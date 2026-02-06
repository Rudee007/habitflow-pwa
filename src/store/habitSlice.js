import AddHabitModal from "@/components/AddHabitModal";
import storageService from "@/services/storageService";
import { getTodayKey } from "@/utils/dateHelpers";

export const createHabitSlice = (set) => ({

    habits: [],
    setHabits: (habits) => set({habits}),


    AddHabit: (habit) =>{

        const data = {

            id: habit.id || `habit-${Date.now()}`,
            name: habit.name,
            icon: habit.icon || '✅',
            category: habit.category || 'custom',
            color: habit.color || 'exercise',
            createdAt: new Date().toString(),
        };

        if(storageService.addHabit(data)){

            set({habits: storageService.getHabits() });
            return true;
        }

        return false;
    },


    toggleHabit:(habitId, date = getTodayKey()) =>{
        const value = storageService.toggleHabit(habitId,date);
        set({lastSync: new Date().toISOString() });
        return value;
    },


    isHabitCompleted: (id,date) => storageService.isHabitCompleted(id,date),
});
