import React, { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Check, X, Clock, MapPin, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';

export const TaskCard = ({ task, onComplete, onFail, onDelete, type = 'todo' }) => {
  const isTodo = type === 'todo';
  const x = useMotionValue(0);
  const opacity = useTransform(x, [0, 100], [0, 1]); // Fade in trash icon
  const scale = useTransform(x, [0, 100], [0.8, 1.2]); // Scale up trash icon
  
  // Professional color palette
  const priorityStyles = {
    high: 'bg-purple-500/20 text-purple-200 border-purple-500/30',
    medium: 'bg-sky-500/20 text-sky-200 border-sky-500/30',
    low: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30',
  };

  const threatStyle = 'bg-red-950/40 border-red-500/30'; // Removed hover for touch devices
  const cardBaseStyle = 'bg-gray-900/80 border-white/10';

  const handleDragEnd = (_, info) => {
    if (info.offset.x > 100) { // Threshold to trigger delete
      if (navigator.vibrate) navigator.vibrate(50);
      onDelete(task.id, type);
    }
  };

  return (
    <div className="relative mb-3 group">
      
      {/* BACKGROUND LAYER (TRASH ICON) */}
      <div className="absolute inset-0 bg-red-900/20 rounded-2xl flex items-center justify-start pl-6 border border-red-500/20">
        <motion.div style={{ opacity, scale }}>
          <Trash2 className="text-red-500" size={24} />
        </motion.div>
      </div>

      {/* FOREGROUND CARD (DRAGGABLE) */}
      <motion.div
        layout
        drag="x"
        dragConstraints={{ left: 0, right: 0 }} // Snap back to center
        dragElastic={0.7} // Resistance feeling
        onDragEnd={handleDragEnd}
        style={{ x, touchAction: 'pan-y' }} // touchAction ensures vertical scroll still works
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
        className={clsx(
          "relative flex flex-col p-4 rounded-2xl border backdrop-blur-md overflow-hidden z-10",
          isTodo ? cardBaseStyle : threatStyle
        )}
      >
        <div className="flex justify-between items-start gap-3">
          
          {/* LEFT CONTENT */}
          <div className="flex flex-col flex-1 min-w-0 pointer-events-none"> {/* Disable pointer events on text to prevent selecting while dragging */}
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
            
            {/* Show Fail Count for Threats */}
            {!isTodo && (task.failCount > 0) && (
                <div className="text-[10px] font-bold text-red-400 mb-1">
                  FAILED {task.failCount} TIMES
                </div>
            )}
            
            {task.notes && (
               <p className="text-gray-400 text-xs mb-2 line-clamp-1 font-medium opacity-80">
                 {task.notes}
               </p>
            )}

            {isTodo && (task.protocol?.when || task.protocol?.where) && (
              <div className="flex flex-wrap gap-3 mt-1 opacity-60">
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

          {/* RIGHT ACTION BUTTON (Prevent Drag Propagation) */}
          <div onPointerDown={(e) => e.stopPropagation()}>
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
        </div>
      </motion.div>
    </div>
  );
};