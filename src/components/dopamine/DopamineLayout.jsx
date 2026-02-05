// src/components/dopamine/DopamineLayout.jsx
import React, { useState } from 'react';
import { Target, ShoppingBag, BarChart3 } from 'lucide-react';
import { WorkEngine } from './WorkEngine';
import { GachaMarket } from './GachaMarket';
import { clsx } from 'clsx';

export const DopamineLayout = () => {
  const [view, setView] = useState('work'); // 'work' | 'market' | 'stats'

  return (
    <div className="h-screen w-full bg-black text-white font-sans overflow-hidden flex flex-col">
      
      {/* MAIN CONTENT AREA */}
      <div className="flex-1 overflow-hidden relative">
        {view === 'work' && <WorkEngine />}
        {view === 'market' && <GachaMarket />}
        {view === 'stats' && <div className="flex items-center justify-center h-full text-gray-600">Stats Coming Soon</div>}
      </div>

      {/* BOTTOM NAVIGATION (Glassmorphism) */}
      <div className="h-20 absolute bottom-0 w-full bg-black/80 backdrop-blur-md border-t border-gray-800 flex justify-around items-center z-50 pb-2">
        
        <NavButton 
          active={view === 'work'} 
          onClick={() => setView('work')} 
          icon={Target} 
          label="MISSION" 
          color="text-accent-green"
        />
        
        {/* Floating Action Button Style for Market */}
        <button 
           onClick={() => setView('market')}
           className={clsx(
             "relative -top-5 h-16 w-16 rounded-full flex items-center justify-center shadow-2xl transition-all border-4 border-black",
             view === 'market' ? "bg-accent-purple text-white shadow-glow-purple scale-110" : "bg-gray-800 text-gray-400"
           )}
        >
          <ShoppingBag size={28} />
        </button>

        <NavButton 
          active={view === 'stats'} 
          onClick={() => setView('stats')} 
          icon={BarChart3} 
          label="LEGACY" 
          color="text-accent-cyan"
        />
      </div>
    </div>
  );
};

const NavButton = ({ active, onClick, icon: Icon, label, color }) => (
  <button onClick={onClick} className="flex flex-col items-center gap-1 w-16">
    <Icon size={24} className={active ? color : "text-gray-600"} strokeWidth={active ? 3 : 2} />
    <span className={clsx("text-[10px] font-bold tracking-wider transition-colors", active ? "text-white" : "text-gray-600")}>
      {label}
    </span>
  </button>
);