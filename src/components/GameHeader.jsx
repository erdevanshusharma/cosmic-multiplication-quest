import React from "react";
import { getAverageResponseTime, getPlayerRank } from "../utils/MetricsUtils";

const GameHeader = ({ currentPlanet, planets, score, lives, speedBoost, responseTimes }) => {
  const planet = planets.find((p) => p.id === currentPlanet);
  
  // Get player rank for display
  const avgResponseTime = responseTimes ? getAverageResponseTime(planet.table, responseTimes) : null;
  const playerRank = avgResponseTime ? getPlayerRank(avgResponseTime) : null;
  
  return (
    <div className="flex justify-between items-center mb-6 bg-gray-800 bg-opacity-70 rounded-lg p-3 shadow-lg">
      <div className="text-white">
        <div className="flex items-center">
          <div
            className={`w-6 h-6 ${
              planet.color
            } rounded-full mr-2`}
          ></div>
          <p className="font-bold">
            {planet.name}
          </p>
        </div>
        <p className="text-blue-300">
          Table: {planet.table}'s
        </p>
        {playerRank && (
          <div className={`text-xs ${playerRank.color} font-bold mt-1`}>
            Rank: {playerRank.rank}
          </div>
        )}
      </div>
      <div className="text-white">
        <p className="text-yellow-300 font-bold">Score: {score}</p>
        <p>Lives: {Array(lives).fill("❤️").join("")}</p>
        {speedBoost > 1 && (
          <p className="text-xs text-green-300">
            Speed Boost: x{speedBoost.toFixed(1)}
          </p>
        )}
        {avgResponseTime && (
          <p className="text-xs text-blue-300">
            Avg Time: {avgResponseTime.toFixed(1)}s
          </p>
        )}
      </div>
    </div>
  );
};

export default GameHeader;