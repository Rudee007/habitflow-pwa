// src/components/HabitGrid.jsx - Simplified
import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import HabitCard from './HabitCard';
import HabitMonthDetails from './HabitMonthDetails';
import useHabitStore from '../store/habitStore';
import EmptyHabitsState from './EmptyHabitsState';
import { getTodayKey } from '../utils/dateHelpers';

function HabitGrid() {
  const { habits, isHabitCompleted } = useHabitStore();
  const [selectedHabit, setSelectedHabit] = useState(null);

  const todayKey = getTodayKey();

  // Sort habits: incomplete first, completed last
  const sortedHabits = [...habits].sort((a, b) => {
    const aComplete = isHabitCompleted(a.id, todayKey);
    const bComplete = isHabitCompleted(b.id, todayKey);
    
    if (aComplete === bComplete) return 0;
    return aComplete ? 1 : -1;
  });

  if (habits.length === 0) {
    return <EmptyHabitsState />;
  }

  return (
    <>
      {/* Toast notifications */}
      <Toaster position="top-center" />

      <div className="space-y-3 pb-6">
        {sortedHabits.map((habit, index) => (
          <HabitCard
            key={habit.id}
            habit={habit}
            index={index}
            onOpenDetails={setSelectedHabit}
          />
        ))}
      </div>

      {selectedHabit && (
        <HabitMonthDetails
          habit={selectedHabit}
          onClose={() => setSelectedHabit(null)}
        />
      )}
    </>
  );
}

export default HabitGrid;
