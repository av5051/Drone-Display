import React, { useEffect, useRef } from 'react';
import { useDroneStore } from '../../store/droneStore';

export const NotificationFeed = () => {
  // Access the notifications array from the Zustand store
  const notifications = useDroneStore((state) => state.notifications);
  const scrollRef = useRef(null);

  // Requirement: UI must not rely on page refresh 
  // This effect ensures the terminal automatically scrolls to the bottom 
  // whenever a new success or failure message arrives.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [notifications]);

  return (
    <div className="bg-black border border-green-900/30 p-6 h-full flex flex-col shadow-inner">
      {/* Label for the UI Layer  */}
      <h2 className="text-sm font-bold text-green-900 mb-4 uppercase tracking-widest border-b border-green-900/20 pb-2">
        System_Terminal_Output
      </h2>
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-3 font-mono text-sm scrollbar-hide"
      >
        {/* Placeholder if no data has been received yet */}
        {notifications.length === 0 && (
          <p className="text-green-900/40 italic"> {'>'} Initializing MAVLink stream... Awaiting commands.</p>
        )}

        {/* Mapping notifications to display Command Status (Success/Failure)  */}
        {notifications.map((n) => (
          <div key={n.id} className="flex gap-4 border-l-2 border-transparent hover:border-green-900 pl-2 transition-colors">
            {/* Timestamp for debugging and system integration logs [cite: 3] */}
            <span className="text-green-900 font-bold shrink-0">
              [{new Date(n.id).toLocaleTimeString([], { hour12: false })}]
            </span>
            
            {/* Dynamic coloring: Red for errors/rejections, Green for successes  */}
            <span className={n.type === 'error' ? 'text-red-500 font-bold' : 'text-green-400'}>
              {n.type === 'error' ? '![REJECTED]:' : '>>'} {n.text.toUpperCase()}
            </span>
          </div>
        ))}
      </div>

      {/* Visual indicator of the Control Flow  */}
      <div className="mt-4 pt-2 border-t border-green-900/10 flex justify-between items-center">
        <span className="text-[10px] text-green-900/50 uppercase tracking-tighter">
          Response_Listener: Active
        </span>
        <div className="flex gap-1">
          <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
          <div className="w-1 h-1 bg-green-900 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};