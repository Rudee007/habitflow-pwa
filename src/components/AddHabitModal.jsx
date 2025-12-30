// src/components/AddHabitModal.jsx
import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import useHabitStore from '../store/habitStore';
import { getHabitColor } from '../utils/colors';
import { cn } from '../utils/cn';

import {
  Droplets,
  Dumbbell,
  Sunrise,
  Brain,
  BookOpen,
  Apple,
  Moon,
  PhoneOff,
  Smartphone,
  Target,
} from 'lucide-react';

// Intent-based presets
const HABIT_PRESETS = [
  {
    id: 'water',
    keywords: ['water', 'drink', 'hydr'],
    category: 'Health',
    color: 'exercise',
    icon: Droplets,
  },
  {
    id: 'workout',
    keywords: ['workout', 'exercise', 'gym', 'run', 'yoga'],
    category: 'Fitness',
    color: 'move',
    icon: Dumbbell,
  },
  {
    id: 'morning',
    keywords: ['wake', 'morning', 'early'],
    category: 'Routine',
    color: 'stand',
    icon: Sunrise,
  },
  {
    id: 'focus',
    keywords: ['code', 'study', 'focus', 'deep work', 'learn'],
    category: 'Focus',
    color: 'stand',
    icon: Brain,
  },
  {
    id: 'reading',
    keywords: ['read', 'book', 'gita', 'novel'],
    category: 'Learning',
    color: 'stand',
    icon: BookOpen,
  },
  {
    id: 'nutrition',
    keywords: ['diet', 'food', 'fruit', 'veggie', 'eat'],
    category: 'Health',
    color: 'exercise',
    icon: Apple,
  },
  {
    id: 'sleep',
    keywords: ['sleep', 'bed', 'night'],
    category: 'Recovery',
    color: 'sleep',
    icon: Moon,
  },
  {
    id: 'no-social',
    keywords: ['social', 'instagram', 'whatsapp', 'twitter', 'x'],
    category: 'Digital Detox',
    color: 'move',
    icon: PhoneOff,
  },
  {
    id: 'screen',
    keywords: ['screen', 'youtube', 'netflix'],
    category: 'Digital Detox',
    color: 'move',
    icon: Smartphone,
  },
];

const FALLBACK_PRESET = {
  id: 'custom',
  category: 'Habit',
  color: 'exercise',
  icon: Target,
};

function matchPreset(name) {
  const lower = name.toLowerCase();
  const preset =
    HABIT_PRESETS.find((p) =>
      p.keywords.some((kw) => lower.includes(kw))
    ) || FALLBACK_PRESET;
  return preset;
}

function AddHabitModal({ open, onClose }) {
  const addHabit = useHabitStore((s) => s.addHabit);

  // IMPORTANT: hooks must be in same order on every render
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  if (!open) return null; // this is before any EARLIER conditional hooks, so safe

  // Derive suggestion from plain function (NO useMemo)
  const suggestion = matchPreset(name);
  const colorKey = suggestion.color;
  const colorIndex = ['move', 'exercise', 'stand', 'sleep'].indexOf(colorKey);
  const colorToken = getHabitColor(colorIndex === -1 ? 1 : colorIndex);
  const IconPreview = suggestion.icon;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    setSaving(true);
    try {
      await addHabit({
        name: trimmed,
        icon: suggestion.id,
        category: suggestion.category,
        color: suggestion.color,
      });

      setName('');
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 rounded-3xl p-6 w-full max-w-md border border-gray-800 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-accent-green/20 flex items-center justify-center">
            <Sparkles size={20} className="text-accent-green" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Add New Habit</h2>
            <p className="text-gray-400 text-sm">
              Type the habit; icon & style are auto-selected.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name only */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Habit name
            </label>
            <input
              className="w-full bg-gray-800 border border-gray-700 rounded-2xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-accent-green transition-colors"
              placeholder="e.g. Drink 3L water, Code 1 hour"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Smart suggestion preview */}
          <div className="mt-2 rounded-2xl bg-gray-800/70 border border-gray-700 px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gray-900 flex items-center justify-center">
                <IconPreview size={20} className="text-accent-green" />
              </div>
              <div>
                <p className="text-sm text-gray-300">
                  Category:{' '}
                  <span className="font-medium text-white">
                    {suggestion.category}
                  </span>
                </p>
                <p className="text-xs text-gray-500">
                  Auto-detected from your habit text.
                </p>
              </div>
            </div>
            <div
              className="px-3 py-1 rounded-full text-xs font-medium text-black"
              style={{
                background: `linear-gradient(135deg, ${colorToken.solid}, ${colorToken.light})`,
              }}
            >
              {suggestion.color}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!name.trim() || saving}
            className="w-full mt-3 bg-accent-green text-black font-semibold py-3 rounded-2xl active:scale-95 transition-transform disabled:bg-gray-800 disabled:text-gray-500"
          >
            {saving ? 'Saving…' : 'Save Habit'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddHabitModal;
