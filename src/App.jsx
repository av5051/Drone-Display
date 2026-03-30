import { useTelemetry } from './layers/data/useTelemetry';
import { useDroneStore } from './store/droneStore';
import { TelemetryCard } from './layers/ui/TelemetryCard';
import { StatusBar } from './layers/ui/StatusBar';
import { FlightControls } from './layers/control/FlightControls';
import { ModeSelector } from './layers/control/ModeSelector';
import { GPSCard } from './layers/ui/GPSCard';

// ... imports stay the same

function App() {
  useTelemetry();
  const t = useDroneStore((state) => state.telemetry);

  return (
    <div className="min-h-screen bg-black text-green-500 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-end border-b border-green-900/40 pb-4 mb-8">
          <div>
            <h1 className="text-2xl font-black tracking-widest uppercase italic">
              Nav_System <span className="text-white text-lg">v1.0</span>
            </h1>
            <p className="text-[10px] text-green-900 font-bold uppercase tracking-[0.3em]">
              SITL Connection Active
            </p>
          </div>
          <StatusBar />
        </header>

        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <TelemetryCard label="Altitude" value={t.alt} unit="M" />
          <TelemetryCard label="Airspeed" value={t.airspeed} unit="M/S" />
          <TelemetryCard label="Heading" value={t.heading} unit="DEG" />
          <TelemetryCard label="Battery" value={t.battery} unit="%" color={t.battery < 20 ? 'text-red-500' : 'text-green-400'} />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Controls Section */}
          <div className="lg:col-span-1">
            <section className="bg-black border border-green-900/30 p-6 rounded-none shadow-none">
              <h2 className="text-[10px] font-bold text-green-900 mb-4 uppercase tracking-widest">Command_Center</h2>
              <FlightControls />
              <div className="mt-6 pt-6 border-t border-green-900/20">
                <p className="text-[10px] text-green-900 mb-3 uppercase tracking-widest">Flight_Modes</p>
                <ModeSelector />
              </div>
            </section>
          </div>

          {/* Data Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* GPSCard should now be bg-black in its own file, 
                but we ensure the container here is black too */}
            <div className="bg-black border border-green-900/30">
               <GPSCard />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black border border-green-900/30 p-4">
                <p className="text-[10px] text-green-900 uppercase font-bold tracking-tighter">Pitch_Axis</p>
                <p className="text-xl font-mono text-white">{t.pitch ?? '0.0'}°</p>
              </div>
              <div className="bg-black border border-green-900/30 p-4">
                <p className="text-[10px] text-green-900 uppercase font-bold tracking-tighter">Roll_Axis</p>
                <p className="text-xl font-mono text-white">{t.roll ?? '0.0'}°</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default App;