// src/store/habitStore.js
import { create } from 'zustand';
import storageService from '../services/storageService';
import googleSheetsService from '../services/googleSheetsService';
import { getMonthKey, getTodayKey } from '../utils/dateHelpers';
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';

function timeStringToNumber(timeStr) {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(':').map(Number);
  return h + (m || 0) / 60; // 0–24
}

function numberToTimeString(value) {
  if (value == null) return '--:--';
  const h = Math.floor(value);
  const m = Math.round((value - h) * 60);
  const hh = String(h).padStart(2, '0');
  const mm = String(m).padStart(2, '0');
  return `${hh}:${mm}`;
}

const useHabitStore = create((set, get) => ({
  // State
  habits: [],
  currentMonth: new Date(),
  selectedDate: new Date(),
  isLoading: true,
  lastSync: null,
  isSyncing: false, // NEW: Track sync status
  
  // Initialize store
  initialize: () => {
    const habits = storageService.getHabits();
    const lastSync = storageService.getLastSync();
    set({ habits, lastSync, isLoading: false });
  },

  // Habits
  setHabits: (habits) => set({ habits }),
  
  addHabit: (habit) => {
    const data = {
      id: habit.id || `habit-${Date.now()}`,
      name: habit.name,
      icon: habit.icon || '✅',
      category: habit.category || 'Custom',
      color: habit.color || 'exercise',
      createdAt: new Date().toISOString(), // Add timestamp for Google Sheets
    };

    const success = storageService.addHabit(data);
    if (success) {
      const habits = storageService.getHabits();
      set({ habits });
    }
    return success;
  },

  toggleHabit: (habitId, date = getTodayKey()) => {
    const newValue = storageService.toggleHabit(habitId, date);
    
    // Trigger haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(newValue ? [10, 50, 10] : [10]);
    }
    
    // Force re-render by updating timestamp
    set({ lastSync: new Date().toISOString() });
    return newValue;
  },

  isHabitCompleted: (habitId, date = getTodayKey()) => {
    return storageService.isHabitCompleted(habitId, date);
  },

  getHabitMonth: (habitId, date) => {
    return storageService.getHabitMonth(habitId, date);
  },

  // Get completions for current week
  getHabitWeek: (habitId, date = new Date()) => {
    const start = startOfWeek(date, { weekStartsOn: 0 }); // Sunday
    const end = endOfWeek(date, { weekStartsOn: 0 });
    const days = eachDayOfInterval({ start, end });
    
    return days.map(day => {
      const dateKey = format(day, 'yyyy-MM-dd');
      return storageService.isHabitCompleted(habitId, dateKey);
    });
  },

  // Calculate habit statistics
  getHabitStats: (habitId, date) => {
    const monthData = storageService.getHabitMonth(habitId, date);
    const completions = Object.values(monthData).filter(Boolean).length;
    const totalDays = Object.keys(monthData).length;
    const percentage = totalDays > 0 ? Math.round((completions / totalDays) * 100) : 0;
    
    // Calculate streak
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;
    
    const sortedDates = Object.keys(monthData).sort().reverse();
    for (const date of sortedDates) {
      if (monthData[date]) {
        tempStreak++;
        if (currentStreak === 0) currentStreak = tempStreak;
        bestStreak = Math.max(bestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }
    
    return {
      completions,
      totalDays,
      percentage,
      currentStreak,
      bestStreak,
    };
  },

  // Month navigation
  setCurrentMonth: (date) => set({ currentMonth: date }),
  
  nextMonth: () => {
    const { currentMonth } = get();
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    set({ currentMonth: nextMonth });
  },
  
  previousMonth: () => {
    const { currentMonth } = get();
    const prevMonth = new Date(currentMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    set({ currentMonth: prevMonth });
  },

  // Sleep tracking
  saveSleep: (dateKey, payload) => {
    const success = storageService.saveSleep(dateKey, payload);
    if (success) {
      set({ lastSync: new Date().toISOString() });
    }
    return success;
  },

  getSleep: (date) => storageService.getSleep(date),
  
  getSleepMonth: (date) => storageService.getSleepMonth(date),
  
  getSleepStats: (date) => {
    const sleepData = storageService.getSleepMonth(date);
    const entries = Object.values(sleepData);
  
    if (entries.length === 0) {
      return { averageTime: '--:--', total: 0 };
    }
  
    const numericTimes = entries
      .map((e) => timeStringToNumber(e.time))
      .filter((v) => v != null);
  
    if (numericTimes.length === 0) {
      return { averageTime: '--:--', total: entries.length };
    }
  
    const sum = numericTimes.reduce((s, v) => s + v, 0);
    const avg = sum / numericTimes.length;
  
    return {
      averageTime: numberToTimeString(avg),
      total: entries.length,
    };
  },
  
  // Goals
  saveGoals: (goals) => {
    const success = storageService.saveGoals(goals);
    if (success) {
      set({ lastSync: new Date().toISOString() });
    }
    return success;
  },

  getGoals: () => storageService.getGoals(),

  // Export/Import
  exportData: () => storageService.exportData(),
  
  importData: async (file) => {
    const success = await storageService.importData(file);
    if (success) {
      get().initialize();
    }
    return success;
  },

  clearAll: () => {
    localStorage.removeItem('habitTracker_v1');
    localStorage.removeItem('habitTrackerSpreadsheetId'); // Also clear Google Sheets ID
    storageService.init?.();
    set({
      habits: [],
      currentMonth: new Date(),
      selectedDate: new Date(),
      lastSync: null,
      isSyncing: false,
    });
  },

  // Sync
  updateLastSync: () => {
    const success = storageService.updateLastSync();
    if (success) {
      set({ lastSync: new Date().toISOString() });
    }
    return success;
  },

  // ========================================
  // GOOGLE SHEETS SYNC METHODS (NEW)
  // ========================================

  /**
   * Sync local data TO Google Sheets (Upload)
   */
  syncToGoogleSheets: async () => {
    try {
      set({ isSyncing: true });
      const state = get();
      
      // Get all data from localStorage via storageService
      const allData = storageService.getAllData();
      
      const result = await googleSheetsService.syncToSheets({
        habits: state.habits,
        completions: allData.completions || {},
        sleepData: allData.sleepData || {},
      });
      
      set({ 
        lastSync: result.timestamp, 
        isSyncing: false 
      });
      
      return result;
    } catch (error) {
      set({ isSyncing: false });
      console.error('Sync to Google Sheets failed:', error);
      throw error;
    }
  },

  /**
   * Fetch data FROM Google Sheets (Download)
   */
  fetchFromGoogleSheets: async () => {
    try {
      set({ isSyncing: true });
      
      const data = await googleSheetsService.fetchFromSheets();
      
      // Update localStorage via storageService
      storageService.importFromGoogleSheets(data);
      
      // Update Zustand store
      set({
        habits: data.habits,
        lastSync: new Date().toISOString(),
        isSyncing: false,
      });
      
      return data;
    } catch (error) {
      set({ isSyncing: false });
      console.error('Fetch from Google Sheets failed:', error);
      throw error;
    }
  },

  /**
   * Check Google Sheets connection status
   */
  getGoogleSheetsStatus: () => {
    return {
      isConnected: googleSheetsService.isAuthenticated(),
      spreadsheetUrl: googleSheetsService.getSpreadsheetUrl(),
      lastSync: get().lastSync,
      isSyncing: get().isSyncing,
    };
  },
}));

export default useHabitStore;
