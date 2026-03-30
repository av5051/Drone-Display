import { useDroneStore } from '../../store/droneStore';

export const GPSCard = () => {
  const { lat, lon } = useDroneStore((state) => state.telemetry);

  const formatCoord = (val) => val !== null ? val.toFixed(6) : "0.000000";

  return (
    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 flex flex-col justify-center">
      <h2 className="text-sm font-bold text-slate-500 mb-4 uppercase tracking-widest text-center">Global Position</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <p className="text-[10px] text-slate-500 uppercase">Latitude</p>
          <p className="font-mono text-xl text-blue-300 tracking-tighter">{formatCoord(lat)}</p>
        </div>
        <div className="text-center border-l border-slate-800">
          <p className="text-[10px] text-slate-500 uppercase">Longitude</p>
          <p className="font-mono text-xl text-blue-300 tracking-tighter">{formatCoord(lon)}</p>
        </div>
      </div>
    </div>
  );
};