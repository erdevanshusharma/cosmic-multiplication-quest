import React from "react";
import { getMasteryData } from "../utils/MetricsUtils";
import HeatMap from "./HeatMap";

const MetricsView = ({
  planets,
  unlockedPlanets,
  correctAnswers,
  wrongAnswers,
  responseTimes,
  setGameState,
  selectPlanet,
  showPerformanceView,
  setShowPerformanceView,
  attemptCounts,
}) => {
  const masteryData = getMasteryData(
    planets,
    correctAnswers,
    wrongAnswers,
    responseTimes
  );

  return (
    <div className="max-w-4xl mx-auto text-white">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white">Galactic Map</h2>
        <div className="flex space-x-4">
          <button
            onClick={() => setGameState("menu")}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition-colors"
          >
            Back to Menu
          </button>
          <button
            onClick={() => setShowPerformanceView(!showPerformanceView)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg shadow-md transition-colors"
          >
            {showPerformanceView ? "Planet View" : "Stats View"}
          </button>
        </div>
      </div>

      {!showPerformanceView ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {planets.map((planet) => {
            const planetData = masteryData.find((p) => p.id === planet.id);
            const isUnlocked = unlockedPlanets.includes(planet.id);
            const mastery = planetData ? planetData.mastery : 0;

            return (
              <div
                key={planet.id}
                onClick={() => isUnlocked && selectPlanet(planet.id)}
                className={`rounded-lg p-4 flex flex-col cursor-pointer transform transition-all duration-200 ${
                  isUnlocked
                    ? `${planet.color} bg-opacity-80 hover:bg-opacity-100 hover:scale-105`
                    : "bg-gray-800 bg-opacity-40 cursor-not-allowed opacity-60"
                }`}
                style={{
                  boxShadow: isUnlocked
                    ? "0 0 15px rgba(255, 255, 255, 0.2)"
                    : "none",
                }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold">{planet.name}</h3>
                    <p
                      className={`text-sm ${
                        isUnlocked ? "text-white" : "text-gray-400"
                      }`}
                    >
                      {planet.table}'s Table
                    </p>
                  </div>
                  <div
                    className={`rounded-full w-12 h-12 flex items-center justify-center ${
                      isUnlocked
                        ? "bg-white bg-opacity-20"
                        : "bg-gray-700 bg-opacity-20"
                    }`}
                  >
                    <span className="text-lg">{planet.table}</span>
                  </div>
                </div>

                {isUnlocked && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Mastery:</span>
                      <span>{mastery}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-white h-2 rounded-full"
                        style={{ width: `${mastery}%` }}
                      ></div>
                    </div>

                    {planetData && planetData.playerRank && (
                      <div
                        className={`mt-2 text-center text-xs font-bold py-1 px-2 rounded ${planetData.playerRank.color} bg-opacity-20`}
                      >
                        {planetData.playerRank.rank} Rank
                      </div>
                    )}

                    {planetData && planetData.totalQuestions > 0 && (
                      <div className="mt-2 text-xs text-white">
                        <div className="flex justify-between">
                          <span>Attempts:</span>
                          <span>{planetData.totalQuestions}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Accuracy:</span>
                          <span>{planetData.accuracyRate}%</span>
                        </div>
                        {planetData.avgResponseTime && (
                          <div className="flex justify-between">
                            <span>Avg Time:</span>
                            <span>
                              {planetData.avgResponseTime.toFixed(2)}s
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Show HeatMap for unlocked planets */}
                    {isUnlocked &&
                      planetData &&
                      planetData.totalQuestions > 0 && (
                        <div className="mt-3 bg-black bg-opacity-40 p-2 rounded-lg">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowPerformanceView(true);
                            }}
                            className="text-xs text-blue-300 hover:text-blue-200 underline block w-full text-center"
                          >
                            View Detailed Performance
                          </button>
                        </div>
                      )}
                  </div>
                )}

                {!isUnlocked && (
                  <div
                    className="mt-3 text-center text-xs p-2 rounded-lg"
                    style={{
                      background: "rgba(0, 0, 0, 0.3)",
                      backdropFilter: "blur(2px)",
                    }}
                  >
                    🔒 Master previous planet to unlock
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-gray-800 bg-opacity-60 rounded-lg p-4 mb-8">
          <h3 className="text-2xl font-bold mb-4">Performance Stats</h3>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-700 bg-opacity-50">
                  <th className="px-4 py-2 text-left">Planet</th>
                  <th className="px-4 py-2 text-center">Table</th>
                  <th className="px-4 py-2 text-center">Correct</th>
                  <th className="px-4 py-2 text-center">Wrong</th>
                  <th className="px-4 py-2 text-center">Accuracy</th>
                  <th className="px-4 py-2 text-center">Avg Time</th>
                  <th className="px-4 py-2 text-center">Rank</th>
                </tr>
              </thead>
              <tbody>
                {masteryData
                  .filter((planet) => unlockedPlanets.includes(planet.id))
                  .map((planet) => (
                    <tr
                      key={planet.id}
                      className="border-b border-gray-700 border-opacity-50 hover:bg-gray-700 hover:bg-opacity-30"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <div
                            className={`w-3 h-3 ${planet.color} rounded-full mr-2`}
                          ></div>
                          {planet.name}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">{planet.table}×</td>
                      <td className="px-4 py-3 text-center text-green-400">
                        {planet.totalCorrect}
                      </td>
                      <td className="px-4 py-3 text-center text-red-400">
                        {planet.totalWrong}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {planet.accuracyRate}%
                      </td>
                      <td className="px-4 py-3 text-center">
                        {planet.avgResponseTime
                          ? `${planet.avgResponseTime.toFixed(2)}s`
                          : "N/A"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {planet.playerRank ? (
                          <span className={planet.playerRank.color}>
                            {planet.playerRank.rank}
                          </span>
                        ) : (
                          "N/A"
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Planet-specific HeatMaps */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {masteryData
              .filter((planet) => unlockedPlanets.includes(planet.id))
              .map((planet) => (
                <div
                  key={`heatmap-${planet.id}`}
                  className="p-3 bg-gray-700 bg-opacity-30 rounded-lg"
                >
                  <div className="flex items-center mb-2">
                    <div
                      className={`w-4 h-4 ${planet.color} rounded-full mr-2`}
                    ></div>
                    <h4 className="text-lg font-bold">
                      {planet.name} ({planet.table}'s Table)
                    </h4>
                  </div>
                  <HeatMap
                    tableNumber={planet.table}
                    responseTimes={responseTimes}
                    attemptCounts={attemptCounts}
                    correctAnswers={correctAnswers}
                    wrongAnswers={wrongAnswers}
                  />

                  <button
                    onClick={() => {
                      selectPlanet(planet.id);
                      setGameState("game");
                    }}
                    className={`mt-3 px-4 py-2 w-full ${planet.color} hover:opacity-80 text-white font-bold rounded-lg shadow-lg transition-all transform hover:scale-105`}
                  >
                    Play {planet.name} Problems
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Removed achievements and spaceship parts sections */}
    </div>
  );
};

export default MetricsView;
