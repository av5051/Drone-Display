import { useEffect } from 'react';
import { useDroneStore } from '../../store/droneStore';

export const useTelemetry = () => {
  const setTelemetry = useDroneStore((state) => state.setTelemetry);

  useEffect(() => {
    const eventSource = new EventSource('http://localhost:5000/telemetry');

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setTelemetry(data);
    };

    eventSource.onerror = (err) => {
      console.error("SSE Connection Failed:", err);
      eventSource.close();
    };

    return () => eventSource.close();
  }, [setTelemetry]);
};