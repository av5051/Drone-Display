import axios from 'axios';
import { useDroneStore } from '../../store/droneStore';

export const FlightControls = () => {
  const armed = useDroneStore((state) => state.telemetry.armed);

  const handleCommand = async (endpoint, data = {}) => {
    try {
      await axios.post(`http://localhost:5000/${endpoint}`, data);
    } catch (err) {
      alert(err.response?.data?.message || "Command failed");
    }
  };

  return (
    <div className="grid grid-cols-3 gap-3">
      <button 
        onClick={() => handleCommand('arm', { armed: !armed })}
        className={`p-3 rounded font-bold transition ${armed ? 'bg-orange-600 hover:bg-orange-700' : 'bg-red-600 hover:bg-red-700'}`}
      >
        {armed ? 'DISARM' : 'ARM'}
      </button>
      <button 
        disabled={!armed}
        onClick={() => handleCommand('takeoff', { altitude: 10 })}
        className="bg-green-600 p-3 rounded font-bold hover:bg-green-700 disabled:opacity-50"
      >
        TAKEOFF
      </button>
      <button 
        onClick={() => handleCommand('land')}
        className="bg-blue-600 p-3 rounded font-bold hover:bg-blue-700"
      >
        LAND
      </button>
    </div>
  );
};