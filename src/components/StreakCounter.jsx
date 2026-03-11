import React from 'react';
import { Flame, Trophy, Calendar, PartyPopper, Zap, Star, Crown, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import useHabitStore from '../store/habitStore';
import { getTodayKey } from '../utils/dateHelpers';
import { format, subDays } from 'date-fns';

function StreakCounter() {
  const { habits, getHabitStats, currentMonth, isHabitCompleted } = useHabitStore();

  const calculateTrueStreak = (habitId) => {
    let streak = 0;
    let currentDate = new Date();
    
    for (let i = 0; i < 365; i++) {
      const dateKey = format(subDays(currentDate, i), 'yyyy-MM-dd');
      if (isHabitCompleted(habitId, dateKey)) {
        streak++;
      } else {
        if (i === 0) continue;
        break;
      }
    }
    
    return streak;
  };

  const habitStreaks = habits.map(habit => {
    const stats = getHabitStats(habit.id, currentMonth);
    const trueStreak = calculateTrueStreak(habit.id);
    
    return {
      id: habit.id,
      name: habit.name,
      currentStreak: trueStreak,
      bestStreak: stats.bestStreak,
      monthPercentage: stats.percentage,
    };
  });

  // Find max streaks
  const maxCurrentStreak = Math.max(0, ...habitStreaks.map(h => h.currentStreak));
  const maxBestStreak = Math.max(0, ...habitStreaks.map(h => h.bestStreak));
  const topHabit = habitStreaks.find(h => h.currentStreak === maxCurrentStreak);

  // Calculate total completions today
  const todayKey = getTodayKey();
  const completedToday = habits.filter(h => isHabitCompleted(h.id, todayKey)).length;
  const totalHabits = habits.length;
  const todayPercentage = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

  return (
    <div className="bg-[#1C1C1E] rounded-[28px] p-6 border border-white/5 relative overflow-hidden shadow-xl">
      
      {/* ── Header Section ── */}
      <div className="flex items-center gap-4 mb-4">
        {/* Soft Orange Squircle Icon Box */}
        <div className="w-[52px] h-[52px] rounded-[16px] bg-gradient-to-br from-[#FF9500] to-[#E65C00] flex items-center justify-center shadow-[0_4px_15px_rgba(255,149,0,0.3)]">
          <Flame size={26} className="text-white" strokeWidth={2.5} />
        </div>
        <div>
          <h3 className="text-white text-[18px] font-bold tracking-wide leading-tight">Current Streak</h3>
          <p className="text-[#8E8E93] text-[13px] font-medium mt-0.5">
            {topHabit ? topHabit.name : 'Start a habit!'}
          </p>
        </div>
      </div>

      {/* ── Main Stat (Big Number) ── */}
      <div className="flex items-baseline gap-2 mb-2">
        <motion.span 
          key={maxCurrentStreak}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 15 }}
          className="text-[64px] font-black bg-gradient-to-b from-[#FF9500] to-[#FF3B30] bg-clip-text text-transparent leading-none"
        >
          {maxCurrentStreak}
        </motion.span>
        <span className="text-[22px] text-[#8E8E93] font-bold tracking-tight pb-1">
          {maxCurrentStreak === 1 ? 'day' : 'days'}
        </span>
        
        {/* Replaced Emoji with animated filled Lucide icon */}
        {maxCurrentStreak > 0 && (
          <motion.div
            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            className="pb-2 pl-1"
          >
            <Flame size={24} className="text-[#FF9500] fill-[#FF9500]" />
          </motion.div>
        )}
      </div>

      {/* ── Milestones & Personal Best ── */}
      <div className="flex flex-col gap-1.5 mb-5 min-h-[20px]">
        {maxBestStreak > maxCurrentStreak && maxCurrentStreak > 0 && (
          <div className="flex items-center gap-1.5 text-xs font-medium text-[#8E8E93]">
            <Trophy size={12} className="text-yellow-500" />
            <span>Personal best: <strong className="text-white">{maxBestStreak}</strong></span>
          </div>
        )}

        {/* Dynamic Milestone Messages using Lucide Icons */}
        {maxCurrentStreak === 0 && (
          <div className="flex items-center gap-1.5 text-xs text-[#8E8E93] font-medium">
            <Target size={12} /> <span>Complete a task to start!</span>
          </div>
        )}
        {maxCurrentStreak >= 7 && maxCurrentStreak < 14 && (
          <div className="flex items-center gap-1.5 text-xs text-[#FF9500] font-medium">
            <Flame size={12} className="fill-[#FF9500]" /> <span>One week strong! Keep going!</span>
          </div>
        )}
        {maxCurrentStreak >= 14 && maxCurrentStreak < 21 && (
          <div className="flex items-center gap-1.5 text-xs text-yellow-500 font-medium">
            <Zap size={12} className="fill-yellow-500" /> <span>Two weeks! Unstoppable!</span>
          </div>
        )}
        {maxCurrentStreak >= 21 && maxCurrentStreak < 30 && (
          <div className="flex items-center gap-1.5 text-xs text-orange-400 font-medium">
            <Star size={12} className="fill-orange-400" /> <span>Habit forming! 21 days!</span>
          </div>
        )}
        {maxCurrentStreak >= 30 && (
          <div className="flex items-center gap-1.5 text-xs text-yellow-400 font-medium">
            <Crown size={12} className="fill-yellow-400" /> <span>Legendary! 30+ day streak!</span>
          </div>
        )}
      </div>

      {/* ── Subtle Divider ── */}
      <div className="h-[1px] w-full bg-white/5 mb-4" />

      {/* ── Today's Progress Section ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-[#8E8E93]">
            <Calendar size={16} />
            <span className="text-white font-bold text-[15px]">Today's Progress</span>
          </div>
          <span className="text-[#32ADE6] font-bold text-[15px]">
            {completedToday}/{totalHabits}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-[8px] bg-[#2C2C2E] rounded-full overflow-hidden relative mb-2.5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${todayPercentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-[#0A84FF] to-[#32ADE6] relative"
          >
            {/* Soft Shine Effect */}
            <motion.div
              animate={{ x: [-100, 300] }}
              transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2 }}
              className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            />
          </motion.div>
        </div>

        {/* Footer Note with Icon */}
        <div className="flex items-center gap-1.5">
          {todayPercentage === 100 && totalHabits > 0 ? (
            <PartyPopper size={14} className="text-[#32ADE6]" />
          ) : (
             <div className="w-1.5 h-1.5 rounded-full bg-[#8E8E93] ml-0.5" />
          )}
          <p className="text-[#8E8E93] text-[12px] font-medium">
            {todayPercentage === 100 && totalHabits > 0 
              ? 'All done for today!' 
              : `${todayPercentage}% completed`}
          </p>
        </div>
      </div>

    </div>
  );
}

export default StreakCounter;