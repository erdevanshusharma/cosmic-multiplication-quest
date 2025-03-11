import React, { useState, useEffect, useRef } from "react";
import "./App.css";

// Helper functions for local storage
const saveToLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Error saving to localStorage:", error);
  }
};

const loadFromLocalStorage = (key, defaultValue) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : defaultValue;
  } catch (error) {
    console.error("Error loading from localStorage:", error);
    return defaultValue;
  }
};

const CosmicMultiplicationQuest = () => {
  // Ref for stars container
  const starsRef = useRef(null);

  // Create stars for background
  useEffect(() => {
    if (!starsRef.current) return;

    const starsContainer = starsRef.current;
    starsContainer.innerHTML = "";

    const starCount = 200;

    for (let i = 0; i < starCount; i++) {
      const star = document.createElement("div");
      star.classList.add("star");

      // Random position
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;

      // Random size
      const size = Math.random() * 3;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;

      // Random opacity
      star.style.opacity = Math.random();

      // Random animation delay for twinkling effect
      star.style.animation = `pulse ${3 + Math.random() * 4}s infinite ${
        Math.random() * 5
      }s`;

      starsContainer.appendChild(star);
    }
  }, []);

  // Initialize or get profile ID
  const [profileId, setProfileId] = useState(() => {
    const savedProfileId = localStorage.getItem("cosmicQuest_profileId");
    if (savedProfileId) {
      return savedProfileId;
    } else {
      // Create a new profile ID if one doesn't exist
      const newProfileId = `profile_${Date.now()}`;
      localStorage.setItem("cosmicQuest_profileId", newProfileId);
      return newProfileId;
    }
  });

  // Game states - initialize from localStorage with defaults
  const [gameState, setGameState] = useState(
    loadFromLocalStorage("cosmicQuest_gameState", "menu")
  ); // menu, game, metrics
  const [currentPlanet, setCurrentPlanet] = useState(
    loadFromLocalStorage("cosmicQuest_currentPlanet", 1)
  );
  const [score, setScore] = useState(
    loadFromLocalStorage("cosmicQuest_score", 0)
  );
  const [lives, setLives] = useState(
    loadFromLocalStorage("cosmicQuest_lives", 3)
  );
  const [feedback, setFeedback] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState({});
  const [answerOptions, setAnswerOptions] = useState([]);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(10);
  const [unlockedPlanets, setUnlockedPlanets] = useState(
    loadFromLocalStorage("cosmicQuest_unlockedPlanets", [1])
  );
  const [speedBoost, setSpeedBoost] = useState(1);
  const [correctAnswers, setCorrectAnswers] = useState(
    loadFromLocalStorage("cosmicQuest_correctAnswers", {})
  );
  const [wrongAnswers, setWrongAnswers] = useState(
    loadFromLocalStorage("cosmicQuest_wrongAnswers", {})
  );
  const [spaceshipParts, setSpaceshipParts] = useState(
    loadFromLocalStorage("cosmicQuest_spaceshipParts", 0)
  );
  const [badges, setBadges] = useState(
    loadFromLocalStorage("cosmicQuest_badges", [])
  );
  const [miniGameActive, setMiniGameActive] = useState(false);
  const [miniGameType, setMiniGameType] = useState("");
  const [miniGameFeedback, setMiniGameFeedback] = useState("");
  const [planetMastery, setPlanetMastery] = useState(
    loadFromLocalStorage("cosmicQuest_planetMastery", {})
  ); // Tracks mastery level for each planet
  const [fastAnswers, setFastAnswers] = useState(
    loadFromLocalStorage("cosmicQuest_fastAnswers", {})
  ); // Tracks fast answers for each planet
  const [lastPlayed, setLastPlayed] = useState(
    loadFromLocalStorage("cosmicQuest_lastPlayed", null)
  ); // Last played timestamp
  
  // Performance metrics
  const [responseTimes, setResponseTimes] = useState(
    loadFromLocalStorage("cosmicQuest_responseTimes", {})
  ); // Track response times for each question
  const [attemptCounts, setAttemptCounts] = useState(
    loadFromLocalStorage("cosmicQuest_attemptCounts", {})
  ); // Track number of attempts for each question
  const [showPerformanceView, setShowPerformanceView] = useState(false); // Toggle for performance view

  // Save states to localStorage when they change
  useEffect(() => {
    saveToLocalStorage("cosmicQuest_gameState", gameState);
  }, [gameState]);

  useEffect(() => {
    saveToLocalStorage("cosmicQuest_currentPlanet", currentPlanet);
  }, [currentPlanet]);

  useEffect(() => {
    saveToLocalStorage("cosmicQuest_score", score);
  }, [score]);

  useEffect(() => {
    saveToLocalStorage("cosmicQuest_lives", lives);
  }, [lives]);

  useEffect(() => {
    saveToLocalStorage("cosmicQuest_unlockedPlanets", unlockedPlanets);
  }, [unlockedPlanets]);

  useEffect(() => {
    saveToLocalStorage("cosmicQuest_correctAnswers", correctAnswers);
  }, [correctAnswers]);

  useEffect(() => {
    saveToLocalStorage("cosmicQuest_wrongAnswers", wrongAnswers);
  }, [wrongAnswers]);

  useEffect(() => {
    saveToLocalStorage("cosmicQuest_spaceshipParts", spaceshipParts);
  }, [spaceshipParts]);

  useEffect(() => {
    saveToLocalStorage("cosmicQuest_badges", badges);
  }, [badges]);

  useEffect(() => {
    saveToLocalStorage("cosmicQuest_planetMastery", planetMastery);
  }, [planetMastery]);

  useEffect(() => {
    saveToLocalStorage("cosmicQuest_fastAnswers", fastAnswers);
  }, [fastAnswers]);

  useEffect(() => {
    saveToLocalStorage("cosmicQuest_lastPlayed", lastPlayed);
  }, [lastPlayed]);
  
  useEffect(() => {
    saveToLocalStorage("cosmicQuest_responseTimes", responseTimes);
  }, [responseTimes]);
  
  useEffect(() => {
    saveToLocalStorage("cosmicQuest_attemptCounts", attemptCounts);
  }, [attemptCounts]);

  // Update last played time whenever the game is started or resumed
  useEffect(() => {
    if (gameState === "game") {
      const now = new Date().toISOString();
      setLastPlayed(now);
    }
  }, [gameState]);

  // Show welcome back message if returning after a while
  useEffect(() => {
    if (lastPlayed && score > 0) {
      const lastPlayedDate = new Date(lastPlayed);
      const now = new Date();
      const daysSinceLastPlayed = Math.floor(
        (now - lastPlayedDate) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceLastPlayed >= 1) {
        // Only show welcome back message if it's been at least a day
        const welcomeMessage =
          daysSinceLastPlayed === 1
            ? "Welcome back, space explorer! It's been a day since your last mission."
            : `Welcome back, space explorer! It's been ${daysSinceLastPlayed} days since your last mission.`;

        setTimeout(() => {
          alert(welcomeMessage);
        }, 1000);
      }
    }
  }, []);

  // Planet data - each represents a multiplication table
  const planets = [
    {
      id: 1,
      name: "Earth",
      table: 3,
      color: "bg-blue-400",
      difficulty: "easy",
    },
    { id: 2, name: "Mars", table: 4, color: "bg-red-500", difficulty: "easy" },
    {
      id: 3,
      name: "Jupiter",
      table: 5,
      color: "bg-orange-300",
      difficulty: "easy",
    },
    {
      id: 4,
      name: "Saturn",
      table: 6,
      color: "bg-yellow-600",
      difficulty: "medium",
    },
    {
      id: 5,
      name: "Uranus",
      table: 7,
      color: "bg-blue-300",
      difficulty: "medium",
    },
    {
      id: 6,
      name: "Neptune",
      table: 8,
      color: "bg-blue-600",
      difficulty: "medium",
    },
    {
      id: 7,
      name: "Pluto",
      table: 9,
      color: "bg-purple-400",
      difficulty: "medium",
    },
    {
      id: 8,
      name: "Kepler-186f",
      table: 10,
      color: "bg-green-500",
      difficulty: "hard",
    },
    {
      id: 9,
      name: "Trappist-1e",
      table: 11,
      color: "bg-red-300",
      difficulty: "hard",
    },
    {
      id: 10,
      name: "Proxima Centauri b",
      table: 12,
      color: "bg-pink-400",
      difficulty: "hard",
    },
    {
      id: 11,
      name: "HD 189733b",
      table: 13,
      color: "bg-indigo-400",
      difficulty: "expert",
    },
    {
      id: 12,
      name: "WASP-12b",
      table: 14,
      color: "bg-purple-600",
      difficulty: "expert",
    },
    {
      id: 13,
      name: "CoRoT-7b",
      table: 15,
      color: "bg-amber-700",
      difficulty: "expert",
    },
    {
      id: 14,
      name: "K2-18b",
      table: 16,
      color: "bg-cyan-500",
      difficulty: "expert",
    },
    {
      id: 15,
      name: "GJ 1214b",
      table: 17,
      color: "bg-lime-600",
      difficulty: "master",
    },
    {
      id: 16,
      name: "TOI-1452b",
      table: 18,
      color: "bg-teal-400",
      difficulty: "master",
    },
    {
      id: 17,
      name: "55 Cancri e",
      table: 19,
      color: "bg-rose-500",
      difficulty: "master",
    },
    {
      id: 18,
      name: "Kepler-442b",
      table: 20,
      color: "bg-emerald-600",
      difficulty: "master",
    },
  ];

  // Track previous multiplier to avoid consecutive repeats
  const [previousMultiplier, setPreviousMultiplier] = useState(null);

  // Generate a new multiplication question based on current planet
  const generateQuestion = () => {
    // Clear any feedback and set game to active mode
    setMiniGameActive(false);
    setMiniGameFeedback("");
    
    const planet = planets.find((p) => p.id === currentPlanet);
    const multiplicand = planet.table;
    
    // Get a multiplier that's different from the previous one
    // and preferentially choose difficult multipliers based on metrics
    let multiplier;
    const tableKey = `table_${multiplicand}`;
    const tableData = responseTimes[tableKey] || {};
    
    // Track which multipliers have been shown the least
    // Use attemptCounts to determine how many times each multiplier has been shown
    const multiplierCounts = {};
    
    // Count appearances of each multiplier for this table
    for (let i = 1; i <= 12; i++) {
      const questionKey = `${multiplicand}x${i}`;
      multiplierCounts[i] = attemptCounts[questionKey] || 0;
    }
    
    // Create an array of all multipliers except the previous one
    const availableMultipliers = Array.from({ length: 12 }, (_, i) => i + 1)
      .filter(mult => mult !== previousMultiplier);
    
    // Determine selection strategy
    const random = Math.random();
    
    if (random < 0.4) {
      // 40% chance: Prioritize least shown multipliers
      // Sort by lowest appearance count
      availableMultipliers.sort((a, b) => multiplierCounts[a] - multiplierCounts[b]);
      
      // Pick one of the least shown multipliers (with some randomness)
      // Take the first 3 least shown or all if less than 3 are available
      const leastShownCount = Math.min(3, availableMultipliers.length);
      multiplier = availableMultipliers[Math.floor(Math.random() * leastShownCount)];
    }
    else if (random < 0.8 && Object.keys(tableData).length >= 6) {
      // 40% chance: Use performance-based selection (when we have enough data)
      // Create a list of all multipliers with their average response times
      const multiplierPerformance = availableMultipliers.map(mult => {
        const questionKey = `${multiplicand}x${mult}`;
        const times = tableData[questionKey] || [];
        // Default to 0 if no data (will be least prioritized)
        const avgTime = times.length > 0 
          ? times.reduce((sum, t) => sum + t, 0) / times.length 
          : 0;
        return { multiplier: mult, avgTime };
      });
      
      if (multiplierPerformance.length > 0) {
        // Weight by avg time - slower times get higher probability
        const totalWeight = multiplierPerformance.reduce((sum, item) => sum + Math.max(1, item.avgTime), 0);
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
          multiplier = multiplierPerformance[
            Math.floor(Math.random() * multiplierPerformance.length)
          ].multiplier;
        }
      } else {
        // Should never reach here since we've filtered previousMultiplier
        multiplier = availableMultipliers[Math.floor(Math.random() * availableMultipliers.length)];
      }
    } else {
      // 20% chance: Pure random selection from available multipliers
      multiplier = availableMultipliers[Math.floor(Math.random() * availableMultipliers.length)];
    }
    
    // Save this multiplier as the previous one for next time
    setPreviousMultiplier(multiplier);
    
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
      timeLimit: getDifficultyTimeLimit(planet.difficulty),
    };

    setCurrentQuestion(newQuestion);
    setAnswerOptions(options);
    setTimeRemaining(newQuestion.timeLimit);
    setFeedback(""); // Clear any existing feedback
    setTimerRunning(true);
  };

  // Get time limit based on difficulty
  const getDifficultyTimeLimit = (difficulty) => {
    switch (difficulty) {
      case "easy":
        return 15;
      case "medium":
        return 12;
      case "hard":
        return 10;
      case "expert":
        return 8;
      case "master":
        return 6;
      default:
        return 10;
    }
  };

  // Start the game
  const startGame = () => {
    // Get the current planet
    const planet = planets.find((p) => p.id === currentPlanet);
    
    // Reset states
    setMiniGameActive(false);
    setMiniGameFeedback("");
    setFeedback("");
    setPreviousMultiplier(null);
    
    // Start with a fresh game using the current planet
    startGameWithPlanet(planet);
  };

  // Submit answer
  const submitAnswer = (selectedAnswer) => {
    const isCorrect = selectedAnswer === currentQuestion.answer;

    // Track answer for metrics
    const questionKey = `${currentQuestion.multiplicand}x${currentQuestion.multiplier}`;
    const planet = planets.find((p) => p.id === currentPlanet);
    
    // Calculate response time in seconds
    const fullTimeLimit = getDifficultyTimeLimit(planet.difficulty);
    const secondsUsed = fullTimeLimit - timeRemaining;
    
    // Update attempt counts for this question
    setAttemptCounts(prev => ({
      ...prev,
      [questionKey]: (prev[questionKey] || 0) + 1
    }));
    
    // Track response time (only for correct answers)
    if (isCorrect) {
      // Store response time with the table number as the key prefix
      const tableKey = `table_${currentQuestion.multiplicand}`;
      setResponseTimes(prev => ({
        ...prev,
        [tableKey]: {
          ...(prev[tableKey] || {}),
          [questionKey]: [
            ...(prev[tableKey]?.[questionKey] || []),
            secondsUsed
          ]
        }
      }));
    }

    if (isCorrect) {
      // Calculate points based on time remaining and difficulty
      const difficultyMultiplier =
        planet.difficulty === "easy"
          ? 1
          : planet.difficulty === "medium"
          ? 2
          : planet.difficulty === "hard"
          ? 3
          : planet.difficulty === "expert"
          ? 4
          : 5; // 5x for master level

      // Calculate base points
      const timeBonus = Math.max(1, Math.ceil(timeRemaining / 2));
      
      // Award significant bonus for very fast answers
      let speedMultiplier = 1;
      let speedBonusText = "";
      
      const fullTimeLimit = getDifficultyTimeLimit(planet.difficulty);
      const secondsUsed = fullTimeLimit - timeRemaining;
      
      if (timeRemaining >= fullTimeLimit * 0.8) {
        // Super fast answer (80%+ of time remaining)
        speedMultiplier = 2.0;
        speedBonusText = `SUPER FAST! ⚡⚡ (${secondsUsed.toFixed(1)}s - 2× points)`;
      } else if (timeRemaining >= fullTimeLimit * 0.6) {
        // Fast answer (60%+ of time remaining)
        speedMultiplier = 1.5;
        speedBonusText = `FAST! ⚡ (${secondsUsed.toFixed(1)}s - 1.5× points)`;
      }
      
      // Calculate final points and round to integer
      const pointsEarned = Math.round(10 * difficultyMultiplier * timeBonus * speedBoost * speedMultiplier);
      
      setScore((prev) => prev + pointsEarned);
      
      // Build feedback message with speed bonus if applicable
      let feedbackText = `Correct! +${pointsEarned} points`;
      if (speedBonusText) {
        feedbackText = `${feedbackText}\n${speedBonusText}`;
      }
      
      setFeedback(feedbackText);

      // Track correct answer
      setCorrectAnswers((prev) => ({
        ...prev,
        [questionKey]: (prev[questionKey] || 0) + 1,
      }));

      // Track fast answers for the current planet (answers where time remaining is high)
      const isFastAnswer =
        (planet.difficulty === "easy" && timeRemaining >= 10) ||
        (planet.difficulty === "medium" && timeRemaining >= 8) ||
        (planet.difficulty === "hard" && timeRemaining >= 6) ||
        (planet.difficulty === "expert" && timeRemaining >= 5) ||
        (planet.difficulty === "master" && timeRemaining >= 4);

      if (isFastAnswer) {
        setFastAnswers((prev) => ({
          ...prev,
          [currentPlanet]: (prev[currentPlanet] || 0) + 1,
        }));
      }

      // Update planet mastery
      setPlanetMastery((prev) => {
        const correctCount = correctAnswers[questionKey] || 0;
        const wrongCount = wrongAnswers[questionKey] || 0;
        const totalAttempts = correctCount + wrongCount + 1; // +1 for current correct answer
        const newMasteryPercent = Math.floor(
          ((correctCount + 1) / totalAttempts) * 100
        );

        return {
          ...prev,
          [currentPlanet]: newMasteryPercent,
        };
      });

      // Check if user can unlock the next planet
      // Only unlock if they have high mastery, answered quickly multiple times, AND achieved expert rank
      const currentMastery = planetMastery[currentPlanet] || 0;
      const fastAnswersCount = fastAnswers[currentPlanet] || 0;
      
      // Get average response time and player rank for this table
      const currentTable = planets.find(p => p.id === currentPlanet).table;
      const avgResponseTime = getAverageResponseTime(currentTable);
      const playerRank = avgResponseTime ? getPlayerRank(avgResponseTime) : null;
      
      // Get the minimum rank required to unlock the next planet (Expert or better)
      const hasRequiredRank = playerRank && 
        ['Expert', 'Master', 'Grandmaster'].includes(playerRank.rank);

      // Check for planet unlock conditions
      if (
        currentMastery >= 85 &&
        fastAnswersCount >= 10 &&
        hasRequiredRank &&
        !unlockedPlanets.includes(currentPlanet + 1) &&
        currentPlanet < planets.length
      ) {
        // Unlock the next planet
        setUnlockedPlanets((prev) => [...prev, currentPlanet + 1]);
        setBadges((prev) => [
          ...prev,
          `Unlocked ${planets[currentPlanet].name}`,
        ]);
        
        // Show special unlock notification
        const nextPlanet = planets.find(p => p.id === currentPlanet + 1);
        const unlockMessage = `🎉 ACHIEVEMENT UNLOCKED! 🎉\n\nYou've mastered ${planets[currentPlanet - 1].name}'s table!\n\n${nextPlanet.name} (${nextPlanet.table}'s table) is now available!`;
        
        // Show a modal-style alert for planet unlock (after a short delay)
        setTimeout(() => {
          alert(unlockMessage);
        }, 500);
        
        // Also set feedback with unlock message
        setFeedback(
          (prev) => `${prev}\n🎉 New planet unlocked! 🎉`
        );
      }

      // Random chance to trigger mini-game
      if (Math.random() < 0.2) {
        triggerMiniGame();
      } else {
        // Continue with next question
        setTimeout(() => {
          generateQuestion();
        }, 1500);
      }

      // Increase speed boost for consecutive correct answers
      setSpeedBoost((prev) => Math.min(prev + 0.1, 2.0));

      // Award spaceship part at certain score thresholds
      if (score > 0 && score % 100 < 10) {
        setSpaceshipParts((prev) => prev + 1);
        setBadges((prev) => [...prev, "New Spaceship Part!"]);
      }
    } else {
      setLives((prev) => prev - 1);
      setFeedback(`Incorrect. The answer is ${currentQuestion.answer}.`);
      setSpeedBoost(1); // Reset speed boost

      // Track wrong answer
      setWrongAnswers((prev) => ({
        ...prev,
        [questionKey]: (prev[questionKey] || 0) + 1,
      }));

      // Update planet mastery
      setPlanetMastery((prev) => {
        const correctCount = correctAnswers[questionKey] || 0;
        const wrongCount = wrongAnswers[questionKey] || 0;
        const totalAttempts = correctCount + wrongCount + 1; // +1 for current wrong answer
        const newMasteryPercent = Math.floor(
          (correctCount / totalAttempts) * 100
        );

        return {
          ...prev,
          [currentPlanet]: newMasteryPercent,
        };
      });

      // Check if game over
      if (lives <= 1) {
        setTimerRunning(false);
        setGameState("metrics");
        return;
      }

      // Continue with next question after delay
      setTimeout(() => {
        generateQuestion();
      }, 2000);
    }
  };

  // Trigger a mini-game
  const triggerMiniGame = () => {
    setTimerRunning(false);
    setMiniGameActive(true);
    setMiniGameType(Math.random() < 0.5 ? "asteroid" : "landing");
    
    // Clear any existing feedback when starting a mini-game
    setFeedback("");

    // Generate mini-game question with multiple-choice options
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

    setCurrentQuestion(newQuestion);
    setAnswerOptions(options);
  };

  // Complete mini-game based on selected answer
  const completeMiniGame = (selectedAnswer) => {
    const success = selectedAnswer === currentQuestion.answer;

    if (success) {
      // Use rounded integer points
      const bonusPoints = 50;
      setScore((prev) => prev + bonusPoints);
      
      // Create a more exciting success message
      let successMessage;
      
      if (miniGameType === "asteroid") {
        successMessage = `🎯 MISSION SUCCESS! 🎯\n+${bonusPoints} points\nYou've successfully navigated through the asteroid field!`;
      } else {
        successMessage = `🎯 MISSION SUCCESS! 🎯\n+${bonusPoints} points\nPerfect landing achieved on the planetary surface!`;
      }
      
      setMiniGameFeedback(successMessage);
      
      // Add badge
      setBadges((prev) => [
        ...prev,
        `${miniGameType === "asteroid" ? "Asteroid Dodger" : "Safe Lander"}`,
      ]);
    } else {
      setMiniGameFeedback(
        `Mission failed. The answer was ${currentQuestion.answer}.`
      );
    }

    // Generate the next question in advance but don't show it yet
    const planet = planets.find((p) => p.id === currentPlanet);
    const multiplicand = planet.table;
    
    // Get a multiplier that's different from the previous one
    // and preferentially choose difficult multipliers based on metrics
    let multiplier;
    const tableKey = `table_${multiplicand}`;
    const tableData = responseTimes[tableKey] || {};
    
    // Track which multipliers have been shown the least
    // Use attemptCounts to determine how many times each multiplier has been shown
    const multiplierCounts = {};
    
    // Count appearances of each multiplier for this table
    for (let i = 1; i <= 12; i++) {
      const questionKey = `${multiplicand}x${i}`;
      multiplierCounts[i] = attemptCounts[questionKey] || 0;
    }
    
    // Create an array of all multipliers except the previous one
    const availableMultipliers = Array.from({ length: 12 }, (_, i) => i + 1)
      .filter(mult => mult !== previousMultiplier);
    
    // Determine selection strategy
    const random = Math.random();
    
    if (random < 0.4) {
      // 40% chance: Prioritize least shown multipliers
      // Sort by lowest appearance count
      availableMultipliers.sort((a, b) => multiplierCounts[a] - multiplierCounts[b]);
      
      // Pick one of the least shown multipliers (with some randomness)
      // Take the first 3 least shown or all if less than 3 are available
      const leastShownCount = Math.min(3, availableMultipliers.length);
      multiplier = availableMultipliers[Math.floor(Math.random() * leastShownCount)];
    }
    else if (random < 0.8 && Object.keys(tableData).length >= 6) {
      // 40% chance: Use performance-based selection (when we have enough data)
      // Create a list of all multipliers with their average response times
      const multiplierPerformance = availableMultipliers.map(mult => {
        const questionKey = `${multiplicand}x${mult}`;
        const times = tableData[questionKey] || [];
        // Default to 0 if no data (will be least prioritized)
        const avgTime = times.length > 0 
          ? times.reduce((sum, t) => sum + t, 0) / times.length 
          : 0;
        return { multiplier: mult, avgTime };
      });
      
      if (multiplierPerformance.length > 0) {
        // Weight by avg time - slower times get higher probability
        const totalWeight = multiplierPerformance.reduce((sum, item) => sum + Math.max(1, item.avgTime), 0);
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
          multiplier = multiplierPerformance[
            Math.floor(Math.random() * multiplierPerformance.length)
          ].multiplier;
        }
      } else {
        // Should never reach here since we've filtered previousMultiplier
        multiplier = availableMultipliers[Math.floor(Math.random() * availableMultipliers.length)];
      }
    } else {
      // 20% chance: Pure random selection from available multipliers
      multiplier = availableMultipliers[Math.floor(Math.random() * availableMultipliers.length)];
    }
    
    // Save this multiplier as the previous one for next time
    setPreviousMultiplier(multiplier);
    
    const correctAnswer = multiplicand * multiplier;

    // Generate answer options
    let wrongAnswers = [];
    while (wrongAnswers.length < 3) {
      let wrongAnswer;
      const errorType = Math.random();

      if (errorType < 0.3) {
        const offset = Math.floor(Math.random() * 3) + 1;
        wrongAnswer = correctAnswer + (Math.random() < 0.5 ? offset : -offset);
      } else if (errorType < 0.6) {
        wrongAnswer = multiplicand + multiplier;
      } else if (errorType < 0.8) {
        const tableOffset = Math.floor(Math.random() * 2) + 1;
        const wrongTable =
          multiplicand + (Math.random() < 0.5 ? tableOffset : -tableOffset);
        wrongAnswer = wrongTable * multiplier;
      } else {
        const range = Math.max(5, Math.floor(correctAnswer * 0.2));
        wrongAnswer =
          correctAnswer + Math.floor(Math.random() * range * 2) - range;
      }

      if (
        wrongAnswer > 0 &&
        wrongAnswer !== correctAnswer &&
        !wrongAnswers.includes(wrongAnswer)
      ) {
        wrongAnswers.push(wrongAnswer);
      }
    }

    // Combine and shuffle options
    const options = [correctAnswer, ...wrongAnswers];
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }

    // Prepare the next question
    const nextQuestion = {
      multiplicand,
      multiplier,
      answer: correctAnswer,
      timeLimit: getDifficultyTimeLimit(planet.difficulty),
    };
    
    // Show feedback for a bit, then transition to the new question
    setTimeout(() => {
      // Perform a quick, clean transition
      setMiniGameActive(false);
      setMiniGameFeedback("");
      setCurrentQuestion(nextQuestion);
      setAnswerOptions(options);
      setTimeRemaining(nextQuestion.timeLimit);
      setFeedback("");
      setTimerRunning(true);
    }, 2000);
  };

  // Handle planet selection
  const selectPlanet = (planetId) => {
    if (unlockedPlanets.includes(planetId)) {
      // First update the current planet
      setCurrentPlanet(planetId);
      
      // Then start the game with the new planet's table
      const selectedPlanet = planets.find(p => p.id === planetId);
      
      // Reset any previous state
      setMiniGameActive(false);
      setMiniGameFeedback("");
      setFeedback("");
      setPreviousMultiplier(null);
      
      // Start with a fresh game using the selected planet's table
      startGameWithPlanet(selectedPlanet);
    }
  };
  
  // Start a game with a specific planet
  const startGameWithPlanet = (planet) => {
    setGameState("game");
    setScore(0);
    setLives(3);
    
    // Generate a question for this specific planet
    const multiplicand = planet.table;
    
    // Use our improved multiplier selection that prioritizes least shown numbers
    // But simplify for first question of a planet (no performance data needed)
    const multiplierCounts = {};
    
    // Count appearances of each multiplier for this table
    for (let i = 1; i <= 12; i++) {
      const questionKey = `${multiplicand}x${i}`;
      multiplierCounts[i] = attemptCounts[questionKey] || 0;
    }
    
    // For first question, prioritize multipliers that have been shown the least
    const availableMultipliers = Array.from({ length: 12 }, (_, i) => i + 1);
    availableMultipliers.sort((a, b) => multiplierCounts[a] - multiplierCounts[b]);
    
    // Pick one of the least shown multipliers
    // For variety, randomize among the 3 least shown
    const leastShownCount = Math.min(3, availableMultipliers.length);
    const multiplier = availableMultipliers[Math.floor(Math.random() * leastShownCount)];
    
    const correctAnswer = multiplicand * multiplier;
    
    // Save this multiplier as the previous one for next time
    setPreviousMultiplier(multiplier);
    
    // Generate answer options
    let wrongAnswers = [];
    while (wrongAnswers.length < 3) {
      let wrongAnswer;
      const errorType = Math.random();

      if (errorType < 0.3) {
        const offset = Math.floor(Math.random() * 3) + 1;
        wrongAnswer = correctAnswer + (Math.random() < 0.5 ? offset : -offset);
      } else if (errorType < 0.6) {
        wrongAnswer = multiplicand + multiplier;
      } else if (errorType < 0.8) {
        const tableOffset = Math.floor(Math.random() * 2) + 1;
        const wrongTable =
          multiplicand + (Math.random() < 0.5 ? tableOffset : -tableOffset);
        wrongAnswer = wrongTable * multiplier;
      } else {
        const range = Math.max(5, Math.floor(correctAnswer * 0.2));
        wrongAnswer =
          correctAnswer + Math.floor(Math.random() * range * 2) - range;
      }

      if (
        wrongAnswer > 0 &&
        wrongAnswer !== correctAnswer &&
        !wrongAnswers.includes(wrongAnswer)
      ) {
        wrongAnswers.push(wrongAnswer);
      }
    }

    // Combine and shuffle options
    const options = [correctAnswer, ...wrongAnswers];
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }

    // Create the new question
    const newQuestion = {
      multiplicand,
      multiplier,
      answer: correctAnswer,
      timeLimit: getDifficultyTimeLimit(planet.difficulty),
    };

    // Update the state with the new question
    setCurrentQuestion(newQuestion);
    setAnswerOptions(options);
    setTimeRemaining(newQuestion.timeLimit);
    setTimerRunning(true);
  };

  // Reset all progress but keep the same profile
  const resetProgress = () => {
    if (
      window.confirm(
        "Are you sure you want to reset all your progress? This cannot be undone."
      )
    ) {
      // Reset all game state to defaults
      setGameState("menu");
      setCurrentPlanet(1);
      setScore(0);
      setLives(3);
      setFeedback("");
      setUnlockedPlanets([1]);
      setSpeedBoost(1);
      setCorrectAnswers({});
      setWrongAnswers({});
      setSpaceshipParts(0);
      setBadges([]);
      setPlanetMastery({});
      setFastAnswers({});
      setResponseTimes({});
      setAttemptCounts({});
      setShowPerformanceView(false);

      // Clear specific items from localStorage
      const keysToRemove = [
        "cosmicQuest_gameState",
        "cosmicQuest_currentPlanet",
        "cosmicQuest_score",
        "cosmicQuest_lives",
        "cosmicQuest_unlockedPlanets",
        "cosmicQuest_correctAnswers",
        "cosmicQuest_wrongAnswers",
        "cosmicQuest_spaceshipParts",
        "cosmicQuest_badges",
        "cosmicQuest_planetMastery",
        "cosmicQuest_fastAnswers",
        "cosmicQuest_lastPlayed",
        "cosmicQuest_responseTimes",
        "cosmicQuest_attemptCounts",
      ];

      keysToRemove.forEach((key) => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.error(`Error removing ${key} from localStorage:`, error);
        }
      });

      // Show confirmation message
      alert("Your progress has been reset. Start your cosmic journey again!");
    }
  };

  // Create a completely new profile (full reset)
  const createNewProfile = () => {
    if (
      window.confirm(
        "This will create a completely new profile and clear ALL data. Are you sure you want to continue? This cannot be undone."
      )
    ) {
      // Clear the entire localStorage for this app
      try {
        // Get all keys from localStorage
        const allKeys = Object.keys(localStorage);

        // Filter only keys related to our app
        const appKeys = allKeys.filter((key) => key.startsWith("cosmicQuest_"));

        // Remove all app-related keys
        appKeys.forEach((key) => {
          localStorage.removeItem(key);
        });

        // Generate a new unique profile ID
        const newProfileId = `profile_${Date.now()}`;
        localStorage.setItem("cosmicQuest_profileId", newProfileId);

        // Reset all state variables to defaults
        setGameState("menu");
        setCurrentPlanet(1);
        setScore(0);
        setLives(3);
        setFeedback("");
        setUnlockedPlanets([1]);
        setSpeedBoost(1);
        setCorrectAnswers({});
        setWrongAnswers({});
        setSpaceshipParts(0);
        setBadges([]);
        setPlanetMastery({});
        setFastAnswers({});
        setLastPlayed(null);
        setResponseTimes({});
        setAttemptCounts({});
        setShowPerformanceView(false);

        // Show confirmation and reload the page to ensure a fresh start
        alert("New profile created successfully! Starting fresh...");
        window.location.reload();
      } catch (error) {
        console.error("Error creating new profile:", error);
        alert("There was an error creating a new profile. Please try again.");
      }
    }
  };

  // Timer effect
  useEffect(() => {
    let timer;
    if (timerRunning && timeRemaining > 0) {
      timer = setTimeout(() => {
        setTimeRemaining((time) => time - 1);
      }, 1000);
    } else if (timerRunning && timeRemaining === 0) {
      // Time's up
      setTimerRunning(false);
      setLives((prev) => prev - 1);
      setFeedback(`Time's up! The answer was ${currentQuestion.answer}.`);
      setSpeedBoost(1); // Reset speed boost

      // Check if game over
      if (lives <= 1) {
        setGameState("metrics");
        return;
      }

      // Continue with next question after delay
      setTimeout(() => {
        generateQuestion();
      }, 2000);
    }

    return () => clearTimeout(timer);
  }, [timerRunning, timeRemaining, lives, currentQuestion]);

  // Determine rank based on average response time
  const getPlayerRank = (avgResponseTime) => {
    // Fix the boundary condition issue by using strict inequalities for all thresholds
    if (avgResponseTime > 15) return { rank: "Noob", color: "text-gray-400" };
    if (avgResponseTime > 12) return { rank: "Apprentice", color: "text-green-400" };
    if (avgResponseTime > 9) return { rank: "Journeyman", color: "text-blue-400" };
    if (avgResponseTime > 6) return { rank: "Expert", color: "text-yellow-400" };
    if (avgResponseTime > 3) return { rank: "Master", color: "text-orange-400" };
    // Only Grandmaster if strictly less than 3 seconds
    if (avgResponseTime <= 3) return { rank: "Grandmaster", color: "text-purple-400" };
    
    // Fallback (should never reach here)
    return { rank: "Unknown", color: "text-gray-400" };
  };
  
  // Unit test function for rank calculation
  const testRankCalculation = () => {
    const testCases = [
      { time: 16.0, expectedRank: "Noob" },
      { time: 15.1, expectedRank: "Noob" },
      { time: 15.0, expectedRank: "Apprentice" },
      { time: 12.1, expectedRank: "Apprentice" },
      { time: 12.0, expectedRank: "Journeyman" },
      { time: 9.1, expectedRank: "Journeyman" },
      { time: 9.0, expectedRank: "Expert" },
      { time: 6.1, expectedRank: "Expert" },
      { time: 6.0, expectedRank: "Master" },
      { time: 3.1, expectedRank: "Master" },
      { time: 3.0, expectedRank: "Grandmaster" },
      { time: 2.9, expectedRank: "Grandmaster" },
    ];
    
    const results = testCases.map(test => {
      const actual = getPlayerRank(test.time).rank;
      const passed = actual === test.expectedRank;
      return {
        time: test.time,
        expected: test.expectedRank,
        actual,
        passed
      };
    });
    
    const allPassed = results.every(r => r.passed);
    console.log("Rank Calculation Test Results:", results);
    console.log("All tests passed:", allPassed);
    
    // Check specific case for 3.3s
    const specificCase = getPlayerRank(3.3).rank;
    console.log("Rank for 3.3s:", specificCase);
    
    return { allPassed, results };
  };
  
  // Run tests in development environment
  if (process.env.NODE_ENV === 'development') {
    // Run tests after component mounts
    useEffect(() => {
      console.log("Running rank calculation tests...");
      testRankCalculation();
    }, []);
  }
  
  // Calculate average response time for a table and determine max average for any fact
  const getAverageResponseTime = (tableNumber) => {
    const tableKey = `table_${tableNumber}`;
    const tableData = responseTimes[tableKey];
    
    if (!tableData) return null;
    
    // Check if the player has answered all multipliers (1-12) for this table
    const answeredMultipliers = Object.keys(tableData).map(key => parseInt(key.split('x')[1]));
    const hasAllMultipliers = Array.from({ length: 12 }, (_, i) => i + 1)
      .every(multiplier => answeredMultipliers.includes(multiplier));
    
    // If not all multipliers have been answered, don't assign a rank yet
    if (!hasAllMultipliers) return null;
    
    // Calculate average response time for each individual multiplication fact
    const factAverages = [];
    
    // For debugging, track individual averages
    const individualAverages = {};
    
    // Check each multiplication fact (1-12)
    for (let i = 1; i <= 12; i++) {
      const factKey = `${tableNumber}x${i}`;
      const times = tableData[factKey] || [];
      
      if (times.length > 0) {
        // Calculate average for this specific fact
        const factSum = times.reduce((acc, time) => acc + time, 0);
        const factAvg = Math.round((factSum / times.length) * 10) / 10;
        
        // Store for debugging
        individualAverages[factKey] = factAvg;
        
        // Add to our list of fact averages
        factAverages.push(factAvg);
      }
    }
    
    if (factAverages.length === 0) return null;
    
    // Log individual averages for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log(`Table ${tableNumber} individual fact averages:`, individualAverages);
    }
    
    // Return the MAXIMUM average response time among all facts
    // This ensures the player only gets a rank if ALL facts are at or below the threshold
    return Math.max(...factAverages);
  };

  // Get mastery percentage for each multiplication table
  const getMasteryData = () => {
    return planets.map((planet) => {
      const tableQuestions = Object.keys(correctAnswers).filter(
        (key) => parseInt(key.split("x")[0]) === planet.table
      );

      const totalCorrect = tableQuestions.reduce(
        (sum, key) => sum + correctAnswers[key],
        0
      );
      const totalWrong = tableQuestions.reduce(
        (sum, key) => sum + (wrongAnswers[key] || 0),
        0
      );
      const total = totalCorrect + totalWrong;

      const mastery = total > 0 ? Math.floor((totalCorrect / total) * 100) : 0;
      
      // Calculate average response time for this table
      const avgResponseTime = getAverageResponseTime(planet.table);
      
      // Calculate accuracy rate
      const accuracyRate = total > 0 ? Math.floor((totalCorrect / total) * 100) : 0;
      
      // Get player rank based on average response time
      const playerRank = avgResponseTime ? getPlayerRank(avgResponseTime) : null;

      return {
        ...planet,
        mastery,
        totalQuestions: total,
        avgResponseTime,
        accuracyRate,
        playerRank,
        totalCorrect,
        totalWrong
      };
    });
  };

  // Render main menu
  const renderMenu = () => (
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
          from 3 to 20. Answer correctly to earn points and unlock new planets!
          Master the advanced tables to become a true Space Mathematician! Watch
          out for special mini-games and collect spaceship parts along the way!
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

        <button
          onClick={createNewProfile}
          className="text-purple-400 underline text-sm hover:text-purple-300 transition-colors"
        >
          Create New Profile
        </button>
      </div>
    </div>
  );

  // Render game screen
  const renderGame = () => (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6 bg-gray-800 bg-opacity-70 rounded-lg p-3 shadow-lg">
        <div className="text-white">
          <div className="flex items-center">
            <div
              className={`w-6 h-6 ${
                planets.find((p) => p.id === currentPlanet).color
              } rounded-full mr-2`}
            ></div>
            <p className="font-bold">
              {planets.find((p) => p.id === currentPlanet).name}
            </p>
          </div>
          <p className="text-blue-300">
            Table: {planets.find((p) => p.id === currentPlanet).table}'s
          </p>
        </div>
        <div className="text-white">
          <p className="text-yellow-300 font-bold">Score: {score}</p>
          <p>Lives: {Array(lives).fill("❤️").join("")}</p>
          {speedBoost > 1 && (
            <p className="text-xs text-green-300">
              Speed Boost: x{speedBoost.toFixed(1)}
            </p>
          )}
        </div>
      </div>

      {!miniGameActive ? (
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <div className="mb-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl text-white font-bold">
                <span className="text-blue-400">Space</span> Problem:
              </h2>
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
                feedback.includes("Correct") || feedback.includes("success") || feedback.includes("SUCCESS")
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
                  : ""
              }}
            >
              {feedback}
            </div>
          )}
        </div>
      ) : (
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
                disabled={miniGameFeedback !== ""} // Disable buttons when showing feedback
                className={`${
                  miniGameFeedback !== "" 
                  ? "bg-gray-500 cursor-not-allowed opacity-70" 
                  : "bg-gray-700 hover:bg-gray-600 transform hover:scale-105"
                } text-white font-bold py-4 px-6 rounded-lg transition-all relative overflow-hidden`}
                style={{ boxShadow: "0 0 15px rgba(0, 0, 0, 0.3)" }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-600 opacity-20"></div>
                <span className="relative text-xl">{option}</span>
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
                whiteSpace: "pre-line", // Allow line breaks in feedback
                boxShadow: miniGameFeedback.includes("SUCCESS")
                  ? "0 0 15px rgba(16, 185, 129, 0.6)"
                  : ""
              }}
            >
              {miniGameFeedback}
            </div>
          )}
        </div>
      )}

      <div className="mt-6 flex justify-between">
        <button
          onClick={() => setGameState("menu")}
          className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-5 rounded-full shadow-lg flex items-center"
          style={{ boxShadow: "0 0 10px rgba(75, 85, 99, 0.5)" }}
        >
          <span className="mr-2">🏠</span>
          Return to Base
        </button>
        <button
          onClick={() => setGameState("metrics")}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-5 rounded-full shadow-lg flex items-center"
          style={{ boxShadow: "0 0 10px rgba(147, 51, 234, 0.5)" }}
        >
          <span className="mr-2">🌌</span>
          View Galactic Map
        </button>
      </div>
    </div>
  );

  // Render performance metrics view
  const renderPerformanceMetrics = () => {
    const masteryData = getMasteryData();
    const tablesWithData = masteryData.filter(p => p.totalQuestions > 0);
    
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">Performance Metrics</h1>
          <button
            onClick={() => setShowPerformanceView(false)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full shadow-lg"
          >
            Back to Galactic Map
          </button>
        </div>
        
        {/* Ranking System Explanation */}
        <div className="bg-gray-800 bg-opacity-90 rounded-lg p-4 mb-6">
          <h2 className="text-xl font-bold text-white mb-3">Ranking System</h2>
          <p className="text-white text-sm mb-3">
            Ranks are based on your <span className="text-yellow-400">slowest</span> average time across all multiplication facts in a table. 
            Every multiplication fact must meet the threshold time for a rank to be awarded.
          </p>
          <div className="grid grid-cols-3 gap-4 md:grid-cols-6">
            <div className="bg-gray-700 rounded-lg p-2 text-center">
              <div className="text-gray-400 font-bold">Noob</div>
              <div className="text-xs text-gray-300">&gt; 15s</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-2 text-center">
              <div className="text-green-400 font-bold">Apprentice</div>
              <div className="text-xs text-gray-300">12.1-15s</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-2 text-center">
              <div className="text-blue-400 font-bold">Journeyman</div>
              <div className="text-xs text-gray-300">9.1-12s</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-2 text-center">
              <div className="text-yellow-400 font-bold">Expert</div>
              <div className="text-xs text-gray-300">6.1-9s</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-2 text-center">
              <div className="text-orange-400 font-bold">Master</div>
              <div className="text-xs text-gray-300">3.1-6s</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-2 text-center">
              <div className="text-purple-400 font-bold">Grandmaster</div>
              <div className="text-xs text-gray-300">≤ 3s</div>
            </div>
          </div>
        </div>
        
        {/* Overview of all tables */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Table Rankings</h2>
          
          {tablesWithData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-white">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-left py-2">Table</th>
                    <th className="text-left py-2">Avg. Time</th>
                    <th className="text-left py-2">Rank</th>
                    <th className="text-left py-2">Accuracy</th>
                    <th className="text-right py-2">Attempts</th>
                  </tr>
                </thead>
                <tbody>
                  {tablesWithData.map(planet => {
                    // Count total attempts for this table
                    const totalAttempts = Object.keys(attemptCounts)
                      .filter(key => parseInt(key.split('x')[0]) === planet.table)
                      .reduce((sum, key) => sum + attemptCounts[key], 0);
                    
                    return (
                      <tr key={planet.id} className="border-b border-gray-700">
                        <td className="py-3">
                          <div className="flex items-center">
                            <div className={`w-4 h-4 ${planet.color} rounded-full mr-2`}></div>
                            <span>{planet.table}'s</span>
                          </div>
                        </td>
                        <td>
                          {planet.avgResponseTime 
                            ? `${planet.avgResponseTime.toFixed(1)}s` 
                            : "N/A"}
                        </td>
                        <td>
                          {planet.playerRank && (
                            <span className={planet.playerRank.color}>
                              {planet.playerRank.rank}
                            </span>
                          )}
                        </td>
                        <td>{planet.accuracyRate}%</td>
                        <td className="text-right">{totalAttempts}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-400">
              Complete missions to generate performance data.
            </p>
          )}
        </div>
        
        {/* Detailed metrics with visualization */}
        {tablesWithData.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Detailed Analysis</h2>
            
            {tablesWithData.map(planet => {
              // Get specific facts for this table
              const tableKey = `table_${planet.table}`;
              const tableData = responseTimes[tableKey] || {};
              const tableQuestions = Object.keys(tableData);
              
              if (tableQuestions.length === 0) return null;
              
              // Create "heatmap" data: sort by average response time
              const questionPerformance = tableQuestions.map(q => {
                const times = tableData[q];
                const avgTime = times.reduce((sum, t) => sum + t, 0) / times.length;
                const [multiplicand, multiplier] = q.split('x').map(Number);
                return {
                  question: q,
                  multiplicand,
                  multiplier,
                  avgTime,
                  attempts: attemptCounts[q] || 0
                };
              }).sort((a, b) => b.avgTime - a.avgTime); // Sort slowest first
              
              return (
                <div key={planet.id} className="mb-8">
                  <div className="flex items-center mb-3">
                    <div className={`w-6 h-6 ${planet.color} rounded-full mr-2`}></div>
                    <h3 className="text-xl font-bold text-white">
                      {planet.table}'s Table
                      {planet.playerRank && (
                        <span className={`ml-3 ${planet.playerRank.color}`}>
                          [{planet.playerRank.rank}]
                        </span>
                      )}
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Statistics */}
                    <div>
                      <div className="bg-gray-700 rounded-lg p-4 mb-4">
                        <h4 className="text-lg text-white mb-2">Statistics</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm text-gray-400">Average Time</div>
                            <div className="text-xl text-white">
                              {planet.avgResponseTime ? `${planet.avgResponseTime.toFixed(1)}s` : "N/A"}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-400">Accuracy</div>
                            <div className="text-xl text-white">{planet.accuracyRate}%</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-400">Correct Answers</div>
                            <div className="text-xl text-white">{planet.totalCorrect}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-400">Wrong Answers</div>
                            <div className="text-xl text-white">{planet.totalWrong}</div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Practice Recommendations */}
                      {questionPerformance.length > 0 && (
                        <div className="bg-gray-700 rounded-lg p-4">
                          <h4 className="text-lg text-white mb-2">Focus Practice On</h4>
                          <ul className="space-y-1">
                            {questionPerformance.slice(0, 3).map(q => (
                              <li key={q.question} className="text-white">
                                {q.multiplicand} × {q.multiplier} = {q.multiplicand * q.multiplier}
                                <span className="text-yellow-400 ml-2">
                                  ({q.avgTime.toFixed(1)}s avg)
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    
                    {/* Heatmap-like visualization */}
                    <div className="bg-gray-700 rounded-lg p-4">
                      <h4 className="text-lg text-white mb-2">Response Time Heatmap</h4>
                      <div className="grid grid-cols-3 gap-1">
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(multiplier => {
                          const question = `${planet.table}x${multiplier}`;
                          const performance = questionPerformance.find(q => q.question === question);
                          
                          // Determine color based on avg time
                          let bgColor = "bg-gray-600"; // Default/no data
                          
                          if (performance) {
                            if (performance.avgTime > 15) bgColor = "bg-red-700";
                            else if (performance.avgTime > 12) bgColor = "bg-red-500";
                            else if (performance.avgTime > 9) bgColor = "bg-yellow-500";
                            else if (performance.avgTime > 6) bgColor = "bg-yellow-300";
                            else if (performance.avgTime > 3) bgColor = "bg-green-500";
                            else bgColor = "bg-green-300";
                          }
                          
                          return (
                            <div 
                              key={multiplier} 
                              className={`${bgColor} rounded-md p-2 text-center`}
                              title={performance 
                                ? `Average: ${performance.avgTime.toFixed(1)}s (${performance.attempts} attempts)`
                                : "No data"}
                            >
                              <div className="text-xs text-white">{planet.table}×{multiplier}</div>
                              {performance && (
                                <div className="text-xs font-bold text-white">
                                  {performance.avgTime.toFixed(1)}s
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Render metrics/galactic map
  const renderMetrics = () => {
    // If showing performance view, render that instead
    if (showPerformanceView) {
      return renderPerformanceMetrics();
    }
    
    const masteryData = getMasteryData();

    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">Galactic Map</h1>
          <button
            onClick={() => setShowPerformanceView(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-full shadow-lg flex items-center"
          >
            <span className="mr-2">📊</span>
            Performance Metrics
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl text-white mb-4">Space Explorer Stats</h2>
            <div className="text-white space-y-2">
              <p>Total Score: {score}</p>
              <p>Spaceship Parts: {spaceshipParts}</p>
              <p>
                Planets Unlocked: {unlockedPlanets.length} / {planets.length}
              </p>
              {lastPlayed && (
                <p className="text-gray-400 text-sm mt-2">
                  Last played: {new Date(lastPlayed).toLocaleString()}
                </p>
              )}
              <p className="text-gray-500 text-xs mt-1">
                Profile ID: {profileId.substring(profileId.indexOf("_") + 1)}
              </p>

              <div className="mt-4 pt-4 border-t border-gray-700">
                <h3 className="text-lg text-blue-300 mb-2">
                  Progression System:
                </h3>
                <ul className="text-sm space-y-1 text-gray-300">
                  <li>• Master each planet before unlocking the next one</li>
                  <li>
                    • You need 85% accuracy and 10 fast answers to progress
                  </li>
                  <li>• <span className="text-yellow-400">Expert rank</span> or higher is required to unlock new planets</li>
                  <li>• You must answer all multipliers of a table to earn a rank</li>
                  <li>• Fast answers are based on your planet's difficulty:</li>
                  <li className="pl-4">- Easy: Answer within 10 seconds</li>
                  <li className="pl-4">- Medium: Answer within 8 seconds</li>
                  <li className="pl-4">- Hard: Answer within 6 seconds</li>
                  <li className="pl-4">- Expert: Answer within 5 seconds</li>
                  <li className="pl-4">- Master: Answer within 4 seconds</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl text-white mb-4">Achievements</h2>
            <div className="text-white">
              {badges.length > 0 ? (
                <ul className="list-disc list-inside">
                  {badges.map((badge, index) => (
                    <li key={index}>{badge}</li>
                  ))}
                </ul>
              ) : (
                <p>Complete missions to earn badges!</p>
              )}
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-4">
          Planetary Systems
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
          {planets.map((planet) => {
            const planetData = masteryData.find((p) => p.id === planet.id);
            const isUnlocked = unlockedPlanets.includes(planet.id);

            return (
              <div
                key={planet.id}
                className={`relative ${
                  planet.color
                } rounded-full aspect-square flex flex-col justify-center items-center p-2 text-center cursor-pointer transform transition-all hover:scale-105 planet-hover planet-shadow ${
                  isUnlocked ? "opacity-100" : "opacity-50"
                }`}
                onClick={() => isUnlocked && selectPlanet(planet.id)}
                style={{
                  animation: isUnlocked
                    ? `planet-rotate ${20 + planet.id * 10}s linear infinite`
                    : "none",
                  boxShadow: `0 0 ${planet.id * 2}px rgba(255, 255, 255, 0.5)`,
                }}
              >
                <div className="text-black font-bold">{planet.name}</div>
                <div className="text-xs text-black">{planet.table}'s Table</div>

                {planetData.totalQuestions > 0 && (
                  <>
                    {/* Mastery percentage */}
                    <div
                      className="absolute bottom-1 right-1 w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-xs"
                      style={{ boxShadow: "0 0 5px white" }}
                    >
                      <div
                        className={`${
                          planetData.mastery > 90
                            ? "text-purple-400"
                            : planetData.mastery > 80
                            ? "text-green-400"
                            : planetData.mastery > 50
                            ? "text-yellow-400"
                            : "text-red-400"
                        }`}
                      >
                        {planetData.mastery}%
                      </div>
                    </div>

                    {/* Player rank for this planet */}
                    {planetData.playerRank && (
                      <div
                        className="absolute top-1 left-1 text-xs bg-gray-900 px-2 py-1 rounded-full"
                        style={{ boxShadow: "0 0 5px white" }}
                      >
                        <span className={planetData.playerRank.color}>
                          {planetData.playerRank.rank}
                        </span>
                      </div>
                    )}

                    {/* Fast answers counter */}
                    <div
                      className="absolute top-1 right-1 text-xs bg-gray-900 text-white px-2 py-1 rounded-full"
                      style={{ boxShadow: "0 0 5px white" }}
                    >
                      ⚡ {fastAnswers[planet.id] || 0}/10
                    </div>
                  </>
                )}

                {!isUnlocked && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-50">
                    <span className="text-3xl">🔒</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <h2 className="text-2xl font-bold text-white mb-4">Mastery Progress</h2>
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          {masteryData
            .filter((p) => p.totalQuestions > 0)
            .map((planet) => (
              <div key={planet.id} className="mb-5">
                <div className="flex justify-between text-white mb-1">
                  <span className="flex items-center">
                    {planet.name} ({planet.table}'s)
                    {planet.playerRank && (
                      <span className={`ml-2 ${planet.playerRank.color} text-sm`}>
                        [{planet.playerRank.rank}]
                      </span>
                    )}
                  </span>
                  <div className="flex space-x-4">
                    <span
                      className={`${
                        planet.mastery > 90
                          ? "text-purple-400"
                          : planet.mastery > 80
                          ? "text-green-400"
                          : planet.mastery > 50
                          ? "text-yellow-400"
                          : "text-red-400"
                      }`}
                    >
                      Mastery: {planet.mastery}%
                    </span>
                    <span
                      className={`${
                        (fastAnswers[planet.id] || 0) >= 10
                          ? "text-green-400"
                          : "text-gray-400"
                      }`}
                    >
                      Fast: {fastAnswers[planet.id] || 0}/10
                    </span>
                  </div>
                </div>

                {/* Mastery progress bar */}
                <div className="w-full bg-gray-700 rounded-full h-4 mb-1">
                  <div
                    className={`h-4 rounded-full ${
                      planet.mastery > 90
                        ? "bg-purple-500" // Outstanding mastery (new level)
                        : planet.mastery > 80
                        ? "bg-green-500" // Strong mastery
                        : planet.mastery > 50
                        ? "bg-yellow-500" // Moderate mastery
                        : "bg-red-500" // Needs practice
                    }`}
                    style={{
                      width: `${planet.mastery}%`,
                      backgroundImage:
                        planet.mastery > 90
                          ? "linear-gradient(to right, #8b5cf6, #d946ef)"
                          : "none",
                    }}
                  ></div>
                </div>

                {/* Average response time indicator (if available) */}
                {planet.avgResponseTime && (
                  <div className="flex items-center text-white text-xs mt-1 mb-1">
                    <span className="text-gray-400 mr-2">Avg. Time:</span>
                    <span className={planet.playerRank ? planet.playerRank.color : "text-white"}>
                      {planet.avgResponseTime.toFixed(1)}s
                    </span>
                  </div>
                )}

                {/* Fast answers progress bar */}
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-blue-400"
                    style={{
                      width: `${Math.min(
                        100,
                        (fastAnswers[planet.id] || 0) * 10
                      )}%`,
                    }}
                  ></div>
                </div>

                {/* Unlock status */}
                {planet.mastery >= 85 && (fastAnswers[planet.id] || 0) >= 10 && 
                 planet.playerRank && ['Expert', 'Master', 'Grandmaster'].includes(planet.playerRank.rank) ? (
                  <div className="text-xs text-green-400 mt-1">
                    All requirements met for next planet!
                  </div>
                ) : planet.mastery >= 85 && (fastAnswers[planet.id] || 0) >= 10 ? (
                  <div className="text-xs text-yellow-400 mt-1">
                    Need Expert rank or higher to progress
                  </div>
                ) : planet.mastery >= 85 ? (
                  <div className="text-xs text-yellow-400 mt-1">
                    Need more fast answers to progress
                  </div>
                ) : (fastAnswers[planet.id] || 0) >= 10 ? (
                  <div className="text-xs text-yellow-400 mt-1">
                    Need higher accuracy to progress
                  </div>
                ) : null}
              </div>
            ))}

          {masteryData.filter((p) => p.totalQuestions > 0).length === 0 && (
            <p className="text-white">
              Complete missions to see your progress!
            </p>
          )}
        </div>

        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => setGameState("menu")}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-5 rounded-full shadow-lg flex items-center"
              style={{ boxShadow: "0 0 10px rgba(75, 85, 99, 0.5)" }}
            >
              <span className="mr-2">🏠</span>
              Return to Base
            </button>
            <button
              onClick={startGame}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-full shadow-lg flex items-center"
              style={{ boxShadow: "0 0 10px rgba(59, 130, 246, 0.5)" }}
            >
              <span className="mr-2">🚀</span>
              Start New Mission
            </button>
          </div>

          {/* Profile management */}
          <div className="flex justify-center space-x-6 pt-2">
            <button
              onClick={resetProgress}
              className="text-red-400 underline text-sm hover:text-red-300 transition-colors"
            >
              Reset Progress
            </button>
            <button
              onClick={createNewProfile}
              className="text-purple-400 underline text-sm hover:text-purple-300 transition-colors"
            >
              Create New Profile
            </button>
            
            {process.env.NODE_ENV === 'development' && (
              <>
                <button
                  onClick={() => {
                    const results = testRankCalculation();
                    alert(`Rank Calculation Tests: ${results.allPassed ? 'PASSED' : 'FAILED'}\n\n` + 
                          `Specific test for 3.3s: Rank = ${getPlayerRank(3.3).rank}\n\n` +
                          `See console for detailed results.`);
                  }}
                  className="text-blue-400 underline text-sm hover:text-blue-300 transition-colors ml-6"
                >
                  Run Tests
                </button>
                <button
                  onClick={() => {
                    // Create a diagnostic view of response times 
                    const tableNumber = 4; // For example, examine the 4's table
                    const tableKey = `table_${tableNumber}`;
                    const tableData = responseTimes[tableKey] || {};
                    
                    // Calculate average for each fact
                    const factAverages = {};
                    for (let i = 1; i <= 12; i++) {
                      const factKey = `${tableNumber}x${i}`;
                      const times = tableData[factKey] || [];
                      
                      if (times.length > 0) {
                        // Calculate the average
                        const factSum = times.reduce((acc, time) => acc + time, 0);
                        factAverages[factKey] = Math.round((factSum / times.length) * 10) / 10;
                      } else {
                        factAverages[factKey] = "No data";
                      }
                    }
                    
                    // Get the maximum average (worst performance)
                    const maxAvg = Math.max(...Object.values(factAverages)
                      .filter(val => typeof val === 'number'));
                    
                    // Get what the rank should be
                    const rank = getPlayerRank(maxAvg);
                    
                    // Create diagnostic message
                    let message = `DIAGNOSTIC: ${tableNumber}'s Table\n\n`;
                    message += `Maximum average time: ${maxAvg}s\n`;
                    message += `This gives a rank of: ${rank.rank}\n\n`;
                    message += "Individual fact averages:\n";
                    
                    // Add each fact's average
                    Object.keys(factAverages).sort().forEach(key => {
                      message += `${key}: ${factAverages[key]}\n`;
                    });
                    
                    // Show the diagnostic
                    alert(message);
                  }}
                  className="text-green-400 underline text-sm hover:text-green-300 transition-colors ml-6"
                >
                  Diagnostic
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 bg-[url('https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80')] bg-cover bg-center bg-blend-overlay py-8 px-4 relative overflow-hidden">
      {/* Stars background */}
      <div ref={starsRef} className="stars absolute inset-0"></div>

      <div className="container mx-auto relative z-10">
        {gameState === "menu" && renderMenu()}
        {gameState === "game" && renderGame()}
        {gameState === "metrics" && renderMetrics()}
      </div>
    </div>
  );
};

export default CosmicMultiplicationQuest;
