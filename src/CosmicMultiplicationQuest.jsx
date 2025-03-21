import React, { useState, useEffect } from "react";
import "./App.css";
import { planets } from "./Constants";
import {
  saveToLocalStorage,
  loadFromLocalStorage,
  saveLearningModeLevelCompletion,
  isLearningModeLevelCompleted,
  LEARNING_MODE_STORAGE_KEYS,
} from "./utils/LocalStorageUtils";
import StarsBackground from "./components/StarsBackground";
import MainMenu from "./components/MainMenu";
import GameScreen from "./components/GameScreen";
import MetricsView from "./components/MetricsView";
import LevelCompletionConfetti from "./components/LevelCompletionConfetti";
import {
  generateQuestion,
  getDifficultyTimeLimit,
  generateLearningModeQuestion,
} from "./utils/QuestionGenerator";
import {
  getAverageResponseTime,
  getPlayerRank,
  getLearningModeMasteryData,
} from "./utils/MetricsUtils";
import { getLearningLevels } from "./utils/LearningModeConfig";

const CosmicMultiplicationQuest = () => {
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
  const [currentQuestion, setCurrentQuestion] = useState(
    loadFromLocalStorage("cosmicQuest_currentQuestion", {})
  );
  const [answerOptions, setAnswerOptions] = useState(
    loadFromLocalStorage("cosmicQuest_answerOptions", [])
  );
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
  // Removed minigame state variables
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
  const [showPerformanceView, setShowPerformanceView] = useState(
    loadFromLocalStorage("cosmicQuest_showPerformanceView", false)
  ); // Toggle for performance view

  // Learning mode state
  const [isLearningMode, setIsLearningMode] = useState(false);
  const [currentLearningLevel, setCurrentLearningLevel] = useState(null);
  const [learningModeResponseTimes, setLearningModeResponseTimes] = useState(
    loadFromLocalStorage(LEARNING_MODE_STORAGE_KEYS.RESPONSE_TIMES, {})
  ); // Track learning mode response times
  const [showLevelCompletion, setShowLevelCompletion] = useState(false);
  const [completedLevel, setCompletedLevel] = useState(null);
  const [nextLevel, setNextLevel] = useState(null);
  const [levelCompletionRank, setLevelCompletionRank] = useState(null);
  const [questionStartTime, setQuestionStartTime] = useState(null); // Track when the question was shown

  // Save states to localStorage when they change and update URL
  useEffect(() => {
    saveToLocalStorage("cosmicQuest_gameState", gameState);

    // Always use the correct base URL for GitHub Pages
    const baseUrl = "/cosmic-multiplication-quest/";

    // Update URL based on game state
    let newPath = "";

    if (gameState === "menu") {
      newPath = baseUrl;
    } else if (gameState === "game") {
      newPath = `${baseUrl}play/${currentPlanet}`;
    } else if (gameState === "metrics") {
      // Different URLs for planet view and performance view
      if (showPerformanceView) {
        newPath = `${baseUrl}stats/performance`;
      } else {
        newPath = `${baseUrl}stats/planets`;
      }
    }

    // Use the final path directly - no combination needed
    const newUrl = newPath;

    // Update URL without full page reload
    window.history.pushState(
      { gameState, currentPlanet, showPerformanceView },
      "",
      newUrl
    );
  }, [gameState, currentPlanet, showPerformanceView]);

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

  useEffect(() => {
    saveToLocalStorage("cosmicQuest_showPerformanceView", showPerformanceView);
  }, [showPerformanceView]);
  
  useEffect(() => {
    saveToLocalStorage("cosmicQuest_currentQuestion", currentQuestion);
  }, [currentQuestion]);
  
  useEffect(() => {
    saveToLocalStorage("cosmicQuest_answerOptions", answerOptions);
  }, [answerOptions]);

  // Save learning mode response times when they change
  useEffect(() => {
    saveToLocalStorage(
      LEARNING_MODE_STORAGE_KEYS.RESPONSE_TIMES,
      learningModeResponseTimes
    );
  }, [learningModeResponseTimes]);

  // Update last played time whenever the game is started or resumed
  // And ensure we have a valid question when the game starts
  useEffect(() => {
    if (gameState === "game") {
      const now = new Date().toISOString();
      setLastPlayed(now);
      
      // Check if we need to generate a new question on game state change
      if (!currentQuestion.multiplicand || !currentQuestion.multiplier || 
          !currentQuestion.answer || answerOptions.length === 0) {
        const planet = planets.find(p => p.id === currentPlanet);
        if (planet) {
          generateNewQuestion();
        }
      }
    }
  }, [gameState, currentPlanet, currentQuestion, answerOptions, planets]);

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

  // Handle browser back/forward button
  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state) {
        // Restore the state from the popstate event
        setGameState(event.state.gameState || "menu");
        if (event.state.currentPlanet) {
          setCurrentPlanet(event.state.currentPlanet);
        }
        if (typeof event.state.showPerformanceView !== "undefined") {
          setShowPerformanceView(event.state.showPerformanceView);
          // Also update localStorage to keep it in sync
          saveToLocalStorage(
            "cosmicQuest_showPerformanceView",
            event.state.showPerformanceView
          );
        }
      } else {
        // Default to menu if no state is available
        setGameState("menu");
      }
    };

    // Add event listener for popstate
    window.addEventListener("popstate", handlePopState);

    // Initial URL processing
    const processInitialUrl = () => {
      const baseUrl = "/cosmic-multiplication-quest/";
      const path = window.location.pathname;

      // Handle paths directly
      if (path.includes(`${baseUrl}play/`)) {
        const planetIdMatch = path.match(/\/play\/(\d+)/);
        const planetId = planetIdMatch ? parseInt(planetIdMatch[1]) : 1;

        if (unlockedPlanets.includes(planetId)) {
          setCurrentPlanet(planetId);
          setGameState("game");
          
          // Check if we need to generate a new question
          const savedQuestion = loadFromLocalStorage("cosmicQuest_currentQuestion", {});
          const savedOptions = loadFromLocalStorage("cosmicQuest_answerOptions", []);
          
          // If the question is empty or doesn't have required properties, generate a new one
          if (!savedQuestion.multiplicand || !savedQuestion.multiplier || 
              !savedQuestion.answer || savedOptions.length === 0) {
            // We'll generate a new question in a subsequent useEffect
            // This just flags that we need a new question
            setTimeout(() => {
              const planet = planets.find(p => p.id === planetId);
              if (planet) {
                generateNewQuestion();
              }
            }, 100);
          }
        }
      } else if (path.includes(`${baseUrl}stats/performance`)) {
        // Explicitly set performance view based on URL - this takes precedence over localStorage
        // This is critical to ensure refresh works properly
        setGameState("metrics");
        setShowPerformanceView(true);
        // Also update localStorage
        saveToLocalStorage("cosmicQuest_showPerformanceView", true);
      } else if (
        path.includes(`${baseUrl}stats/planets`) ||
        path === `${baseUrl}stats` ||
        path.endsWith(`${baseUrl}stats/`)
      ) {
        // Explicitly set planet view based on URL
        setGameState("metrics");
        setShowPerformanceView(false);
        // Also update localStorage
        saveToLocalStorage("cosmicQuest_showPerformanceView", false);
      } else {
        setGameState("menu");
      }
    };

    // Process the initial URL when the component mounts
    processInitialUrl();

    // Clean up the event listener when component unmounts
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [unlockedPlanets]);

  // Track previous multiplier to avoid consecutive repeats
  const [previousMultiplier, setPreviousMultiplier] = useState(null);

  // Generate a new multiplication question based on current planet
  const generateNewQuestion = () => {
    // Clear any feedback and set game to active mode
    setFeedback(""); // Ensure feedback is cleared

    // Set the question start time for timing calculations
    setQuestionStartTime(Date.now());

    const planet = planets.find((p) => p.id === currentPlanet);
    
    // Safety check - ensure we have a valid planet
    if (!planet) {
      console.error("Cannot generate question: invalid planet ID", currentPlanet);
      return;
    }

    // Check if we're in learning mode
    if (isLearningMode && currentLearningLevel) {
      const result = generateLearningModeQuestion(
        { ...planet, isLearningMode: true },
        previousMultiplier,
        attemptCounts,
        responseTimes,
        currentLearningLevel.range
      );

      setPreviousMultiplier(result.newMultiplier);
      setCurrentQuestion(result.question);
      setAnswerOptions(result.options);
      setTimeRemaining(null); // No time limit in learning mode
      setFeedback(""); // Clear any existing feedback
      setTimerRunning(false); // No timer in learning mode
    } else {
      // Regular mode
      const result = generateQuestion(
        planet,
        previousMultiplier,
        attemptCounts,
        responseTimes
      );

      setPreviousMultiplier(result.newMultiplier);
      setCurrentQuestion(result.question);
      setAnswerOptions(result.options);
      setTimeRemaining(result.question.timeLimit);
      setFeedback(""); // Clear any existing feedback
      setTimerRunning(true);
    }
  };

  // Find the next learning level
  const findNextLearningLevel = (currentLevelId) => {
    const allLevels = getLearningLevels();
    const currentIndex = allLevels.findIndex(
      (level) => level.id === currentLevelId
    );

    // Return the next level or null if at the end
    return currentIndex < allLevels.length - 1
      ? allLevels[currentIndex + 1]
      : null;
  };

  // Change to a specific learning level
  const changeLearningLevel = (level) => {
    setCurrentLearningLevel(level);

    // Reset mini-game state
    setMiniGameActive(false);
    setMiniGameFeedback("");

    const planet = planets.find((p) => p.id === currentPlanet);

    // Generate first question for the new level
    const result = generateLearningModeQuestion(
      { ...planet, isLearningMode: true },
      null, // No previous multiplier
      attemptCounts,
      responseTimes,
      level.range
    );

    setPreviousMultiplier(result.newMultiplier);
    setCurrentQuestion(result.question);
    setAnswerOptions(result.options);
    setTimeRemaining(null); // No time limit in learning mode
    setFeedback(""); // Clear any existing feedback
    setTimerRunning(false); // No timer in learning mode

    // Set the question start time for timing calculations
    setQuestionStartTime(Date.now());
  };

  // Exit learning mode and return to normal game mode
  const exitLearningMode = () => {
    setIsLearningMode(false);
    setCurrentLearningLevel(null);

    // Reset mini-game state
    setMiniGameActive(false);
    setMiniGameFeedback("");

    const planet = planets.find((p) => p.id === currentPlanet);

    // Generate first question for normal mode
    const result = generateQuestion(
      planet,
      null, // No previous multiplier
      attemptCounts,
      responseTimes
    );

    setPreviousMultiplier(result.newMultiplier);
    setCurrentQuestion(result.question);
    setAnswerOptions(result.options);
    setTimeRemaining(result.question.timeLimit);
    setFeedback(""); // Clear any existing feedback
    setTimerRunning(true); // Start timer for normal mode
  };

  // Handle level completion and progression
  const handleLevelCompletion = () => {
    // If there's a next level, move to it
    if (nextLevel) {
      changeLearningLevel(nextLevel);
    } else {
      // If all levels are completed, exit to normal mode
      exitLearningMode();
    }

    // Hide the completion modal
    setShowLevelCompletion(false);
    setCompletedLevel(null);
    setNextLevel(null);
    setLevelCompletionRank(null);
  };

  // Start learning mode with selected level
  const startLearningMode = (planet, level) => {
    setIsLearningMode(true);
    setCurrentLearningLevel(level);

    // Reset mini-game state
    setMiniGameActive(false);
    setMiniGameFeedback("");

    // Generate first question
    const result = generateLearningModeQuestion(
      { ...planet, isLearningMode: true },
      null, // No previous multiplier
      attemptCounts,
      responseTimes,
      level.range
    );

    setPreviousMultiplier(result.newMultiplier);
    setCurrentQuestion(result.question);
    setAnswerOptions(result.options);
    setTimeRemaining(null); // No time limit in learning mode
    setFeedback(""); // Clear any existing feedback
    setTimerRunning(false); // No timer in learning mode

    // Set the question start time for timing calculations
    setQuestionStartTime(Date.now());
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

    // Calculate response time differently based on mode
    let secondsUsed;
    if (isLearningMode) {
      // In learning mode, calculate actual time spent on the question
      if (questionStartTime) {
        // Calculate seconds elapsed since the question was shown
        secondsUsed = (Date.now() - (questionStartTime + 700)) / 1000;
        // Round to 1 decimal place for better display
        secondsUsed = Math.round(secondsUsed * 10) / 10;
      } else {
        // Fallback if start time wasn't recorded for some reason
        secondsUsed = 3;
      }
    } else {
      // Regular mode - calculate from timer
      const fullTimeLimit = getDifficultyTimeLimit(isLearningMode);
      secondsUsed = fullTimeLimit - timeRemaining;
    }

    // Ensuring secondsUsed isn't counted more than 15 seconds in case someone got busy with something
    secondsUsed = Math.min(secondsUsed, 15);

    // Update attempt counts for this question
    setAttemptCounts((prev) => ({
      ...prev,
      [questionKey]: (prev[questionKey] || 0) + 1,
    }));

    // Track response time (only for correct answers) - different for each mode
    if (isCorrect) {
      if (isLearningMode && currentLearningLevel) {
        // Learning mode - store in learning mode response times only
        const planetKey = `planet_${currentPlanet}`;
        const levelKey = `level_${currentLearningLevel.id}`;

        // Update learning mode response times
        setLearningModeResponseTimes((prev) => {
          // Create nested structure if it doesn't exist
          let updatedData = { ...prev };

          if (!updatedData[planetKey]) {
            updatedData[planetKey] = {};
          }

          if (!updatedData[planetKey][levelKey]) {
            updatedData[planetKey][levelKey] = {};
          }

          if (!updatedData[planetKey][levelKey][questionKey]) {
            updatedData[planetKey][levelKey][questionKey] = [];
          }

          // Add the new response time
          updatedData[planetKey][levelKey][questionKey] = [
            ...updatedData[planetKey][levelKey][questionKey],
            secondsUsed,
          ];

          return updatedData;
        });

        // Check if level is completed
        const levelData = getLearningModeMasteryData(
          planet,
          currentLearningLevel.id,
          correctAnswers,
          wrongAnswers,
          learningModeResponseTimes
        );

        // Auto-save completion status - consider complete if rank is Hacker or better
        if (
          levelData.playerRank &&
          ["Hacker", "God"].includes(levelData.playerRank.rank)
        ) {
          saveLearningModeLevelCompletion(
            currentPlanet,
            currentLearningLevel.id,
            {
              completed: true,
              playerRank: levelData.playerRank,
            }
          );
        }
      } else {
        // Regular mode - store in standard response times
        const tableKey = `table_${currentQuestion.multiplicand}`;
        setResponseTimes((prev) => {
          // Return the new state object
          return {
            ...prev,
            [tableKey]: {
              ...(prev[tableKey] || {}),
              [questionKey]: [
                ...(prev[tableKey]?.[questionKey] || []),
                secondsUsed,
              ],
            },
          };
        });
      }

      // Important: We always track correct answers for both modes
      // This ensures the global stats are maintained
      setCorrectAnswers((prev) => ({
        ...prev,
        [questionKey]: (prev[questionKey] || 0) + 1,
      }));
    } else {
      // For incorrect answers
      setWrongAnswers((prev) => ({
        ...prev,
        [questionKey]: (prev[questionKey] || 0) + 1,
      }));
    }

    if (isCorrect) {
      // Different point calculation based on mode
      let pointsEarned = 0;
      let feedbackText = "";

      if (isLearningMode) {
        // Learning mode - simpler point system without time pressure
        pointsEarned = 10; // Fixed points for learning mode
        feedbackText = `Correct! +${pointsEarned} points`;

        // If this is an actual timed response, add info about the time
        if (secondsUsed) {
          feedbackText = `${feedbackText}\nTime: ${secondsUsed.toFixed(1)}s`;
        }
      } else {
        // Regular mode - full point system
        // Calculate points based on table number
        const difficultyMultiplier = Math.min(
          Math.max(Math.floor(planet.table / 4), 1),
          5
        );

        // Calculate base points
        const timeBonus = Math.max(1, Math.ceil(timeRemaining / 2));

        // Award significant bonus for very fast answers
        let speedMultiplier = 1;
        let speedBonusText = "";

        const fullTimeLimit = getDifficultyTimeLimit();
        const secondsUsed = fullTimeLimit - timeRemaining;

        if (timeRemaining >= fullTimeLimit * 0.8) {
          // Super fast answer (80%+ of time remaining)
          speedMultiplier = 2.0;
          speedBonusText = `SUPER FAST! ⚡⚡ (${secondsUsed.toFixed(
            2
          )}s - 2× points)`;
        } else if (timeRemaining >= fullTimeLimit * 0.6) {
          // Fast answer (60%+ of time remaining)
          speedMultiplier = 1.5;
          speedBonusText = `FAST! ⚡ (${secondsUsed.toFixed(
            2
          )}s - 1.5× points)`;
        }

        // Calculate final points and round to integer
        pointsEarned = Math.round(
          10 * difficultyMultiplier * timeBonus * speedBoost * speedMultiplier
        );

        // Build feedback message with speed bonus if applicable
        feedbackText = `Correct! +${pointsEarned} points`;
        if (speedBonusText) {
          feedbackText = `${feedbackText}\n${speedBonusText}`;
        }
      }

      setScore((prev) => prev + pointsEarned);
      setFeedback(feedbackText);

      // Track fast answers for the current planet (answers where time remaining is high)
      // With 15 second timer for all questions, consider answers with 10+ seconds remaining as fast
      const isFastAnswer = timeRemaining >= 5;

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
      const currentTable = planets.find((p) => p.id === currentPlanet).table;
      const avgResponseTime = getAverageResponseTime(
        currentTable,
        responseTimes
      );
      const playerRank = avgResponseTime
        ? getPlayerRank(avgResponseTime)
        : null;

      // Get the minimum rank required to unlock the next planet (Hacker or better)
      const hasRequiredRank =
        playerRank && ["Hacker", "God"].includes(playerRank.rank);

      // Check for planet unlock conditions
      if (
        currentMastery >= 85 &&
        fastAnswersCount >= 10 &&
        hasRequiredRank &&
        !isLearningMode
      ) {
        // Find the next planet ID
        const currentPlanetIndex = planets.findIndex(
          (p) => p.id === currentPlanet
        );
        const nextPlanetId =
          currentPlanetIndex < planets.length - 1
            ? planets[currentPlanetIndex + 1].id
            : null;

        // Unlock the next planet if there is one and it's not already unlocked
        if (nextPlanetId && !unlockedPlanets.includes(nextPlanetId)) {
          setUnlockedPlanets((prev) => [...prev, nextPlanetId]);

          setBadges((prev) => [
            ...prev,
            `Unlocked ${planets[currentPlanet].name}`,
          ]);

          // Show special unlock notification
          const nextPlanet = planets.find((p) => p.id === currentPlanet + 1);
          const unlockMessage = `🎉 ACHIEVEMENT UNLOCKED! 🎉\n\nYou've mastered ${
            planets[currentPlanet - 1].name
          }'s table!\n\n${nextPlanet.name} (${
            nextPlanet.table
          }'s table) is now available!`;

          // Show a modal-style alert for planet unlock (after a short delay)
          setTimeout(() => {
            alert(unlockMessage);
          }, 500);

          // Also set feedback with unlock message
          setFeedback((prev) => `${prev}\n🎉 New planet unlocked! 🎉`);
        }
      }

      // Continue with next question
      setTimeout(() => {
        generateNewQuestion();
      }, 1500);

      // If in learning mode, check if level is completed after correct answer
      if (isLearningMode && currentLearningLevel) {
        const levelData = getLearningModeMasteryData(
          planet,
          currentLearningLevel.id,
          correctAnswers,
          wrongAnswers,
          learningModeResponseTimes
        );

        // Modified condition to trigger level completion
        // Now based on completion percentage and minimum times answered
        // instead of requiring specific ranks to make it more accessible
        const completionThreshold = 0.95; // 95% completion needed (more forgiving)
        const minAnswersPerQuestion = 5; // Each question needs to be answered 5 times
        
        const totalQuestionsInRange = 
          currentLearningLevel.range[1] - currentLearningLevel.range[0] + 1;
        const questionKeys = Object.keys(
          learningModeResponseTimes[`planet_${currentPlanet}`]?.[`level_${currentLearningLevel.id}`] || {}
        );
        
        // Calculate total answers for this level
        let totalAnswers = 0;
        questionKeys.forEach(key => {
          const times = learningModeResponseTimes[`planet_${currentPlanet}`]?.[`level_${currentLearningLevel.id}`]?.[key] || [];
          totalAnswers += times.length;
        });
        
        // Check completion percentage
        const completionPercentage = 
          totalQuestionsInRange > 0 ? 
          questionKeys.length / totalQuestionsInRange : 0;
        
        // Check if minimum answers requirement is met
        const hasMinAnswers = 
          totalAnswers >= (totalQuestionsInRange * minAnswersPerQuestion * completionThreshold);
        
        // Check if this level hasn't been completed yet
        const notCompletedYet = !isLearningModeLevelCompleted(currentPlanet, currentLearningLevel.id);
        
        // Determine if level should be marked as completed
        if (
          completionPercentage >= completionThreshold && 
          hasMinAnswers && 
          notCompletedYet
        ) {
          // Save completion status
          saveLearningModeLevelCompletion(
            currentPlanet,
            currentLearningLevel.id,
            {
              completed: true,
              playerRank: levelData.playerRank,
            }
          );

          // Find the next level for progression
          const nextLevelData = findNextLearningLevel(currentLearningLevel.id);

          // Set up the completion celebration
          setCompletedLevel(currentLearningLevel);
          setNextLevel(nextLevelData);
          setLevelCompletionRank(levelData.playerRank);

          // Show the completion celebration after a short delay
          setTimeout(() => {
            setShowLevelCompletion(true);
          }, 1000);
        }
      }

      // Increase speed boost for consecutive correct answers
      setSpeedBoost((prev) => Math.min(prev + 0.1, 2.0));

      // Award spaceship part at certain score thresholds
      if (score > 0 && score % 100 < 10) {
        setSpaceshipParts((prev) => prev + 1);
        setBadges((prev) => [...prev, "New Spaceship Part!"]);
      }
    } else {
      // Not decreasing lives anymore
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

      // Continue with next question after delay
      setTimeout(() => {
        generateNewQuestion();
      }, 2000);
    }
  };

  // Trigger a mini-game
  // Minigame functions removed

  // Handle planet selection
  const selectPlanet = (planetId) => {
    if (unlockedPlanets.includes(planetId)) {
      // First update the current planet
      setCurrentPlanet(planetId);

      // Then start the game with the new planet's table
      const selectedPlanet = planets.find((p) => p.id === planetId);

      // Reset any previous state
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

    // Exit learning mode when starting a new planet game
    setIsLearningMode(false);
    setCurrentLearningLevel(null);

    // Generate a question for this specific planet
    const result = generateQuestion(
      planet,
      previousMultiplier,
      attemptCounts,
      responseTimes
    );

    setPreviousMultiplier(result.newMultiplier);
    setCurrentQuestion(result.question);
    setAnswerOptions(result.options);
    setTimeRemaining(result.question.timeLimit);
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
      setIsLearningMode(false);
      setCurrentLearningLevel(null);
      setLearningModeResponseTimes({});

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
        "cosmicQuest_currentQuestion",
        "cosmicQuest_answerOptions",
        // Learning mode keys
        LEARNING_MODE_STORAGE_KEYS.PROGRESS,
        LEARNING_MODE_STORAGE_KEYS.LEVEL_COMPLETION,
        LEARNING_MODE_STORAGE_KEYS.RESPONSE_TIMES,
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

  // Timer effect
  useEffect(() => {
    // Skip timer in learning mode
    if (isLearningMode) {
      return;
    }

    let timer;
    if (timerRunning && timeRemaining > 0) {
      timer = setTimeout(() => {
        setTimeRemaining((time) => time - 1);
      }, 1000);
    } else if (timerRunning && timeRemaining === 0) {
      // Time's up
      setTimerRunning(false);
      setFeedback(`Time's up! The answer was ${currentQuestion.answer}.`);
      setSpeedBoost(1); // Reset speed boost

      // Continue with next question after delay
      setTimeout(() => {
        generateNewQuestion();
      }, 2000);
    }

    return () => clearTimeout(timer);
  }, [timerRunning, timeRemaining, lives, currentQuestion, isLearningMode]);

  // Function to reset stats for a specific planet
  const resetPlanetStats = (planetId) => {
    if (
      !window.confirm(
        `Reset stats for ${
          planets.find((p) => p.id === planetId).name
        }? This cannot be undone.`
      )
    ) {
      return;
    }

    // Get the planet's table number
    const planetTable = planets.find((p) => p.id === planetId).table;

    // Reset normal mode stats
    setCorrectAnswers((prevCorrect) => {
      const newCorrect = { ...prevCorrect };
      // Remove all entries for this table (e.g., "2x1", "2x2", etc.)
      Object.keys(newCorrect).forEach((key) => {
        if (
          key.startsWith(`${planetTable}x`) ||
          key.startsWith(`${planetTable}×`)
        ) {
          delete newCorrect[key];
        }
      });
      return newCorrect;
    });

    setWrongAnswers((prevWrong) => {
      const newWrong = { ...prevWrong };
      // Remove all entries for this table
      Object.keys(newWrong).forEach((key) => {
        if (
          key.startsWith(`${planetTable}x`) ||
          key.startsWith(`${planetTable}×`)
        ) {
          delete newWrong[key];
        }
      });
      return newWrong;
    });

    setResponseTimes((prevTimes) => {
      const newTimes = { ...prevTimes };
      // Remove all entries for this table
      if (newTimes[`table_${planetTable}`]) {
        delete newTimes[`table_${planetTable}`];
      }
      return newTimes;
    });

    setAttemptCounts((prevCounts) => {
      const newCounts = { ...prevCounts };
      // Remove all entries for this table
      Object.keys(newCounts).forEach((key) => {
        if (
          key.startsWith(`${planetTable}x`) ||
          key.startsWith(`${planetTable}×`)
        ) {
          delete newCounts[key];
        }
      });
      return newCounts;
    });

    // Reset learning mode stats
    setLearningModeResponseTimes((prevTimes) => {
      const newTimes = { ...prevTimes };
      // Remove planet entries from learning mode response times
      if (newTimes[`planet_${planetId}`]) {
        delete newTimes[`planet_${planetId}`];
      }
      return newTimes;
    });

    // Reset planet mastery for this planet
    setPlanetMastery((prevMastery) => {
      const newMastery = { ...prevMastery };
      if (newMastery[planetId]) {
        delete newMastery[planetId];
      }
      return newMastery;
    });

    // Reset fast answers for this planet
    setFastAnswers((prevFastAnswers) => {
      const newFastAnswers = { ...prevFastAnswers };
      if (newFastAnswers[planetId]) {
        delete newFastAnswers[planetId];
      }
      return newFastAnswers;
    });

    // Clear learning mode level completion data for this planet
    const learningModeLevelCompletion = loadFromLocalStorage(
      LEARNING_MODE_STORAGE_KEYS.LEVEL_COMPLETION,
      {}
    );
    const planetKey = `planet_${planetId}`;
    if (learningModeLevelCompletion[planetKey]) {
      delete learningModeLevelCompletion[planetKey];
      saveToLocalStorage(
        LEARNING_MODE_STORAGE_KEYS.LEVEL_COMPLETION,
        learningModeLevelCompletion
      );
    }

    // Clear learning mode progress for this planet
    const learningModeProgress = loadFromLocalStorage(
      LEARNING_MODE_STORAGE_KEYS.PROGRESS,
      {}
    );
    if (learningModeProgress[planetId]) {
      delete learningModeProgress[planetId];
      saveToLocalStorage(
        LEARNING_MODE_STORAGE_KEYS.PROGRESS,
        learningModeProgress
      );
    }
    
    // If the current question is for this planet, reset it
    if (currentPlanet === planetId && gameState === "game") {
      // Clear current question and generate a new one
      setCurrentQuestion({});
      setAnswerOptions([]);
      saveToLocalStorage("cosmicQuest_currentQuestion", {});
      saveToLocalStorage("cosmicQuest_answerOptions", []);
      
      // Generate a new question after a brief delay
      setTimeout(() => {
        generateNewQuestion();
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 bg-[url('https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80')] bg-cover bg-center bg-blend-overlay py-8 px-4 relative overflow-hidden">
      <StarsBackground />

      <div className="container mx-auto relative z-10">
        {gameState === "menu" && (
          <MainMenu
            startGame={startGame}
            setGameState={setGameState}
            score={score}
            unlockedPlanets={unlockedPlanets}
            correctAnswers={correctAnswers}
            resetProgress={resetProgress}
          />
        )}

        {gameState === "game" && (
          <>
            <GameScreen
              planets={planets}
              currentPlanet={currentPlanet}
              score={score}
              lives={lives}
              speedBoost={speedBoost}
              currentQuestion={currentQuestion}
              timeRemaining={timeRemaining}
              answerOptions={answerOptions}
              feedback={feedback}
              submitAnswer={submitAnswer}
              setGameState={setGameState}
              responseTimes={responseTimes}
              attemptCounts={attemptCounts}
              correctAnswers={correctAnswers}
              wrongAnswers={wrongAnswers}
              startLearningMode={startLearningMode}
              isLearningMode={isLearningMode}
              currentLearningLevel={currentLearningLevel}
              learningModeResponseTimes={learningModeResponseTimes}
              changeLearningLevel={changeLearningLevel}
              exitLearningMode={exitLearningMode}
            />

            {/* Level completion celebration */}
            <LevelCompletionConfetti
              show={showLevelCompletion}
              level={completedLevel}
              rank={levelCompletionRank}
              nextLevel={nextLevel}
              onComplete={handleLevelCompletion}
            />
          </>
        )}

        {gameState === "metrics" && (
          <MetricsView
            planets={planets}
            unlockedPlanets={unlockedPlanets}
            correctAnswers={correctAnswers}
            wrongAnswers={wrongAnswers}
            responseTimes={responseTimes}
            setGameState={setGameState}
            selectPlanet={selectPlanet}
            showPerformanceView={showPerformanceView}
            setShowPerformanceView={setShowPerformanceView}
            attemptCounts={attemptCounts}
            resetPlanetStats={resetPlanetStats}
          />
        )}
      </div>
    </div>
  );
};

export default CosmicMultiplicationQuest;
