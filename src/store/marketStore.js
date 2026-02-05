import { create } from 'zustand';
import marketStorageService from '../services/marketStorageService';
import googleSheetsService from '../services/googleSheetsService'; // Will update this later
import { drawLottery, getTaskReward } from '../utils/marketMath';

const useMarketStore = create((set, get) => ({
  // --- STATE ---
  points: 0,
  inventory: [],
  shopItems: [],
  todos: [],
  notTodos: [],
  isLoading: true,
  
  // Stats
  streak: 0,
  rank: 'Apprentice',

  // --- INITIALIZATION ---
  initialize: () => {
    const economy = marketStorageService.getEconomy();
    const tasks = marketStorageService.getDailyTasks();
    const shop = marketStorageService.getShopItems();

    set({
      points: economy.points,
      inventory: economy.inventory,
      streak: economy.streak || 0,
      todos: tasks.todos,
      notTodos: tasks.notTodos,
      shopItems: shop,
      isLoading: false
    });
  },

  // --- ACTIONS: TO-DO (The Work Engine) ---
addTodo: (task) => {
  const newTodo = {
    id: `todo-${Date.now()}`,
    title: task.title,
    priority: task.priority || 'medium', // low, medium, high
    completed: false,
    notes: task.notes || '',
    // PSYCHOLOGY: Implementation Intentions
    protocol: {
      when: task.when || '',   // "At 9:00 AM"
      where: task.where || ''  // "In the library"
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

    // 1. Update Task
    const updatedTodos = [...todos];
    updatedTodos[taskIndex] = { ...task, completed: true };

    // 2. Update Economy
    const newPoints = points + reward;

    set({ todos: updatedTodos, points: newPoints });
    
    // 3. Persist
    marketStorageService.saveDailyTasks({ todos: updatedTodos, notTodos: get().notTodos });
    marketStorageService.saveEconomy({ points: newPoints, inventory: get().inventory });
  },

  // --- ACTIONS: NOT-TO-DO (The Shield) ---
 addNotTodo: (task) => {
    const newNotTodo = {
      id: `not-${Date.now()}`,
      title: task.title,
      cost: task.cost || 50,
      notes: task.notes || '',
      failed: false,
      paid: false
    };

    const updated = [...get().notTodos, newNotTodo];
    set({ notTodos: updated });
    marketStorageService.saveDailyTasks({ todos: get().todos, notTodos: updated });
  },

  failNotTodo: (id) => {
    const { notTodos, points } = get();
    const task = notTodos.find(t => t.id === id);
    if (!task) return;

    // PSYCHOLOGY: If you didn't buy it from the store, you pay DOUBLE (Sin Tax)
    const penalty = task.cost * 2;
    const newPoints = Math.max(0, points - penalty); // No negative debt for now

    const updated = notTodos.map(t => t.id === id ? { ...t, failed: true } : t);

    set({ notTodos: updated, points: newPoints });
    
    marketStorageService.saveDailyTasks({ todos: get().todos, notTodos: updated });
    marketStorageService.saveEconomy({ points: newPoints, inventory: get().inventory });
    
    return penalty; // Return value to show in UI alert
  },

  // --- ACTIONS: MARKETPLACE (The Gacha) ---
  buyLotteryTicket: (cost = 100) => {
    const { points, shopItems, inventory } = get();

    if (points < cost) return { success: false, message: "Not enough points!" };

    // 1. Draw the item
    const wonItem = drawLottery(shopItems);
    
    // 2. Create the "Ticket"
    const ticket = {
      id: `ticket-${Date.now()}`,
      itemId: wonItem.id,
      name: wonItem.name,
      wonAt: new Date().toISOString(),
      isUsed: false
    };

    // 3. Update State
    const newPoints = points - cost;
    const newInventory = [...inventory, ticket];

    set({ points: newPoints, inventory: newInventory });
    
    // 4. Persist
    marketStorageService.saveEconomy({ points: newPoints, inventory: newInventory });

    return { success: true, item: wonItem };
  },

  useInventoryItem: (ticketId) => {
    const { inventory } = get();
    // Remove the ticket from inventory (Consumption)
    const newInventory = inventory.filter(t => t.id !== ticketId);
    
    set({ inventory: newInventory });
    marketStorageService.saveEconomy({ points: get().points, inventory: newInventory });
  },

  // --- SYNC (Placeholder for now) ---
  syncMarketToSheets: async () => {
    // We will implement the specific GSheets logic in the next step
    // calling googleSheetsService.syncMarket(...)
    console.log("Syncing Market Data to Sheets...");
  }
}));

export default useMarketStore;