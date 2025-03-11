import React from "react";

const MiniGame = ({ 
  miniGameType, 
  currentQuestion, 
  answerOptions, 
  miniGameFeedback,
  completeMiniGame 
}) => {
  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg relative overflow-hidden">
      {/* Animated background elements */}
      {miniGameType === "asteroid" ? (
        <>
          <div className="absolute w-16 h-16 rounded-full bg-gray-600 opacity-40 top-10 right-10 animate-pulse"></div>
          <div
            className="absolute w-8 h-8 rounded-full bg-gray-500 opacity-30 bottom-20 left-10"
            style={{ animation: "pulse 3s infinite 1s" }}
          ></div>
          <div
            className="absolute w-12 h-12 rounded-full bg-gray-600 opacity-20 top-20 left-20"
            style={{ animation: "pulse 4s infinite 2s" }}
          ></div>
        </>
      ) : (
        <>
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-blue-800 to-transparent opacity-30"></div>
          <div className="absolute w-full h-1 bg-blue-400 bottom-0 opacity-50"></div>
        </>
      )}

      <h2
        className="text-3xl text-white mb-4 font-bold relative"
        style={{ textShadow: "0 0 10px rgba(255, 255, 255, 0.5)" }}
      >
        {miniGameType === "asteroid" ? (
          <span className="text-yellow-300">
            ⚠️ Asteroid Field Alert! ⚠️
          </span>
        ) : (
          <span className="text-blue-300">
            🌍 Planetary Landing Approach 🛬
          </span>
        )}
      </h2>

      <div className="mb-8 text-white relative z-10">
        <p className="mb-5 text-lg">
          {miniGameType === "asteroid"
            ? "Solve the equation quickly to navigate through the dangerous asteroid field!"
            : "Calculate the correct landing angle based on the equation to achieve a safe landing!"}
        </p>

        <div className="text-4xl font-bold text-center my-6 py-4 bg-gray-700 bg-opacity-60 rounded-lg shadow-inner">
          {currentQuestion.multiplicand} × {currentQuestion.multiplier} = ?
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {answerOptions.map((option, index) => (
          <button
            key={index}
            onClick={() => completeMiniGame(option)}
            disabled={miniGameFeedback !== ""}
            className={`p-4 text-2xl text-center ${
              miniGameFeedback !== ""
                ? "bg-gray-500 cursor-not-allowed opacity-70"
                : "bg-gray-700 hover:bg-gray-600 hover:border-yellow-400 transform hover:scale-105"
            } text-white rounded-lg border-2 border-gray-600 transition-all`}
          >
            {option}
          </button>
        ))}
      </div>

      {miniGameFeedback && (
        <div
          className={`mt-4 p-3 rounded-lg text-center text-lg font-semibold ${
            miniGameFeedback.includes("SUCCESS")
              ? "bg-green-700 text-white"
              : "bg-red-700 text-white"
          }`}
          style={{
            whiteSpace: "pre-line",
            boxShadow: miniGameFeedback.includes("SUCCESS")
              ? "0 0 15px rgba(16, 185, 129, 0.6)"
              : "",
          }}
        >
          {miniGameFeedback}
        </div>
      )}

      {/* Visual elements specific to minigame */}
      {miniGameType === "asteroid" ? (
        <div className="absolute text-4xl right-4 bottom-4 animate-bounce">☄️</div>
      ) : (
        <div className="absolute text-4xl right-4 bottom-4">🚀</div>
      )}
    </div>
  );
};

export default MiniGame;