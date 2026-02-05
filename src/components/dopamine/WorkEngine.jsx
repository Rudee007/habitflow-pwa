// src/components/dopamine/WorkEngine.jsx
import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Zap, Shield } from 'lucide-react';
import { clsx } from 'clsx';
import useMarketStore from '../../store/marketStore';
import { TaskCard } from './TaskCard';
import { MissionControlModal } from './MissionControlModal';

export const WorkEngine = () => {
  const points = useMarketStore(state => state.points);
  const todos = useMarketStore(state => state.todos);
  const notTodos = useMarketStore(state => state.notTodos);
  const completeTodo = useMarketStore(state => state.completeTodo);
  const failNotTodo = useMarketStore(state => state.failNotTodo);
  
  const [activeTab, setActiveTab] = useState('todo'); 
  const [isModalOpen, setIsModalOpen] = useState(false);

  const activeTodos = todos.filter(t => !t.completed);
  const hasTasks = activeTab === 'todo' ? activeTodos.length > 0 : notTodos.length > 0;

  return (
    <div className="flex flex-col h-full bg-black px-4 pt-6 pb-24 overflow-hidden relative">
      
      {/* HEADER: The Scoreboard */}
      <div className="flex justify-between items-end mb-8 flex-shrink-0">
        <div>
          <h2 className="text-gray-400 text-xs font-bold tracking-widest uppercase mb-1">Current Balance</h2>
          <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-accent-green to-accent-cyan font-sans tracking-tight">
            {points.toLocaleString()} <span className="text-2xl text-gray-500 font-bold">PTS</span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="text-accent-purple font-black tracking-wider">LEVEL 5</div>
          <div className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">ARCHITECT</div>
        </div>
      </div>

      {/* TOGGLE */}
      <div className="flex bg-gray-900 p-1 rounded-full mb-6 relative flex-shrink-0">
        <motion.div 
          className="absolute bg-gray-800 rounded-full h-[calc(100%-8px)] top-1 bottom-1 w-[48%]"
          initial={false}
          animate={{ 
            x: activeTab === 'todo' ? '2%' : '100%',
            backgroundColor: activeTab === 'todo' ? '#2C2C2E' : '#2C2C2E' 
          }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
        <button 
          onClick={() => setActiveTab('todo')} 
          className="flex-1 py-3 text-center z-10 font-bold text-sm flex justify-center items-center gap-2 transition-colors duration-200"
        >
           <Zap size={16} className={activeTab === 'todo' ? "text-accent-green" : "text-gray-500"} fill={activeTab === 'todo' ? "currentColor" : "none"} /> 
           <span className={activeTab === 'todo' ? "text-white" : "text-gray-500"}>ATTACK</span>
        </button>
        <button 
          onClick={() => setActiveTab('avoid')} 
          className="flex-1 py-3 text-center z-10 font-bold text-sm flex justify-center items-center gap-2 transition-colors duration-200"
        >
           <Shield size={16} className={activeTab === 'avoid' ? "text-accent-red" : "text-gray-500"} fill={activeTab === 'avoid' ? "currentColor" : "none"} />
           <span className={activeTab === 'avoid' ? "text-white" : "text-gray-500"}>DEFENSE</span>
        </button>
      </div>

      {/* ACTION BUTTON */}
      <div className="mb-6 flex-shrink-0">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full py-4 rounded-3xl bg-gray-900 border border-gray-800 flex items-center justify-center gap-3 text-gray-400 hover:text-white hover:border-accent-green transition-all group active:scale-95"
        >
          <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center group-hover:bg-accent-green group-hover:text-black transition-colors shadow-lg">
            <Plus size={20} strokeWidth={3} />
          </div>
          <span className="font-bold tracking-wide text-sm">INITIALIZE NEW MISSION</span>
        </button>
      </div>

      {/* TASK LIST */}
      <div className="flex-1 overflow-y-auto min-h-0 pr-1 pb-20 scrollbar-hide">
        <h3 className="text-gray-500 text-[10px] font-bold mb-4 uppercase tracking-widest sticky top-0 bg-black/95 backdrop-blur-sm py-2 z-10">
          {activeTab === 'todo' ? "High Priority Operations" : "Active Threats"}
        </h3>
        
        <AnimatePresence mode="popLayout" initial={false}>
          {activeTab === 'todo' ? (
            activeTodos.map(task => (
              <TaskCard key={task.id} task={task} type="todo" onComplete={completeTodo} />
            ))
          ) : (
            notTodos.map(task => (
              <TaskCard key={task.id} task={task} type="avoid" onFail={failNotTodo} />
            ))
          )}
        </AnimatePresence>

        {!hasTasks && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-gray-600 mt-10 border border-dashed border-gray-800 rounded-2xl p-8"
          >
            <p className="text-sm font-medium">No active missions.</p>
            <p className="text-xs mt-1 opacity-50">System standby...</p>
          </motion.div>
        )}
      </div>

      {/* MODAL (Now rendered unconditionally, it handles its own visibility via Portal) */}
      <MissionControlModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        defaultType={activeTab}
      />
    </div>
  );
};