// src/components/dopamine/MissionControlModal.jsx
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom'; // Import Portal
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, MapPin, AlignLeft, Crosshair, Shield } from 'lucide-react';
import { clsx } from 'clsx';
import useMarketStore from '../../store/marketStore';

export const MissionControlModal = ({ isOpen, onClose, defaultType = 'todo' }) => {
  const { addTodo, addNotTodo } = useMarketStore();
  const [type, setType] = useState(defaultType);
  
  // Form State
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState('medium');
  const [when, setWhen] = useState('');
  const [where, setWhere] = useState('');
  const [cost, setCost] = useState(50);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setType(defaultType);
      setTitle('');
      setNotes('');
      setWhen('');
      setWhere('');
      setPriority('medium');
      setCost(50);
    }
  }, [isOpen, defaultType]);

  const handleSubmit = () => {
    if (!title.trim()) return;

    if (type === 'todo') {
      addTodo({ title, priority, notes, when, where });
    } else {
      addNotTodo({ title, cost, notes });
    }
    onClose();
  };

  // Portal Logic: We render this directly to document.body
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center pointer-events-none">
          
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm pointer-events-auto"
          />

          {/* Modal Card */}
          <motion.div 
            initial={{ y: '100%' }} 
            animate={{ y: 0 }} 
            exit={{ y: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative bg-gray-900 w-full max-w-lg rounded-t-3xl sm:rounded-3xl border border-gray-800 shadow-2xl pointer-events-auto overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header Toggle */}
            <div className="flex bg-gray-950 p-2 gap-2 shrink-0">
              <button 
                onClick={() => setType('todo')}
                className={clsx(
                  "flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all",
                  type === 'todo' ? "bg-gray-800 text-white shadow-lg" : "text-gray-500 hover:text-gray-300"
                )}
              >
                <Crosshair size={16} className={type === 'todo' ? "text-accent-green" : ""} />
                NEW MISSION
              </button>
              <button 
                 onClick={() => setType('avoid')}
                 className={clsx(
                   "flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all",
                   type === 'avoid' ? "bg-gray-800 text-white shadow-lg" : "text-gray-500 hover:text-gray-300"
                 )}
              >
                <Shield size={16} className={type === 'avoid' ? "text-accent-red" : ""} />
                NEW THREAT
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Title Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 tracking-widest uppercase">
                  {type === 'todo' ? 'Objective Name' : 'Habit to Avoid'}
                </label>
                <input 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={type === 'todo' ? "e.g., Complete System Design" : "e.g., Doomscrolling Instagram"}
                  className="w-full bg-transparent text-xl font-bold text-white placeholder-gray-700 outline-none border-b border-gray-800 focus:border-accent-purple py-2 transition-colors"
                  autoFocus
                />
              </div>

              {/* Priority / Cost Matrix */}
              {type === 'todo' ? (
                 <div className="space-y-3">
                   <label className="text-xs font-bold text-gray-500 tracking-widest uppercase">Priority Level</label>
                   <div className="flex gap-2">
                     {['low', 'medium', 'high'].map((p) => (
                       <button
                         key={p}
                         onClick={() => setPriority(p)}
                         className={clsx(
                           "flex-1 py-3 rounded-xl border font-bold text-xs uppercase transition-all",
                           priority === p 
                             ? p === 'high' ? "bg-accent-purple/20 border-accent-purple text-accent-purple"
                             : p === 'medium' ? "bg-accent-cyan/20 border-accent-cyan text-accent-cyan"
                             : "bg-accent-green/20 border-accent-green text-accent-green"
                             : "border-gray-800 bg-gray-800/50 text-gray-500"
                         )}
                       >
                         {p}
                       </button>
                     ))}
                   </div>
                 </div>
              ) : (
                 <div className="space-y-3">
                   <label className="text-xs font-bold text-gray-500 tracking-widest uppercase">Penalty Cost: {cost} PTS</label>
                   <input 
                     type="range" min="10" max="200" step="10" 
                     value={cost} onChange={(e) => setCost(Number(e.target.value))}
                     className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-accent-red"
                   />
                   <div className="flex justify-between text-[10px] text-gray-600 font-mono">
                     <span>MINOR (10)</span>
                     <span>SEVERE (200)</span>
                   </div>
                 </div>
              )}

              {/* Protocol (If-Then) */}
              {type === 'todo' && (
                <div className="bg-gray-800/30 p-4 rounded-2xl border border-gray-800 space-y-4">
                  <div className="flex items-center gap-2 text-accent-cyan">
                    <AlignLeft size={14} />
                    <span className="text-xs font-bold uppercase tracking-widest">Execution Protocol</span>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 bg-gray-900/50 p-2 rounded-xl border border-gray-800 focus-within:border-gray-600 transition-colors">
                      <Clock size={16} className="text-gray-500 shrink-0" />
                      <input 
                        value={when}
                        onChange={(e) => setWhen(e.target.value)}
                        placeholder="When? (e.g. 10:00 AM)"
                        className="bg-transparent text-sm text-white placeholder-gray-600 outline-none w-full"
                      />
                    </div>
                    <div className="flex items-center gap-3 bg-gray-900/50 p-2 rounded-xl border border-gray-800 focus-within:border-gray-600 transition-colors">
                      <MapPin size={16} className="text-gray-500 shrink-0" />
                      <input 
                        value={where}
                        onChange={(e) => setWhere(e.target.value)}
                        placeholder="Where? (e.g. Study Desk)"
                        className="bg-transparent text-sm text-white placeholder-gray-600 outline-none w-full"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className="space-y-2">
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Tactical notes..."
                  rows={2}
                  className="w-full bg-gray-800/50 rounded-xl p-3 text-sm text-gray-300 placeholder-gray-600 outline-none focus:ring-1 focus:ring-gray-600 resize-none border border-transparent focus:border-gray-700"
                />
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-gray-800 bg-gray-900 shrink-0 pb-8 sm:pb-4">
              <button 
                onClick={handleSubmit}
                className={clsx(
                  "w-full py-4 rounded-2xl font-black tracking-widest uppercase transition-transform active:scale-95 shadow-lg",
                  type === 'todo' 
                    ? "bg-accent-green text-black shadow-glow-green hover:bg-accent-green-light" 
                    : "bg-accent-red text-white shadow-glow-red hover:bg-accent-red-light"
                )}
              >
                {type === 'todo' ? 'INITIALIZE MISSION' : 'ACTIVATE SHIELD'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body // Target container
  );
};