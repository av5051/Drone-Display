from pymavlink import mavutil
from flask import Flask, Response, jsonify, request
from flask_cors import CORS
import math, json, threading, time

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

print("Connecting to SITL...")
mav = mavutil.mavlink_connection('udp:127.0.0.1:14550')
mav.wait_heartbeat()
print(f"Connected: System {mav.target_system}, Component {mav.target_component}")

mav.mav.request_data_stream_send(
    mav.target_system, mav.target_component,
    mavutil.mavlink.MAV_DATA_STREAM_ALL, 4, 1
)

not_fall = False
state = {
    'lat': 0.0, 'lon': 0.0, 'alt': 0.0,
    'airspeed': 0.0, 'groundspeed': 0.0, 'heading': 0,
    'roll': 0.0, 'pitch': 0.0,
    'battery': 0, 'mode': 'UNKNOWN', 'armed': False,
}

def set_rc_neutral():
    global not_fall
    while not_fall:
        mav.mav.rc_channels_override_send(
            mav.target_system, mav.target_component,
            65535, 65535, 1500, 65535, 65535, 65535, 65535, 65535
        )
        time.sleep(0.05)

def mavlink_reader():
    while True:
        try:
            msg = mav.recv_match(
                type=['GLOBAL_POSITION_INT', 'HEARTBEAT', 'VFR_HUD', 'ATTITUDE', 'SYS_STATUS', 'BATTERY_STATUS'],
                blocking=True,
                timeout=1.0
            )
            if not msg:
                continue

            m_type = msg.get_type()

            if m_type == 'GLOBAL_POSITION_INT':
                state['lat'], state['lon'] = msg.lat / 1e7, msg.lon / 1e7
                state['alt'] = round(msg.relative_alt / 1000, 2)

            elif m_type == 'HEARTBEAT':
                modes = mav.mode_mapping()
                if modes:
                    state['mode'] = next((n for n, id in modes.items() if id == msg.custom_mode), "UNKNOWN")
                state['armed'] = bool(msg.base_mode & mavutil.mavlink.MAV_MODE_FLAG_SAFETY_ARMED)

            elif m_type in ['SYS_STATUS', 'BATTERY_STATUS']:
                if hasattr(msg, 'battery_remaining'):
                    state['battery'] = msg.battery_remaining

            elif m_type == 'VFR_HUD':
                state['airspeed'] = round(msg.airspeed, 1)
                state['groundspeed'] = round(msg.groundspeed, 1)
                state['heading'] = msg.heading

            elif m_type == 'ATTITUDE':
                state['roll'] = round(math.degrees(msg.roll), 1)
                state['pitch'] = round(math.degrees(msg.pitch), 1)

        except Exception as e:
            print(f"Reader Error: {e}")
            continue

threading.Thread(target=mavlink_reader, daemon=True).start()

@app.route('/mode', methods=['POST'])
def set_mode():
    global not_fall
    data = request.get_json()
    raw_mode = data.get('mode', '').upper()
    fix_map = {
        'ALTHOLD': 'ALT_HOLD',
        'STABILIZE': 'STABILIZE',
        'GUIDED': 'GUIDED',
        'LOITER': 'LOITER',
        'RTL': 'RTL'
    }
    mode_name = fix_map.get(raw_mode, raw_mode)

    mapping = mav.mode_mapping()
    if not mapping or mode_name not in mapping:
        not_fall = False
        return jsonify(ok=False, message=f"Mode {mode_name} not found"), 400

    if mode_name in ['ALT_HOLD', 'STABILIZE', 'LOITER']:
        not_fall = True
        threading.Thread(target=set_rc_neutral, daemon=True).start()
    else:
        not_fall = False

    mav.set_mode(mapping[mode_name])

    for _ in range(20):
        if state['mode'].replace('_', '').upper() == raw_mode:
            return jsonify(ok=True, message=f"Confirmed: {mode_name}")
        time.sleep(0.1)

    return jsonify(ok=False, message="SITL Rejected Mode Change"), 400

@app.route('/arm', methods=['POST'])
def arm():
    do_arm = request.get_json().get('armed', True)
    
    if do_arm and state['mode'] not in ['STABILIZE', 'GUIDED']:
        mav.set_mode(mav.mode_mapping()['STABILIZE'])
        time.sleep(0.2)

    mav.mav.command_long_send(
        mav.target_system, mav.target_component,
        mavutil.mavlink.MAV_CMD_COMPONENT_ARM_DISARM, 0,
        1 if do_arm else 0, 0, 0, 0, 0, 0, 0
    )

    for _ in range(30):
        if state['armed'] == do_arm:
            return jsonify(ok=True, message="Armed" if do_arm else "Disarmed")
        time.sleep(0.1)
    
    return jsonify(ok=False, message="Arming Failed (Check Pre-Arms)"), 400

@app.route('/takeoff', methods=['POST'])
def takeoff():
    if not state['armed'] or state['mode'] != 'GUIDED':
        return jsonify(ok=False, message="Takeoff requires ARMED + GUIDED mode"), 400

    alt = request.get_json().get('altitude', 10)
    mav.mav.command_long_send(
        mav.target_system, mav.target_component,
        mavutil.mavlink.MAV_CMD_NAV_TAKEOFF, 0, 0, 0, 0, 0, 0, 0, alt
    )
    return jsonify(ok=True, message=f"Taking off to {alt}m")

@app.route('/land', methods=['POST'])
def land():
    global not_fall
    not_fall = False
    
    mapping = mav.mode_mapping()
    if 'LAND' in mapping:
        mav.set_mode(mapping['LAND'])
        return jsonify(ok=True, message="Landing initiated")
    
    return jsonify(ok=False, message="LAND mode not supported"), 400
lat = 5 
lon = 5
gotoalt = 5
@app.route("/goto")
def goto():
    lat +=5
    lon +=5
    gotoalt += 5
    if state['armed'] or state['mode'] != 'GUIDED':
        mav.mav.mission_item_send(
            mav.target_system, mav.target_component,
            0, mavutil.mavlink.MAV_FRAME_GLOBAL_RELATIVE_ALT,
            mavutil.mavlink.MAV_CMD_NAV_WAYPOINT,
            2, 0, 0, 0, 0, 0,lat
            , lon, gotoalt
        )
        return jsonify(ok=True, message=f"Going to {lat}, {lon} at {gotoalt}m")
    else:

        return jsonify(ok=False, message=f"check flying mode again , should be guided and armed")

@app.route('/telemetry')
def stream():
    def event_stream():
        while True:
            yield f"data: {json.dumps(state)}\n\n"
            time.sleep(0.2)
    return Response(event_stream(), mimetype='text/event-stream')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, threaded=True)