import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Crosshair, Shield, Clock, MapPin, AlignLeft, CheckCircle2, AlertTriangle, Zap } from 'lucide-react';
import { clsx } from 'clsx';
import useMarketStore from '../../store/marketStore';

export const MissionControlPage = ({ onBack, initialType = 'todo' }) => {
  const { addTodo, addNotTodo } = useMarketStore();
  
  // State
  const [type, setType] = useState(initialType
    
  ); // 'todo' | 'avoid'
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
    <div className="h-full w-full bg-[#050505] text-white flex flex-col relative overflow-hidden font-sans">
      
      {/* Background Gradient Orbs (More subtle) */}
      <div className="absolute top-[-20%] left-[-10%] w-[300px] h-[300px] bg-accent-purple/10 rounded-full blur-[120px] pointer-events-none" />
      
      {/* HEADER */}
      <div className="sticky top-0 z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 p-4 flex items-center gap-4 shrink-0">
        <button 
          onClick={onBack}
          className="p-3 bg-white/5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all active:scale-95"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-lg font-bold tracking-wide uppercase text-gray-200">
            New Operation
          </h1>
          <div className="flex items-center gap-2">
            <span className={clsx("w-1.5 h-1.5 rounded-full", type === 'todo' ? "bg-accent-purple" : "bg-orange-500")} />
            <p className="text-[10px] text-gray-600 font-mono tracking-wider">SYSTEM_READY</p>
          </div>
        </div>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto p-5 space-y-8 pb-48 scrollbar-hide">
        <div className="max-w-lg mx-auto w-full space-y-8">

          {/* STEP 1: TYPE SELECTION */}
          <Section delay={0.1} label="01 // Protocol">
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setType('todo')}
                className={clsx(
                  "relative p-5 rounded-2xl border flex flex-col items-center gap-3 transition-all duration-300 active:scale-95 overflow-hidden group",
                  type === 'todo' 
                    ? "bg-accent-purple/5 border-accent-purple/30 text-accent-purple" 
                    : "bg-white/5 border-white/5 text-gray-500 hover:bg-white/10"
                )}
              >
                <div className={clsx("p-3 rounded-full transition-colors", type === 'todo' ? "bg-accent-purple/10" : "bg-black/20")}>
                  <Zap size={22} fill={type === 'todo' ? "currentColor" : "none"} />
                </div>
                <span className="font-bold text-xs tracking-widest">MISSION</span>
              </button>

              <button 
                onClick={() => setType('avoid')}
                className={clsx(
                  "relative p-5 rounded-2xl border flex flex-col items-center gap-3 transition-all duration-300 active:scale-95 overflow-hidden group",
                  type === 'avoid' 
                    ? "bg-orange-500/5 border-orange-500/30 text-orange-500" 
                    : "bg-white/5 border-white/5 text-gray-500 hover:bg-white/10"
                )}
              >
                <div className={clsx("p-3 rounded-full transition-colors", type === 'avoid' ? "bg-orange-500/10" : "bg-black/20")}>
                  <Shield size={22} fill={type === 'avoid' ? "currentColor" : "none"} />
                </div>
                <span className="font-bold text-xs tracking-widest">THREAT</span>
              </button>
            </div>
          </Section>

          {/* STEP 2: OBJECTIVE */}
          <Section delay={0.2} label="02 // Objective">
            <div className="bg-white/5 p-1 rounded-2xl border border-white/10 focus-within:border-white/20 transition-colors">
              <div className="p-4">
                <input 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={type === 'todo' ? "Enter Todo's..." : "Enter habit to avoid..."}
                  className="w-full bg-transparent text-xl font-bold placeholder-gray-600 outline-none text-white"
                  autoFocus
                />
              </div>
            </div>
          </Section>

          {/* STEP 3: PARAMETERS */}
          <Section delay={0.3} label="03 // Parameters">
            {type === 'todo' ? (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  {['low', 'medium', 'high'].map((p) => (
                    <button
                      key={p}
                      onClick={() => setPriority(p)}
                      className={clsx(
                        "py-3 rounded-xl border font-bold text-[10px] uppercase transition-all duration-200",
                        priority === p 
                          ? p === 'high' ? "bg-accent-purple/20 border-accent-purple text-accent-purple"
                          : p === 'medium' ? "bg-accent-cyan/20 border-accent-cyan text-accent-cyan"
                          : "bg-accent-green/20 border-accent-green text-accent-green"
                          : "border-white/5 bg-white/5 text-gray-500 hover:bg-white/10"
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white/5 p-6 rounded-2xl border border-white/5 space-y-6">
                <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-gray-400 tracking-widest">PENALTY COST</span>
                    <span className="text-xl font-bold text-orange-500">{cost} PTS</span>
                </div>
                <input 
                  type="range" min="10" max="200" step="10" 
                  value={cost} onChange={(e) => setCost(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
              </div>
            )}
          </Section>

          {/* STEP 4: PROTOCOL (Only for Todo) */}
          {type === 'todo' && (
            <Section delay={0.4} label="04 // Protocol">
              <div className="space-y-3">
                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5 transition-colors focus-within:border-white/20">
                  <Clock size={18} className="text-gray-500" />
                  <input 
                    value={when}
                    onChange={(e) => setWhen(e.target.value)}
                    placeholder="When? (e.g. 10:00 AM)"
                    className="bg-transparent text-sm w-full outline-none placeholder-gray-600 text-white"
                  />
                </div>

                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5 transition-colors focus-within:border-white/20">
                  <MapPin size={18} className="text-gray-500" />
                  <input 
                    value={where}
                    onChange={(e) => setWhere(e.target.value)}
                    placeholder="Where? (e.g. Library)"
                    className="bg-transparent text-sm w-full outline-none placeholder-gray-600 text-white"
                  />
                </div>
              </div>
            </Section>
          )}

          {/* STEP 5: NOTES */}
          <Section delay={0.5} label="05 // Intel">
            <div className="flex gap-4 bg-white/5 p-4 rounded-xl border border-white/5 min-h-[100px] focus-within:border-white/20 transition-colors">
              <AlignLeft size={18} className="text-gray-600 mt-1 shrink-0" />
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Tactical notes..."
                className="bg-transparent text-sm w-full outline-none placeholder-gray-700 resize-none h-full text-gray-300 leading-relaxed"
              />
            </div>
          </Section>
          
        </div>
      </div>

      {/* FOOTER ACTION - Refined */}
      <div className="absolute bottom-0 left-0 right-0 p-6 pb-8 bg-[#050505]/90 backdrop-blur-md border-t border-white/5 z-50">
        <button 
          onClick={handleSubmit}
          className={clsx(
            "w-full max-w-lg mx-auto py-4 rounded-2xl font-bold text-sm tracking-widest uppercase transition-all active:scale-95 flex items-center justify-center gap-3",
            type === 'todo' 
              ? "bg-accent-green hover:bg-accent-green-light text-black shadow-lg shadow-accent-green/20" 
              : "bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-600/20"
          )}
        >
          {type === 'todo' ? <CheckCircle2 size={18} strokeWidth={2.5} /> : <AlertTriangle size={18} strokeWidth={2.5} />}
          <span>{type === 'todo' ? "Initialize Mission" : "Activate Protocol"}</span>
        </button>
      </div>

    </div>
  );
};

// Animation Helper
const Section = ({ children, delay, label }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4, ease: "easeOut" }}
    className="space-y-2"
  >
    <h3 className="text-[10px] font-bold text-gray-600 font-mono tracking-widest uppercase pl-1">
      {label}
    </h3>
    {children}
  </motion.div>
);