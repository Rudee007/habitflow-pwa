import React from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Trash2, Check, AlertOctagon, MapPin, Clock, Zap, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

export const TaskCard = ({ task, onComplete, onFail, onDelete, type = 'todo', index = 0 }) => {
  const isTodo = type === 'todo';
  
  // Clean theme mapping
  const theme = {
    high: { color: 'text-accent-purple', border: 'border-accent-purple/40', bg: 'bg-accent-purple/5' },
    medium: { color: 'text-accent-cyan', border: 'border-accent-cyan/40', bg: 'bg-accent-cyan/5' },
    low: { color: 'text-accent-green', border: 'border-accent-green/40', bg: 'bg-accent-green/5' },
    avoid: { color: 'text-orange-500', border: 'border-orange-500/40', bg: 'bg-orange-500/5' }
  }[isTodo ? task.priority : 'avoid'];

  const x = useMotionValue(0);
  const opacity = useTransform(x, [0, 60], [0, 1]);

  return (
    <div className="relative w-full mb-3 px-4 overflow-hidden group">
      
      {/* Swipe Delete Action (Minimalist) */}
      <div className="absolute inset-0 left-4 right-4 bg-red-950/20 rounded-xl flex items-center pl-6 border border-red-900/20">
        <motion.div style={{ opacity }}>
          <Trash2 size={18} className="text-red-500" />
        </motion.div>
      </div>

      {/* Main Card Body */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 80 }}
        dragElastic={0.1}
        onDragEnd={(_, info) => info.offset.x > 60 && onDelete(task.id, type)}
        style={{ x, touchAction: 'pan-y' }}
        className="relative z-10 bg-[#0A0A0A] border border-white/5 rounded-xl p-4 flex items-center gap-4 hover:border-white/10 transition-colors"
      >
        {/* Priority Indicator Dot */}
        <div className={clsx("w-1 h-8 rounded-full shrink-0", isTodo ? theme.color.replace('text', 'bg') : 'bg-orange-600')} />

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={clsx("text-[9px] font-black tracking-widest uppercase", theme.color)}>
              {isTodo ? `PR_${task.priority}` : 'THREAT_MONITOR'}
            </span>
            {isTodo && task.protocol?.when && (
              <span className="text-[9px] text-gray-600 font-mono italic">
                // {task.protocol.when}
              </span>
            )}
          </div>
          
          <h3 className="text-[15px] font-bold text-gray-200 truncate tracking-tight uppercase">
            {task.title}
          </h3>

          {/* Context Footer */}
          <div className="flex items-center gap-3 mt-2 opacity-60">
            {isTodo ? (
              task.protocol?.where && (
                <div className="flex items-center gap-1 text-[10px] text-gray-400">
                  <MapPin size={10} className={theme.color} />
                  <span className="truncate">{task.protocol.where}</span>
                </div>
              )
            ) : (
              <div className="flex items-center gap-1 text-[10px] text-orange-500 font-bold">
                <Zap size={10} />
                <span>-{task.cost} SCORE</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Button (Professional Square) */}
        <button
          onClick={() => isTodo ? onComplete(task.id) : onFail(task.id)}
          className={clsx(
            "w-10 h-10 rounded-lg flex items-center justify-center border transition-all active:scale-95 shrink-0",
            isTodo 
              ? "border-white/10 bg-white/5 text-gray-400 hover:text-accent-green hover:border-accent-green/50" 
              : "border-orange-500/20 bg-orange-500/5 text-orange-500 hover:bg-orange-500/10"
          )}
        >
          {isTodo ? <Check size={20} strokeWidth={2.5} /> : <AlertOctagon size={20} strokeWidth={2.5} />}
        </button>
      </motion.div>
    </div>
  );
};