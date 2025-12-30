// src/components/StreakCounter.jsx
import React from 'react';
import { Flame, Trophy, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import useHabitStore from '../store/habitStore';
import { getTodayKey } from '../utils/dateHelpers';
import { format, subDays } from 'date-fns';

function StreakCounter() {
  const { habits, getHabitStats, currentMonth, isHabitCompleted } = useHabitStore();

  // Calculate true current streak (checking consecutive days including across months)
  const calculateTrueStreak = (habitId) => {
    let streak = 0;
    let currentDate = new Date();
    
    // Check last 365 days for streak
    for (let i = 0; i < 365; i++) {
      const dateKey = format(subDays(currentDate, i), 'yyyy-MM-dd');
      if (isHabitCompleted(habitId, dateKey)) {
        streak++;
      } else {
        // Allow 1 day grace for "today" if not yet completed
        if (i === 0) continue;
        break;
      }
    }
    
    return streak;
  };

  // Get all streaks
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
    <div className="bg-gray-900 rounded-3xl p-6 border border-gray-800 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-red-500/5 to-transparent pointer-events-none" />
      
      {/* Animated flame background */}
      {maxCurrentStreak > 0 && (
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute -right-8 -top-8 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl"
        />
      )}
      
      <div className="relative space-y-6">
        {/* Main Streak Section */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <motion.div 
              animate={maxCurrentStreak > 0 ? { 
                rotate: [0, -5, 5, -5, 0],
              } : {}}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg"
            >
              <Flame size={28} className="text-white" />
            </motion.div>
            <div>
              <h3 className="text-white text-xl font-bold">Current Streak</h3>
              <p className="text-gray-400 text-sm">
                {topHabit ? topHabit.name : 'Start a habit!'}
              </p>
            </div>
          </div>

          <div className="flex items-baseline gap-3 mb-3">
            <motion.span 
              key={maxCurrentStreak}
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 15 }}
              className="text-6xl font-black bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent"
            >
              {maxCurrentStreak}
            </motion.span>
            <span className="text-2xl text-gray-400 font-semibold">
              {maxCurrentStreak === 1 ? 'day' : 'days'}
            </span>
            {maxCurrentStreak > 0 && (
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
              >
                🔥
              </motion.span>
            )}
          </div>

          {/* Personal Best */}
          {maxBestStreak > maxCurrentStreak && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-sm"
            >
              <Trophy size={16} className="text-yellow-500" />
              <p className="text-gray-400">
                Personal best: <span className="text-yellow-500 font-bold">{maxBestStreak} days</span>
              </p>
            </motion.div>
          )}

          {/* Milestone messages */}
          {maxCurrentStreak === 0 && (
            <p className="text-gray-500 text-sm">
              Complete a habit to start your streak! 🚀
            </p>
          )}
          {maxCurrentStreak >= 7 && maxCurrentStreak < 14 && (
            <p className="text-orange-400 text-sm font-medium">
              🌟 One week strong! Keep going!
            </p>
          )}
          {maxCurrentStreak >= 14 && maxCurrentStreak < 21 && (
            <p className="text-orange-400 text-sm font-medium">
              ⚡ Two weeks! You're unstoppable!
            </p>
          )}
          {maxCurrentStreak >= 21 && maxCurrentStreak < 30 && (
            <p className="text-orange-400 text-sm font-medium">
              💪 Habit forming! 21 days milestone reached!
            </p>
          )}
          {maxCurrentStreak >= 30 && (
            <p className="text-orange-400 text-sm font-medium">
              👑 Legendary! 30+ day streak!
            </p>
          )}
        </div>

        {/* Today's Progress */}
        <div className="pt-6 border-t border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-blue-400" />
              <span className="text-gray-300 font-semibold">Today's Progress</span>
            </div>
            <span className="text-blue-400 font-bold">
              {completedToday}/{totalHabits}
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-2.5 bg-gray-800 rounded-full overflow-hidden relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${todayPercentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 relative"
            >
              {/* Shine effect */}
              <motion.div
                animate={{ x: [-100, 200] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent"
              />
            </motion.div>
          </div>

          <p className="text-gray-500 text-xs mt-2">
            {todayPercentage === 100 ? '🎉 All done for today!' : `${todayPercentage}% completed`}
          </p>
        </div>
      </div>
    </div>
  );
}

export default StreakCounter;
