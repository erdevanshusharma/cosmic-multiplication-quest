// Determine rank based on average response time
export const getPlayerRank = (avgResponseTime, isLearningMode = false) => {
  // No time-based rank in learning mode if it's disabled
  if (isLearningMode === true && avgResponseTime === null) {
    return { rank: "Learning", color: "text-emerald-400" };
  }
  
  // Default ranks with color scheme
  if (avgResponseTime > 10) return { rank: "Noob", color: "text-blue-800" };
  if (avgResponseTime > 5)
    return { rank: "Journeyman", color: "text-violet-500" };
  if (avgResponseTime > 3)
    return { rank: "Pro", color: "text-sky-400" };
  if (avgResponseTime > 1)
    return { rank: "Hacker", color: "text-rose-200" };
  // God rank for 1 second or under
  if (avgResponseTime <= 1)
    return { rank: "God", color: "text-amber-100" };

  // Fallback (should never reach here)
  return { rank: "Unknown", color: "text-gray-400" };
};

// Calculate average response time for a table and determine max average for any fact
export const getAverageResponseTime = (tableNumber, responseTimes) => {
  const tableKey = `table_${tableNumber}`;
  const tableData = responseTimes[tableKey];

  if (!tableData) return null;

  // Check if the player has answered all multipliers (1-12) for this table
  const answeredMultipliers = Object.keys(tableData).map((key) =>
    parseInt(key.split("x")[1])
  );
  const hasAllMultipliers = Array.from({ length: 12 }, (_, i) => i + 1).every(
    (multiplier) => answeredMultipliers.includes(multiplier)
  );

  // If not all multipliers have been answered, don't assign a rank yet
  if (!hasAllMultipliers) return null;

  // Calculate average response time for each individual multiplication fact
  const factAverages = [];

  // For debugging, track individual averages
  const individualAverages = {};

  // Check each multiplication fact (1-12)
  for (let i = 1; i <= 12; i++) {
    const factKey = `${tableNumber}x${i}`;
    const times = tableData[factKey] || [];

    if (times.length > 0) {
      // Calculate average for this specific fact
      const factSum = times.reduce((acc, time) => acc + time, 0);
      const factAvg = Math.round((factSum / times.length) * 10) / 10;

      // Store for debugging
      individualAverages[factKey] = factAvg;

      // Add to our list of fact averages
      factAverages.push(factAvg);
    }
  }

  if (factAverages.length === 0) return null;

  // Return the MAXIMUM average response time among all facts
  // This ensures the player only gets a rank if ALL facts are at or below the threshold
  return Math.max(...factAverages);
};

// Get mastery percentage for each multiplication table
export const getMasteryData = (planets, correctAnswers, wrongAnswers, responseTimes) => {
  return planets.map((planet) => {
    const tableQuestions = Object.keys(correctAnswers).filter(
      (key) => parseInt(key.split("x")[0]) === planet.table
    );

    const totalCorrect = tableQuestions.reduce(
      (sum, key) => sum + correctAnswers[key],
      0
    );
    const totalWrong = tableQuestions.reduce(
      (sum, key) => sum + (wrongAnswers[key] || 0),
      0
    );
    const total = totalCorrect + totalWrong;

    const mastery = total > 0 ? Math.floor((totalCorrect / total) * 100) : 0;

    // Calculate average response time for this table
    const avgResponseTime = getAverageResponseTime(planet.table, responseTimes);

    // Calculate accuracy rate
    const accuracyRate =
      total > 0 ? Math.floor((totalCorrect / total) * 100) : 0;

    // Get player rank based on average response time
    const playerRank = avgResponseTime
      ? getPlayerRank(avgResponseTime, planet.isLearningMode)
      : null;

    return {
      ...planet,
      mastery,
      totalQuestions: total,
      avgResponseTime,
      accuracyRate,
      playerRank,
      totalCorrect,
      totalWrong,
    };
  });
};

// Get mastery data for learning mode levels
export const getLearningModeMasteryData = (planet, levelId, correctAnswers, wrongAnswers, responseTimes) => {
  // Calculate statistics for questions within the specific level range
  const planetId = planet.id;
  const tableNumber = planet.table;
  
  // Get all keys for this planet/table
  const planetKey = `planet_${planetId}`;
  const levelKey = `level_${levelId}`;
  
  // If we don't have data yet, return null
  if (!responseTimes[planetKey] || !responseTimes[planetKey][levelKey]) {
    return {
      mastery: 0,
      totalQuestions: 0,
      avgResponseTime: null,
      accuracyRate: 0,
      playerRank: getPlayerRank(null, true),
      totalCorrect: 0,
      totalWrong: 0,
      completed: false
    };
  }
  
  const levelData = responseTimes[planetKey][levelKey];
  const questionKeys = Object.keys(levelData);
  
  // Calculate totals
  let totalTime = 0;
  let totalQuestions = questionKeys.length;
  let totalAnswers = 0;
  
  questionKeys.forEach(key => {
    const times = levelData[key];
    totalTime += times.reduce((sum, time) => sum + time, 0);
    totalAnswers += times.length;
  });
  
  // Calculate average time
  const avgResponseTime = totalAnswers > 0 ? totalTime / totalAnswers : null;
  
  // Get player rank based on average response time
  const playerRank = getPlayerRank(avgResponseTime, true);
  
  // Calculate mastery and accuracy (placeholder - real data would come from correct/wrong answers)
  // In a real implementation, we'd track correct/wrong answers per level
  const mastery = 100; // Placeholder
  const accuracyRate = 100; // Placeholder
  
  // Determine if level is completed based on rank (Pro or better)
  const completed = playerRank && ['Pro', 'Hacker', 'God'].includes(playerRank.rank);
  
  return {
    mastery,
    totalQuestions,
    avgResponseTime,
    accuracyRate,
    playerRank,
    totalCorrect: totalQuestions, // Placeholder
    totalWrong: 0, // Placeholder
    completed
  };
};