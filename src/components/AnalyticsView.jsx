import React, { useMemo } from 'react';
import { 
  TrendingUp, Target, Flame, Zap
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

  const momentumTrend = useMemo(() => {
    // We start the momentum at a baseline (e.g., 50, or calculate further back)
    let currentMomentum = 50; 

    return Array.from({ length: 30 }, (_, i) => {
      const day = subDays(new Date(), 29 - i);
      const dateKey = format(day, 'yyyy-MM-dd');
      
      const totalHabits = habits.length;
      
      if (totalHabits > 0) {
        const completed = habits.filter(h => isHabitCompleted(h.id, dateKey)).length;
        const dailyPerformance = (completed / totalHabits) * 100;
        
        // MOMENTUM MATH: 75% Yesterday's Momentum + 25% Today's Performance
        // This makes the graph climb gradually on good days and fall gradually on bad days
        currentMomentum = (currentMomentum * 0.75) + (dailyPerformance * 0.25);
      }

      return {
        date: format(day, 'MMM dd'),
        dateShort: format(day, 'dd'),
        momentum: Math.round(currentMomentum),
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
        <div className="bg-[#13161F] border border-white/10 rounded-xl p-3 shadow-xl backdrop-blur-md">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">{label}</p>
          <p className="text-white font-black text-sm" style={{ color: payload[0]?.color }}>
            Score: {payload[0]?.value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="px-1">
        <h1 className="text-3xl font-black text-white tracking-tight">Analytics</h1>
        <p className="text-gray-500 text-sm font-bold uppercase tracking-widest mt-1">
          {format(new Date(), 'MMMM yyyy')}
        </p>
      </div>

      {/* Key Stats - 2 Column Layout */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#CEEE98] rounded-3xl p-5 border border-[#CEEE98]/20 shadow-[0_10px_30px_rgba(206,238,152,0.1)]"
        >
          <div className="flex items-center justify-between mb-3">
            <Target size={24} className="text-[#1A2D09]" />
            <div className="text-right">
              <div className="text-4xl font-black text-[#1A2D09]">{overallStats.completion}%</div>
              <div className="text-[#1A2D09]/70 text-[10px] font-bold uppercase tracking-widest">Success Rate</div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-[#DED4E8] rounded-3xl p-5 border border-[#DED4E8]/20 shadow-[0_10px_30px_rgba(222,212,232,0.1)]"
        >
          <div className="flex items-center justify-between mb-3">
            <Flame size={24} className="text-[#2C1438]" />
            <div className="text-right">
              <div className="text-4xl font-black text-[#2C1438]">{overallStats.streak}</div>
              <div className="text-[#2C1438]/70 text-[10px] font-bold uppercase tracking-widest">Day Streak</div>
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
          className="bg-[#1C1C1E] rounded-[24px] p-6 border border-white/5 shadow-lg"
        >
          <div className="flex items-center gap-2 mb-4">
            <Target size={16} className="text-[#62D9FF]" />
            <h3 className="text-white font-bold text-sm tracking-wide">Performance Snapshot</h3>
          </div>
          
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={performanceRadar}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis 
                dataKey="metric"
                tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}
              />
              <PolarRadiusAxis 
                angle={90}
                domain={[0, 100]}
                tick={{ fill: '#6b7280', fontSize: 10 }}
              />
              <Radar 
                dataKey="value"
                stroke="#62D9FF"
                fill="#62D9FF"
                fillOpacity={0.5}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* 30-Day Momentum & 14-Day Charts */}
      <div className="grid grid-cols-1 gap-6">
        
        {/* --- 30-DAY MOMENTUM CURVE --- */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-[#1C1C1E] rounded-[24px] p-6 border border-white/5 shadow-lg relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#92E82A]/10 rounded-full blur-[50px] pointer-events-none" />
          
          <div className="flex flex-col gap-1 mb-6 relative z-10">
            <div className="flex items-center gap-2 text-[#92E82A]">
              <TrendingUp size={16} strokeWidth={2.5} />
              <h3 className="text-white font-bold text-sm tracking-wide">Momentum Curve</h3>
            </div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
              Consistent action builds long-term growth.
            </p>
          </div>
          
          <div className="relative z-10">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={momentumTrend} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMomentum" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#92E82A" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#92E82A" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2E" vertical={false} />
                <XAxis 
                  dataKey="dateShort" 
                  stroke="#636366"
                  style={{ fontSize: '10px', fontWeight: 'bold' }}
                  tickLine={false}
                  axisLine={false}
                  interval={4}
                  dy={10}
                />
                <YAxis 
                  stroke="#636366"
                  style={{ fontSize: '10px', fontWeight: 'bold' }}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 100]}
                  ticks={[0, 50, 100]}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2, strokeDasharray: '4 4' }} />
                <Area 
                  type="monotone" 
                  dataKey="momentum" 
                  stroke="#92E82A" 
                  strokeWidth={3}
                  fill="url(#colorMomentum)"
                  activeDot={{ r: 6, fill: '#92E82A', stroke: '#1C1C1E', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* 14-Day Activity - Bar Chart */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#1C1C1E] rounded-[24px] p-6 border border-white/5 shadow-lg"
        >
          <div className="flex items-center gap-2 mb-6">
            <Zap size={16} className="text-[#FF9500]" />
            <h3 className="text-white font-bold text-sm tracking-wide">Daily Output (14 Days)</h3>
          </div>
          
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyActivity} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2E" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#636366"
                style={{ fontSize: '10px', fontWeight: 'bold' }}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis 
                stroke="#636366"
                style={{ fontSize: '10px', fontWeight: 'bold' }}
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
                ticks={[0, 50, 100]}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
              <Bar 
                dataKey="completion" 
                radius={[6, 6, 6, 6]}
                maxBarSize={35}
              >
                {weeklyActivity.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={
                      entry.completion === 100 ? '#92E82A' : 
                      entry.completion >= 75 ? '#62D9FF' : 
                      entry.completion >= 50 ? '#FF9500' : 
                      '#FA114F'
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
        <p className="text-[#8E8E93] text-[11px] font-bold tracking-widest uppercase">
          {overallStats.completion >= 80 
            ? "Exceptional performance protocol."
            : overallStats.completion >= 60
            ? "Momentum stabilizing. Maintain vector."
            : "System calibration required."
          }
        </p>
      </motion.div>
    </div>
  );
}

export default AnalyticsView;