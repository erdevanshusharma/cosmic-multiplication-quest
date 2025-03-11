import React from "react";

const HeatMap = ({ tableNumber, responseTimes, attemptCounts, correctAnswers, wrongAnswers }) => {
  const tableKey = `table_${tableNumber}`;
  const tableData = responseTimes?.[tableKey] || {};
  
  // Create a matrix for all possible multiplications (1-12)
  const gridData = [];
  
  for (let multiplier = 1; multiplier <= 12; multiplier++) {
    const questionKey = `${tableNumber}x${multiplier}`;
    const times = tableData[questionKey] || [];
    
    // Calculate metrics
    const avgTime = times.length > 0 
      ? times.reduce((sum, t) => sum + t, 0) / times.length 
      : null;
      
    const attempts = attemptCounts?.[questionKey] || 0;
    const correct = correctAnswers?.[questionKey] || 0;
    const wrong = wrongAnswers?.[questionKey] || 0;
    
    // Calculate accuracy rate
    const accuracyRate = attempts > 0 
      ? Math.floor((correct / attempts) * 100) 
      : null;
    
    // Determine cell color based on response time (match rank colors)
    // Match color scheme with player ranks (Minecraft-inspired)
    let cellColor;
    if (avgTime === null) {
      cellColor = "bg-gray-700"; // Not attempted
    } else if (avgTime <= 1) {
      cellColor = "bg-pink-300"; // God (peach/pink)
    } else if (avgTime <= 3) {
      cellColor = "bg-gray-900"; // Hacker (black)
    } else if (avgTime <= 5) {
      cellColor = "bg-blue-400"; // Pro (diamond blue)
    } else {
      cellColor = "bg-gray-400"; // Noob (light gray)
    }
    
    // Add data to grid
    gridData.push({
      multiplier,
      product: tableNumber * multiplier,
      avgTime,
      attempts,
      accuracyRate,
      cellColor,
    });
  }
  
  return (
    <div className="bg-gray-800 bg-opacity-90 rounded-lg p-3 shadow-lg">
      <h3 className="text-white text-sm font-bold mb-2">
        {tableNumber}'s Table Performance
      </h3>
      
      <div className="grid grid-cols-4 gap-1">
        {gridData.map((cell) => (
          <div 
            key={cell.multiplier}
            className={`${cell.cellColor} rounded-md p-1 text-center cursor-help relative group`}
          >
            <div className="text-xs text-white font-bold">
              {tableNumber} × {cell.multiplier}
            </div>
            
            {/* Show additional data on hover */}
            <div className="hidden group-hover:block absolute z-10 left-full ml-2 top-0 bg-gray-900 border border-gray-700 rounded-md p-2 shadow-lg text-left whitespace-nowrap text-xs">
              <div className="text-white">{tableNumber} × {cell.multiplier}</div>
              {cell.avgTime !== null ? (
                <>
                  <div className="text-blue-300">Avg time: {cell.avgTime.toFixed(1)}s</div>
                  <div className="text-yellow-300">Accuracy: {cell.accuracyRate}%</div>
                  <div className="text-gray-300">Attempts: {cell.attempts}</div>
                </>
              ) : (
                <div className="text-gray-400 italic">Not yet attempted</div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Color legend matching rank system - Minecraft inspired */}
      <div className="mt-2 flex flex-wrap gap-2 justify-center">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-pink-300 rounded-sm mr-1"></div>
          <span className="text-pink-300 text-xs">God ≤1s</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-gray-900 rounded-sm mr-1"></div>
          <span className="text-gray-900 text-xs">Hacker ≤3s</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-400 rounded-sm mr-1"></div>
          <span className="text-blue-400 text-xs">Pro ≤5s</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-gray-400 rounded-sm mr-1"></div>
          <span className="text-gray-400 text-xs">Noob ≤10s</span>
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