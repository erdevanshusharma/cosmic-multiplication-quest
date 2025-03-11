import React, { useState, useEffect } from "react";
import "./App.css";
import { planets } from "./Constants";
import { saveToLocalStorage, loadFromLocalStorage } from "./utils/LocalStorageUtils";
import StarsBackground from "./components/StarsBackground";
import MainMenu from "./components/MainMenu";
import GameScreen from "./components/GameScreen";
import MetricsView from "./components/MetricsView";
import { generateQuestion, generateMiniGameQuestion, getDifficultyTimeLimit } from "./utils/QuestionGenerator";
import { getAverageResponseTime, getPlayerRank } from "./utils/MetricsUtils";

const CosmicMultiplicationQuest = () => {
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

  // Track previous multiplier to avoid consecutive repeats
  const [previousMultiplier, setPreviousMultiplier] = useState(null);

  // Generate a new multiplication question based on current planet
  const generateNewQuestion = () => {
    // Clear any feedback and set game to active mode
    setMiniGameActive(false);
    setMiniGameFeedback("");

    const planet = planets.find((p) => p.id === currentPlanet);
    
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
    setAttemptCounts((prev) => ({
      ...prev,
      [questionKey]: (prev[questionKey] || 0) + 1,
    }));

    // Track response time (only for correct answers)
    if (isCorrect) {
      // Store response time with the table number as the key prefix
      const tableKey = `table_${currentQuestion.multiplicand}`;
      setResponseTimes((prev) => ({
        ...prev,
        [tableKey]: {
          ...(prev[tableKey] || {}),
          [questionKey]: [
            ...(prev[tableKey]?.[questionKey] || []),
            secondsUsed,
          ],
        },
      }));
    }

    if (isCorrect) {
      // Calculate points based on table number
      const difficultyMultiplier = Math.min(Math.max(Math.floor(planet.table / 4), 1), 5);

      // Calculate base points
      const timeBonus = Math.max(1, Math.ceil(timeRemaining / 2));

      // Award significant bonus for very fast answers
      let speedMultiplier = 1;
      let speedBonusText = "";

      const fullTimeLimit = getDifficultyTimeLimit(planet.table);
      const secondsUsed = fullTimeLimit - timeRemaining;

      if (timeRemaining >= fullTimeLimit * 0.8) {
        // Super fast answer (80%+ of time remaining)
        speedMultiplier = 2.0;
        speedBonusText = `SUPER FAST! ⚡⚡ (${secondsUsed.toFixed(
          1
        )}s - 2× points)`;
      } else if (timeRemaining >= fullTimeLimit * 0.6) {
        // Fast answer (60%+ of time remaining)
        speedMultiplier = 1.5;
        speedBonusText = `FAST! ⚡ (${secondsUsed.toFixed(1)}s - 1.5× points)`;
      }

      // Calculate final points and round to integer
      const pointsEarned = Math.round(
        10 * difficultyMultiplier * timeBonus * speedBoost * speedMultiplier
      );

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
        (planet.table <= 5 && timeRemaining >= 10) ||
        (planet.table <= 9 && timeRemaining >= 8) ||
        (planet.table <= 12 && timeRemaining >= 6) ||
        (planet.table <= 16 && timeRemaining >= 5) ||
        (planet.table >= 17 && timeRemaining >= 4);

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
      const avgResponseTime = getAverageResponseTime(currentTable, responseTimes);
      const playerRank = avgResponseTime
        ? getPlayerRank(avgResponseTime)
        : null;

      // Get the minimum rank required to unlock the next planet (Expert or better)
      const hasRequiredRank =
        playerRank &&
        ["Expert", "Master", "Grandmaster"].includes(playerRank.rank);

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

      // Random chance to trigger mini-game
      if (Math.random() < 0.2) {
        // Show feedback first, then trigger mini-game after a delay
        setTimeout(() => {
          triggerMiniGame();
        }, 1500);
      } else {
        // Continue with next question
        setTimeout(() => {
          generateNewQuestion();
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
        generateNewQuestion();
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

    const result = generateMiniGameQuestion();
    setCurrentQuestion(result.question);
    setAnswerOptions(result.options);
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

    // Generate the next question for after the mini-game
    const planet = planets.find((p) => p.id === currentPlanet);
    const result = generateQuestion(
      planet,
      previousMultiplier,
      attemptCounts,
      responseTimes
    );

    // Store the next multiplier
    setPreviousMultiplier(result.newMultiplier);

    // Show feedback for a bit, then transition to the new question
    setTimeout(() => {
      // Perform a quick, clean transition
      setMiniGameActive(false);
      setMiniGameFeedback("");
      setCurrentQuestion(result.question);
      setAnswerOptions(result.options);
      setTimeRemaining(result.question.timeLimit);
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
      const selectedPlanet = planets.find((p) => p.id === planetId);

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
        generateNewQuestion();
      }, 2000);
    }

    return () => clearTimeout(timer);
  }, [timerRunning, timeRemaining, lives, currentQuestion]);

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
            createNewProfile={createNewProfile}
          />
        )}
        
        {gameState === "game" && (
          <GameScreen 
            planets={planets}
            currentPlanet={currentPlanet}
            score={score}
            lives={lives}
            speedBoost={speedBoost}
            miniGameActive={miniGameActive}
            miniGameType={miniGameType}
            currentQuestion={currentQuestion}
            timeRemaining={timeRemaining}
            answerOptions={answerOptions}
            feedback={feedback}
            miniGameFeedback={miniGameFeedback}
            submitAnswer={submitAnswer}
            completeMiniGame={completeMiniGame}
            setGameState={setGameState}
            responseTimes={responseTimes}
            attemptCounts={attemptCounts}
            correctAnswers={correctAnswers}
            wrongAnswers={wrongAnswers}
          />
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
          />
        )}
      </div>
    </div>
  );
};

export default CosmicMultiplicationQuest;