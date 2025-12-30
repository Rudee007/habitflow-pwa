// src/components/HabitMonthDetails.jsx
import React from 'react';
import { X } from 'lucide-react';
import useHabitStore from '../store/habitStore';
import { cn } from '../utils/cn';
import { getDateKey, getDaysInMonth } from '../utils/dateHelpers';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

function buildMonthCells(date, monthData) {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0‑based

  const firstDay = new Date(year, month, 1);
  const firstWeekday = firstDay.getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];

  // leading blanks before day 1
  for (let i = 0; i < firstWeekday; i += 1) {
    cells.push({ type: 'empty', key: `empty-${i}` });
  }

  // real days
  for (let d = 1; d <= daysInMonth; d += 1) {
    const dateObj = new Date(year, month, d);
    const dateKey = getDateKey(dateObj);
    cells.push({
      type: 'day',
      key: dateKey,
      day: d,
      done: !!monthData[dateKey],
      isToday: isSameDate(dateObj, new Date()),
    });
  }

  return cells;
}

function isSameDate(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function buildChartData(currentMonth, monthData) {
  const days = getDaysInMonth(currentMonth);
  return days.map((day) => {
    const key = getDateKey(day);
    return {
      day: day.getDate(),
      value: monthData[key] ? 1 : 0,
    };
  });
}

function HabitMonthDetails({ habit, onClose }) {
  const { currentMonth, getHabitMonth } = useHabitStore();

  const monthData = getHabitMonth(habit.id, currentMonth);
  const cells = buildMonthCells(currentMonth, monthData);
  const chartData = buildChartData(currentMonth, monthData);

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-gray-900 rounded-3xl p-6 w-full max-w-xl border border-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
        >
          <X size={18} />
        </button>

        <h2 className="text-xl font-bold text-white mb-1">
          {habit.name}
        </h2>
        <p className="text-sm text-gray-400 mb-4">
          Monthly view
        </p>

        {/* Graph */}
        <div className="mb-6 h-40">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis
                dataKey="day"
                stroke="#636366"
                style={{ fontSize: 11 }}
                tickLine={false}
              />
              <YAxis hide domain={[0, 1]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1C1C1E',
                  border: '1px solid #2C2C2E',
                  borderRadius: 12,
                  color: '#FFFFFF',
                  fontSize: 12,
                }}
                formatter={(value) => (value ? 'Completed' : 'Not completed')}
                labelFormatter={(label) => `Day ${label}`}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#92E82A"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Calendar header */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        {/* Calendar cells */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {cells.map((cell) => {
            if (cell.type === 'empty') {
              return <div key={cell.key} />;
            }

            return (
              <div
                key={cell.key}
                className={cn(
                  'w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs',
                  cell.done
                    ? 'bg-accent-green text-black'
                    : 'bg-gray-800 text-gray-500',
                  cell.isToday && 'ring-2 ring-accent-cyan'
                )}
              >
                {cell.day}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default HabitMonthDetails;
