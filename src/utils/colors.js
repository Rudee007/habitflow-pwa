// src/utils/colors.js
export const habitColors = {
    move: {
      gradient: ['#FA114F', '#FC6C74'],
      solid: '#FA114F',
      light: '#FC6C74',
    },
    exercise: {
      gradient: ['#92E82A', '#3CD27C'],
      solid: '#92E82A',
      light: '#3CD27C',
    },
    stand: {
      gradient: ['#00C7BE', '#38B1C5'],
      solid: '#00C7BE',
      light: '#38B1C5',
    },
    sleep: {
      gradient: ['#B47EFF', '#D8B8DA'],
      solid: '#B47EFF',
      light: '#D8B8DA',
    },
  };
  
  export function getHabitColor(index) {
    const colors = ['move', 'exercise', 'stand', 'sleep'];
    return habitColors[colors[index % colors.length]];
  }
  