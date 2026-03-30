from pymavlink import mavutil
from flask import Flask, Response, jsonify, request
from flask_cors import CORS
import math
import json
import os
import threading

app = Flask(__name__)
CORS(app)

# ── Connect to SITL ───────────────────────────────────────────────────

print("Connecting to SITL...")
mav = mavutil.mavlink_connection('udp:127.0.0.1:14550')
mav.wait_heartbeat()
print(f"Connected — system {mav.target_system}, component {mav.target_component}")
print(f"Mode: {mav.flightmode}\n")

# ── Shared state — one dict, updated by background thread ─────────────
# This lives at module level so ALL routes can read it.
# The background thread writes to it continuously.

state = {
    'lat':         None,
    'lon':         None,
    'alt':         None,
    'airspeed':    None,
    'groundspeed': None,
    'heading':     None,
    'climb':       None,
    'roll':        None,
    'pitch':       None,
    'battery':     None,
    'voltage':     None,
    'mode':        None,
    'armed':       None,
}

# ── Background thread — reads MAVLink and updates state ───────────────
# This is the fix for all-null status.
# The previous version had read_mavlink() as a generator called inside
# the SSE route — meaning state only updated when SSE was connected.
# Now it runs in a daemon thread always, so /status and /arm
# all see live data immediately.

def mavlink_reader():
    while True:
        msg = mav.recv_match(
            type=[
                'GLOBAL_POSITION_INT',
                'HEARTBEAT',
                'BATTERY_STATUS',
                'VFR_HUD',
                'ATTITUDE',
            ],
            blocking=True,
            timeout=2
        )

        if not msg:
            continue

        t = msg.get_type()

        if t == 'GLOBAL_POSITION_INT':
            state['lat'] = round(msg.lat / 1e7, 6)
            state['lon'] = round(msg.lon / 1e7, 6)
            state['alt'] = round(msg.relative_alt / 1000, 2)

        elif t == 'HEARTBEAT':
            state['mode']  = mav.flightmode
            state['armed'] = bool(
                msg.base_mode & mavutil.mavlink.MAV_MODE_FLAG_SAFETY_ARMED
            )

        elif t == 'VFR_HUD':
            state['airspeed']    = round(msg.airspeed, 1)
            state['groundspeed'] = round(msg.groundspeed, 1)
            state['heading']     = msg.heading
            state['climb']       = round(msg.climb, 2)

        elif t == 'ATTITUDE':
            state['roll']  = round(math.degrees(msg.roll), 1)
            state['pitch'] = round(math.degrees(msg.pitch), 1)

        elif t == 'BATTERY_STATUS':
            state['battery'] = msg.battery_remaining
            if msg.voltages and msg.voltages[0] != 65535:
                state['voltage'] = round(msg.voltages[0] / 1000, 2)

# Start the reader thread immediately at startup
reader_thread = threading.Thread(target=mavlink_reader, daemon=True)
reader_thread.start()
print("MAVLink reader thread started\n")

# ── Helper — send command and wait for ACK ────────────────────────────

def send_command(command, p1=0, p2=0, p3=0, p4=0, p5=0, p6=0, p7=0):
    mav.mav.command_long_send(
        mav.target_system,
        mav.target_component,
        command,
        0,
        p1, p2, p3, p4, p5, p6, p7
    )
    ack = mav.recv_match(type='COMMAND_ACK', blocking=True, timeout=3)
    if ack and ack.result == 0:
        return True
    return False

# ── SSE stream ────────────────────────────────────────────────────────

def telemetry_stream():
    while True:
        payload = json.dumps(state)
        yield f"data: {payload}\n\n"
        # emit at 10Hz — state is always fresh from the reader thread
        import time
        time.sleep(0.1)

# ── Routes ────────────────────────────────────────────────────────────

@app.route('/telemetry')
def get_telemetry():
    return Response(
        telemetry_stream(),
        mimetype='text/event-stream',
        headers={
            'Cache-Control': 'no-cache',
            'X-Accel-Buffering': 'no',
        }
    )

@app.route('/status')
def get_status():
    return jsonify(state)

@app.route('/arm', methods=['POST'])
def arm():
    data   = request.get_json()
    do_arm = data.get('armed', True)

    success = send_command(
        mavutil.mavlink.MAV_CMD_COMPONENT_ARM_DISARM,
        p1=1 if do_arm else 0
    )

    if success:
        return jsonify(ok=True, message='Armed' if do_arm else 'Disarmed')
    return jsonify(ok=False, message='Arm command rejected'), 400

@app.route('/mode', methods=['POST'])
def set_mode():
    data      = request.get_json()
    mode_name = data.get('mode', '').upper()

    allowed = ['GUIDED', 'LOITER', 'ALTHOLD', 'STABILIZE', 'RTL', 'LAND']
    if mode_name not in allowed:
        return jsonify(ok=False, message=f'Mode {mode_name} not allowed'), 400

    mode_mapping = mav.mode_mapping()
    if mode_name not in mode_mapping:
        return jsonify(ok=False, message=f'Mode {mode_name} not in mapping'), 400

    mode_id = mode_mapping[mode_name]
    mav.mav.set_mode_send(
        mav.target_system,
        mavutil.mavlink.MAV_MODE_FLAG_CUSTOM_MODE_ENABLED,
        mode_id
    )

    # give SITL a moment to switch then check via state
    import time
    time.sleep(0.5)

    return jsonify(ok=True, message=f'Mode set to {mode_name}', mode=state['mode'])

@app.route('/takeoff', methods=['POST'])
def takeoff():
    data     = request.get_json()
    altitude = data.get('altitude', 10)

    if state['mode'] != 'GUIDED':
        return jsonify(ok=False, message='Must be in GUIDED mode first'), 400

    if not state['armed']:
        return jsonify(ok=False, message='Must be armed before takeoff'), 400

    success = send_command(
        mavutil.mavlink.MAV_CMD_NAV_TAKEOFF,
        p7=altitude
    )

    if success:
        return jsonify(ok=True, message=f'Takeoff to {altitude}m')
    return jsonify(ok=False, message='Takeoff rejected'), 400

@app.route('/land', methods=['POST'])
def land():
    mode_id = mav.mode_mapping()['LAND']
    mav.mav.set_mode_send(
        mav.target_system,
        mavutil.mavlink.MAV_MODE_FLAG_CUSTOM_MODE_ENABLED,
        mode_id
    )
    return jsonify(ok=True, message='Landing')

# ── Run ───────────────────────────────────────────────────────────────

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False, threaded=True)
