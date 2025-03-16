import React, { useState } from "react";
import GameHeader from "./GameHeader";
import GameQuestion from "./GameQuestion";
import MiniGame from "./MiniGame";
import HeatMap from "./HeatMap";
import LearningModeSelector from "./LearningModeSelector";
import LearningModeMetrics from "./LearningModeMetrics";
import { isLearningModeEnabled } from "../utils/LearningModeConfig";

const GameScreen = ({
  planets,
  currentPlanet,
  score,
  lives,
  speedBoost,
  miniGameActive,
  miniGameType,
  currentQuestion,
  timeRemaining,
  answerOptions,
  feedback,
  miniGameFeedback,
  submitAnswer,
  completeMiniGame,
  setGameState,
  responseTimes,
  attemptCounts,
  correctAnswers,
  wrongAnswers,
  startLearningMode,
  isLearningMode,
  currentLearningLevel,
  learningModeResponseTimes,
  exitLearningMode,
}) => {
  // Local state for learning mode selector
  const [showLearningModeSelector, setShowLearningModeSelector] =
    useState(false);

  // Get current planet details
  const planet = planets.find((p) => p.id === currentPlanet);
  const tableNumber = planet ? planet.table : 0;

  // Handle opening the learning mode selector
  const openLearningModeSelector = () => {
    setShowLearningModeSelector(true);
  };

  // Handle selecting a learning level
  const handleSelectLevel = (level) => {
    setShowLearningModeSelector(false);
    if (startLearningMode) {
      startLearningMode(planet, level);
    }
  };

  // Cancel learning mode selection
  const handleCancelLearningMode = () => {
    setShowLearningModeSelector(false);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <GameHeader
        currentPlanet={currentPlanet}
        planets={planets}
        score={score}
        speedBoost={speedBoost}
        responseTimes={responseTimes}
      />

      <div className="flex flex-col md:flex-row gap-4">
        <div className="md:w-8/12">
          {!miniGameActive ? (
            <GameQuestion
              currentQuestion={currentQuestion}
              timeRemaining={timeRemaining}
              answerOptions={answerOptions}
              feedback={feedback}
              submitAnswer={submitAnswer}
            />
          ) : (
            <MiniGame
              miniGameType={miniGameType}
              currentQuestion={currentQuestion}
              answerOptions={answerOptions}
              miniGameFeedback={miniGameFeedback}
              completeMiniGame={completeMiniGame}
            />
          )}
        </div>

        <div className="md:w-4/12">
          {isLearningMode && currentLearningLevel ? (
            <>
              {/* Show smaller version of HeatMap filtered to current range */}
              <div className="mt-4">
                <HeatMap
                  tableNumber={tableNumber}
                  responseTimes={responseTimes}
                  attemptCounts={attemptCounts}
                  correctAnswers={correctAnswers}
                  wrongAnswers={wrongAnswers}
                  isLearningMode={true}
                  levelRange={currentLearningLevel.range}
                  learningModeResponseTimes={learningModeResponseTimes}
                  planetId={currentPlanet}
                  currentLearningLevel={currentLearningLevel}
                />
              </div>

              {/* Show Learning Mode Metrics in learning mode */}
              <LearningModeMetrics
                planet={planet}
                currentLearningLevel={currentLearningLevel}
                learningModeResponseTimes={learningModeResponseTimes}
                onChangeLevel={() => setShowLearningModeSelector(true)}
                onExitLearningMode={exitLearningMode}
              />
            </>
          ) : (
            /* Show regular HeatMap during normal mode */
            <HeatMap
              tableNumber={tableNumber}
              responseTimes={responseTimes}
              attemptCounts={attemptCounts}
              correctAnswers={correctAnswers}
              wrongAnswers={wrongAnswers}
            />
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-between">
        <div className="flex gap-4">
          <button
            onClick={() => setGameState("menu")}
            className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-5 rounded-full shadow-lg flex items-center"
            style={{ boxShadow: "0 0 10px rgba(75, 85, 99, 0.5)" }}
          >
            <span className="mr-2">🏠</span>
            Return to Base
          </button>

          {isLearningModeEnabled() && !isLearningMode && (
            <button
              onClick={openLearningModeSelector}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-5 rounded-full shadow-lg flex items-center"
              style={{ boxShadow: "0 0 10px rgba(5, 150, 105, 0.5)" }}
            >
              <span className="mr-2">📚</span>
              Learning Mode
            </button>
          )}

          {isLearningMode && currentLearningLevel && (
            <flex className="flex gap-4">
              <button
                onClick={() => setShowLearningModeSelector(true)}
                className="bg-emerald-800 text-white font-bold py-2 px-5 rounded-full shadow-lg flex items-center"
              >
                Learning: {currentLearningLevel.name}
              </button>
              <button
                onClick={exitLearningMode}
                className="bg-violet-700 text-white font-bold py-2 px-5 rounded-full shadow-lg flex items-center"
              >
                Exit Learning
              </button>
            </flex>
          )}
        </div>

        <button
          onClick={() => setGameState("metrics")}
          className="bg-purple-700 hover:bg-purple-800 text-white font-bold py-2 px-5 rounded-full shadow-lg flex items-center"
          style={{ boxShadow: "0 0 10px rgba(147, 51, 234, 0.5)" }}
        >
          <span className="mr-2">🌌</span>
          View Galactic Map
        </button>
      </div>

      {/* Learning Mode Selector Modal */}
      {showLearningModeSelector && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <LearningModeSelector
            planet={planet}
            onSelectLevel={handleSelectLevel}
            onCancel={handleCancelLearningMode}
          />
        </div>
      )}
    </div>
  );
};

export default GameScreen;
