// src/components/BottomNav.jsx
import React from 'react';
import { LayoutGrid, Gamepad2, PieChart, Plus, Settings2 } from 'lucide-react';
import { clsx } from 'clsx'; // Make sure to install clsx if not present, or use template literals

function BottomNav({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'home', icon: LayoutGrid, label: 'Habits' },
    { id: 'Todo', icon: Gamepad2, label: 'Zone' }, // Renamed to "Zone" for cool factor
    { id: 'add', icon: Plus, label: 'Add', isSpecial: true },
    { id: 'analytics', icon: PieChart, label: 'Stats' },
    { id: 'settings', icon: Settings2, label: 'System' },
  ];

  return (
    <nav className="fixed bottom-6 left-4 right-4 z-50 max-w-2xl mx-auto">
      <div className="bg-gray-900/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl shadow-black/50 px-2 py-2 flex items-center justify-between">
        
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          // Special "Add" Button (Floating Center)
          if (tab.isSpecial) {
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="group relative -top-8 mx-2"
              >
                <div className="absolute inset-0 bg-accent-green rounded-full blur opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
                <div className="relative w-16 h-16 rounded-full bg-gradient-to-b from-accent-green to-accent-green-light flex items-center justify-center shadow-glow-green transform transition-transform group-active:scale-95 border-4 border-black">
                  <Icon size={32} className="text-black" strokeWidth={3} />
                </div>
              </button>
            );
          }

          // Standard Nav Item
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={clsx(
                "relative flex flex-col items-center justify-center w-16 h-14 rounded-2xl transition-all duration-300",
                isActive ? "bg-white/10" : "hover:bg-white/5"
              )}
            >
              {/* Active Indicator Dot */}
              {isActive && (
                <span className="absolute top-2 w-1 h-1 bg-accent-green rounded-full shadow-[0_0_8px_rgba(146,232,42,0.8)]" />
              )}

              <Icon 
                size={22} 
                className={clsx(
                  "transition-colors duration-300 mb-1",
                  isActive ? "text-white" : "text-gray-500"
                )}
                strokeWidth={isActive ? 2.5 : 2}
              />
              
              <span className={clsx(
                "text-[10px] font-bold tracking-wide transition-colors",
                isActive ? "text-accent-green" : "text-gray-500"
              )}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNav;