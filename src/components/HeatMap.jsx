import React from "react";

const HeatMap = ({
  tableNumber,
  responseTimes,
  attemptCounts,
  correctAnswers,
  wrongAnswers,
  isLearningMode = false,
  levelRange = null,
  learningModeResponseTimes = null,
  planetId = null,
  currentLearningLevel = null,
}) => {
  // Different data source based on mode
  let tableData = {};
  
  if (isLearningMode && learningModeResponseTimes && planetId && currentLearningLevel) {
    // In learning mode, use learning mode data
    const planetKey = `planet_${planetId}`;
    const levelKey = `level_${currentLearningLevel.id}`;
    tableData = learningModeResponseTimes[planetKey]?.[levelKey] || {};
  } else {
    // In regular mode, use regular data
    const tableKey = `table_${tableNumber}`;
    tableData = responseTimes?.[tableKey] || {};
  }

  // Create a matrix for multiplications (either all 1-12 or filtered by level range)
  const gridData = [];
  
  // Determine range of multipliers to display
  const minMultiplier = isLearningMode && levelRange ? levelRange[0] : 1;
  const maxMultiplier = isLearningMode && levelRange ? levelRange[1] : 12;

  for (let multiplier = minMultiplier; multiplier <= maxMultiplier; multiplier++) {
    const questionKey = `${tableNumber}x${multiplier}`;
    
    // Get response times - either from learning mode or regular mode
    const times = tableData[questionKey] || [];

    // Calculate metrics
    const avgTime =
      times.length > 0
        ? times.reduce((sum, t) => sum + t, 0) / times.length
        : null;

    // For learning mode, we calculate stats directly from the response times data
    let attempts, correct, wrong;
    
    if (isLearningMode) {
      // In learning mode, we only track correct answers in learningModeResponseTimes
      attempts = times.length;
      correct = times.length; // All tracked responses in learning mode are correct answers
      wrong = 0; // We don't track wrong answers in learning mode currently
    } else {
      // Regular mode - use the standard metrics
      attempts = attemptCounts?.[questionKey] || 0;
      correct = correctAnswers?.[questionKey] || 0;
      wrong = wrongAnswers?.[questionKey] || 0;
    }

    // Calculate accuracy rate
    const accuracyRate =
      attempts > 0 ? Math.floor((correct / attempts) * 100) : null;

    // Determine cell color based on response time (match rank colors)
    // Match updated color scheme with player ranks
    let cellColor, textColor;
    if (avgTime === null) {
      cellColor = "bg-gray-700"; // Not attempted
      textColor = "text-white";
    } else if (avgTime <= 1) {
      cellColor = "bg-slate-50"; // God (amber-50 with better contrast)
      textColor = "text-black"; // Black text on light background
    } else if (avgTime <= 3) {
      cellColor = "bg-slate-400"; // Hacker (rose-200 with better contrast)
      textColor = "text-black"; // Black text on light background
    } else if (avgTime <= 5) {
      cellColor = "bg-slate-500"; // Pro (sky-400 with better contrast)
      textColor = "text-white";
    } else if (avgTime <= 10) {
      cellColor = "bg-slate-700"; // Journeyman (violet-500 with better contrast)
      textColor = "text-white";
    } else {
      cellColor = "bg-slate-800"; // Noob (blue-800 with better contrast)
      textColor = "text-white";
    }

    // Add data to grid
    gridData.push({
      multiplier,
      product: tableNumber * multiplier,
      avgTime,
      attempts,
      accuracyRate,
      cellColor,
      textColor,
    });
  }

  return (
    <div className="bg-gray-800 bg-opacity-90 rounded-lg p-3 shadow-lg">
      <h3 className="text-white text-sm font-bold mb-2">
        {isLearningMode && levelRange 
          ? `${tableNumber}'s Table (×${minMultiplier}-${maxMultiplier})`
          : `${tableNumber}'s Table Performance`
        }
      </h3>

      <div className={`grid ${isLearningMode ? 'grid-cols-3' : 'grid-cols-4'} gap-1`}>
        {gridData.map((cell) => (
          <div
            key={cell.multiplier}
            className={`${cell.cellColor} rounded-md p-1 text-center cursor-help relative group`}
          >
            <div className={`text-xs ${cell.textColor} font-bold`}>
              {tableNumber} × {cell.multiplier}
            </div>

            {/* Show additional data on hover */}
            <div className="hidden group-hover:block absolute z-10 left-full ml-2 top-0 bg-gray-900 border border-gray-700 rounded-md p-2 shadow-lg text-left whitespace-nowrap text-xs">
              <div className="text-white">
                {tableNumber} × {cell.multiplier}
              </div>
              {cell.avgTime !== null ? (
                <>
                  <div className="text-blue-300">
                    Avg time: {cell.avgTime.toFixed(2)}s
                  </div>
                  <div className="text-yellow-300">
                    Accuracy: {cell.accuracyRate}%
                  </div>
                  <div className="text-gray-300">Attempts: {cell.attempts}</div>
                </>
              ) : (
                <div className="text-gray-400 italic">Not yet attempted</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Color legend matching updated rank system */}
      <div className="mt-2 flex flex-wrap gap-2 justify-center">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-slate-50 rounded-sm mr-1"></div>
          <span className="text-white text-xs font-bold">God ≤1s</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-slate-400 rounded-sm mr-1"></div>
          <span className="text-white text-xs font-bold">Hacker ≤3s</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-slate-500 rounded-sm mr-1"></div>
          <span className="text-white text-xs font-bold">Pro ≤5s</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-slate-700 rounded-sm mr-1"></div>
          <span className="text-white text-xs font-bold">Journeyman ≤10s</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-slate-800 rounded-sm mr-1"></div>
          <span className="text-white text-xs font-bold">Noob &gt;10s</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-gray-700 rounded-sm mr-1"></div>
          <span className="text-gray-400 text-xs">Not Attempted</span>
        </div>
      </div>
    </div>
  );
};

export default HeatMap;
