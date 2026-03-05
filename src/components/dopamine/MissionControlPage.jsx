import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Shield, Zap, Terminal, Info, AlertOctagon, X } from 'lucide-react';
import { clsx } from 'clsx';
import useMarketStore from '../../store/marketStore';

export const MissionControlPage = ({ onBack, initialType = 'todo' }) => {
  const { addTodo, addNotTodo } = useMarketStore();
  
  const [type, setType] = useState(initialType);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [cost, setCost] = useState(50);
  const [when, setWhen] = useState('');
  const [where, setWhere] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    if (!title.trim()) return;
    if (type === 'todo') {
      addTodo({ title, priority, notes, when, where });
    } else {
      addNotTodo({ title, cost, notes });
    }
    if (navigator.vibrate) navigator.vibrate([50]);
    onBack();
  };

  return (
    <div className="fixed inset-0 bg-[#050505] text-white flex flex-col font-mono overflow-hidden select-none">
      
      {/* MOBILE-FIRST HEADER */}
      <header className="px-6 pt-8 pb-4 flex items-center justify-between shrink-0">
        <button 
          onClick={onBack}
          className="w-12 h-12 flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl active:scale-90 transition-transform"
        >
          <X size={20} className="text-gray-400" />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[10px] tracking-[0.3em] text-gray-500 font-black uppercase mb-1">Terminal</span>
          <div className="flex items-center gap-2">
            <div className={clsx("w-2 h-2 rounded-full animate-pulse", type === 'todo' ? "bg-accent-purple" : "bg-orange-500")} />
            <h1 className="text-sm font-bold tracking-widest uppercase italic">New_Entry</h1>
          </div>
        </div>
        <div className="w-12 h-12" /> {/* Spacer for symmetry */}
      </header>

      {/* SCROLLABLE ENGINE */}
      <div className="flex-1 overflow-y-auto px-6 pb-32 pt-4 space-y-8 scrollbar-hide">
        
        {/* 01 // PROTOCOL SELECTOR */}
        <div className="grid grid-cols-2 gap-3">
          <ProtocolButton 
            active={type === 'todo'} 
            onClick={() => setType('todo')}
            icon={<Zap size={18} />}
            label="MISSION"
            sub="Objective"
            color="accent-purple"
          />
          <ProtocolButton 
            active={type === 'avoid'} 
            onClick={() => setType('avoid')}
            icon={<Shield size={18} />}
            label="THREAT"
            sub="Protocol"
            color="orange-500"
          />
        </div>

        {/* 02 // DYNAMIC COMMAND LINE */}
        <motion.div 
          layout
          className={clsx(
            "relative p-6 rounded-3xl border transition-colors duration-500",
            type === 'todo' ? "bg-white/5 border-white/10" : "bg-orange-500/5 border-orange-500/20"
          )}
        >
          <div className="flex items-center gap-2 mb-6 text-gray-600">
            <Terminal size={14} />
            <span className="text-[10px] font-black tracking-widest uppercase">Input_Command</span>
          </div>

          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-6 text-xl font-bold leading-snug">
            {type === 'todo' ? (
              <>
                <span className="text-gray-600 italic">I will</span>
                <ExpandingInput 
                  value={title} 
                  onChange={setTitle} 
                  placeholder="[DO_SOMETHING]" 
                  color="text-white"
                />
                <span className="text-gray-600 italic">at</span>
                <ExpandingInput 
                  value={when} 
                  onChange={setWhen} 
                  placeholder="[TIME]" 
                  color="text-accent-cyan"
                  width="w-24"
                />
                <span className="text-gray-600 italic">in</span>
                <ExpandingInput 
                  value={where} 
                  onChange={setWhere} 
                  placeholder="[LOC]" 
                  color="text-accent-purple"
                />
              </>
            ) : (
              <>
                <span className="text-orange-500 italic uppercase">Sacrifice</span>
                <input 
                  type="number"
                  value={cost}
                  onChange={(e) => setCost(Number(e.target.value))}
                  className="bg-orange-500/20 text-orange-500 w-16 text-center border-b border-orange-500 focus:outline-none rounded-t"
                />
                <span className="text-gray-600 italic uppercase">Score to engage in</span>
                <ExpandingInput 
                  value={title} 
                  onChange={setTitle} 
                  placeholder="[FORBIDDEN_ACTION]" 
                  color="text-orange-500"
                />
              </>
            )}
          </div>
        </motion.div>

        {/* 03 // EXTRA INTEL (Notes) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Supplemental Intel</span>
            <Info size={14} className="text-gray-700" />
          </div>
          <textarea 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Document additional mission data or threat details..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm h-32 outline-none focus:border-white/30 transition-all font-sans"
          />
        </div>

        {/* 04 // PRIORITY (Only for Todo) */}
        {type === 'todo' && (
          <div className="grid grid-cols-3 gap-2">
            {['low', 'medium', 'high'].map((p) => (
              <button
                key={p}
                onClick={() => setPriority(p)}
                className={clsx(
                  "py-4 rounded-2xl border text-[10px] font-black uppercase transition-all",
                  priority === p ? "bg-white text-black border-white shadow-xl shadow-white/5" : "bg-white/5 border-white/5 text-gray-500"
                )}
              >
                {p}
              </button>
            ))}
          </div>
        )}

      </div>

      {/* FIXED FOOTER ACTION */}
      <div className="absolute bottom-0 left-0 right-0 p-6 pt-10 bg-gradient-to-t from-[#050505] via-[#050505] to-transparent pointer-events-none">
        <button 
          onClick={handleSubmit}
          className={clsx(
            "pointer-events-auto w-full max-w-md mx-auto py-5 rounded-2xl font-black text-xs tracking-[0.4em] uppercase transition-all active:scale-[0.96] flex items-center justify-center gap-3 shadow-2xl",
            type === 'todo' 
              ? "bg-accent-green text-black" 
              : "bg-orange-600 text-white"
          )}
        >
          {type === 'todo' ? <Zap size={18} fill="black" /> : <AlertOctagon size={18} />}
          {type === 'todo' ? "Initialize Mission" : "Establish Sacrifice"}
        </button>
      </div>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const ProtocolButton = ({ active, onClick, icon, label, sub, color }) => (
  <button 
    onClick={onClick}
    className={clsx(
      "flex flex-col p-4 rounded-3xl border-2 transition-all duration-300",
      active ? `border-${color} bg-${color}/10 shadow-lg shadow-${color}/5` : "border-white/5 bg-white/5 grayscale opacity-40"
    )}
  >
    <div className={clsx("mb-4", active ? `text-${color}` : "text-gray-500")}>
      {icon}
    </div>
    <span className="text-xs font-black tracking-widest block">{label}</span>
    <span className="text-[8px] opacity-60 uppercase">{sub}</span>
  </button>
);

const ExpandingInput = ({ value, onChange, placeholder, color, width = "min-w-[120px]" }) => (
  <input 
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className={clsx(
      "bg-transparent border-b-2 border-white/5 focus:border-white/20 outline-none transition-all placeholder:text-gray-800",
      color,
      width
    )}
  />
);