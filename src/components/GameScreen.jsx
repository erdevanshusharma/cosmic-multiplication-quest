import React from "react";
import GameHeader from "./GameHeader";
import GameQuestion from "./GameQuestion";
import MiniGame from "./MiniGame";
import HeatMap from "./HeatMap";

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
  wrongAnswers
}) => {
  // Get current planet details
  const planet = planets.find(p => p.id === currentPlanet);
  const tableNumber = planet ? planet.table : 0;
  
  return (
    <div className="max-w-6xl mx-auto">
      <GameHeader 
        currentPlanet={currentPlanet}
        planets={planets}
        score={score}
        lives={lives}
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
          {/* Show HeatMap during both regular game and mini-games */}
          <HeatMap 
            tableNumber={tableNumber}
            responseTimes={responseTimes}
            attemptCounts={attemptCounts}
            correctAnswers={correctAnswers}
            wrongAnswers={wrongAnswers}
          />
        </div>
      </div>
      
      <div className="mt-6 flex justify-between">
        <button
          onClick={() => setGameState("menu")}
          className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-5 rounded-full shadow-lg flex items-center"
          style={{ boxShadow: "0 0 10px rgba(75, 85, 99, 0.5)" }}
        >
          <span className="mr-2">🏠</span>
          Return to Base
        </button>
        <button
          onClick={() => setGameState("metrics")}
          className="bg-purple-700 hover:bg-purple-800 text-white font-bold py-2 px-5 rounded-full shadow-lg flex items-center"
          style={{ boxShadow: "0 0 10px rgba(147, 51, 234, 0.5)" }}
        >
          <span className="mr-2">🌌</span>
          View Galactic Map
        </button>
      </div>
    </div>
  );
};

export default GameScreen;