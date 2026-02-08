// src/services/storageService.js
import { getMonthKey, getTodayKey } from '../utils/dateHelpers';

const STORAGE_KEY = 'habitTracker_v1';
const STORAGE_VERSION = '1.0.0';

class StorageService {
  constructor() {
    this.init();
  }

  init() {
    if (!this.isAvailable()) {
      console.error('LocalStorage is not available');
      return;
    }

    const existing = this.getData();
    if (!existing.version) {
      this.setData({
        version: STORAGE_VERSION,
        lastSync: null,
        months: {},
        habits: [],
      });
    }
  }

  // Check if localStorage is available
  isAvailable() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  // Get all data
  getData() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error reading from storage:', error);
      return {};
    }
  }

  // Set all data
  setData(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error writing to storage:', error);
      return false;
    }
  }

  // Get habits list
  getHabits() {
    const data = this.getData();
    return data.habits || [];
  }

  // Add new habit
  addHabit(habit) {
    const data = this.getData();
    const habits = data.habits || [];
    const newHabit = {
      id: habit.id || `habit-${Date.now()}`,
      name: habit.name,
      icon: habit.icon || '✓',
      category: habit.category || 'Custom',
      color: habit.color || 'exercise',
      createdAt: habit.createdAt || new Date().toISOString(), // Add for Google Sheets
    };
    habits.push(newHabit);
    data.habits = habits;
    return this.setData(data);
  }

  // Delete habit
  deleteHabit(habitId) {
    const data = this.getData();
    data.habits = (data.habits || []).filter((h) => h.id !== habitId);
    return this.setData(data);
  }

  // Toggle habit completion for a specific date
  toggleHabit(habitId, date = getTodayKey()) {
    const data = this.getData();
    const monthKey = getMonthKey(new Date(date));

    // Initialize month if doesn't exist
    if (!data.months[monthKey]) {
      data.months[monthKey] = {
        habits: {},
        sleep: {},
        goals: [],
        notes: '',
      };
    }

    // Initialize habit if doesn't exist
    if (!data.months[monthKey].habits[habitId]) {
      data.months[monthKey].habits[habitId] = {};
    }

    // Toggle completion
    const currentValue = data.months[monthKey].habits[habitId][date];
    data.months[monthKey].habits[habitId][date] = !currentValue;

    this.setData(data);
    return !currentValue;
  }

  // Get habit completion status for a date
  isHabitCompleted(habitId, date = getTodayKey()) {
    const data = this.getData();
    const monthKey = getMonthKey(new Date(date));
    return data.months[monthKey]?.habits[habitId]?.[date] || false;
  }

  // Get all completions for a habit in a month
  getHabitMonth(habitId, date) {
    const data = this.getData();
    const monthKey = getMonthKey(date);
    return data.months[monthKey]?.habits[habitId] || {};
  }

  // ===== Sleep tracking (time-only) =====

  // Save sleep; payload = { time: "HH:mm" }
  saveSleep(dateKey, payload) {
    const data = this.getData();
    const monthKey = getMonthKey(new Date(dateKey));

    if (!data.months[monthKey]) {
      data.months[monthKey] = {
        habits: {},
        sleep: {},
        goals: [],
        notes: '',
      };
    }

    data.months[monthKey].sleep[dateKey] = {
      time: payload.time,
    };

    return this.setData(data);
  }

  // Get sleep for a single date
  getSleep(date = getTodayKey()) {
    const data = this.getData();
    const monthKey = getMonthKey(new Date(date));
    return data.months[monthKey]?.sleep[date] || null;
  }

  // Get sleep for entire month (map of dateKey -> { time })
  getSleepMonth(date) {
    const data = this.getData();
    const monthKey = getMonthKey(date);
    return data.months[monthKey]?.sleep || {};
  }

  // ===== Goals =====

  saveGoals(goals) {
    const data = this.getData();
    const monthKey = getMonthKey(new Date());

    if (!data.months[monthKey]) {
      data.months[monthKey] = {
        habits: {},
        sleep: {},
        goals: [],
        notes: '',
      };
    }

    data.months[monthKey].goals = goals;
    return this.setData(data);
  }

  getGoals() {
    const data = this.getData();
    const monthKey = getMonthKey(new Date());
    return data.months[monthKey]?.goals || [];
  }

  exportData() {
    const data = this.getData();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habit-tracker-backup-${
      new Date().toISOString().split('T')[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Import data from JSON
  async importData(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          this.setData(data);
          resolve(true);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  // Get last sync timestamp
  getLastSync() {
    const data = this.getData();
    return data.lastSync;
  }

  // Update last sync timestamp
  updateLastSync() {
    const data = this.getData();
    data.lastSync = new Date().toISOString();
    return this.setData(data);
  }

  // Check available storage quota
  async checkQuota() {
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      return {
        usage: estimate.usage,
        quota: estimate.quota,
        percentUsed: ((estimate.usage / estimate.quota) * 100).toFixed(2),
      };
    }
    return null;
  }

  // ========================================
  // GOOGLE SHEETS SYNC METHODS (NEW)
  // ========================================

  /**
   * Get all data formatted for Google Sheets sync
   * Flattens the month-based structure into simple arrays
   */
  getAllData() {
    try {
      const data = this.getData();
      
      // Flatten completions from month-based structure
      const completions = {};
      Object.values(data.months || {}).forEach(monthData => {
        Object.entries(monthData.habits || {}).forEach(([habitId, dates]) => {
          if (!completions[habitId]) {
            completions[habitId] = {};
          }
          Object.assign(completions[habitId], dates);
        });
      });

      // Flatten sleep data from month-based structure
      const sleepData = {};
      Object.values(data.months || {}).forEach(monthData => {
        Object.assign(sleepData, monthData.sleep || {});
      });

      return {
        habits: data.habits || [],
        completions,
        sleepData,
        goals: data.months?.[getMonthKey(new Date())]?.goals || [],
        lastSync: data.lastSync || null,
      };
    } catch (error) {
      console.error('Error getting all data:', error);
      return {
        habits: [],
        completions: {},
        sleepData: {},
        goals: [],
        lastSync: null,
      };
    }
  }

  /**
   * Import data from Google Sheets
   * Converts flat structure back to month-based structure
   */
  importFromGoogleSheets(sheetData) {
    try {
      const currentData = this.getData();
      
      // Update habits list
      currentData.habits = sheetData.habits || currentData.habits || [];
      
      // Rebuild months structure from flat completions
      if (sheetData.completions) {
        Object.entries(sheetData.completions).forEach(([habitId, dates]) => {
          Object.entries(dates).forEach(([dateKey, completed]) => {
            const monthKey = getMonthKey(new Date(dateKey));
            
            // Initialize month if needed
            if (!currentData.months[monthKey]) {
              currentData.months[monthKey] = {
                habits: {},
                sleep: {},
                goals: [],
                notes: '',
              };
            }
            
            // Initialize habit in month if needed
            if (!currentData.months[monthKey].habits[habitId]) {
              currentData.months[monthKey].habits[habitId] = {};
            }
            
            // Set completion status
            currentData.months[monthKey].habits[habitId][dateKey] = completed;
          });
        });
      }
      
      // Rebuild sleep data structure
      if (sheetData.sleepData) {
        Object.entries(sheetData.sleepData).forEach(([dateKey, sleepEntry]) => {
          const monthKey = getMonthKey(new Date(dateKey));
          
          // Initialize month if needed
          if (!currentData.months[monthKey]) {
            currentData.months[monthKey] = {
              habits: {},
              sleep: {},
              goals: [],
              notes: '',
            };
          }
          
          // Set sleep data
          currentData.months[monthKey].sleep[dateKey] = sleepEntry;
        });
      }
      
      // Update last sync timestamp
      currentData.lastSync = new Date().toISOString();
      
      // Save to localStorage
      return this.setData(currentData);
    } catch (error) {
      console.error('Error importing from Google Sheets:', error);
      return false;
    }
  }

  /**
   * Merge data from Google Sheets (instead of replacing)
   * Useful for syncing between multiple devices
   */
  mergeFromGoogleSheets(sheetData) {
    try {
      const currentData = this.getData();
      
      // Merge habits (avoid duplicates by ID)
      const habitIds = new Set(currentData.habits.map(h => h.id));
      const newHabits = (sheetData.habits || []).filter(h => !habitIds.has(h.id));
      currentData.habits = [...currentData.habits, ...newHabits];
      
      // Merge completions
      if (sheetData.completions) {
        Object.entries(sheetData.completions).forEach(([habitId, dates]) => {
          Object.entries(dates).forEach(([dateKey, completed]) => {
            const monthKey = getMonthKey(new Date(dateKey));
            
            if (!currentData.months[monthKey]) {
              currentData.months[monthKey] = {
                habits: {},
                sleep: {},
                goals: [],
                notes: '',
              };
            }
            
            if (!currentData.months[monthKey].habits[habitId]) {
              currentData.months[monthKey].habits[habitId] = {};
            }
            
            // Only update if not already set (local takes precedence)
            if (currentData.months[monthKey].habits[habitId][dateKey] === undefined) {
              currentData.months[monthKey].habits[habitId][dateKey] = completed;
            }
          });
        });
      }
      
      // Merge sleep data
      if (sheetData.sleepData) {
        Object.entries(sheetData.sleepData).forEach(([dateKey, sleepEntry]) => {
          const monthKey = getMonthKey(new Date(dateKey));
          
          if (!currentData.months[monthKey]) {
            currentData.months[monthKey] = {
              habits: {},
              sleep: {},
              goals: [],
              notes: '',
            };
          }
          
          // Only update if not already set
          if (!currentData.months[monthKey].sleep[dateKey]) {
            currentData.months[monthKey].sleep[dateKey] = sleepEntry;
          }
        });
      }
      
      currentData.lastSync = new Date().toISOString();
      return this.setData(currentData);
    } catch (error) {
      console.error('Error merging from Google Sheets:', error);
      return false;
    }
  }
}

export default new StorageService();
