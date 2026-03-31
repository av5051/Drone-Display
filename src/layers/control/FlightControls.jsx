import axios from 'axios';
import { useDroneStore } from '../../store/droneStore';

export const FlightControls = () => {
  const { armed, mode } = useDroneStore((state) => state.telemetry);
  const addNotification = useDroneStore((state) => state.addNotification);

  const handleCommand = async (endpoint, data = {}) => {
    try {
      const res = await axios.post(`http://localhost:5000/${endpoint}`, data);
      // Success feedback 
      addNotification(res.data.message, 'success');
    } catch (err) {
      // Failure feedback with better error handling
      const errorMsg = err.response?.data?.message || err.message || "Command Rejected";
      addNotification(errorMsg, 'error');
    }
  };

  return (
    <div className="grid grid-cols-3 gap-3">
      <button 
        onClick={() => handleCommand('arm', { armed: !armed })}
        className={`p-3 text-[10px] font-black border ${
          armed 
            ? 'bg-red-600 border-red-400 text-white' 
            : 'bg-black border-green-900/40 text-green-500 hover:border-green-400'
        }`}
      >
        {armed ? 'DISARM' : 'ARM_MOTORS'}
      </button>

      <button 
        disabled={!armed || mode !== 'GUIDED'}
        onClick={() => handleCommand('takeoff', { altitude: 10 })}
        className="bg-black border border-green-900/40 p-3 text-[10px] font-black text-green-500 hover:border-green-400 disabled:opacity-20"
      >
        TAKEOFF_10M
      </button>

      <button 
        onClick={() => handleCommand('land')}
        className="bg-black border border-green-900/40 p-3 text-[10px] font-black text-green-500 hover:border-green-400"
      >
        LAND_NOW
      </button>
      <button 
        onClick={() => handleCommand('goto')}
        className="bg-black border border-green-900/40 p-3 text-[10px] font-black text-green-500 hover:border-green-400"
      >
        flyHigh
      </button>
    </div>
  );
};