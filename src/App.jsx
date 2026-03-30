import React from 'react';
import { useTelemetry } from './layers/data/useTelemetry';
import { useDroneStore } from './store/droneStore';

// UI Components
import { TelemetryCard } from './layers/ui/TelemetryCard';
import { StatusBar } from './layers/ui/StatusBar';
import { GPSCard } from './layers/ui/GPSCard';
import { NotificationFeed } from './layers/ui/NotificationFeed';

// Control Components
import { FlightControls } from './layers/control/FlightControls';
import { ModeSelector } from './layers/control/ModeSelector';

// ... existing imports

function App() {
  useTelemetry();
  const t = useDroneStore((state) => state.telemetry);

  return (
    <div className="min-h-screen bg-black text-green-500 p-8 font-mono">
      <div className="max-w-7xl mx-auto">
        
        <header className="flex justify-between items-end border-b border-green-900/40 pb-6 mb-10">
          <div>
            <h1 className="text-3xl font-black tracking-widest uppercase italic">
              NAV_SYSTEM <span className="text-white text-xl">V1.0</span>
            </h1>
            <p className="text-xs text-green-900 font-bold uppercase tracking-[0.3em] mt-1">
              SITL_ACTIVE_SESSION
            </p>
          </div>
          <StatusBar />
        </header>

        {/* Primary Metrics: Increased padding and text size */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <TelemetryCard label="Altitude" value={t.alt} unit="M" />
          <TelemetryCard label="Airspeed" value={t.airspeed} unit="M/S" />
          <TelemetryCard label="Heading" value={t.heading} unit="DEG" />
          <TelemetryCard label="Battery" value={t.battery} unit="%" color={t.battery < 20 ? 'text-red-500' : 'text-green-400'} />
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Left Column: Commands (Span 4) */}
          <div className="lg:col-span-4 space-y-8">
            <section className="bg-black border border-green-900/30 p-8">
              <h2 className="text-xs font-bold text-green-900 mb-6 uppercase tracking-widest border-b border-green-900/20 pb-3">
                Command_Center
              </h2>
              <FlightControls />
              
              <div className="mt-10 pt-8 border-t border-green-900/20">
                <p className="text-xs text-green-900 mb-4 uppercase tracking-widest font-bold">
                  Flight_Mode_Selection
                </p>
                <ModeSelector />
              </div>
            </section>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black border border-green-900/30 p-5 text-center">
                <p className="text-xs text-green-900 uppercase font-bold mb-2">Pitch</p>
                <p className="text-2xl font-mono text-white">{t.pitch?.toFixed(1) ?? '0.0'}°</p>
              </div>
              <div className="bg-black border border-green-900/30 p-5 text-center">
                <p className="text-xs text-green-900 uppercase font-bold mb-2">Roll</p>
                <p className="text-2xl font-mono text-white">{t.roll?.toFixed(1) ?? '0.0'}°</p>
              </div>
            </div>
          </div>

          {/* Right Column: GPS & Large Terminal (Span 8) */}
          <div className="lg:col-span-8 space-y-8">
            <GPSCard />
            
            {/* Terminal height increased to 250px */}
            <div className="h-[250px]">
               <NotificationFeed />
            </div>
            
            <div className="bg-green-900/5 p-4 border border-green-900/10 text-xs text-green-900 uppercase tracking-[0.15em] text-center">
              System_Status: Nominal // MAVLink_Protocol: v2.0 // SITL_Link: Stable
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;