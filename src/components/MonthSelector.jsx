// src/components/MonthSelector.jsx
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import useHabitStore from '../store/habitStore';

function MonthSelector() {
  const { currentMonth, previousMonth, nextMonth } = useHabitStore();

  return (
    <div className="flex items-center justify-between bg-gray-900 rounded-2xl p-4 border border-gray-800">
      <button
        onClick={previousMonth}
        className="w-10 h-10 rounded-xl bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors active:scale-95"
      >
        <ChevronLeft size={20} className="text-white" />
      </button>

      <div className="text-center">
        <h2 className="text-xl font-bold text-white">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <p className="text-sm text-gray-400">
          {format(currentMonth, 'MMM')} Calendar
        </p>
      </div>

      <button
        onClick={nextMonth}
        className="w-10 h-10 rounded-xl bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors active:scale-95"
      >
        <ChevronRight size={20} className="text-white" />
      </button>
    </div>
  );
}

export default MonthSelector;
