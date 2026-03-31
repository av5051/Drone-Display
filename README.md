# Drone Nav

A full-stack dashboard to monitor and control a drone using **MAVLink** and **SITL**. This project uses a Python bridge to communicate with the drone and a React frontend to display live telemetry and trigger flight commands.

---

### Project Structure

* **backend/**: Python scripts using `pymavlink` to connect to the drone and `Flask` to create an API.
* **src/layers/**: UI components split into controls (buttons/modes), data (hooks), and UI (display cards).
* **src/store/**: Global state management using `droneStore.js` (Zustand) to keep telemetry synced across the app.

---

### Workflow

**1. The Connection**
The backend script (`telemetryData.py`) connects to the SITL simulator via UDP. It runs a background thread that constantly listens for MAVLink messages like `GLOBAL_POSITION_INT` and `VFR_HUD`.

**2. Telemetry Flow**
* The backend saves the latest drone data into a local `state` dictionary.
* It exposes a `/telemetry` endpoint using **Server-Sent Events (SSE)**.
* The frontend hook `useTelemetry.js` listens to this stream and pushes the data into the `droneStore`.
* Components like `GPSCard` and `StatusBar` automatically update when the store changes.

**3. Command Execution**
When you click a button in the UI:
* A POST request is sent to backend routes like `/arm`, `/takeoff`, or `/mode`.
* The backend translates that request into a MAVLink command and sends it to the drone.
* The drone firmware (ArduPilot/PX4) handles the actual physics and motor mixing.

---

### Setup

**Backend**
1. Navigate to `/backend`.
2. Install dependencies: `pip install -r requirements.txt`.
3. Run your SITL simulator.
4. Start the server: `python telemetryData.py`.

**Frontend**
1. Navigate to the root folder.
2. Install packages: `npm install`.
3. Launch the dashboard: `npm run dev`.
   
**ardupilot(needs to be installed)**
1. cd ardupilot/
2. sim_vehicle.py -v ArduCopter --console --map
---

### Key Features
* **Live Tracking:** Real-time GPS, Altitude, Heading, and Battery levels.
* **Flight Control:** Toggle between Stabilize, Guided, Loiter, and RTL modes.
* **Navigation:** Manual Arm/Disarm, Takeoff, and Coordinate-based "Goto" triggers.
* **Stability:** Includes an RC neutral override to keep the drone level during mode swaps.
