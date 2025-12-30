// src/components/HabitCard.jsx - With Undo Feature
import React, { useState } from 'react';
import { ChevronRight, Flame, Sparkles, TrendingUp, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import useHabitStore from '../store/habitStore';
import { getHabitColor } from '../utils/colors';
import { getTodayKey } from '../utils/dateHelpers';
import CompletionToast from './CompletionToast';
import {
  Droplets, Dumbbell, Sunrise, Brain, BookOpen,
  Apple, Moon, PhoneOff, Smartphone, Target,
} from 'lucide-react';

const HABIT_ICON_MAP = {
  water: Droplets, workout: Dumbbell, morning: Sunrise,
  focus: Brain, reading: BookOpen, nutrition: Apple,
  sleep: Moon, 'no-social': PhoneOff, screen: Smartphone,
  custom: Target,
};

function HabitCard({ habit, index, onOpenDetails }) {
  const { currentMonth, toggleHabit, getHabitStats, isHabitCompleted } = useHabitStore();
  const [particles, setParticles] = useState([]);
  const [ripples, setRipples] = useState([]);

  const todayKey = getTodayKey();
  const completedToday = isHabitCompleted(habit.id, todayKey);
  const stats = getHabitStats(habit.id, currentMonth);
  const color = getHabitColor(index);
  const Icon = HABIT_ICON_MAP[habit.icon] || Target;

  const handleToggleCompletion = (e) => {
    e.stopPropagation();

    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(completedToday ? [10] : [20, 40, 20]);
    }

    if (!completedToday) {
      // Completing - show celebration
      createParticles(e);
      createRipple(e);

      // Toggle the habit
      toggleHabit(habit.id, todayKey);

      // Get updated stats
      const newStats = getHabitStats(habit.id, currentMonth);
      const newStreak = newStats.currentStreak;

    } else {
      // Undoing - simple feedback
      toggleHabit(habit.id, todayKey);

    }
  };

  const createParticles = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newParticles = Array.from({ length: 12 }, (_, i) => ({
      id: Date.now() + i,
      x,
      y,
      angle: (Math.PI * 2 * i) / 12,
    }));

    setParticles(newParticles);
    setTimeout(() => setParticles([]), 1000);
  };

  const createRipple = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newRipple = { id: Date.now(), x, y };
    setRipples([...ripples, newRipple]);
    setTimeout(() => setRipples(r => r.filter(rip => rip.id !== newRipple.id)), 600);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`bg-gray-900 rounded-3xl border overflow-hidden transition-all duration-500 ${
        completedToday 
          ? 'border-gray-700 opacity-75' 
          : `border-gray-800 hover:border-gray-700`
      }`}
    >
      {/* Header - Tap to view details */}
      <div
        onClick={() => onOpenDetails(habit)}
        className="p-4 pb-3 active:bg-gray-800/50 transition-colors cursor-pointer relative"
      >
        <div className="flex items-center justify-between mb-3">
          {/* Icon + Name */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <motion.div
              whileTap={{ scale: 0.85, rotate: 5 }}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 relative`}
              style={{
                background: completedToday 
                  ? `linear-gradient(135deg, ${color.solid}80, ${color.light}50)`
                  : `linear-gradient(135deg, ${color.solid}25, ${color.light}15)`,
              }}
            >
              <Icon size={22} style={{ color: color.solid }} />
              
              {/* Streak flame overlay */}
              {stats.currentStreak >= 3 && !completedToday && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-1 -right-1"
                >
                  <Flame size={16} className="text-orange-500 fill-orange-500" />
                </motion.div>
              )}
            </motion.div>
            
            <div className="flex-1 min-w-0">
              <h3 className={`font-semibold text-base truncate transition-all duration-300 ${
                completedToday ? 'text-gray-500' : 'text-white'
              }`}>
                {habit.name}
              </h3>
              <p className="text-gray-500 text-xs">
                {completedToday ? '✓ Completed' : habit.category}
              </p>
            </div>
          </div>

          {/* Percentage + Arrow */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="text-right">
              <p
                className="text-xl font-bold leading-none"
                style={{ color: color.solid }}
              >
                {stats.percentage}%
              </p>
            </div>
            <ChevronRight size={18} className="text-gray-600" />
          </div>
        </div>

        {/* Progress Bar + Stats */}
        <div className="space-y-2">
          <div className="h-2.5 bg-gray-800 rounded-full overflow-hidden relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${stats.percentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full rounded-full relative"
              style={{
                background: `linear-gradient(90deg, ${color.solid}, ${color.light})`,
              }}
            >
              {/* Shine effect */}
              <motion.div
                animate={{ x: [-100, 200] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent"
              />
            </motion.div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">
              {stats.completions}/{stats.totalDays || 30} days
            </span>
            {stats.currentStreak > 0 && (
              <motion.span 
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="flex items-center gap-1 text-orange-400 font-bold"
              >
                <Flame size={14} />
                {stats.currentStreak} 🔥
              </motion.span>
            )}
          </div>
        </div>
      </div>

      {/* Big Action Button - Thumb Zone */}
      <div className="relative overflow-hidden">
        {/* Particles */}
        <AnimatePresence>
          {particles.map(particle => (
            <motion.div
              key={particle.id}
              initial={{ 
                x: particle.x, 
                y: particle.y,
                scale: 1,
                opacity: 1
              }}
              animate={{
                x: particle.x + Math.cos(particle.angle) * 100,
                y: particle.y + Math.sin(particle.angle) * 100,
                scale: 0,
                opacity: 0
              }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="absolute w-2 h-2 rounded-full pointer-events-none"
              style={{ background: color.solid }}
            />
          ))}
        </AnimatePresence>

        {/* Ripples */}
        <AnimatePresence>
          {ripples.map(ripple => (
            <motion.div
              key={ripple.id}
              initial={{ 
                x: ripple.x, 
                y: ripple.y,
                scale: 0,
                opacity: 0.6
              }}
              animate={{
                scale: 4,
                opacity: 0
              }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="absolute w-20 h-20 -ml-10 -mt-10 rounded-full border-2 pointer-events-none"
              style={{ borderColor: color.solid }}
            />
          ))}
        </AnimatePresence>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleToggleCompletion}
          className={`w-full py-4 font-bold text-sm relative overflow-hidden cursor-pointer transition-all duration-300 ${
            completedToday
              ? 'bg-gray-800 text-gray-400 hover:bg-gray-750'
              : 'text-black'
          }`}
          style={{
            background: completedToday
              ? undefined
              : `linear-gradient(135deg, ${color.solid}, ${color.light})`,
          }}
        >
          {completedToday ? (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center gap-2 group"
            >
              <RotateCcw size={16} className="text-gray-500 group-hover:text-gray-300 transition-colors" />
              <span className="group-hover:text-gray-300 transition-colors">
                Tap to undo
              </span>
            </motion.span>
          ) : (
            <motion.span 
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex items-center justify-center gap-2"
            >
              <TrendingUp size={18} />
              Tap to complete
            </motion.span>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}

export default HabitCard;
