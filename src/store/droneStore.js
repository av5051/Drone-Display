import { create } from 'zustand';

export const useDroneStore = create((set) => ({
  // Telemetry: Updated ~10 times per second
  telemetry: {
    lat: 0,
    lon: 0,
    alt: 0,
    airspeed: 0,
    groundspeed: 0,
    heading: 0,
    roll: 0,
    pitch: 0,
    battery: 0,
    mode: 'STABILIZE',
    armed: false,
  },

  // System Logs: Updated only on commands
  notifications: [],

  // Action: Update telemetry (Optimized)
  setTelemetry: (newData) => 
    set((state) => ({
      telemetry: { ...state.telemetry, ...newData }
    })),

  // Action: Add notification (Keeps only the last 10 for performance)
  addNotification: (text, type = 'info') => 
    set((state) => ({
      notifications: [
        { id: Date.now(), text, type },
        ...state.notifications
      ].slice(0, 10) 
    })),
    
  // Action: Clear logs
  clearNotifications: () => set({ notifications: [] }),
}));