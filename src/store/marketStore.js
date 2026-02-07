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

  // --- ACTIONS: TO-DO ---
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
      failed: false, // Initial state: "Shield Active"
      paid: false    // Penalty paid?
    };

    const updated = [...get().notTodos, newNotTodo];
    set({ notTodos: updated });
    marketStorageService.saveDailyTasks({ todos: get().todos, notTodos: updated });
  },

  // ⚠️ CRITICAL: LOGIC FOR FAILING A NOT-TO-DO
  failNotTodo: (id) => {
    const { notTodos, points } = get();
    const taskIndex = notTodos.findIndex(t => t.id === id);
    
    // Safety check: if task doesn't exist or is already failed, stop.
    if (taskIndex === -1 || notTodos[taskIndex].failed) return;

    const task = notTodos[taskIndex];

    // PSYCHOLOGY: The "Sin Tax"
    // If you do the bad habit without buying a pass, you pay the cost (or double, depending on your strictness)
    // For now, let's stick to the defined cost.
    const penalty = task.cost; 
    
    // Calculate new balance (Prevent going below 0 for now)
    const newPoints = Math.max(0, points - penalty);

    // Update the task state to "Failed"
    const updatedNotTodos = [...notTodos];
    updatedNotTodos[taskIndex] = { 
        ...task, 
        failed: true, 
        paid: true // Mark as paid so we don't deduct again
    };

    // Update State
    set({ 
        notTodos: updatedNotTodos, 
        points: newPoints 
    });
    
    // Persist Changes
    marketStorageService.saveDailyTasks({ todos: get().todos, notTodos: updatedNotTodos });
    marketStorageService.saveEconomy({ 
        points: newPoints, 
        inventory: get().inventory, 
        streak: get().streak 
    });
    
    // Optional: Return penalty to show a toast notification
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
    // Future implementation: call googleSheetsService.syncMarket(...)
  }
}));

export default useMarketStore;