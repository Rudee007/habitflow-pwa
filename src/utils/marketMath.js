// src/utils/marketMath.js

/**
 * Selects a random item from the shop based on rarity weights.
 * * Algorithm: Weighted Random Selection
 * Formula: Weight = (10 / (DesireLevel + 1)) + LuckFloor
 * Logic: Higher "Desire Level" = Lower probability of winning.
 * * @param {Array} items - Array of shop items
 * @param {Number} luckFloor - Base probability buffer (default 0.5)
 * @returns {Object|null} The selected item or null if empty
 */
export const drawLottery = (items = [], luckFloor = 0.5) => {
  // Guard clause for empty or invalid inputs
  if (!items || items.length === 0) return null;

  // 1. Assign Weights to all items
  const pool = items.map(item => {
    // Ensure level is a valid non-negative number
    const level = Math.max(0, Number(item.desireLevel) || 0);
    
    // Inverse relationship: Higher Level (10) -> Lower Weight
    const weight = (10 / (level + 1)) + luckFloor;
    
    return { ...item, weight };
  });

  // 2. Calculate Total Weight of the pool
  const totalWeight = pool.reduce((sum, item) => sum + item.weight, 0);

  // 3. Roll the dice (0 to TotalWeight)
  let randomPointer = Math.random() * totalWeight;

  // 4. Find where the pointer lands
  for (const item of pool) {
    if (randomPointer < item.weight) {
      return item;
    }
    randomPointer -= item.weight;
  }
  
  // Fallback: Return the first item if rounding errors occur
  return pool[0];
};

/**
 * Returns the point value for a specific task priority.
 * * @param {String} priority - 'high', 'medium', or 'low'
 * @returns {Number} Points value
 */
export const getTaskReward = (priority) => {
  const REWARD_TABLE = {
    high: 100,
    medium: 30,
    low: 10
  };

  // Normalize input to lowercase and default to 'low' reward if invalid
  const key = String(priority).toLowerCase();
  return REWARD_TABLE[key] || REWARD_TABLE.low;
};