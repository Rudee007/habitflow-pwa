// src/components/dopamine/TaskCard.jsx
import React from 'react';
import { motion } from 'framer-motion'; // <--- This was missing
import { Check, X, Clock, MapPin } from 'lucide-react';
import { clsx } from 'clsx';

export const TaskCard = ({ task, onComplete, onFail, type = 'todo' }) => {
  const isTodo = type === 'todo';
  
  const priorityColors = {
    high: 'border-accent-purple shadow-glow-purple',
    medium: 'border-accent-cyan shadow-glow-cyan',
    low: 'border-accent-green shadow-glow-green',
  };

  const dangerStyle = 'border-accent-red shadow-glow-red bg-opacity-10 bg-accent-red';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: isTodo ? 100 : -100 }}
      whileTap={{ scale: 0.98 }}
      className={clsx(
        "relative flex flex-col p-4 mb-3 rounded-3xl border-l-4 bg-gray-900/80 backdrop-blur-sm transition-all",
        isTodo ? (priorityColors[task.priority] || priorityColors.low) : dangerStyle
      )}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex flex-col flex-1 mr-2">
          <span className="text-white font-bold text-lg tracking-wide">{task.title}</span>
          
          {/* PSYCHOLOGY: Show the "If-Then" Protocol if it exists */}
          {isTodo && (task.protocol?.when || task.protocol?.where) && (
            <div className="flex flex-wrap gap-2 mt-2">
              {task.protocol.when && (
                <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 bg-gray-800 px-2 py-1 rounded-md border border-gray-700">
                   <Clock size={10} className="text-accent-cyan" /> {task.protocol.when}
                </div>
              )}
              {task.protocol.where && (
                <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 bg-gray-800 px-2 py-1 rounded-md border border-gray-700">
                   <MapPin size={10} className="text-accent-purple" /> {task.protocol.where}
                </div>
              )}
            </div>
          )}
          
          {/* Show Notes Preview if exists */}
          {task.notes && (
             <p className="text-gray-500 text-xs mt-2 line-clamp-1 italic">"{task.notes}"</p>
          )}

          <span className="text-gray-500 text-[10px] font-bold uppercase mt-2 flex items-center gap-1">
             {isTodo && <span className={clsx("w-2 h-2 rounded-full", 
                task.priority === 'high' ? "bg-accent-purple" : 
                task.priority === 'medium' ? "bg-accent-cyan" : "bg-accent-green"
             )} />}
             {isTodo ? `${task.priority} PRIORITY` : `PENALTY: ${task.cost} PTS`}
          </span>
        </div>

        <button
          onClick={() => isTodo ? onComplete(task.id) : onFail(task.id)}
          className={clsx(
            "h-12 w-12 rounded-2xl flex flex-shrink-0 items-center justify-center transition-all shadow-lg active:scale-90",
            isTodo 
              ? "bg-gray-800 border border-gray-700 text-gray-400 hover:bg-accent-green hover:text-black hover:border-accent-green" 
              : "bg-gray-800 border border-gray-700 text-gray-400 hover:bg-accent-red hover:text-white hover:border-accent-red"
          )}
        >
          {isTodo ? <Check size={24} strokeWidth={3} /> : <X size={24} strokeWidth={3} />}
        </button>
      </div>
    </motion.div>
  );
};