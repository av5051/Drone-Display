import { create } from 'zustand';

export const useDroneStore = create((set) => ({
  telemetry: {
    lat: null, lon: null, alt: null, 
    battery: null, mode: null, armed: false, 
    airspeed: 0, heading: 0
  },
  setTelemetry: (newData) => set({ telemetry: newData }),
}));