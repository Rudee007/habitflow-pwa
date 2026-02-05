import { getTodayKey } from '../utils/dateHelpers'; // Assuming you have this from habit project

const KEYS = {
  ECONOMY: 'market_economy_v1', // Points, Inventory, Stats
  TASKS: 'market_daily_tasks_v1', // To-Dos, Not-To-Dos
  SHOP: 'market_shop_config_v1', // The items available to buy
  LAST_RESET: 'market_last_reset_date'
};

const marketStorageService = {
  // --- ECONOMY (Permanent Data) ---
  getEconomy: () => {
    try {
      const data = localStorage.getItem(KEYS.ECONOMY);
      return data ? JSON.parse(data) : { 
        points: 0, 
        inventory: [], // Won items waiting to be used
        streak: 0,
        level: 'Apprentice' 
      };
    } catch (e) { return { points: 0, inventory: [], streak: 0 }; }
  },

  saveEconomy: (data) => {
    localStorage.setItem(KEYS.ECONOMY, JSON.stringify(data));
  },

  // --- SHOP CONFIG (Semi-Permanent) ---
  getShopItems: () => {
    try {
      const data = localStorage.getItem(KEYS.SHOP);
      // Default starter items if empty
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

  // --- DAILY TASKS (Resets Daily) ---
  getDailyTasks: () => {
    const today = getTodayKey(); // e.g., "2025-10-25"
    const lastReset = localStorage.getItem(KEYS.LAST_RESET);
    
    const savedTasks = localStorage.getItem(KEYS.TASKS);
    let tasks = savedTasks ? JSON.parse(savedTasks) : { todos: [], notTodos: [] };

    // RESET LOGIC: If the date has changed, clear the completion status
    if (lastReset !== today) {
      console.log("🌞 New Day Detected: Resetting Daily Tasks...");
      
      // 1. Archive or Reset Todos (User decides policy, here we reset status)
      const freshTodos = tasks.todos.map(t => ({ ...t, completed: false }));
      
      // 2. Reset Not-To-Dos (The "Shield" regenerates)
      const freshNotTodos = tasks.notTodos.map(t => ({ ...t, failed: false, paid: false }));

      tasks = { todos: freshTodos, notTodos: freshNotTodos };
      
      // Save the new state
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