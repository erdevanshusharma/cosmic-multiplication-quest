import React, { useEffect, useState } from 'react';

const LevelCompletionConfetti = ({ 
  show, 
  level, 
  rank, 
  onComplete,
  nextLevel = null
}) => {
  const [isVisible, setIsVisible] = useState(false);
  
  // Debug level completion show status
  useEffect(() => {
    if (show) {
      console.log("Level completion should show:", { level, nextLevel });
    }
  }, [show, level, nextLevel]);
  
  useEffect(() => {
    if (show) {
      // Make sure the modal is visible
      setIsVisible(true);
      
      // Keep showing the modal until user interacts with it
      // This ensures they don't miss it
      // We'll let the user dismiss it with the button instead of auto-hiding
      
      return () => {}; // No auto-hide timeout
    }
  }, [show, onComplete]);
  
  if (!show && !isVisible) return null;
  
  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/70 transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Confetti animation using CSS - increased count for more celebration */}
      <div className="confetti-container">
        {[...Array(100)].map((_, i) => (
          <div 
            key={i} 
            className="confetti"
            style={{
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 10 + 5}px`,
              height: `${Math.random() * 10 + 10}px`,
              backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 3 + 2}s`
            }}
          />
        ))}
      </div>
      
      {/* Celebration message card with animation */}
      <div className="bg-gray-800 rounded-xl p-8 max-w-md text-center transform scale-110 shadow-2xl border-2 border-emerald-400 animate-bounce-slow">
        <h2 className="text-3xl font-bold text-white mb-4">🎉 Level Mastered! 🎉</h2>
        <div className="mb-6">
          <div className="text-xl text-gray-300 mb-2">
            You've mastered:
          </div>
          <div className="text-2xl font-bold text-emerald-400 mb-4">
            {level.name}: {level.description}
          </div>
          {/* Rank display removed from learning mode completion */}
        </div>
        
        {nextLevel ? (
          <div className="mb-6">
            <p className="text-gray-300 mb-3">Up next:</p>
            <div className="text-xl text-blue-300 font-bold">{nextLevel.name}: {nextLevel.description}</div>
          </div>
        ) : (
          <div className="mb-6">
            <p className="text-gray-300 mb-3">Congratulations!</p>
            <div className="text-xl text-blue-300 font-bold">You've completed all learning levels!</div>
          </div>
        )}
        
        <button
          onClick={() => {
            setIsVisible(false);
            if (onComplete) setTimeout(onComplete, 500);
          }}
          className="mt-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold transition-colors text-xl shadow-lg hover:scale-105 transform transition-transform"
        >
          {nextLevel ? '✨ Go to Next Level ✨' : '✨ Return to Main Test ✨'}
        </button>
      </div>
    </div>
  );
};

export default LevelCompletionConfetti;