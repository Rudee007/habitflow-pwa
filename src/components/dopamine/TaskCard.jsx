import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, Clock, MapPin } from 'lucide-react';
import { clsx } from 'clsx';

export const TaskCard = ({ task, onComplete, onFail, type = 'todo' }) => {
  const isTodo = type === 'todo';
  
  // Professional color palette
  const priorityStyles = {
    high: 'bg-purple-500/20 text-purple-200 border-purple-500/30',
    medium: 'bg-sky-500/20 text-sky-200 border-sky-500/30',
    low: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30',
  };

  const threatStyle = 'bg-red-950/40 border-red-500/30 hover:bg-red-900/40';
  const cardBaseStyle = 'bg-gray-900/80 border-white/10 hover:bg-gray-800/90';

  return (
    <motion.div
      layout // Enables smooth reordering when other items disappear
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ 
        opacity: 0, 
        x: isTodo ? 50 : -50, // Slide right for Todo, Left for Threat
        height: 0,           // Collapse height smoothly
        marginBottom: 0,     // Remove margin
        transition: { duration: 0.3, ease: "backIn" } 
      }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={clsx(
        "relative group flex flex-col p-4 mb-3 rounded-2xl border backdrop-blur-md overflow-hidden",
        isTodo ? cardBaseStyle : threatStyle
      )}
    >
      <div className="flex justify-between items-start gap-3">
        
        {/* LEFT CONTENT */}
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className={clsx(
              "font-bold text-base truncate pr-2 shadow-black drop-shadow-md",
              isTodo ? "text-white" : "text-red-100"
            )}>
              {task.title}
            </span>
            
            {isTodo && (
              <span className={clsx(
                "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border",
                priorityStyles[task.priority] || priorityStyles.low
              )}>
                {task.priority}
              </span>
            )}
            
            {!isTodo && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border border-red-500/40 text-red-300 bg-red-500/10">
                -{task.cost} PTS
              </span>
            )}
          </div>
          
          {task.notes && (
             <p className="text-gray-400 text-xs mb-2 line-clamp-1 font-medium opacity-80">
               {task.notes}
             </p>
          )}

          {isTodo && (task.protocol?.when || task.protocol?.where) && (
            <div className="flex flex-wrap gap-3 mt-1 opacity-60 group-hover:opacity-100 transition-opacity">
              {task.protocol.when && (
                <div className="flex items-center gap-1.5 text-xs text-gray-300">
                   <Clock size={12} className="text-sky-400" /> 
                   <span>{task.protocol.when}</span>
                </div>
              )}
              {task.protocol.where && (
                <div className="flex items-center gap-1.5 text-xs text-gray-300">
                   <MapPin size={12} className="text-purple-400" /> 
                   <span>{task.protocol.where}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT ACTION BUTTON */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            isTodo ? onComplete(task.id) : onFail(task.id);
          }}
          className={clsx(
            "h-10 w-10 rounded-xl flex flex-shrink-0 items-center justify-center transition-all duration-200 border shadow-lg active:scale-90",
            isTodo 
              ? "bg-gray-800 border-gray-600 text-gray-400 hover:border-accent-green hover:bg-accent-green hover:text-black" 
              : "bg-red-900/20 border-red-800 text-red-500 hover:border-red-500 hover:bg-red-600 hover:text-white"
          )}
        >
          {isTodo ? <Check size={18} strokeWidth={3} /> : <X size={18} strokeWidth={3} />}
        </button>
      </div>
    </motion.div>
  );
};