/**
 * Configuration for Learning Mode levels
 * Each level focuses on specific multiplication ranges
 */
export const LEARNING_MODE_CONFIG = {
  enabled: true, // Whether Learning Mode is available
  levels: [
    { id: 1, name: "Level 1", range: [1, 3], description: "Multiplication ×1 to ×3" },
    { id: 2, name: "Level 2", range: [4, 6], description: "Multiplication ×4 to ×6" },
    { id: 3, name: "Level 3", range: [7, 9], description: "Multiplication ×7 to ×9" },
    { id: 4, name: "Level 4", range: [10, 12], description: "Multiplication ×10 to ×12" },
    { id: 5, name: "Combined 1-2", range: [1, 6], description: "Multiplication ×1 to ×6" },
    { id: 6, name: "Combined 3-4", range: [7, 12], description: "Multiplication ×7 to ×12" }
  ]
};

/**
 * Get all configured learning levels
 * @returns {Array} Array of learning level objects
 */
export const getLearningLevels = () => {
  return LEARNING_MODE_CONFIG.levels;
};

/**
 * Check if Learning Mode is enabled in configuration
 * @returns {boolean} Whether Learning Mode is enabled
 */
export const isLearningModeEnabled = () => {
  return LEARNING_MODE_CONFIG.enabled;
};