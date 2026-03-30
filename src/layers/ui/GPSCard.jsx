import { useDroneStore } from '../../store/droneStore';

export const GPSCard = () => {
  const { lat, lon } = useDroneStore((state) => state.telemetry);

  const formatCoord = (val) => (val !== null && val !== undefined) ? val.toFixed(6) : "0.000000";

  return (
    <div className="bg-black border border-green-900/30 p-6 rounded-none flex flex-col justify-center">
      <h2 className="text-[10px] font-bold text-green-900 mb-4 uppercase tracking-[0.2em] text-center">Global_Positioning_System</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <p className="text-[9px] text-green-900 uppercase font-bold mb-1">Latitude</p>
          <p className="font-mono text-xl text-white tracking-tighter">{formatCoord(lat)}</p>
        </div>
        <div className="text-center border-l border-green-900/20">
          <p className="text-[9px] text-green-900 uppercase font-bold mb-1">Longitude</p>
          <p className="font-mono text-xl text-white tracking-tighter">{formatCoord(lon)}</p>
        </div>
      </div>
    </div>
  );
};