export const TelemetryCard = ({ label, value, unit, color = "text-white" }) => (
  <div className="bg-black border border-green-900/30 p-4 rounded-sm hover:border-green-500/50 transition-colors group">
    <p className="text-[10px] text-green-800 group-hover:text-green-500 transition-colors uppercase font-bold tracking-wider mb-1">
      {label}
    </p>
    <div className="flex items-baseline gap-2">
      <span className={`text-3xl font-mono tracking-tighter ${color}`}>
        {value ?? '--'}
      </span>
      <span className="text-green-900 text-xs font-bold">{unit}</span>
    </div>
  </div>
);