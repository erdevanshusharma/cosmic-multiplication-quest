import React from "react";

const GameQuestion = ({
  currentQuestion,
  timeRemaining,
  answerOptions,
  feedback,
  submitAnswer
}) => {
  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <div className="mb-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl text-white font-bold">
            <span className="text-blue-400">Space</span> Problem:
          </h2>
          {timeRemaining !== null ? (
            <div
              className={`px-3 py-1 rounded-full ${
                timeRemaining < 5
                  ? "bg-red-500 animate-pulse"
                  : timeRemaining < 10
                  ? "bg-yellow-500"
                  : "bg-blue-500"
              }`}
              style={{
                boxShadow:
                  timeRemaining < 5
                    ? "0 0 10px rgba(239, 68, 68, 0.7)"
                    : "none",
              }}
            >
              Time: {timeRemaining}s
            </div>
          ) : (
            <div className="px-3 py-1 rounded-full bg-emerald-600">
              Learning Mode
            </div>
          )}
        </div>
        <div className="relative">
          <div
            className="text-5xl font-bold text-center my-8 py-6 px-4 rounded-lg bg-gray-700 bg-opacity-60"
            style={{ textShadow: "0 0 8px rgba(255, 255, 255, 0.5)" }}
          >
            <span className="text-blue-300">
              {currentQuestion.multiplicand}
            </span>
            <span className="text-white"> × </span>
            <span className="text-purple-300">
              {currentQuestion.multiplier}
            </span>
            <span className="text-white"> = </span>
            <span className="text-yellow-300">?</span>
          </div>
          <div className="absolute -top-3 -left-3 w-10 h-10 bg-blue-500 rounded-full opacity-50 animate-pulse"></div>
          <div className="absolute -bottom-3 -right-3 w-10 h-10 bg-purple-500 rounded-full opacity-50 animate-pulse"></div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {answerOptions.map((option, index) => (
          <button
            key={index}
            onClick={() => submitAnswer(option)}
            onTouchStart={(e) => {
              e.preventDefault(); // Prevent double activation
              submitAnswer(option);
            }}
            disabled={feedback !== ""} // Disable buttons when showing feedback
            className={`p-4 text-2xl text-center ${
              feedback !== ""
                ? "bg-gray-500 cursor-not-allowed opacity-70"
                : "bg-gray-700 hover:border-blue-500 hover:bg-gray-600 transform hover:scale-105"
            } text-white rounded-lg border-2 border-gray-600 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500`}
            style={{ boxShadow: "0 0 15px rgba(0, 0, 0, 0.3)" }}
          >
            {option}
          </button>
        ))}
      </div>

      {feedback && (
        <div
          className={`mt-4 p-3 rounded-lg text-center text-lg font-semibold ${
            feedback.includes("Correct") ||
            feedback.includes("success") ||
            feedback.includes("SUCCESS")
              ? "bg-green-700 text-white"
              : "bg-red-700 text-white"
          }`}
          style={{
            whiteSpace: "pre-line", // Allow line breaks in feedback
            boxShadow: feedback.includes("SUPER FAST")
              ? "0 0 20px rgba(16, 185, 129, 0.7)"
              : feedback.includes("FAST")
              ? "0 0 15px rgba(16, 185, 129, 0.5)"
              : feedback.includes("SUCCESS") || feedback.includes("success")
              ? "0 0 15px rgba(16, 185, 129, 0.6)"
              : "",
          }}
        >
          {feedback}
        </div>
      )}
    </div>
  );
};

export default GameQuestion;