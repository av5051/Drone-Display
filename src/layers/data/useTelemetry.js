import { useEffect } from 'react';
import { useDroneStore } from "../../store/droneStore";

export const useTelemetry = () => {
  const setTelemetry = useDroneStore((state) => state.setTelemetry);
  const addNotification = useDroneStore((state) => state.addNotification);

  useEffect(() => {
    // Connect to the Flask SSE stream
    const sse = new EventSource('http://localhost:5000/telemetry');

    sse.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setTelemetry(data);
      } catch (err) {
        console.error("Telemetry Parse Error", err);
      }
    };

    sse.onerror = () => {
      // Don't spam notifications on every drop, just log it
      console.warn("Connection to SITL lost. Retrying...");
    };

    // CRITICAL: This cleanup stops the "Laptop Fan" issue by 
    // closing old connections when the app reloads.
    return () => sse.close();
  }, [setTelemetry, addNotification]); // Only run once on mount
};