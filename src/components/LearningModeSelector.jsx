import React, { useState, useEffect } from "react";
import { getLearningLevels } from "../utils/LearningModeConfig";
import { loadLearningModeLevelCompletion } from "../utils/LocalStorageUtils";
import { getPlayerRank } from "../utils/MetricsUtils";

const LearningModeSelector = ({ planet, onSelectLevel, onCancel }) => {
  const [levels, setLevels] = useState([]);
  const [selectedLevelId, setSelectedLevelId] = useState(null);
  const [levelCompletionStatus, setLevelCompletionStatus] = useState({});

  // Load levels and completion status on component mount
  useEffect(() => {
    const learningLevels = getLearningLevels();
    setLevels(learningLevels);

    // Load completion status for this planet
    const completion = loadLearningModeLevelCompletion();
    const planetKey = `planet_${planet.id}`;
    setLevelCompletionStatus(completion[planetKey] || {});
  }, [planet.id]);

  // Handle level selection
  const handleSelectLevel = (levelId) => {
    setSelectedLevelId(levelId);
  };

  // Start learning mode with the selected level
  const handleStart = (levelId) => {
    if (levelId) {
      const selectedLevel = levels.find((level) => level.id === levelId);
      onSelectLevel(selectedLevel);
    }
  };

  return (
    <div className="learning-mode-selector p-6 bg-gray-900 rounded-lg shadow-lg text-white">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Learning Mode - Table {planet.table}
      </h2>
      <p className="mb-4 text-gray-300">
        Select a level to practice specific multiplication ranges
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {levels.map((level) => {
          const isCompleted = levelCompletionStatus[level.id]?.completed;
          const playerRank =
            levelCompletionStatus[level.id]?.playerRank ||
            getPlayerRank(null, true);

          return (
            <div
              key={level.id}
              className={`p-4 rounded-lg cursor-pointer transition-all duration-200 border-2 ${
                selectedLevelId === level.id
                  ? "border-blue-500 bg-blue-900/30"
                  : "border-gray-700 bg-gray-800 hover:bg-gray-700"
              }`}
              onClick={() => {
                handleSelectLevel(level.id);
                handleStart(level.id);
              }}
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">{level.name}</h3>
                {isCompleted && (
                  <span
                    className={`px-2 py-1 rounded text-sm ${playerRank.color} bg-gray-700`}
                  >
                    {playerRank.rank}
                  </span>
                )}
              </div>
              <p className="text-gray-400">{level.description}</p>
              {isCompleted && (
                <div className="mt-2 text-sm text-gray-400">✓ Completed</div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-between">
        <button
          className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 transition-all"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default LearningModeSelector;
