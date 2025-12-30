// src/components/AnalyticsView.jsx
import React, { useMemo } from 'react';
import { 
  TrendingUp, Target, Flame, Activity, Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Cell
} from 'recharts';
import useHabitStore from '../store/habitStore';
import { format, subDays } from 'date-fns';

function AnalyticsView() {
  const { habits, currentMonth, getHabitStats, isHabitCompleted } = useHabitStore();

  // Daily trend for last 30 days
  const dailyTrend = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => {
      const day = subDays(new Date(), 29 - i);
      const dateKey = format(day, 'yyyy-MM-dd');
      const completed = habits.filter(h => isHabitCompleted(h.id, dateKey)).length;
      const total = habits.length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        date: format(day, 'MMM dd'),
        dateShort: format(day, 'dd'),
        completion: percentage,
      };
    });
  }, [habits, isHabitCompleted]);

  // Weekly activity (last 14 days) - for bar chart
  const weeklyActivity = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const day = subDays(new Date(), 13 - i);
      const dateKey = format(day, 'yyyy-MM-dd');
      const completed = habits.filter(h => isHabitCompleted(h.id, dateKey)).length;
      const total = habits.length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        date: format(day, 'dd'),
        day: format(day, 'EEE'),
        completion: percentage,
      };
    });
  }, [habits, isHabitCompleted]);

  // Performance radar - 5 METRICS (PENTAGON)
  const performanceRadar = useMemo(() => {
    if (habits.length === 0) return [];

    const allStats = habits.map(h => getHabitStats(h.id, currentMonth));
    const avgCompletion = allStats.reduce((sum, s) => sum + s.percentage, 0) / allStats.length;
    const consistency = allStats.filter(s => s.percentage > 50).length / allStats.length * 100;
    
    const avgStreak = allStats.reduce((sum, s) => sum + s.currentStreak, 0) / allStats.length;
    const streakScore = Math.min((avgStreak / 7) * 100, 100);
    
    let recentCompletions = 0;
    let totalRecent = 0;
    for (let i = 0; i < 7; i++) {
      const dateKey = format(subDays(new Date(), i), 'yyyy-MM-dd');
      habits.forEach(habit => {
        totalRecent++;
        if (isHabitCompleted(habit.id, dateKey)) recentCompletions++;
      });
    }
    const momentum = totalRecent > 0 ? (recentCompletions / totalRecent) * 100 : 0;

    const maxStreak = Math.max(...allStats.map(s => s.bestStreak), 1);
    const currentMax = Math.max(...allStats.map(s => s.currentStreak), 0);
    const potential = (currentMax / maxStreak) * 100;

    return [
      { metric: 'Completion', value: Math.round(avgCompletion) },
      { metric: 'Consistency', value: Math.round(consistency) },
      { metric: 'Streak', value: Math.round(streakScore) },
      { metric: 'Momentum', value: Math.round(momentum) },
      { metric: 'Potential', value: Math.round(potential) },
    ];
  }, [habits, currentMonth, getHabitStats, isHabitCompleted]);

  // Overall stats
  const overallStats = useMemo(() => {
    if (habits.length === 0) return { completion: 0, streak: 0, total: 0 };
    const allStats = habits.map(h => getHabitStats(h.id, currentMonth));
    return {
      completion: Math.round(allStats.reduce((sum, s) => sum + s.percentage, 0) / allStats.length),
      streak: Math.max(...allStats.map(s => s.currentStreak)),
      total: allStats.reduce((sum, s) => sum + s.completions, 0),
    };
  }, [habits, currentMonth, getHabitStats]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-3 shadow-xl">
          <p className="text-white font-semibold text-sm mb-1">{label}</p>
          <p className="text-xs" style={{ color: payload[0]?.color }}>
            {payload[0]?.value}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-5 pb-24">
      {/* Header */}
      <div className="px-1">
        <h1 className="text-3xl font-black text-white">Analytics</h1>
        <p className="text-gray-400 text-sm">{format(new Date(), 'MMMM yyyy')}</p>
      </div>

      {/* Key Stats - 2 Column Layout */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <Target size={24} className="text-white/80" />
            <div className="text-right">
              <div className="text-4xl font-black text-white">{overallStats.completion}%</div>
              <div className="text-white/80 text-sm font-medium">Success Rate</div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <Flame size={24} className="text-white/80" />
            <div className="text-right">
              <div className="text-4xl font-black text-white">{overallStats.streak}</div>
              <div className="text-white/80 text-sm font-medium">Day Streak</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Performance Radar - 5 METRICS PENTAGON */}
      {performanceRadar.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-900 rounded-3xl p-5 border border-gray-800"
        >
          <div className="flex items-center gap-2 mb-4">
            <Target size={18} className="text-purple-400" />
            <h3 className="text-white font-bold">Performance Snapshot</h3>
          </div>
          
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={performanceRadar}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis 
                dataKey="metric"
                tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 600 }}
              />
              <PolarRadiusAxis 
                angle={90}
                domain={[0, 100]}
                tick={{ fill: '#6b7280', fontSize: 10 }}
              />
              <Radar 
                dataKey="value"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.6}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* 30-Day & 14-Day Charts */}
      <div className="grid grid-cols-1 gap-5">
        {/* 30-Day Trend - Area Chart */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-gray-900 rounded-3xl p-5 border border-gray-800"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-blue-400" />
            <h3 className="text-white font-bold">30-Day Trend</h3>
          </div>
          
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={dailyTrend}>
              <defs>
                <linearGradient id="colorDaily" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="dateShort" 
                stroke="#9ca3af"
                style={{ fontSize: '11px' }}
                interval={4}
              />
              <YAxis 
                stroke="#9ca3af"
                style={{ fontSize: '11px' }}
                domain={[0, 100]}
                ticks={[0, 50, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="completion" 
                stroke="#3b82f6" 
                strokeWidth={3}
                fill="url(#colorDaily)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* 14-Day Activity - Bar Chart */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-900 rounded-3xl p-5 border border-gray-800"
        >
          <div className="flex items-center gap-2 mb-4">
            <Zap size={18} className="text-amber-400" />
            <h3 className="text-white font-bold">14-Day Activity</h3>
          </div>
          
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#9ca3af"
                style={{ fontSize: '11px' }}
              />
              <YAxis 
                stroke="#9ca3af"
                style={{ fontSize: '11px' }}
                domain={[0, 100]}
                ticks={[0, 50, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="completion" 
                radius={[8, 8, 0, 0]}
                maxBarSize={40}
              >
                {weeklyActivity.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={
                      entry.completion === 100 ? '#10b981' : 
                      entry.completion >= 75 ? '#3b82f6' : 
                      entry.completion >= 50 ? '#f59e0b' : 
                      '#ef4444'
                    } 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Motivational Message */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center py-4"
      >
        <p className="text-gray-500 text-sm">
          {overallStats.completion >= 80 
            ? "Exceptional performance! 🔥"
            : overallStats.completion >= 60
            ? "Great momentum! Keep going! 💪"
            : "Progress happens one day at a time 🌟"
          }
        </p>
      </motion.div>
    </div>
  );
}

export default AnalyticsView;
