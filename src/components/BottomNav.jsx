// src/components/BottomNav.jsx
import React from 'react';
import { Home, BarChart3, Settings, PlusCircle } from 'lucide-react';
import { cn } from '../utils/cn';

function BottomNav({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'add', icon: PlusCircle, label: 'Add', isSpecial: true },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-xl border-t border-gray-800 safe-area-bottom z-50">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center justify-around py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            if (tab.isSpecial) {
              // Special "Add" button (bigger, centered)
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className="relative -mt-8"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent-green to-accent-green-light shadow-glow-green flex items-center justify-center active:scale-95 transition-transform">
                    <Icon size={28} className="text-black" />
                  </div>
                </button>
              );
            }

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "flex flex-col items-center gap-1 py-2 px-4 transition-all duration-200 active:scale-95",
                  isActive && "scale-105"
                )}
              >
                <Icon 
                  size={24} 
                  className={cn(
                    "transition-colors",
                    isActive ? "text-accent-green" : "text-gray-400"
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span 
                  className={cn(
                    "text-xs font-medium transition-colors",
                    isActive ? "text-white" : "text-gray-400"
                  )}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export default BottomNav;
