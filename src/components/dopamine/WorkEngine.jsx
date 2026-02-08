// src/components/dopamine/WorkEngine.jsx
import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Zap, Shield } from 'lucide-react';
import useMarketStore from '../../store/marketStore';
import { TaskCard } from './TaskCard';

export const WorkEngine = ({ onNavigate }) => {
  const points = useMarketStore(state => state.points);
  const todos = useMarketStore(state => state.todos);
  const notTodos = useMarketStore(state => state.notTodos);
  const completeTodo = useMarketStore(state => state.completeTodo);
  const failNotTodo = useMarketStore(state => state.failNotTodo);
  const deleteTask = useMarketStore(state => state.deleteTask); // <--- IMPORT DELETE
  
  const [activeTab, setActiveTab] = useState('todo'); 

  const activeTodos = todos.filter(t => !t.completed);
  const hasTasks = activeTab === 'todo' ? activeTodos.length > 0 : notTodos.length > 0;

  return (
    <div className="flex flex-col h-full bg-transparent px-4 pt-6 pb-24 overflow-hidden relative">
      
      {/* ... Header, Toggle, and Action Button remain unchanged ... */}
      {/* (Copy them from previous step or leave as is) */}
      <div className="flex justify-between items-end mb-8 flex-shrink-0">
        <div>
          <h2 className="text-gray-400 text-xs font-bold tracking-widest uppercase mb-1 drop-shadow-md">Current Balance</h2>
          <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-accent-green to-accent-cyan font-sans tracking-tight drop-shadow-lg filter">
            {points.toLocaleString()} <span className="text-2xl text-gray-400 font-bold ml-1">PTS</span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="text-accent-purple font-black tracking-wider drop-shadow-md">LEVEL 5</div>
          <div className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">ARCHITECT</div>
        </div>
      </div>

      {/* TOGGLE */}
      <div className="flex bg-white/5 backdrop-blur-md border border-white/10 p-1 rounded-full mb-6 relative flex-shrink-0 shadow-xl">
        <motion.div 
          className="absolute rounded-full h-[calc(100%-8px)] top-1 bottom-1 w-[48%]"
          initial={false}
          animate={{ 
            x: activeTab === 'todo' ? '2%' : '100%',
            backgroundColor: activeTab === 'todo' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.1)' 
          }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
        <button 
          onClick={() => setActiveTab('todo')} 
          className="flex-1 py-3 text-center z-10 font-bold text-sm flex justify-center items-center gap-2 transition-colors duration-200"
        >
           <Zap size={16} className={activeTab === 'todo' ? "text-accent-green drop-shadow-glow" : "text-gray-500"} fill={activeTab === 'todo' ? "currentColor" : "none"} /> 
           <span className={activeTab === 'todo' ? "text-white" : "text-gray-500"}>ATTACK</span>
        </button>
        <button 
          onClick={() => setActiveTab('avoid')} 
          className="flex-1 py-3 text-center z-10 font-bold text-sm flex justify-center items-center gap-2 transition-colors duration-200"
        >
           <Shield size={16} className={activeTab === 'avoid' ? "text-accent-red drop-shadow-glow" : "text-gray-500"} fill={activeTab === 'avoid' ? "currentColor" : "none"} />
           <span className={activeTab === 'avoid' ? "text-white" : "text-gray-500"}>DEFENSE</span>
        </button>
      </div>

      {/* ACTION BUTTON */}
      <div className="mb-6 flex-shrink-0">
        <button 
          onClick={() => onNavigate(activeTab)}
          className="w-full py-4 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 flex items-center justify-center gap-3 text-gray-400 hover:text-white hover:border-accent-green/50 transition-all group active:scale-95 shadow-lg"
        >
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-accent-green group-hover:text-black transition-colors shadow-inner">
            <Plus size={20} strokeWidth={3} />
          </div>
          <span className="font-bold tracking-wide text-sm drop-shadow-md">
            {activeTab === 'todo' ? "INITIALIZE NEW MISSION" : "LOG NEW THREAT"}
          </span>
        </button>
      </div>

      {/* TASK LIST */}
      <div className="flex-1 overflow-y-auto min-h-0 pr-1 pb-20 scrollbar-hide">
        <h3 className="text-gray-500 text-[10px] font-bold mb-4 uppercase tracking-widest sticky top-0 bg-transparent backdrop-blur-md py-2 z-10 rounded-b-lg">
          {activeTab === 'todo' ? "High Priority Operations" : "Active Threats"}
        </h3>
        
        <AnimatePresence mode="wait">
          {activeTab === 'todo' ? (
            <motion.div
              key="todo-list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <AnimatePresence>
                {activeTodos.map(task => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    type="todo" 
                    onComplete={completeTodo} 
                    onDelete={deleteTask} // <--- PASS DELETE PROP
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              key="threat-list"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <AnimatePresence>
                {notTodos.map(task => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    type="avoid" 
                    onFail={failNotTodo} 
                    onDelete={deleteTask} // <--- PASS DELETE PROP
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {!hasTasks && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center text-gray-500 mt-10 border border-dashed border-white/10 rounded-2xl p-8 bg-white/5 backdrop-blur-sm"
          >
            <p className="text-sm font-medium">No active missions.</p>
            <p className="text-xs mt-1 opacity-50">System standby...</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};