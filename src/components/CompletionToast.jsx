// src/components/CompletionToast.jsx - Custom Celebration Toast
import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Trophy, Star, Zap, X } from 'lucide-react';

const MESSAGES = {
  1: ["Great start! 🌱", "First step done!"],
  3: ["3 day streak! 🔥", "You're on fire!"],
  5: ["Amazing! 5 days! ⚡", "Keep it up!"],
  7: ["Full week! 🏆", "You're crushing it!"],
  10: ["10 days strong! 💪", "Unstoppable!"],
  14: ["Two weeks! 🌟", "Legendary streak!"],
  21: ["Habit formed! 🎯", "You're a champion!"],
  30: ["30 day warrior! 👑", "Absolutely insane!"],
};

function CompletionToast({ habitName, streak, color, onClose }) {
  // Find appropriate message
  let message = MESSAGES[1];
  const milestones = Object.keys(MESSAGES).map(Number).sort((a, b) => b - a);
  
  for (const milestone of milestones) {
    if (streak >= milestone) {
      message = MESSAGES[milestone];
      break;
    }
  }

  const getIcon = () => {
    if (streak >= 21) return Trophy;
    if (streak >= 7) return Star;
    if (streak >= 3) return Flame;
    return Zap;
  };

  const IconComponent = getIcon();

  return (
    <motion.div
      initial={{ y: -100, opacity: 0, scale: 0.8 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: -100, opacity: 0, scale: 0.8 }}
      transition={{ type: "spring", damping: 15, stiffness: 300 }}
      className="bg-gray-900 border-2 rounded-3xl shadow-2xl overflow-hidden max-w-sm mx-4"
      style={{ borderColor: color.solid }}
    >
      {/* Gradient top bar */}
      <div 
        className="h-1.5"
        style={{ background: `linear-gradient(90deg, ${color.solid}, ${color.light})` }}
      />

      <div className="p-4 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gray-800 text-gray-400 hover:text-white flex items-center justify-center"
        >
          <X size={14} />
        </button>

        <div className="flex items-center gap-4">
          {/* Animated icon */}
          <motion.div
            animate={{ 
              rotate: [0, -10, 10, -10, 0],
              scale: [1, 1.1, 1.1, 1.1, 1]
            }}
            transition={{ duration: 0.5 }}
            className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{
              background: `linear-gradient(135deg, ${color.solid}, ${color.light})`,
            }}
          >
            <IconComponent size={32} className="text-white" />
          </motion.div>

          {/* Message */}
          <div className="flex-1 min-w-0">
            <motion.h3
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-white font-bold text-lg mb-0.5 truncate"
            >
              {message[0]}
            </motion.h3>
            <motion.p
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-gray-400 text-sm mb-2"
            >
              {habitName} • {message[1]}
            </motion.p>

            {/* Streak counter */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full"
              style={{ background: `${color.solid}20` }}
            >
              <Flame size={14} className="text-orange-400" />
              <span className="text-white text-xs font-bold">
                {streak} day{streak !== 1 ? 's' : ''} streak
              </span>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Particle effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * 100 + '%',
              y: '100%',
              opacity: 0
            }}
            animate={{
              y: '-20%',
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              delay: i * 0.1,
              ease: "easeOut"
            }}
            className="absolute w-1 h-1 rounded-full"
            style={{ background: color.solid }}
          />
        ))}
      </div>
    </motion.div>
  );
}

export default CompletionToast;
