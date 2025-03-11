// Determine rank based on average response time
export const getPlayerRank = (avgResponseTime) => {
  // Fix the boundary condition issue by using strict inequalities for all thresholds
  if (avgResponseTime > 9) return { rank: "Noob", color: "text-gray-400" };
  if (avgResponseTime > 6)
    return { rank: "Expert", color: "text-yellow-400" };
  if (avgResponseTime > 3)
    return { rank: "Master", color: "text-orange-400" };
  if (avgResponseTime > 1)
    return { rank: "Grandmaster", color: "text-purple-400" };
  // God rank for 1 second or under
  if (avgResponseTime <= 1)
    return { rank: "God", color: "text-rose-500" };

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
      ? getPlayerRank(avgResponseTime)
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