/**
 * Calculates the winning item based on Desire Level and Luck Floor.
 * Formula: Weight = (10 / (DesireLevel + 1)) + LuckFloor
 * * @param {Array} items - Array of shop items { id, name, desireLevel, ... }
 * @param {Number} luckFloor - Base probability (default 0.5 to prevent 0% chance)
 * @returns {Object} The winning item
 */
export const drawLottery = (items, luckFloor = 0.5) => {
  if (!items || items.length === 0) return null;

  // 1. Calculate Weights
  const weightedItems = items.map(item => ({
    ...item,
    weight: (10 / (Number(item.desireLevel) + 1)) + luckFloor
  }));

  // 2. Total Pool
  const totalWeight = weightedItems.reduce((sum, item) => sum + item.weight, 0);

  // 3. The "Roll"
  let random = Math.random() * totalWeight;

  // 4. Find Winner
  for (const item of weightedItems) {
    if (random < item.weight) {
      return item;
    }
    random -= item.weight;
  }
  
  // Fallback (should theoretically not be reached)
  return items[0];
};

/**
 * Calculates points based on Priority
 */
export const getTaskReward = (priority) => {
  switch (priority) {
    case 'high': return 100;
    case 'medium': return 30;
    case 'low': return 10;
    default: return 10;
  }
};