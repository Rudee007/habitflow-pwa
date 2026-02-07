import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ShoppingBag, Target } from 'lucide-react';
import useHabitStore from './store/habitStore';
import useMarketStore from './store/marketStore';
import googleSheetsService from './services/googleSheetsService';

// Components
import BottomNav from './components/BottomNav';
import StreakCounter from './components/StreakCounter';
import SleepTracker from './components/SleepTracker';
import MonthSelector from './components/MonthSelector';
import HabitGrid from './components/HabitGrid';
import AnalyticsView from './components/AnalyticsView';
import SettingsView from './components/SettingsView';
import AddHabitModal from './components/AddHabitModal';
import HyperspeedBackground from "@/components/HyperspeedBackground";

// Dopamine Components
import { WorkEngine } from './components/dopamine/WorkEngine';
import { GachaMarket } from './components/dopamine/GachaMarket';
import { MissionControlPage } from './components/dopamine/MissionControlPage';

// --- Wrapper Component for the Game Zone ---
const DopamineZone = () => {
  const [mode, setMode] = useState('work'); // 'work' | 'store' | 'create'
  const [createType, setCreateType] = useState('todo'); // Stores 'todo' or 'avoid'

  // Handler to switch to create mode with specific context
  const handleCreate = (type) => {
    setCreateType(type);
    setMode('create');
  };

  // Full Screen Portal for Creation Page
  if (mode === 'create') {
    return createPortal(
      <motion.div 
        key="create"
        initial={{ opacity: 0, y: '100%' }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: '100%' }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-sm"
      >
        <MissionControlPage 
           initialType={createType} 
           onBack={() => setMode('work')} 
        />
      </motion.div>,
      document.body
    );
  }

  return (
    <div className="flex flex-col h-full relative">
      {/* Top Toggle Switch */}
      <div className="flex items-center justify-between mb-6 bg-gray-900/80 backdrop-blur-md p-1.5 rounded-2xl border border-gray-800 shrink-0">
        <button
          onClick={() => setMode('work')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
            mode === 'work' 
              ? 'bg-gray-800 text-white shadow-lg border border-gray-700' 
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <Target size={16} className={mode === 'work' ? 'text-accent-green' : ''} />
          MISSIONS
        </button>
        <button
          onClick={() => setMode('store')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
            mode === 'store' 
              ? 'bg-gray-800 text-white shadow-lg border border-gray-700' 
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <ShoppingBag size={16} className={mode === 'store' ? 'text-accent-purple' : ''} />
          STORE
        </button>
      </div>

      {/* Content Area */}
      <div className="relative flex-1 min-h-0">
         <AnimatePresence mode="wait" initial={false}>
            {mode === 'work' ? (
              <motion.div
                key="work"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                {/* Pass the handleCreate function properly */}
                <WorkEngine onNavigate={handleCreate} />
              </motion.div>
            ) : (
              <motion.div
                key="store"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <GachaMarket />
              </motion.div>
            )}
         </AnimatePresence>
      </div>
    </div>
  );
};

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Stores
  const { initialize: initHabits, isLoading: loadingHabits } = useHabitStore();
  const { initialize: initMarket, isLoading: loadingMarket } = useMarketStore();

  useEffect(() => {
    initHabits();
    initMarket();
    if (window.gapi) googleSheetsService.gapiLoaded();
    if (window.google?.accounts) googleSheetsService.gisLoaded();
    window.gapiLoaded = () => googleSheetsService.gapiLoaded();
    window.gisLoaded = () => googleSheetsService.gisLoaded();
    return () => { delete window.gapiLoaded; delete window.gisLoaded; };
  }, [initHabits, initMarket]);

  const handleTabChange = (tab) => {
    if (tab === 'add') {
      setShowAddModal(true);
      if (navigator.vibrate) navigator.vibrate([10]);
      return;
    }
    setActiveTab(tab);
    if (navigator.vibrate) navigator.vibrate([5]);
  };

  const isLoading = loadingHabits || loadingMarket;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-accent-green/20 via-transparent to-transparent opacity-50 blur-3xl" />
        <div className="w-16 h-16 border-4 border-accent-green border-t-transparent rounded-full animate-spin mb-4 relative z-10" />
        <p className="text-gray-400 font-mono text-sm relative z-10 animate-pulse">SYNCHRONIZING SYSTEM...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black text-white font-sans selection:bg-accent-green/30">
      
      {/* Background Effect */}
      <div className="fixed inset-0 z-0 opacity-40 pointer-events-none">
         <HyperspeedBackground />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-6 pb-28 min-h-screen flex flex-col">
        
        {/* VIEW: HOME (Habits) */}
        {activeTab === 'home' && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="space-y-6"
          >
            <div className="flex items-center justify-between pb-2">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-white mb-1">
                  Dashboard
                </h1>
                <p className="text-gray-500 font-medium text-sm uppercase tracking-wider">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <div className="relative group">
                <div className="absolute inset-0 bg-accent-green blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
                <div className="relative w-12 h-12 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center shadow-2xl">
                  <Sparkles size={22} className="text-accent-green" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StreakCounter />
              <SleepTracker />
            </div>
            <MonthSelector />
            <HabitGrid />
          </motion.div>
        )}

        {/* VIEW: DOPAMINE ZONE */}
        {activeTab === 'Todo' && (
          <motion.div 
            key="zone"
            initial={{ opacity: 0, scale: 0.98 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="h-full flex-1 min-h-0"
          >
            <DopamineZone />
          </motion.div>
        )}

        {/* VIEW: ANALYTICS */}
        {activeTab === 'analytics' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <AnalyticsView />
          </motion.div>
        )}

        {/* VIEW: SETTINGS */}
        {activeTab === 'settings' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <SettingsView />
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <div className="relative z-50">
         <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      </div>

      <AddHabitModal open={showAddModal} onClose={() => setShowAddModal(false)} />
    </div>
  );
}

export default App;