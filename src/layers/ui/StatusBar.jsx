import { useDroneStore } from '../../store/droneStore';

export const StatusBar = () => {
  const { mode, armed } = useDroneStore((state) => state.telemetry);
  const requestedMode = useDroneStore((state) => state.requestedMode);
  
  return (
    <div className="flex items-center gap-4 bg-slate-900 p-3 rounded-md mb-6 border-l-4 border-blue-500">
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full animate-pulse ${mode ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className="text-sm font-medium">Link: {mode ? 'Live' : 'No Data'}</span>
      </div>
      <div className={`px-3 py-1 rounded text-xs font-black uppercase ${armed ? 'bg-red-600 text-white' : 'bg-slate-700 text-slate-400'}`}>
        {armed ? 'Armed' : 'Disarmed'}
      </div>
      <div className="bg-blue-600 px-3 py-1 rounded text-xs font-black uppercase text-white">
        {mode ?? 'Unknown Mode'}
        {requestedMode && requestedMode !== mode && (
          <span className="text-[10px] ml-2 text-yellow-100">(pending: {requestedMode})</span>
        )}
      </div>
    </div>
  );
};