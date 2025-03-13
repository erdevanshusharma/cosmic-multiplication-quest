// Helper functions for local storage
export const saveToLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Error saving to localStorage:", error);
  }
};

export const loadFromLocalStorage = (key, defaultValue) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : defaultValue;
  } catch (error) {
    console.error("Error loading from localStorage:", error);
    return defaultValue;
  }
};

// Learning Mode specific storage keys
export const LEARNING_MODE_STORAGE_KEYS = {
  PROGRESS: "cosmic_learning_mode_progress",
  LEVEL_COMPLETION: "cosmic_learning_mode_level_completion",
  RESPONSE_TIMES: "cosmic_learning_mode_response_times"
};

// Save learning mode progress
export const saveLearningModeProgress = (planetId, progress) => {
  const currentProgress = loadLearningModeProgress();
  const updatedProgress = {
    ...currentProgress,
    [planetId]: progress
  };
  saveToLocalStorage(LEARNING_MODE_STORAGE_KEYS.PROGRESS, updatedProgress);
};

// Load learning mode progress
export const loadLearningModeProgress = () => {
  return loadFromLocalStorage(LEARNING_MODE_STORAGE_KEYS.PROGRESS, {});
};

// Save learning mode level completion status
export const saveLearningModeLevelCompletion = (planetId, levelId, status) => {
  const currentCompletion = loadLearningModeLevelCompletion();
  const planetKey = `planet_${planetId}`;
  
  const updatedPlanetLevels = {
    ...(currentCompletion[planetKey] || {}),
    [levelId]: status
  };
  
  const updatedCompletion = {
    ...currentCompletion,
    [planetKey]: updatedPlanetLevels
  };
  
  saveToLocalStorage(LEARNING_MODE_STORAGE_KEYS.LEVEL_COMPLETION, updatedCompletion);
};

// Load learning mode level completion status
export const loadLearningModeLevelCompletion = () => {
  return loadFromLocalStorage(LEARNING_MODE_STORAGE_KEYS.LEVEL_COMPLETION, {});
};

// Check if a learning mode level is completed
export const isLearningModeLevelCompleted = (planetId, levelId) => {
  const completion = loadLearningModeLevelCompletion();
  const planetKey = `planet_${planetId}`;
  return completion[planetKey]?.[levelId]?.completed || false;
};

// Save learning mode response times
export const saveLearningModeResponseTimes = (planetId, levelId, questionKey, time) => {
  const currentResponseTimes = loadLearningModeResponseTimes();
  const planetKey = `planet_${planetId}`;
  const levelKey = `level_${levelId}`;
  
  // Create nested structure if it doesn't exist
  if (!currentResponseTimes[planetKey]) {
    currentResponseTimes[planetKey] = {};
  }
  if (!currentResponseTimes[planetKey][levelKey]) {
    currentResponseTimes[planetKey][levelKey] = {};
  }
  if (!currentResponseTimes[planetKey][levelKey][questionKey]) {
    currentResponseTimes[planetKey][levelKey][questionKey] = [];
  }
  
  // Add the new response time
  currentResponseTimes[planetKey][levelKey][questionKey].push(time);
  
  // Save updated response times
  saveToLocalStorage(LEARNING_MODE_STORAGE_KEYS.RESPONSE_TIMES, currentResponseTimes);
};

// Load learning mode response times
export const loadLearningModeResponseTimes = () => {
  return loadFromLocalStorage(LEARNING_MODE_STORAGE_KEYS.RESPONSE_TIMES, {});
};

// Get average response time for a specific question in learning mode
export const getLearningModeAvgResponseTime = (planetId, levelId, questionKey) => {
  const responseTimes = loadLearningModeResponseTimes();
  const planetKey = `planet_${planetId}`;
  const levelKey = `level_${levelId}`;
  
  const times = responseTimes[planetKey]?.[levelKey]?.[questionKey] || [];
  
  if (times.length === 0) {
    return null;
  }
  
  const sum = times.reduce((acc, time) => acc + time, 0);
  return sum / times.length;
};