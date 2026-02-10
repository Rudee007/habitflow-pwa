// src/store/marketStore.js
import { create } from 'zustand';
import marketStorageService from '../services/marketStorageService';
import googleSheetsService from '../services/googleSheetsService'; 
import { drawLottery, getTaskReward } from '../utils/marketMath';

// Helper for robust ID generation
const generateId = (prefix) => `${prefix}-${crypto.randomUUID ? crypto.randomUUID() : Date.now()}-${Math.floor(Math.random() * 1000)}`;

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
    try {
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
    } catch (error) {
      console.error("Failed to initialize market store:", error);
      set({ isLoading: false });
    }
  },

  // --- ACTIONS: TO-DO (Work Engine) ---
  addTodo: (task) => {
    const newTodo = {
      id: generateId('todo'),
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
    
    set((state) => {
      const updatedTodos = [...state.todos, newTodo];
      // Side effect: Save to storage
      marketStorageService.saveDailyTasks({ 
        todos: updatedTodos, 
        notTodos: state.notTodos 
      });
      return { todos: updatedTodos };
    });
  },

  addShopItem: (item) => {
    const newItem = {
      id: generateId('item'),
      name: item.name,
      desireLevel: item.desireLevel || 5,
      type: 'consumable'
    };

    set((state) => {
      const updatedShop = [...state.shopItems, newItem];
      marketStorageService.saveShopItems(updatedShop);
      return { shopItems: updatedShop };
    });
  },

  removeShopItem: (id) => {
    set((state) => {
      const updatedShop = state.shopItems.filter(i => i.id !== id);
      marketStorageService.saveShopItems(updatedShop);
      return { shopItems: updatedShop };
    });
  },
  
  deleteTask: (id, type) => {
    set((state) => {
      const isTodo = type === 'todo';
      
      // Filter the correct list
      const updatedTodos = isTodo 
        ? state.todos.filter(t => t.id !== id) 
        : state.todos;
        
      const updatedNotTodos = !isTodo 
        ? state.notTodos.filter(t => t.id !== id) 
        : state.notTodos;

      // Save to storage
      marketStorageService.saveDailyTasks({ 
        todos: updatedTodos, 
        notTodos: updatedNotTodos 
      });

      return { 
        todos: updatedTodos, 
        notTodos: updatedNotTodos 
      };
    });
  },

  completeTodo: (id) => {
    // 1. Get fresh state to avoid race conditions
    const { todos, points, streak, inventory, notTodos } = get();
    
    const taskIndex = todos.findIndex(t => t.id === id);
    if (taskIndex === -1) return; // Task not found
    if (todos[taskIndex].completed) return; // Already completed

    const task = todos[taskIndex];
    const reward = getTaskReward(task.priority);

    // 2. Create immutable updates
    const updatedTodos = [...todos];
    updatedTodos[taskIndex] = { ...task, completed: true };
    const newPoints = points + reward;

    // 3. Update State
    set({ todos: updatedTodos, points: newPoints });
    
    // 4. Persistence
    marketStorageService.saveDailyTasks({ todos: updatedTodos, notTodos });
    marketStorageService.saveEconomy({ 
        points: newPoints, 
        inventory, 
        streak 
    });
  },

  // --- ACTIONS: NOT-TO-DO (The Shield) ---
  addNotTodo: (task) => {
    const newNotTodo = {
      id: generateId('not'),
      title: task.title,
      cost: task.cost || 50,
      notes: task.notes || '',
      failCount: 0,
    };

    set((state) => {
      const updated = [...state.notTodos, newNotTodo];
      marketStorageService.saveDailyTasks({ 
        todos: state.todos, 
        notTodos: updated 
      });
      return { notTodos: updated };
    });
  },

  failNotTodo: (id) => {
    // 1. Get fresh state
    const { notTodos, points, todos, inventory, streak } = get();
    
    const taskIndex = notTodos.findIndex(t => t.id === id);
    if (taskIndex === -1) return 0;

    const task = notTodos[taskIndex];
    const penalty = task.cost; 
    
    // 2. Calculate Math (Stop at 0 to prevent negative debt, or remove Math.max to allow debt)
    const newPoints = Math.max(0, points - penalty);

    // 3. Update Task
    const updatedNotTodos = [...notTodos];
    updatedNotTodos[taskIndex] = { 
        ...task, 
        failCount: (task.failCount || 0) + 1,
        lastFailedAt: new Date().toISOString()
    };

    // 4. Update State
    set({ 
        notTodos: updatedNotTodos, 
        points: newPoints 
    });
    
    // 5. Persist
    marketStorageService.saveDailyTasks({ todos, notTodos: updatedNotTodos });
    marketStorageService.saveEconomy({ 
        points: newPoints, 
        inventory, 
        streak 
    });
    
    return penalty;
  },

  // --- ACTIONS: MARKETPLACE ---
  buyLotteryTicket: (cost = 100) => {
    // 1. Get fresh state immediately
    const { points, shopItems, inventory, streak } = get();

    // 2. Validation Guards
    if (shopItems.length === 0) {
      return { success: false, message: "Shop is empty! Add items in Admin." };
    }
    if (points < cost) {
      return { success: false, message: "Not enough credits!" };
    }

    // 3. Draw Logic
    const wonItem = drawLottery(shopItems);
    
    // Guard against lottery failure
    if (!wonItem) {
        return { success: false, message: "Lottery draw failed." };
    }
    
    const ticket = {
      id: generateId('ticket'),
      itemId: wonItem.id,
      name: wonItem.name,
      desireLevel: wonItem.desireLevel, // Store rarity snapshot
      wonAt: new Date().toISOString(),
      isUsed: false
    };

    const newPoints = points - cost;
    const newInventory = [...inventory, ticket];

    // 4. Update State
    set({ points: newPoints, inventory: newInventory });
    
    // 5. Persist
    marketStorageService.saveEconomy({ 
        points: newPoints, 
        inventory: newInventory, 
        streak 
    });

    return { success: true, item: wonItem };
  },

  useInventoryItem: (ticketId) => {
    // Functional update ensures we don't delete an item from a stale inventory array
    set((state) => {
        const newInventory = state.inventory.filter(t => t.id !== ticketId);
        
        marketStorageService.saveEconomy({ 
            points: state.points, 
            inventory: newInventory, 
            streak: state.streak 
        });

        return { inventory: newInventory };
    });
  },

  // --- SYNC ---
  syncMarketToSheets: async () => {
    try {
        const state = get();
        console.log("Syncing Market Data to Sheets...");
        // Implement actual sync logic here using state.todos, etc.
        // await googleSheetsService.sync(state);
    } catch (e) {
        console.error("Sync failed", e);
    }
  }
}));

export default useMarketStore;