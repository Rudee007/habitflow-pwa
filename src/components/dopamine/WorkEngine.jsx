import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Zap, Shield, ChevronDown, Edit3, ChevronsDown, ChevronsUp } from 'lucide-react';
import useMarketStore from '../../store/marketStore';
import { TaskCard } from './TaskCard';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const buildCalendarDays = (pivot) => {
  const days = [];
  for (let i = -14; i <= 30; i++) {
    const d = new Date(pivot);
    d.setDate(pivot.getDate() + i);
    days.push(new Date(d));
  }
  return days;
};

export const WorkEngine = ({ onNavigate }) => {
  const points = useMarketStore(s => s.points);
  const todos = useMarketStore(s => s.todos);
  const notTodos = useMarketStore(s => s.notTodos);
  const completeTodo = useMarketStore(s => s.completeTodo);
  const failNotTodo = useMarketStore(s => s.failNotTodo);
  const deleteTask = useMarketStore(s => s.deleteTask);

  const today = new Date();
  const [activeTab, setActiveTab] = useState('todo');
  const [selectedDate, setSelectedDate] = useState(new Date(today));
  
  // NEW: Global expand/collapse state
  const [expandAll, setExpandAll] = useState(false);
  
  const scrollRef = useRef(null);
  const activeDateRef = useRef(null);

  const calDays = buildCalendarDays(today);
  const activeTodos = todos.filter(t => !t.completed);
  const displayList = activeTab === 'todo' ? activeTodos : notTodos;
  const hasTasks = displayList.length > 0;

  const isSameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const isPast = (d) => d < today && !isSameDay(d, today);
  const monthLabel = selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Auto-scroll the calendar
  useEffect(() => {
    if (activeDateRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const activeEl = activeDateRef.current;
      const scrollPosition = activeEl.offsetLeft - (container.offsetWidth / 2) + (activeEl.offsetWidth / 2);
      container.scrollTo({ left: scrollPosition, behavior: 'smooth' });
    }
  }, [selectedDate]);

  // Reset expandAll when switching tabs
  useEffect(() => {
    setExpandAll(false);
  }, [activeTab]);

  return (
    <div className="flex flex-col h-full bg-transparent pb-16 overflow-hidden relative" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif' }}>
      
      {/* ───── HEADER ───── */}
      <div className="flex justify-between items-center px-5 pt-8 mb-6 shrink-0 z-10">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-gray-500 mb-1 drop-shadow-md">
            Current Balance
          </p>
          <div className="flex items-baseline gap-2 drop-shadow-lg">
            <span className="text-5xl font-black tracking-tight text-white leading-none">
              {points.toLocaleString()}
            </span>
            <span className="text-sm font-bold text-gray-400 tracking-widest">PTS</span>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <button
            onClick={() => onNavigate(activeTab)}
            className="flex items-center gap-2 px-4 py-3 rounded-[1rem] transition-all active:scale-95 border backdrop-blur-md"
            style={{
              background: activeTab === 'todo' ? 'rgba(146,232,42,0.1)' : 'rgba(252,108,116,0.1)',
              borderColor: activeTab === 'todo' ? 'rgba(146,232,42,0.3)' : 'rgba(252,108,116,0.3)',
              color: activeTab === 'todo' ? '#92E82A' : '#FC6C74',
            }}
          >
            <Edit3 size={16} strokeWidth={2.5} />
            <span className="text-[11px] font-black uppercase tracking-wider">
              {activeTab === 'todo' ? 'Draft' : 'Log'}
            </span>
          </button>
        </div>
      </div>

      {/* ───── CALENDAR STRIP ───── */}
      <div className="shrink-0 px-5 mb-5 relative z-10">
        <div className="flex items-center justify-between mb-3">
          <button className="flex items-center gap-1 text-sm font-bold text-white drop-shadow-md">
            {monthLabel}
            <ChevronDown size={14} className="text-gray-400" />
          </button>
          <span className="text-[10px] font-bold tracking-widest uppercase transition-colors drop-shadow-md" style={{ color: activeTab === 'todo' ? '#92E82A' : '#FC6C74' }}>
            {activeTab === 'todo' ? 'Operations' : 'Threats'}
          </span>
        </div>

        <div ref={scrollRef} className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x" style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
          {calDays.map((d, i) => {
            const isSelected = isSameDay(d, selectedDate);
            const isToday = isSameDay(d, today);
            const past = isPast(d);

            return (
              <button
                key={i} ref={isSelected ? activeDateRef : null} onClick={() => setSelectedDate(new Date(d))}
                className="flex flex-col items-center shrink-0 rounded-[1.2rem] transition-all duration-300 snap-center backdrop-blur-md"
                style={{
                  width: 48, padding: '10px 0',
                  background: isSelected ? '#92E82A' : isToday ? 'rgba(146,232,42,0.15)' : 'rgba(255,255,255,0.03)',
                  border: isSelected ? 'none' : isToday ? '1px solid rgba(146,232,42,0.4)' : '1px solid rgba(255,255,255,0.05)',
                  transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                  boxShadow: isSelected ? '0 10px 20px rgba(146,232,42,0.3)' : '0 4px 10px rgba(0,0,0,0.1)'
                }}
              >
                <span className="text-[9px] font-bold tracking-wider mb-1" style={{ color: isSelected ? '#000' : past ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.6)' }}>
                  {DAYS[d.getDay()].toUpperCase()}
                </span>
                <span className="text-lg font-black leading-none" style={{ color: isSelected ? '#000' : past ? 'rgba(255,255,255,0.3)' : isToday ? '#fff' : 'rgba(255,255,255,0.9)' }}>
                  {d.getDate()}
                </span>
                <div className="rounded-full mt-1.5 transition-colors" style={{ width: 4, height: 4, background: isSelected ? '#00000044' : isToday ? '#92E82A' : 'transparent' }} />
              </button>
            );
          })}
        </div>
      </div>

      {/* ───── ATTACK / DEFENSE TOGGLE ───── */}
      <div className="mx-5 flex rounded-[1.2rem] mb-5 shrink-0 p-1 bg-black/40 backdrop-blur-md border border-white/10 relative z-10 shadow-lg">
        <motion.div 
          className="absolute top-1 bottom-1 rounded-xl bg-white/10 shadow-inner"
          initial={false}
          animate={{ x: activeTab === 'todo' ? '0%' : '100%', width: 'calc(50% - 4px)' }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
        {[
          { id: 'todo', Icon: Zap, label: 'ATTACK', color: '#92E82A' },
          { id: 'avoid', Icon: Shield, label: 'DEFENSE', color: '#FC6C74' },
        ].map(({ id, Icon, label, color }) => (
          <button
            key={id} onClick={() => setActiveTab(id)}
            className="flex-1 flex items-center justify-center gap-2 py-3 relative z-10 transition-colors duration-200 text-[11px] font-bold tracking-widest uppercase drop-shadow-md"
            style={{ color: activeTab === id ? color : 'rgba(255,255,255,0.5)' }}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* ───── TASK LIST ───── */}
      <div className="flex-1 overflow-y-auto min-h-0 px-5 relative z-0 scrollbar-hide pb-32">
        
        {/* Sticky Header with Toggle Button */}
        <div className="sticky top-0 z-20 bg-gradient-to-b from-black/90 via-black/60 to-transparent pt-2 pb-6 mb-2 flex justify-between items-center">
          <p className="text-[9px] font-bold tracking-[0.2em] uppercase text-white/50 drop-shadow-md">
            {activeTab === 'todo' ? 'Timeline Directives' : 'Active Threats'}
          </p>
          {hasTasks && (
            <button 
              onClick={() => setExpandAll(!expandAll)}
              className="flex items-center gap-1 text-[9px] font-bold tracking-widest uppercase text-white/50 hover:text-white transition-colors"
            >
              {expandAll ? (
                <><ChevronsUp size={12} /> Collapse All</>
              ) : (
                <><ChevronsDown size={12} /> Expand All</>
              )}
            </button>
          )}
        </div>

        {activeTab === 'todo' ? (
          <motion.div key="todo" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
            <AnimatePresence mode="popLayout">
              {activeTodos.map((task, idx) => (
                <TaskCard key={task.id} task={task} type="todo" index={idx} globalExpand={expandAll} onComplete={completeTodo} onDelete={deleteTask} />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div key="avoid" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
            <AnimatePresence mode="popLayout">
              {notTodos.map((task, idx) => (
                <TaskCard key={task.id} task={task} type="avoid" index={idx} globalExpand={expandAll} onFail={failNotTodo} onDelete={deleteTask} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {!hasTasks && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 rounded-3xl p-10 text-center bg-black/30 backdrop-blur-sm border border-dashed border-white/10 shadow-xl">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3 border border-white/5">
              {activeTab === 'todo' ? <Zap size={20} className="text-white/40" /> : <Shield size={20} className="text-white/40" />}
            </div>
            <p className="text-sm font-bold text-gray-300">Timeline is clear</p>
            <p className="text-xs mt-1 text-gray-500 font-medium">No active tasks for this filter.</p>
          </motion.div>
        )}
      </div>
      
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none z-40" />
    </div>
  );
};