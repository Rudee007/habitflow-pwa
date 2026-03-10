import React, { useState, useMemo } from 'react';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { Moon, Clock, CalendarDays } from 'lucide-react';
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
import { clsx } from 'clsx';

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
  const [sleepDate, setSleepDate] = useState(getTodayKey()); // Defaults to Today
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
    if (!sleepTime || !sleepDate) return;

    saveSleep(sleepDate, { time: sleepTime });
    
    // Reset forms after saving
    setSleepTime('');
    setSleepDate(getTodayKey());

    if (navigator.vibrate) {
      navigator.vibrate([10, 50, 10]);
    }
  };

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const data = payload[0].payload;
    return (
      <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-3 shadow-xl backdrop-blur-md">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">{data.label}</p>
        <p className="text-white font-black text-sm">
          {data.timeLabel === '--:--'
            ? 'NO DATA LOGGED'
            : `LOGGED AT ${data.timeLabel}`}
        </p>
      </div>
    );
  };

  return (
    <>
      <div className="bg-[#0A0A0A] rounded-[24px] p-6 border border-white/5 shadow-lg relative overflow-hidden group">
        
        {/* Subtle Background Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#B47EFF]/10 rounded-full blur-[50px] pointer-events-none transition-opacity group-hover:opacity-70" />

        {/* Header */}
        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#B47EFF]/10 border border-[#B47EFF]/20 flex items-center justify-center shadow-inner">
              <Moon size={22} className="text-[#B47EFF]" />
            </div>
            <div>
              <h3 className="text-white text-lg font-black tracking-tight">Sleep Log</h3>
              <p className="text-gray-500 text-[11px] font-bold uppercase tracking-wider">
                Circadian Rhythm
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowDetails(true)}
            className="text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/5 transition-colors active:scale-95"
          >
            History
          </button>
        </div>

        {/* Weekly line chart */}
        <div className="mb-6 rounded-2xl bg-[#13161F] border border-white/5 px-3 py-4 relative z-10">
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis
                  dataKey="label"
                  stroke="#636366"
                  style={{ fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase' }}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  stroke="#636366"
                  style={{ fontSize: 9, fontWeight: 'bold' }}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 21]}
                  ticks={[0, 6, 12, 18]}
                  dx={-10}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2, strokeDasharray: '4 4' }} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#B47EFF"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#13161F', stroke: '#B47EFF', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#B47EFF', stroke: '#FFFFFF', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Input Area (Date & Time Selection) */}
        <div className="space-y-3 relative z-10">
          
          <div className="grid grid-cols-2 gap-3">
            {/* Date Picker */}
            <div className="bg-[#13161F] border border-white/5 rounded-xl p-3 flex flex-col gap-1 focus-within:border-[#B47EFF]/50 transition-colors">
              <div className="flex items-center gap-1.5 text-[#B47EFF]/70">
                <CalendarDays size={12} />
                <span className="text-[9px] font-bold uppercase tracking-widest">Date</span>
              </div>
              <input
                type="date"
                value={sleepDate}
                max={getTodayKey()} // Prevents logging future dates
                onChange={(e) => setSleepDate(e.target.value)}
                className="bg-transparent text-white text-sm font-black focus:outline-none [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-50 hover:[&::-webkit-calendar-picker-indicator]:opacity-100 transition-opacity w-full cursor-pointer"
              />
            </div>

            {/* Time Picker */}
            <div className="bg-[#13161F] border border-white/5 rounded-xl p-3 flex flex-col gap-1 focus-within:border-[#B47EFF]/50 transition-colors">
              <div className="flex items-center gap-1.5 text-[#B47EFF]/70">
                <Clock size={12} />
                <span className="text-[9px] font-bold uppercase tracking-widest">Time</span>
              </div>
              <input
                type="time"
                value={sleepTime}
                onChange={(e) => setSleepTime(e.target.value)}
                className="bg-transparent text-white text-sm font-black focus:outline-none [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-50 hover:[&::-webkit-calendar-picker-indicator]:opacity-100 transition-opacity w-full cursor-pointer"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={!sleepTime || !sleepDate}
            className={clsx(
              "w-full py-4 mt-2 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] border font-black text-xs tracking-widest uppercase shadow-lg",
              (!sleepTime || !sleepDate)
                ? "bg-white/5 text-gray-600 border-white/5 cursor-not-allowed"
                : "bg-[#B47EFF] text-[#13161F] hover:bg-[#C4A2FF] border-transparent shadow-[0_0_15px_rgba(180,126,255,0.3)]"
            )}
          >
            Log Sleep Data
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