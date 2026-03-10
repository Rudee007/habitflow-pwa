import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { 
  Trash2, Check, AlertOctagon, MapPin, Zap, 
  ChevronDown, Terminal, Crosshair, ShieldAlert, ArrowRight 
} from 'lucide-react';
import { clsx } from 'clsx';

export const TaskCard = ({ task, onComplete, onFail, onDelete, type = 'todo', index = 0, globalExpand = false }) => {
  const [isExpanded, setIsExpanded] = useState(globalExpand);

  useEffect(() => {
    setIsExpanded(globalExpand);
  }, [globalExpand]);

  const isTodo = type === 'todo';
  
  // Tactical Theme Mapping
  const theme = {
    high: { color: 'text-accent-purple', border: 'border-accent-purple/40', bg: 'bg-accent-purple', glow: 'shadow-[0_0_15px_rgba(180,126,255,0.3)]' },
    medium: { color: 'text-accent-cyan', border: 'border-accent-cyan/40', bg: 'bg-accent-cyan', glow: 'shadow-[0_0_15px_rgba(56,177,197,0.3)]' },
    low: { color: 'text-accent-green', border: 'border-accent-green/40', bg: 'bg-accent-green', glow: 'shadow-[0_0_15px_rgba(146,232,42,0.3)]' },
    avoid: { color: 'text-orange-500', border: 'border-orange-500/40', bg: 'bg-orange-500', glow: 'shadow-[0_0_15px_rgba(249,115,22,0.3)]' }
  }[isTodo ? task.priority : 'avoid'];

  const x = useMotionValue(0);
  const opacity = useTransform(x, [0, 60], [0, 1]);

  return (
    <div className="relative w-full mb-3 px-3 group">
      
      {/* Swipe Delete Action */}
      <div className="absolute inset-0 left-3 right-3 bg-red-950/20 rounded-xl flex items-center pl-5 border border-red-900/20">
        <motion.div style={{ opacity }}>
          <Trash2 size={16} className="text-red-500" />
        </motion.div>
      </div>

      {/* Main Card Body */}
      <motion.div
        layout
        drag="x"
        dragConstraints={{ left: 0, right: 80 }}
        dragElastic={0.1}
        onDragEnd={(_, info) => info.offset.x > 60 && onDelete(task.id, type)}
        style={{ x, touchAction: 'pan-y' }}
        onClick={() => setIsExpanded(!isExpanded)}
        className="relative z-10 bg-[#0A0A0A] border border-white/5 rounded-xl p-3.5 flex flex-col hover:border-white/10 transition-colors cursor-pointer overflow-hidden shadow-md"
      >
        {/* --- COLLAPSED VIEW (Header) --- */}
        <div className="flex items-center gap-3 w-full">
          {/* Neon Priority Line */}
          <div className={clsx("w-1 rounded-full shrink-0 transition-all duration-300", isTodo ? theme.bg : 'bg-orange-600', isExpanded ? "h-10" : "h-7")} />

          {/* Content Area */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className={clsx("text-[8px] font-black tracking-widest uppercase", theme.color)}>
                {isTodo ? `OP_PR_${task.priority}` : 'THREAT_MONITOR'}
              </span>
              {isTodo && task.protocol?.when && (
                <span className="text-[8px] text-gray-600 font-mono italic">
                  // {task.protocol.when}
                </span>
              )}
            </div>
            
            <h3 className="text-sm font-bold text-gray-200 truncate tracking-tight uppercase">
              {task.title}
            </h3>

            {/* Context Footer (Hidden when expanded) */}
            {!isExpanded && (
                <div className="flex items-center gap-3 mt-1 opacity-60">
                  {isTodo ? (
                    task.protocol?.where && (
                      <div className="flex items-center gap-1 text-[9px] text-gray-400">
                        <MapPin size={9} className={theme.color} />
                        <span className="truncate">{task.protocol.where}</span>
                      </div>
                    )
                  ) : (
                    <div className="flex items-center gap-1 text-[9px] text-orange-500 font-bold">
                      <Zap size={9} />
                      <span>-{task.cost} SCORE</span>
                    </div>
                  )}
                </div>
            )}
          </div>

          {/* Status Icon / Chevron */}
          <div className="flex items-center gap-2 shrink-0">
            <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.3 }} className="text-gray-600">
              <ChevronDown size={14} />
            </motion.div>

            {/* Quick Action Button (Hides when expanded) */}
            {!isExpanded && (
                <button
                  onPointerDown={e => e.stopPropagation()}
                  onClick={(e) => { e.stopPropagation(); isTodo ? onComplete(task.id) : onFail(task.id); }}
                  className={clsx(
                    "w-8 h-8 rounded-lg flex items-center justify-center border transition-all active:scale-95 shrink-0",
                    isTodo 
                      ? "border-white/10 bg-white/5 text-gray-400 hover:text-accent-green hover:border-accent-green/50" 
                      : "border-orange-500/20 bg-orange-500/5 text-orange-500 hover:bg-orange-500/10"
                  )}
                >
                  {isTodo ? <Check size={16} strokeWidth={3} /> : <AlertOctagon size={16} strokeWidth={3} />}
                </button>
            )}
          </div>
        </div>

        {/* --- EXPANDED DOSSIER VIEW --- */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-col gap-3 pt-3" // Tighter padding
            >
              {/* Aesthetic Divider */}
              <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

              {/* Tactical Directives (Notes) */}
              {task.notes && (
                <div className="relative bg-black/50 rounded-r-lg border border-white/5 border-l-2 p-2.5 flex flex-col gap-1.5" style={{ borderLeftColor: isTodo ? 'var(--tw-colors-accent-green)' : '#f97316' }}>
                  <div className="flex items-center gap-1.5 opacity-50">
                    <Terminal size={10} className={theme.color} />
                    <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-gray-400">Mission Directives</span>
                  </div>
                  {/* Tighter line-height and smaller font for long text */}
                  <p className="text-[11px] text-gray-300 leading-snug font-medium">
                    {task.notes}
                  </p>
                </div>
              )}

              {/* Telemetry HUD (Data Grid) */}
              <div className="grid grid-cols-2 gap-2"> {/* Tighter grid */}
                {isTodo && task.protocol?.where && (
                  <div className="flex items-center gap-2 bg-white/[0.02] border border-white/5 rounded-lg p-2">
                    <div className={clsx("w-6 h-6 rounded flex items-center justify-center bg-black/50 border", theme.border)}>
                      <Crosshair size={12} className={theme.color} />
                    </div>
                    <div className="flex flex-col min-w-0"> {/* Added min-w-0 for truncate */}
                      <span className="text-[7px] font-bold text-gray-500 uppercase tracking-widest">Target Location</span>
                      <span className="text-[10px] font-black text-white truncate w-full">{task.protocol.where}</span>
                    </div>
                  </div>
                )}
                
                {!isTodo && (
                  <div className="flex items-center gap-2 bg-orange-500/5 border border-orange-500/20 rounded-lg p-2">
                    <div className="w-6 h-6 rounded flex items-center justify-center bg-orange-950/50 border border-orange-500/30">
                      <Zap size={12} className="text-orange-500" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[7px] font-bold text-orange-500/70 uppercase tracking-widest">Penalty Impact</span>
                      <span className="text-[10px] font-black text-orange-500">-{task.cost} PTS</span>
                    </div>
                  </div>
                )}

                {!isTodo && task.failCount > 0 && (
                  <div className="flex items-center gap-2 bg-red-500/5 border border-red-500/20 rounded-lg p-2">
                    <div className="w-6 h-6 rounded flex items-center justify-center bg-red-950/50 border border-red-500/30">
                      <ShieldAlert size={12} className="text-red-500" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[7px] font-bold text-red-500/70 uppercase tracking-widest">Breaches Logged</span>
                      <span className="text-[10px] font-black text-red-500">{task.failCount}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Big Action Command Button - Tighter Padding */}
              <button
                onPointerDown={e => e.stopPropagation()}
                onClick={e => { e.stopPropagation(); isTodo ? onComplete(task.id) : onFail(task.id); }}
                className={clsx(
                  "relative overflow-hidden w-full py-2.5 mt-1 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.98] border font-black text-[10px] tracking-[0.15em] uppercase group",
                  isTodo 
                    ? `bg-[#0A0A0A] text-white hover:text-black hover:bg-white border-white/20 hover:border-white shadow-md` 
                    : `bg-[#0A0A0A] text-orange-500 hover:text-white hover:bg-orange-600 border-orange-500/30 hover:border-orange-500 shadow-md`
                )}
              >
                {/* Glowing Hover Effect Layer */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                
                {isTodo ? <Check size={14} strokeWidth={3} /> : <AlertOctagon size={14} strokeWidth={3} />}
                <span className="relative z-10">{isTodo ? "Authorize Execution" : "Log Protocol Breach"}</span>
                <ArrowRight size={12} strokeWidth={3} className={clsx("opacity-50 group-hover:opacity-100 transition-opacity", isTodo ? "text-accent-green" : "text-white")} />
              </button>

              {/* Decorative Tech Footer */}
              <div className="w-full flex justify-between items-center opacity-30 px-1 pt-0.5">
                <span className="text-[7px] font-mono tracking-widest text-gray-400">SYS_ID: {task.id.slice(0,8).toUpperCase()}</span>
                <div className="flex gap-1">
                  <div className="w-1 h-1 bg-gray-400 rounded-full" />
                  <div className="w-1 h-1 bg-gray-400 rounded-full" />
                  <div className="w-3 h-1 bg-gray-400 rounded-full" />
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
};