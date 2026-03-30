import React, { useState, memo } from 'react';
import axios from 'axios';
import { useDroneStore } from '../../store/droneStore';

// We wrap the component in memo so it only re-renders when 'currentMode' changes,
// NOT every time the altitude or GPS moves.
export const ModeSelector = memo(() => {
  // SELECTOR OPTIMIZATION: Only listen to 'mode', ignore other telemetry updates
  const currentMode = useDroneStore((state) => state.telemetry.mode);
  const addNotification = useDroneStore((state) => state.addNotification);
  const [isPending, setIsPending] = useState(false);

  const modes = ['STABILIZE', 'ALTHOLD', 'LOITER', 'GUIDED', 'RTL'];

  const setMode = async (modeName) => {
    if (isPending) return;
    setIsPending(true);
    try {
      const res = await axios.post('http://localhost:5000/mode', { mode: modeName });
      addNotification(res.data.message, 'success');
    } catch (err) {
      addNotification(err.response?.data?.message || "Connection Error", 'error');
    } finally {
      // Ensure the button becomes clickable again regardless of success/fail
      setIsPending(false);
    }
  };

  const isActive = (m) => {
    if (!currentMode) return false;
    return currentMode.replace(/_/g, '').toUpperCase() === m.toUpperCase();
  };

  return (
    <div className="flex flex-wrap gap-3">
      {modes.map((m) => (
        <button
          key={m}
          disabled={isPending}
          onClick={() => setMode(m)}
          className={`px-4 py-3 text-xs font-black tracking-widest transition-all border ${
            isActive(m)
              ? 'bg-green-600 border-green-400 text-black shadow-md' // Reduced shadow for performance
              : 'bg-black border-green-900/30 text-green-900 hover:border-green-500 hover:text-green-500'
          } ${isPending ? 'opacity-50 cursor-wait' : 'cursor-pointer active:scale-95'}`}
        >
          {m}
        </button>
      ))}
    </div>
  );
});