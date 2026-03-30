import axios from 'axios';
import { useDroneStore } from '../../store/droneStore';

export const ModeSelector = () => {
  const currentMode = useDroneStore((state) => state.telemetry.mode);
  const modes = ['STABILIZE', 'ALTHOLD', 'LOITER', 'GUIDED', 'RTL'];

  const setMode = async (modeName) => {
    try {
      await axios.post('http://localhost:5000/mode', { mode: modeName });
    } catch (err) {
      console.error("Failed to set mode:", err);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {modes.map((m) => (
        <button
          key={m}
          onClick={() => setMode(m)}
          className={`px-4 py-2 rounded text-xs font-bold transition-all border ${
            currentMode === m 
              ? 'bg-blue-500 border-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' 
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
          }`}
        >
          {m}
        </button>
      ))}
    </div>
  );
};