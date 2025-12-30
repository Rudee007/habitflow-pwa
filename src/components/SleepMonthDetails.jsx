// src/components/SleepMonthDetails.jsx
import React, { useMemo } from 'react';
import { X } from 'lucide-react';
import useHabitStore from '../store/habitStore';
import {
  getDaysInMonth,
  getDateKey,
  formatMonthYear,
} from '../utils/dateHelpers';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Map "HH:mm" -> value for graph and flags.
function mapTimeForGraph(timeStr) {
  if (!timeStr) {
    return { graphValue: 0, hasValue: false, hoursValue: null, isAfterMidnight: false };
  }

  const [h, m] = timeStr.split(':').map(Number);
  const hours = h + (m || 0) / 60; // 0–24

  // After-midnight rule: 00:00–05:00 -> above 12 line (e.g. 12.5–17)
  const isAfterMidnight = hours >= 0 && hours < 5;

  let graphValue;
  if (isAfterMidnight) {
    // show clearly above 12; 0:00 -> 16, 5:00 -> 21 (just "high area")
    graphValue = 16 + hours; // 16–21
  } else {
    // everything else stays within 0–12 range
    const base = hours % 12; // 0–12
    graphValue = base;
  }

  return {
    graphValue,
    hasValue: true,
    hoursValue: hours,
    isAfterMidnight,
  };
}

function hoursToTimeString(value) {
  if (value == null) return '--:--';
  const h = Math.floor(value);
  const m = Math.round((value - h) * 60);
  const hh = String(h).padStart(2, '0');
  const mm = String(m).padStart(2, '0');
  return `${hh}:${mm}`;
}

function SleepMonthDetails({ onClose }) {
  const { currentMonth, getSleepMonth } = useHabitStore();

  const sleepData = getSleepMonth(currentMonth);
  const days = getDaysInMonth(currentMonth);

  const chartData = useMemo(
    () =>
      days.map((day) => {
        const key = getDateKey(day); // date key (already 23 even if 02:30 by save logic)
        const entry = sleepData[key];
        const t = entry?.time; // "HH:mm"

        const { graphValue, hasValue, hoursValue, isAfterMidnight } =
          mapTimeForGraph(t);

        return {
          dayLabel: day.getDate(),
          value: graphValue,
          hasValue,
          timeLabel: t || '--:--',
          hoursValue,
          isAfterMidnight,
        };
      }),
    [days, sleepData]
  );

  // Summary uses real hours (0–24), not graph mapping
  const summary = useMemo(() => {
    const hours = chartData
      .filter((d) => d.hoursValue != null)
      .map((d) => d.hoursValue);

    if (!hours.length) {
      return { avg: '--:--', earliest: '--:--', latest: '--:--' };
    }

    const sum = hours.reduce((s, v) => s + v, 0);
    const avg = sum / hours.length;
    const earliest = Math.min(...hours);
    const latest = Math.max(...hours);

    return {
      avg: hoursToTimeString(avg),
      earliest: hoursToTimeString(earliest),
      latest: hoursToTimeString(latest),
    };
  }, [chartData]);

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const data = payload[0].payload;
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 shadow-lg">
        <p className="text-white font-semibold">
          Day {data.dayLabel}:{' '}
          {data.timeLabel === '--:--' ? 'No entry' : data.timeLabel}
        </p>
        {data.isAfterMidnight && (
          <p className="text-[11px] text-gray-400 mt-1">
            Logged after midnight; shown above the 12:00 line.
          </p>
        )}
      </div>
    );
  };

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

        {/* Header */}
        <h2 className="text-xl font-bold text-white mb-1">
          Sleep time
        </h2>
        <p className="text-sm text-gray-400 mb-4">
          {formatMonthYear(currentMonth)} • When you went to bed each night
        </p>

        {/* Summary chips */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-gray-900/70 border border-gray-800 rounded-2xl px-3 py-2 text-center">
            <p className="text-[11px] text-gray-400 mb-1">Average</p>
            <p className="text-base font-semibold text-white">
              {summary.avg}
            </p>
          </div>
          <div className="bg-gray-900/70 border border-gray-800 rounded-2xl px-3 py-2 text-center">
            <p className="text-[11px] text-gray-400 mb-1">Earliest</p>
            <p className="text-base font-semibold text-white">
              {summary.earliest}
            </p>
          </div>
          <div className="bg-gray-900/70 border border-gray-800 rounded-2xl px-3 py-2 text-center">
            <p className="text-[11px] text-gray-400 mb-1">Latest</p>
            <p className="text-base font-semibold text-white">
              {summary.latest}
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className="h-64 mb-1 rounded-2xl bg-gray-900/60 border border-gray-800 px-2 py-3">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis
                dataKey="dayLabel"
                stroke="#636366"
                style={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                stroke="#636366"
                style={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                // 0–12 for normal times, 16–21 for after-midnight points
                domain={[0, 21]}
                ticks={[0, 3, 6, 9, 12, 16, 18, 20]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="natural"
                dataKey="value"
                stroke="#B47EFF"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, stroke: '#FFFFFF', strokeWidth: 1 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <p className="text-[11px] text-gray-500 mt-2">
          Sleeps between 00:00–05:00 are drawn above the 12:00 line but still
          counted on the same calendar date. Tap a point to see the exact time.
        </p>
      </div>
    </div>
  );
}

export default SleepMonthDetails;
