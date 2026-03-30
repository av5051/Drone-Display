from pymavlink import mavutil
import math
import os

def clear():
    os.system('clear')

print("Connecting to SITL...")
mav = mavutil.mavlink_connection('udp:127.0.0.1:14550')
mav.wait_heartbeat()
print(f"Connected — system {mav.target_system}\n")

state = {
    'lat':       None,
    'lon':       None,
    'alt':       None,
    # 'airspeed':  None,
    # 'groundspeed': None,
    # 'heading':   None,
    'climb':     None,
    'roll':      None,
    'pitch':     None,
    'battery':   None,
    'voltage':   None,
    # 'gps_fix':   None,
    # 'satellites': None,
    'mode':      None,
    'armed':     None,
}

def print_state():
    clear()
    print("=" * 40)
    print("  DRONE TELEMETRY — live from SITL")
    print("=" * 40)

    print(f"\n  GPS")
    print(f"    Lat        : {state['lat']}")
    print(f"    Lon        : {state['lon']}")
    print(f"    Altitude   : {state['alt']} m")
    # print(f"    GPS fix    : {state['gps_fix']}  satellites: {state['satellites']}")

    print(f"\n  FLIGHT")
    # print(f"    Airspeed   : {state['airspeed']} m/s")
    # print(f"    Groundspeed: {state['groundspeed']} m/s")
    # print(f"    Heading    : {state['heading']} deg")
    print(f"    Climb rate : {state['climb']} m/s")
    print(f"    Roll       : {state['roll']} deg")
    print(f"    Pitch      : {state['pitch']} deg")

    print(f"\n  POWER")
    print(f"    Battery    : {state['battery']} %")
    print(f"    Voltage    : {state['voltage']} V")

    print(f"\n  STATUS")
    print(f"    Mode       : {state['mode']}")
    print(f"    Armed      : {state['armed']}")
    print("=" * 40)

print("Reading telemetry — Ctrl+C to stop\n")

while True:
    msg = mav.recv_match(
        type=[
            'GLOBAL_POSITION_INT',
            'HEARTBEAT',
            'BATTERY_STATUS',
            'VFR_HUD',
            'ATTITUDE',
            'GPS_RAW_INT'
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
        state['voltage'] = round(msg.voltages[0] / 1000, 2)

    # elif t == 'GPS_RAW_INT':
    #     state['gps_fix']    = msg.fix_type
    #     state['satellites'] = msg.satellites_visible

    # reprint every time any message arrives
    print_state()