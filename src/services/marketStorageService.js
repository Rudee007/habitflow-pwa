// src/services/marketStorageService.js
import { getTodayKey } from '../utils/dateHelpers';

const KEYS = {
  ECONOMY: 'market_economy_v1',
  TASKS: 'market_daily_tasks_v1',
  SHOP: 'market_shop_config_v1',
  LAST_RESET: 'market_last_reset_date'
};

const marketStorageService = {
  // ... (keep getEconomy, saveEconomy, getShopItems, saveShopItems as is) ...
  getEconomy: () => {
    try {
      const data = localStorage.getItem(KEYS.ECONOMY);
      return data ? JSON.parse(data) : { points: 0, inventory: [], streak: 0, level: 'Apprentice' };
    } catch (e) { return { points: 0, inventory: [], streak: 0, level: 'Apprentice' }; }
  },

  saveEconomy: (data) => {
    localStorage.setItem(KEYS.ECONOMY, JSON.stringify(data));
  },

  getShopItems: () => {
    try {
      const data = localStorage.getItem(KEYS.SHOP);
      if (!data) return [
        { id: '1', name: '15 Min Social Media', desireLevel: 3, type: 'consumable' },
        { id: '2', name: 'Watch 1 Movie', desireLevel: 9, type: 'consumable' },
        { id: '3', name: 'Buy Fast Food', desireLevel: 7, type: 'consumable' }
      ];
      return JSON.parse(data);
    } catch (e) { return []; }
  },

  saveShopItems: (items) => {
    localStorage.setItem(KEYS.SHOP, JSON.stringify(items));
  },

  // --- DAILY TASKS ---
  getDailyTasks: () => {
    const today = getTodayKey();
    const lastReset = localStorage.getItem(KEYS.LAST_RESET);
    
    const savedTasks = localStorage.getItem(KEYS.TASKS);
    let tasks = savedTasks ? JSON.parse(savedTasks) : { todos: [], notTodos: [] };

    if (lastReset !== today) {
      console.log("🌞 New Day Detected: Resetting Daily Tasks...");
      
      const freshTodos = (tasks.todos || []).map(t => ({ 
        ...t, 
        completed: false 
      }));
      
      // RESET NOT-TO-DOS: Reset failCount to 0 for the new day
      const freshNotTodos = (tasks.notTodos || []).map(t => ({ 
        ...t, 
        failCount: 0 
      }));

      tasks = { todos: freshTodos, notTodos: freshNotTodos };
      
      localStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
      localStorage.setItem(KEYS.LAST_RESET, today);
    }

    return tasks;
  },

  saveDailyTasks: (tasks) => {
    localStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
  }
};

export default marketStorageService;