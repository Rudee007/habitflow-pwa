// src/store/marketStore.js
import { create } from 'zustand';
import marketStorageService from '../services/marketStorageService';
import googleSheetsService from '../services/googleSheetsService'; 
import { drawLottery, getTaskReward } from '../utils/marketMath';

const useMarketStore = create((set, get) => ({
  // --- STATE ---
  points: 0,
  inventory: [],
  shopItems: [],
  todos: [],
  notTodos: [],
  isLoading: true,
  streak: 0,
  rank: 'Apprentice',

  // --- INITIALIZATION ---
  initialize: () => {
    const economy = marketStorageService.getEconomy();
    const tasks = marketStorageService.getDailyTasks();
    const shop = marketStorageService.getShopItems();

    set({
      points: economy.points || 0,
      inventory: economy.inventory || [],
      streak: economy.streak || 0,
      todos: tasks.todos || [],
      notTodos: tasks.notTodos || [],
      shopItems: shop || [],
      isLoading: false
    });
  },

  // --- ACTIONS: TO-DO (Work Engine) ---
  addTodo: (task) => {
    const newTodo = {
      id: `todo-${Date.now()}`,
      title: task.title,
      priority: task.priority || 'medium',
      completed: false,
      notes: task.notes || '',
      protocol: {
        when: task.when || '',
        where: task.where || ''
      },
      createdAt: new Date().toISOString()
    };
    
    const updatedTodos = [...get().todos, newTodo];
    set({ todos: updatedTodos });
    marketStorageService.saveDailyTasks({ todos: updatedTodos, notTodos: get().notTodos });
  },

  // Add these inside the create(...) object:

  addShopItem: (item) => {
    const newItem = {
      id: `item-${Date.now()}`,
      name: item.name,
      desireLevel: item.desireLevel || 5,
      type: 'consumable'
    };
    const updatedShop = [...get().shopItems, newItem];
    set({ shopItems: updatedShop });
    marketStorageService.saveShopItems(updatedShop);
  },

  removeShopItem: (id) => {
    const updatedShop = get().shopItems.filter(i => i.id !== id);
    set({ shopItems: updatedShop });
    marketStorageService.saveShopItems(updatedShop);
  },
  
deleteTask: (id, type) => {
    const { todos, notTodos } = get();
    
    if (type === 'todo') {
      const updatedTodos = todos.filter(t => t.id !== id);
      set({ todos: updatedTodos });
      marketStorageService.saveDailyTasks({ todos: updatedTodos, notTodos });
    } else {
      const updatedNotTodos = notTodos.filter(t => t.id !== id);
      set({ notTodos: updatedNotTodos });
      marketStorageService.saveDailyTasks({ todos, notTodos: updatedNotTodos });
    }
  },

  completeTodo: (id) => {
    const { todos, points } = get();
    const taskIndex = todos.findIndex(t => t.id === id);
    if (taskIndex === -1 || todos[taskIndex].completed) return;

    const task = todos[taskIndex];
    const reward = getTaskReward(task.priority);

    const updatedTodos = [...todos];
    updatedTodos[taskIndex] = { ...task, completed: true };

    const newPoints = points + reward;

    set({ todos: updatedTodos, points: newPoints });
    
    marketStorageService.saveDailyTasks({ todos: updatedTodos, notTodos: get().notTodos });
    marketStorageService.saveEconomy({ 
        points: newPoints, 
        inventory: get().inventory, 
        streak: get().streak 
    });
  },

  // --- ACTIONS: NOT-TO-DO (The Shield) ---
  addNotTodo: (task) => {
    const newNotTodo = {
      id: `not-${Date.now()}`,
      title: task.title,
      cost: task.cost || 50,
      notes: task.notes || '',
      failCount: 0, // NEW: Track how many times we failed
    };

    const updated = [...get().notTodos, newNotTodo];
    set({ notTodos: updated });
    marketStorageService.saveDailyTasks({ todos: get().todos, notTodos: updated });
  },

  // ⚠️ UPDATED LOGIC: Allow Multiple Failures
  failNotTodo: (id) => {
    const { notTodos, points } = get();
    const taskIndex = notTodos.findIndex(t => t.id === id);
    
    if (taskIndex === -1) return;

    const task = notTodos[taskIndex];
    const penalty = task.cost; 
    
    // 1. Deduct Points (Allow going into debt or stop at 0, your choice. Here stopping at 0)
    const newPoints = Math.max(0, points - penalty);

    // 2. Update Task: Increment the failure count
    const updatedNotTodos = [...notTodos];
    updatedNotTodos[taskIndex] = { 
        ...task, 
        failCount: (task.failCount || 0) + 1, // Increment count
        lastFailedAt: new Date().toISOString() // Optional: track time
    };

    // 3. Update State
    set({ 
        notTodos: updatedNotTodos, 
        points: newPoints 
    });
    
    // 4. Persist
    marketStorageService.saveDailyTasks({ todos: get().todos, notTodos: updatedNotTodos });
    marketStorageService.saveEconomy({ 
        points: newPoints, 
        inventory: get().inventory, 
        streak: get().streak 
    });
    
    // Return penalty for UI alerts
    return penalty;
  },

  // --- ACTIONS: MARKETPLACE ---
  buyLotteryTicket: (cost = 100) => {
    const { points, shopItems, inventory } = get();

    if (points < cost) return { success: false, message: "Not enough points!" };

    const wonItem = drawLottery(shopItems);
    
    const ticket = {
      id: `ticket-${Date.now()}`,
      itemId: wonItem.id,
      name: wonItem.name,
      wonAt: new Date().toISOString(),
      isUsed: false
    };

    const newPoints = points - cost;
    const newInventory = [...inventory, ticket];

    set({ points: newPoints, inventory: newInventory });
    
    marketStorageService.saveEconomy({ 
        points: newPoints, 
        inventory: newInventory, 
        streak: get().streak 
    });

    return { success: true, item: wonItem };
  },

  useInventoryItem: (ticketId) => {
    const { inventory } = get();
    const newInventory = inventory.filter(t => t.id !== ticketId);
    
    set({ inventory: newInventory });
    marketStorageService.saveEconomy({ 
        points: get().points, 
        inventory: newInventory, 
        streak: get().streak 
    });
  },

  // --- SYNC ---
  syncMarketToSheets: async () => {
    console.log("Syncing Market Data to Sheets...");
  }
}));

export default useMarketStore;