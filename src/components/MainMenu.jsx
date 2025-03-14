import React from "react";

const MainMenu = ({
  startGame,
  setGameState,
  score,
  unlockedPlanets,
  correctAnswers,
  resetProgress,
}) => {
  return (
    <div className="space-y-8 text-center">
      <div className="mb-8">
        <h1
          className="text-5xl font-bold text-white mb-6"
          style={{ textShadow: "0 0 10px rgba(255, 255, 255, 0.7)" }}
        >
          Cosmic Multiplication Quest
        </h1>
        <p className="text-blue-200 text-xl">
          Explore the universe while mastering multiplication tables!
        </p>
      </div>

      <div
        className="relative inline-block mx-auto mb-12"
        style={{ animation: "spaceship-idle 3s ease-in-out infinite" }}
      >
        <div className="w-48 h-48 bg-blue-500 rounded-full mx-auto flex items-center justify-center relative">
          <div
            className="absolute inset-0 rounded-full opacity-50 bg-purple-500"
            style={{ animation: "pulse 2s infinite" }}
          ></div>
          <div className="text-6xl">🚀</div>
        </div>
      </div>

      <div className="space-y-6">
        <button
          onClick={startGame}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-full text-xl transition-all transform hover:scale-105 shadow-lg"
          style={{ boxShadow: "0 0 15px rgba(59, 130, 246, 0.7)" }}
        >
          Start Mission
        </button>

        <button
          onClick={() => setGameState("metrics")}
          className="block mx-auto mt-6 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-full shadow-lg"
          style={{ boxShadow: "0 0 15px rgba(147, 51, 234, 0.7)" }}
        >
          View Galactic Map
        </button>
      </div>

      <div className="mt-12 text-gray-300 max-w-md mx-auto rounded-lg bg-gray-800 bg-opacity-70 p-4">
        <h3 className="text-xl mb-2">Mission Briefing:</h3>
        <p className="text-sm">
          Explore 18 unique planets, each representing a multiplication table
          from 2 to 20. Answer correctly to earn points and unlock new planets!
          Master the advanced tables to become a true Space Mathematician! Watch
          out for special mini-games to test your math skills!
        </p>
      </div>

      {/* Progress management buttons */}
      <div className="mt-6 flex justify-center space-x-4">
        {/* Only show reset button if player has some progress */}
        {(score > 0 ||
          unlockedPlanets.length > 1 ||
          Object.keys(correctAnswers).length > 0) && (
          <button
            onClick={resetProgress}
            className="text-red-400 underline text-sm hover:text-red-300 transition-colors"
          >
            Reset Progress
          </button>
        )}
      </div>
    </div>
  );
};

export default MainMenu;
