// Get time limit based on table number
export const getDifficultyTimeLimit = (tableNumber) => {
  // Tables 3-5: 15 seconds
  // Tables 6-9: 12 seconds
  // Tables 10-12: 10 seconds
  // Tables 13-16: 8 seconds
  // Tables 17-20: 6 seconds
  
  if (tableNumber <= 5) return 15;
  if (tableNumber <= 9) return 12;
  if (tableNumber <= 12) return 10;
  if (tableNumber <= 16) return 8;
  return 6; // Tables 17-20
};

// Generate a new multiplication question
export const generateQuestion = (
  planet,
  previousMultiplier,
  attemptCounts,
  responseTimes
) => {
  const multiplicand = planet.table;

  // Track which multipliers have been shown the least
  const multiplierCounts = {};

  // Count appearances of each multiplier for this table
  for (let i = 1; i <= 12; i++) {
    const questionKey = `${multiplicand}x${i}`;
    multiplierCounts[i] = attemptCounts[questionKey] || 0;
  }

  // Create an array of all multipliers except the previous one
  const availableMultipliers = Array.from(
    { length: 12 },
    (_, i) => i + 1
  ).filter((mult) => mult !== previousMultiplier);

  // Determine selection strategy
  const random = Math.random();
  let multiplier;

  if (random < 0.4) {
    // 40% chance: Prioritize least shown multipliers
    // Sort by lowest appearance count
    availableMultipliers.sort(
      (a, b) => multiplierCounts[a] - multiplierCounts[b]
    );

    // Pick one of the least shown multipliers (with some randomness)
    // Take the first 3 least shown or all if less than 3 are available
    const leastShownCount = Math.min(3, availableMultipliers.length);
    multiplier =
      availableMultipliers[Math.floor(Math.random() * leastShownCount)];
  } else if (random < 0.8) {
    // 40% chance: Use performance-based selection (when we have enough data)
    // Create a list of all multipliers with their average response times
    const tableKey = `table_${multiplicand}`;
    const tableData = responseTimes[tableKey] || {};

    if (Object.keys(tableData).length >= 6) {
      const multiplierPerformance = availableMultipliers.map((mult) => {
        const questionKey = `${multiplicand}x${mult}`;
        const times = tableData[questionKey] || [];
        // Default to 0 if no data (will be least prioritized)
        const avgTime =
          times.length > 0
            ? times.reduce((sum, t) => sum + t, 0) / times.length
            : 0;
        return { multiplier: mult, avgTime };
      });

      if (multiplierPerformance.length > 0) {
        // Weight by avg time - slower times get higher probability
        const totalWeight = multiplierPerformance.reduce(
          (sum, item) => sum + Math.max(1, item.avgTime),
          0
        );
        let randomValue = Math.random() * totalWeight;

        for (const item of multiplierPerformance) {
          const weight = Math.max(1, item.avgTime); // Ensure even unseen items have a chance
          if (randomValue <= weight) {
            multiplier = item.multiplier;
            break;
          }
          randomValue -= weight;
        }

        // Fallback if something goes wrong with weighted selection
        if (!multiplier) {
          multiplier =
            multiplierPerformance[
              Math.floor(Math.random() * multiplierPerformance.length)
            ].multiplier;
        }
      } else {
        multiplier =
          availableMultipliers[
            Math.floor(Math.random() * availableMultipliers.length)
          ];
      }
    } else {
      multiplier =
        availableMultipliers[
          Math.floor(Math.random() * availableMultipliers.length)
        ];
    }
  } else {
    // 20% chance: Pure random selection from available multipliers
    multiplier =
      availableMultipliers[
        Math.floor(Math.random() * availableMultipliers.length)
      ];
  }

  const correctAnswer = multiplicand * multiplier;

  // Generate 3 wrong answers that are close to the correct answer
  let wrongAnswers = [];
  while (wrongAnswers.length < 3) {
    // Create plausible wrong answers: either off by 1-3, or a common mistake like wrong table
    let wrongAnswer;
    const errorType = Math.random();

    if (errorType < 0.3) {
      // Wrong by a small amount (±1-3)
      const offset = Math.floor(Math.random() * 3) + 1;
      wrongAnswer = correctAnswer + (Math.random() < 0.5 ? offset : -offset);
    } else if (errorType < 0.6) {
      // Common mistake: adding instead of multiplying
      wrongAnswer = multiplicand + multiplier;
    } else if (errorType < 0.8) {
      // Common mistake: using wrong table (±1-2)
      const tableOffset = Math.floor(Math.random() * 2) + 1;
      const wrongTable =
        multiplicand + (Math.random() < 0.5 ? tableOffset : -tableOffset);
      wrongAnswer = wrongTable * multiplier;
    } else {
      // Random number in the general vicinity
      const range = Math.max(5, Math.floor(correctAnswer * 0.2));
      wrongAnswer =
        correctAnswer + Math.floor(Math.random() * range * 2) - range;
    }

    // Ensure the wrong answer is positive and not equal to the correct answer or other wrong answers
    if (
      wrongAnswer > 0 &&
      wrongAnswer !== correctAnswer &&
      !wrongAnswers.includes(wrongAnswer)
    ) {
      wrongAnswers.push(wrongAnswer);
    }
  }

  // Combine correct and wrong answers, then shuffle
  const options = [correctAnswer, ...wrongAnswers];
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }

  const newQuestion = {
    multiplicand,
    multiplier,
    answer: correctAnswer,
    timeLimit: getDifficultyTimeLimit(planet.table),
  };

  return {
    question: newQuestion,
    options,
    newMultiplier: multiplier
  };
};

// Generate a mini-game question
export const generateMiniGameQuestion = () => {
  const firstNum = Math.floor(Math.random() * 12) + 1;
  const secondNum = Math.floor(Math.random() * 12) + 1;
  const correctAnswer = firstNum * secondNum;

  // Generate wrong answers
  let wrongAnswers = [];
  while (wrongAnswers.length < 3) {
    let wrongAnswer;

    // Create plausible wrong answers
    if (Math.random() < 0.5) {
      // Wrong by a small amount
      const offset = Math.floor(Math.random() * 5) + 1;
      wrongAnswer = correctAnswer + (Math.random() < 0.5 ? offset : -offset);
    } else {
      // Common mistake: adding or wrong operation
      wrongAnswer =
        Math.random() < 0.5
          ? firstNum + secondNum
          : firstNum * (secondNum + 1);
    }

    // Ensure the wrong answer is positive and unique
    if (
      wrongAnswer > 0 &&
      wrongAnswer !== correctAnswer &&
      !wrongAnswers.includes(wrongAnswer)
    ) {
      wrongAnswers.push(wrongAnswer);
    }
  }

  // Combine and shuffle all options
  const options = [correctAnswer, ...wrongAnswers];
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }

  // Set as current question
  const newQuestion = {
    multiplicand: firstNum,
    multiplier: secondNum,
    answer: correctAnswer,
  };

  return {
    question: newQuestion,
    options,
  };
};