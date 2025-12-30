// src/components/SleepTracker.jsx
import React, { useState, useMemo } from 'react';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { Moon, Clock } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import useHabitStore from '../store/habitStore';
import SleepMonthDetails from './SleepMonthDetails';
import { getTodayKey } from '../utils/dateHelpers';

// Same mapping idea as monthly view
function mapTimeForGraph(timeStr) {
  if (!timeStr) {
    return { graphValue: 0, hasValue: false };
  }
  const [h, m] = timeStr.split(':').map(Number);
  const hours = h + (m || 0) / 60;

  const isAfterMidnight = hours >= 0 && hours < 5;
  let graphValue;
  if (isAfterMidnight) {
    graphValue = 16 + hours; // 16–21 (visibly above 12)
  } else {
    graphValue = hours % 12; // 0–12
  }
  return { graphValue, hasValue: true };
}

function SleepTracker() {
  const [sleepTime, setSleepTime] = useState(''); // "HH:mm"
  const [showDetails, setShowDetails] = useState(false);

  const { saveSleep, getSleepMonth, currentMonth } = useHabitStore();
  const sleepData = getSleepMonth(currentMonth);

  // Weekly data – last 7 nights
  const chartData = useMemo(() => {
    const today = new Date();
    const days = eachDayOfInterval({
      start: subDays(today, 6),
      end: today,
    });

    return days.map((day) => {
      const key = format(day, 'yyyy-MM-dd');
      const entry = sleepData[key];
      const t = entry?.time;
      const { graphValue } = mapTimeForGraph(t);
      return {
        label: format(day, 'EEE'),
        timeLabel: t || '--:--',
        value: graphValue,
      };
    });
  }, [sleepData]);

  const handleSave = () => {
    if (!sleepTime) return;

    const dateKey = getTodayKey(); // always today
    saveSleep(dateKey, { time: sleepTime });
    setSleepTime('');

    if (navigator.vibrate) {
      navigator.vibrate([10, 50, 10]);
    }
  };

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const data = payload[0].payload;
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 shadow-lg">
        <p className="text-white font-semibold">
          {data.timeLabel === '--:--'
            ? 'No entry'
            : `Sleep at ${data.timeLabel}`}
        </p>
      </div>
    );
  };

  return (
    <>
      <div
        className="bg-gray-900 rounded-3xl p-6 border border-gray-800"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-accent-purple/20 flex items-center justify-center">
              <Moon size={24} className="text-accent-purple" />
            </div>
            <div>
              <h3 className="text-white text-lg font-semibold">Sleep time</h3>
              <p className="text-gray-400 text-sm">
                Log when you went to bed
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowDetails(true)}
            className="text-xs px-3 py-1.5 rounded-full bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
          >
            Monthly view
          </button>
        </div>

        {/* Weekly line chart */}
        <div className="mb-5 rounded-2xl bg-gray-900/60 border border-gray-800 px-3 py-3">
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis
                  dataKey="label"
                  stroke="#636366"
                  style={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#636366"
                  style={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 21]}         // 0–12 normal, 16–21 after‑midnight
                  ticks={[0, 3, 6, 9, 12, 16, 18, 20]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="natural"
                  dataKey="value"
                  stroke="#B47EFF"
                  strokeWidth={2.5}
                  dot={{ r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5, stroke: '#FFFFFF', strokeWidth: 1 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Input – time only, more guided UI */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-gray-400" />
              <span className="text-sm text-gray-300">
                What time are you going to sleep today?
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1 bg-gray-800 border border-gray-700 rounded-2xl px-4 py-3 flex items-center gap-3">
              <span className="text-xs text-gray-400">Time</span>
              <input
                type="time"
                value={sleepTime}
                onChange={(e) => setSleepTime(e.target.value)}
                className="flex-1 bg-transparent text-white text-sm focus:outline-none [&::-webkit-calendar-picker-indicator]:invert"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={!sleepTime}
            className="w-full bg-accent-purple hover:bg-accent-purple-light disabled:bg-gray-800 disabled:text-gray-500 text-white font-semibold py-3 rounded-2xl transition-all duration-200 active:scale-95"
          >
            Log sleep time
          </button>
        </div>
      </div>

      {showDetails && (
        <SleepMonthDetails onClose={() => setShowDetails(false)} />
      )}
    </>
  );
}

export default SleepTracker;
