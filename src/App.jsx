// src/App.jsx
import React, { useState, useEffect } from 'react';
import useHabitStore from './store/habitStore';
import googleSheetsService from './services/googleSheetsService';
import BottomNav from './components/BottomNav';
import StreakCounter from './components/StreakCounter';
import SleepTracker from './components/SleepTracker';
import MonthSelector from './components/MonthSelector';
import HabitGrid from './components/HabitGrid';
import AnalyticsView from './components/AnalyticsView';
import SettingsView from './components/SettingsView';
import AddHabitModal from './components/AddHabitModal';
import { Sparkles } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [showAddModal, setShowAddModal] = useState(false);
  const { initialize, isLoading } = useHabitStore();

  // Initialize store on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Initialize Google APIs on mount
  useEffect(() => {
    // Load GAPI
    if (window.gapi) {
      googleSheetsService.gapiLoaded();
    }

    // Load GIS (Google Identity Services)
    if (window.google?.accounts) {
      googleSheetsService.gisLoaded();
    }

    // Fallback: Setup callbacks for when scripts load after component mounts
    window.gapiLoaded = () => {
      console.log('📊 GAPI script loaded');
      googleSheetsService.gapiLoaded();
    };

    window.gisLoaded = () => {
      console.log('🔐 GIS script loaded');
      googleSheetsService.gisLoaded();
    };

    // Cleanup
    return () => {
      delete window.gapiLoaded;
      delete window.gisLoaded;
    };
  }, []);

  // Handle tab change
  const handleTabChange = (tab) => {
    if (tab === 'add') {
      setShowAddModal(true);
      if (navigator.vibrate) navigator.vibrate([5]);
      return;
    }
    setActiveTab(tab);

    if (navigator.vibrate) {
      navigator.vibrate([5]);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white text-lg font-semibold">Loading your habits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Main Container */}
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-24">
        {/* Home View */}
        {activeTab === 'home' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">
                  Habit Tracker
                </h1>
                <p className="text-gray-400 text-sm">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-green to-accent-green-light flex items-center justify-center shadow-glow-green">
                <Sparkles size={24} className="text-black" />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StreakCounter />
              <SleepTracker />
            </div>

            {/* Month Selector */}
            <MonthSelector />

            {/* Habit Cards */}
            <HabitGrid />
          </div>
        )}

        {/* Analytics View */}
        {activeTab === 'analytics' && <AnalyticsView />}

        {/* Settings View */}
        {activeTab === 'settings' && <SettingsView />}
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Add Habit Modal */}
      <AddHabitModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </div>
  );
}

export default App;
