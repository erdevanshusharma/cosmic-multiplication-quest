import React, { useEffect, useState } from 'react';

const LevelCompletionConfetti = ({ 
  show, 
  level, 
  rank, 
  onComplete,
  nextLevel = null
}) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    if (show) {
      setIsVisible(true);
      
      // Hide after 5 seconds and trigger the onComplete callback
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onComplete) {
          setTimeout(() => {
            onComplete();
          }, 500); // Give time for fade out animation
        }
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);
  
  if (!show && !isVisible) return null;
  
  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/70 transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Confetti animation using CSS */}
      <div className="confetti-container">
        {[...Array(50)].map((_, i) => (
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
      
      {/* Celebration message card */}
      <div className="bg-gray-800 rounded-xl p-8 max-w-md text-center transform scale-110 shadow-2xl border-2 border-emerald-400">
        <h2 className="text-3xl font-bold text-white mb-4">Level Completed! 🎉</h2>
        <div className="mb-6">
          <div className="text-xl text-gray-300 mb-2">
            You've mastered:
          </div>
          <div className="text-2xl font-bold text-emerald-400 mb-4">
            {level.name}: {level.description}
          </div>
          <div className="flex justify-center items-center mb-4">
            <div className="text-lg text-gray-300 mr-3">Your rank:</div>
            <div className={`px-4 py-2 rounded text-lg font-bold ${rank.color} bg-gray-700`}>
              {rank.rank}
            </div>
          </div>
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
          className="mt-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold transition-colors"
        >
          {nextLevel ? 'Continue to Next Level' : 'Continue to Main Test'}
        </button>
      </div>
    </div>
  );
};

export default LevelCompletionConfetti;