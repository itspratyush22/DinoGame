import React, { useEffect, useRef, useState, useCallback } from "react";
import "./DinoGame.css";

function DinoGame() {
  const dinoRef = useRef(null);
  const cactusRef = useRef(null);
  const jumpAudioRef = useRef(null);
  const gameOverAudioRef = useRef(null);

  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem("highScore")) || 0);
  const [gameStarted, setGameStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [speed, setSpeed] = useState(4000);
  const [lastSpeedUpdate, setLastSpeedUpdate] = useState(0);
  const [jumpCount, setJumpCount] = useState(0);
  const [isNight, setIsNight] = useState(false);
  const clouds = [1, 2, 3];

  const jump = useCallback(() => {
    if (!dinoRef.current || jumpCount >= 2) return;

    if (!dinoRef.current.classList.contains("jump")) {
      dinoRef.current.classList.add("jump");
      setJumpCount((prev) => prev + 1);
      jumpAudioRef.current?.play();

      setTimeout(() => {
        dinoRef.current.classList.remove("jump");
        setJumpCount((prev) => (prev === 2 ? 0 : prev));
      }, 600);
    }
  }, [jumpCount]);

  const togglePause = () => setIsPaused((prev) => !prev);
  const toggleTheme = () => setIsNight((prev) => !prev);

  const restartGame = () => {
    setScore(0);
    setSpeed(4000);
    setLastSpeedUpdate(0);
    setIsPaused(false);
    setIsGameOver(false);
    setGameStarted(true);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space") {
        if (!gameStarted) restartGame();
        if (!isPaused) jump();
      } else if (e.code === "KeyP") {
        togglePause();
      }
    };

    const handleTouchStart = () => {
      if (!gameStarted) restartGame();
      if (!isPaused) jump();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("touchstart", handleTouchStart);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("touchstart", handleTouchStart);
    };
  }, [gameStarted, jump, isPaused]);

  useEffect(() => {
    if (!gameStarted || isPaused) return;

    const interval = setInterval(() => {
      const dino = dinoRef.current;
      const cactus = cactusRef.current;
      if (!dino || !cactus) return;

      const dinoBottom = parseInt(window.getComputedStyle(dino).getPropertyValue("bottom"));
      const cactusLeft = parseInt(window.getComputedStyle(cactus).getPropertyValue("left"));

      if (cactusLeft < 80 && cactusLeft > 0 && dinoBottom < 60) {
        gameOverAudioRef.current?.play();
        setHighScore((prevHigh) => {
          const updated = Math.max(prevHigh, score);
          localStorage.setItem("highScore", updated);
          return updated;
        });
        setGameStarted(false);
        setIsGameOver(true);
        return;
      }

      setScore((prev) => {
        const newScore = prev + 1;
        if (newScore - lastSpeedUpdate >= 400 && speed > 1200) {
          setSpeed((prevSpeed) => prevSpeed - 200);
          setLastSpeedUpdate(newScore);
        }
        return newScore;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [gameStarted, isPaused, speed, score, lastSpeedUpdate]);

  return (
    <div className={`game ${isNight ? "night-mode" : ""}`}>
      {!gameStarted && !isGameOver && (
        <div className="start-msg">Press Space or Tap to Start</div>
      )}

      {isGameOver && (
        <div className="game-over-screen">
          <h2>Game Over</h2>
          <p>Your Score: {score}</p>
          <button onClick={restartGame} className="restart-btn">Restart</button>
        </div>
      )}

      <div className="score">Score: {score} | High Score: {highScore}</div>

      <button onClick={togglePause} className="control-btn">
        {isPaused ? "Resume" : "Pause"}
      </button>

      <button onClick={toggleTheme} className="control-btn theme-btn">
        {isNight ? "☀️" : "🌙"}
      </button>

      <div id="dino" ref={dinoRef} style={{ backgroundImage: "url('/img/trex.png')" }}></div>

      <div
        id="cactus"
        ref={cactusRef}
        style={{
          backgroundImage: "url('/img/cactus.png')",
          animation: gameStarted ? `cactusMove ${speed}ms linear infinite` : "none",
          animationPlayState: isPaused ? "paused" : "running",
        }}
      ></div>

      {clouds.map((id) => (
        <div
          key={id}
          className="cloud"
          style={{
            backgroundImage: "url('/img/cloud.png')",
            animationDelay: `${id * 5}s`,
            top: `${30 + id * 30}px`,
          }}
        ></div>
      ))}

      <div
        className="ground"
        style={{
          animation: gameStarted && !isPaused
            ? `groundMove ${speed / 2}ms linear infinite`
            : "none",
        }}
      ></div>

      <audio ref={jumpAudioRef} src="/sfx/jump.mp3" />
      <audio ref={gameOverAudioRef} src="/sfx/gameover.mp3" />

      <div className={`footer ${isNight ? "night-footer" : ""}`}>
        Made by Pratyush 🌟
      </div>
    </div>
  );
}

export default DinoGame;
