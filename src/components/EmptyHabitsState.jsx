// src/components/EmptyHabitsState.jsx
import React, { useState } from 'react';
import { Plus, Sparkles } from 'lucide-react';
import AddHabitModal from './AddHabitModal';

function EmptyHabitsState() {
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <>
      <div className="flex flex-col items-center justify-center py-16 px-6">
        {/* Animated icon */}
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-accent-purple/20 to-accent-blue/20 flex items-center justify-center animate-pulse">
            <Sparkles size={40} className="text-accent-purple" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-accent-green/30 animate-ping" />
        </div>

        {/* Message */}
        <h3 className="text-xl font-bold text-white mb-2">No habits yet</h3>
        <p className="text-gray-400 text-center text-sm mb-8 max-w-sm">
          Start building better habits by creating your first one. Track your
          progress and build consistency one day at a time.
        </p>

        {/* CTA Button */}
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-accent-purple hover:bg-accent-purple-light text-white font-semibold rounded-2xl transition-all duration-200 active:scale-95"
        >
          <Plus size={20} />
          Create your first habit
        </button>

   
      </div>

      {/* Modal - FIXED: pass open prop */}
      <AddHabitModal 
        open={showAddModal} 
        onClose={() => setShowAddModal(false)} 
      />
    </>
  );
}

export default EmptyHabitsState;
