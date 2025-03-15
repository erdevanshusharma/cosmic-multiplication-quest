import React from "react";
import { getPlayerRank } from "../utils/MetricsUtils";

const LearningModeMetrics = ({
  planet,
  currentLearningLevel,
  learningModeResponseTimes,
  onChangeLevel,
}) => {
  // Extract data for the specific planet and level
  const planetKey = `planet_${planet.id}`;
  const levelKey = `level_${currentLearningLevel.id}`;
  const levelData = learningModeResponseTimes[planetKey]?.[levelKey] || {};

  // Calculate metrics
  const questionKeys = Object.keys(levelData);

  // For learning mode, we only care about the multiplications within the level range
  const minMultiplier = currentLearningLevel.range[0];
  const maxMultiplier = currentLearningLevel.range[1];

  // Calculate total questions in this level's range
  const totalQuestionsInRange = maxMultiplier - minMultiplier + 1;

  // Count total questions that have been attempted within the range
  const totalQuestions = questionKeys.length;

  // Calculate average response time
  let totalTime = 0;
  let totalAnswers = 0;

  questionKeys.forEach((key) => {
    const times = levelData[key] || [];
    totalTime += times.reduce((sum, time) => sum + time, 0);
    totalAnswers += times.length;
  });

  // Calculate completion percentage based on the range covered
  const completionPercentage = Math.min(
    100,
    Math.round((totalAnswers / (totalQuestionsInRange * 5)) * 100)
  );

  const avgResponseTime = totalAnswers > 0 ? totalTime / totalAnswers : null;
  const playerRank = getPlayerRank(avgResponseTime, true);

  // Format average time to 1 decimal place
  const formattedAvgTime =
    avgResponseTime !== null ? avgResponseTime.toFixed(1) + "s" : "N/A";

  // We already calculated completion percentage above based on range coverage

  // Check if player has achieved Hacker rank or better
  const hasAchievedHackerRank =
    totalQuestions === totalQuestionsInRange &&
    totalAnswers >= totalQuestionsInRange * 5 &&
    completionPercentage === 100 &&
    playerRank &&
    ["Hacker", "God"].includes(playerRank.rank);
  return (
    <div className="bg-gray-800 rounded-lg p-4 mt-4 shadow-lg">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-xl text-emerald-400 font-bold">
          Learning Progress
        </h3>
      </div>

      <div className="mb-3">
        <div className="text-gray-300">
          Table {planet.table} - {currentLearningLevel.description}
        </div>
        <div className="flex justify-between mt-2">
          <div className="text-white">
            Facts covered: {totalQuestions}/{totalQuestionsInRange}
          </div>
          <div className="text-white">Total answers: {totalAnswers}</div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-3">
        <div>
          <span className="text-gray-400">Avg. Time:</span>
          <span className="text-white ml-2">{formattedAvgTime}</span>
        </div>
        {playerRank && (
          <div className={`px-3 py-1 rounded ${playerRank.color} bg-gray-700`}>
            {playerRank.rank}
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-700 rounded-full h-4 mb-2">
        <div
          className="bg-emerald-500 h-4 rounded-full transition-all duration-500"
          style={{ width: `${completionPercentage}%` }}
        ></div>
      </div>

      {hasAchievedHackerRank && (
        <button
          onClick={onChangeLevel}
          className="mt-3 text-center p-2 px-4 bg-emerald-800 rounded-full text-white"
        >
          ✓ Level Mastered! Go to the next level!
        </button>
      )}
    </div>
  );
};

export default LearningModeMetrics;
