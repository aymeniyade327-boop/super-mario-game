import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameEngine } from './game/engine';
import { getLevels } from './game/levels';
import { DEFAULT_CONTROLS } from './game/constants';
import { PlayerControls, GameStatus } from './types';
import { HUD } from './components/HUD';
import { GameCanvas } from './components/GameCanvas';
import { TitleScreen } from './components/TitleScreen';
import { ControlsModal } from './components/ControlsModal';
import { PauseModal } from './components/PauseModal';
import { LevelClearModal } from './components/LevelClearModal';
import { GameOverModal } from './components/GameOverModal';
import { VirtualGamepad } from './components/VirtualGamepad';
import { sound } from './audio/soundEngine';

export default function App() {
  const [levels] = useState(getLevels);
  const [currentLevelIndex, setCurrentLevelIndex] = useState<number>(() => {
    const saved = localStorage.getItem('mario_current_level');
    return saved ? parseInt(saved, 10) || 0 : 0;
  });
  const [maxUnlockedLevelIndex, setMaxUnlockedLevelIndex] = useState<number>(() => {
    const saved = localStorage.getItem('mario_max_unlocked_level');
    return saved ? parseInt(saved, 10) || 0 : 0;
  });
  const [gameStatus, setGameStatus] = useState<GameStatus>('menu');

  useEffect(() => {
    localStorage.setItem('mario_current_level', currentLevelIndex.toString());
  }, [currentLevelIndex]);

  // Controls mappings (saved in state)
  const [marioControls, setMarioControls] = useState<PlayerControls>(() => {
    const saved = localStorage.getItem('mario_controls');
    return saved ? JSON.parse(saved) : DEFAULT_CONTROLS.mario;
  });

  const [luigiControls, setLuigiControls] = useState<PlayerControls>(() => {
    const saved = localStorage.getItem('luigi_controls');
    return saved ? JSON.parse(saved) : DEFAULT_CONTROLS.luigi;
  });

  // Audio & Display toggles
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [crtEnabled, setCrtEnabled] = useState(false);
  const [gamepadVisible, setGamepadVisible] = useState(false);

  // Modals
  const [showControlsModal, setShowControlsModal] = useState(false);
  const [stageBanner, setStageBanner] = useState<{ name: string; subtitle: string; theme: string } | null>(null);

  // Auto-hide stage transition banner after 2.2 seconds
  useEffect(() => {
    if (stageBanner) {
      const timer = setTimeout(() => setStageBanner(null), 2200);
      return () => clearTimeout(timer);
    }
  }, [stageBanner]);

  // Persistent team stats across stages
  const teamStatsRef = useRef({
    marioScore: 0,
    marioCoins: 0,
    marioLives: 3,
    luigiScore: 0,
    luigiCoins: 0,
    luigiLives: 3,
  });

  // Game Engine instance
  const [engine, setEngine] = useState<GameEngine | null>(null);
  const [, setRerenderTrigger] = useState(0);

  // Initialize or re-create game engine for a specific level
  const initLevel = useCallback(
    (levelIndex: number) => {
      const allLevels = getLevels();
      const targetLevel = allLevels[levelIndex] || allLevels[0];
      const stats = teamStatsRef.current;

      const newEngine = new GameEngine(
        targetLevel,
        marioControls,
        luigiControls,
        stats.marioScore,
        stats.marioCoins,
        stats.marioLives,
        stats.luigiScore,
        stats.luigiCoins,
        stats.luigiLives
      );

      newEngine.onLevelClear = () => {
        setGameStatus('levelClear');
        sound.stopMusic();

        // Unlock next world immediately upon clearing current stage
        const nextLevelIndex = Math.min(allLevels.length - 1, levelIndex + 1);
        setMaxUnlockedLevelIndex((prev) => {
          const updated = Math.max(prev, nextLevelIndex);
          localStorage.setItem('mario_max_unlocked_level', updated.toString());
          return updated;
        });

        // Save stats with replenished hearts for next world
        teamStatsRef.current = {
          marioScore: newEngine.mario.score,
          marioCoins: newEngine.mario.coins,
          marioLives: 3,
          luigiScore: newEngine.luigi.score,
          luigiCoins: newEngine.luigi.coins,
          luigiLives: 3,
        };
      };

      newEngine.onGameOver = () => {
        setGameStatus('gameOver');
        sound.stopMusic();
        teamStatsRef.current.marioLives = 3;
        teamStatsRef.current.luigiLives = 3;
      };

      newEngine.onStateChange = () => {
        setRerenderTrigger((t) => t + 1);
      };

      setEngine(newEngine);
      setCurrentLevelIndex(levelIndex);
      setStageBanner({
        name: targetLevel.name,
        subtitle: targetLevel.subtitle,
        theme: targetLevel.theme,
      });

      if (musicEnabled) {
        sound.startMusic(targetLevel.theme);
      }
    },
    [marioControls, luigiControls, musicEnabled]
  );

  // Start game from title screen
  const handleStartGame = () => {
    initLevel(currentLevelIndex);
    setGameStatus('playing');
  };

  // Replay current stage
  const handleReplay = () => {
    initLevel(currentLevelIndex);
    setGameStatus('playing');
  };

  // Proceed to next stage
  const handleNextLevel = () => {
    if (currentLevelIndex < levels.length - 1) {
      const nextIndex = currentLevelIndex + 1;
      initLevel(nextIndex);
      setGameStatus('playing');
    } else {
      setGameStatus('menu');
      sound.stopMusic();
    }
  };

  // Go to main menu
  const handleHome = () => {
    setGameStatus('menu');
    sound.stopMusic();
  };

  // Toggle pause
  const handlePause = () => {
    if (gameStatus === 'playing') {
      setGameStatus('paused');
    } else if (gameStatus === 'paused') {
      setGameStatus('playing');
    }
  };

  // Key listeners for gameplay
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent browser scrolling on Space / Arrow keys during gameplay
      if (
        gameStatus === 'playing' &&
        ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)
      ) {
        e.preventDefault();
      }

      // Escape key to toggle pause
      if (e.code === 'Escape' && (gameStatus === 'playing' || gameStatus === 'paused')) {
        handlePause();
        return;
      }

      if (gameStatus === 'playing' && engine) {
        engine.handleKeyDown(e.code);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (gameStatus === 'playing' && engine) {
        engine.handleKeyUp(e.code);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [engine, gameStatus]);

  // Periodic HUD state sync timer (e.g. 10 FPS for crisp UI text updates)
  useEffect(() => {
    if (gameStatus !== 'playing') return;
    const interval = setInterval(() => {
      setRerenderTrigger((t) => t + 1);
    }, 100);
    return () => clearInterval(interval);
  }, [gameStatus]);

  // Audio toggles
  const handleToggleSound = () => {
    const active = sound.toggleSound();
    setSoundEnabled(active);
  };

  const handleToggleMusic = () => {
    const active = sound.toggleMusic();
    setMusicEnabled(active);
  };

  const handleUpdateControls = (mario: PlayerControls, luigi: PlayerControls) => {
    setMarioControls(mario);
    setLuigiControls(luigi);
    localStorage.setItem('mario_controls', JSON.stringify(mario));
    localStorage.setItem('luigi_controls', JSON.stringify(luigi));
    if (engine) {
      engine.setControls(mario, luigi);
    }
  };

  // If in Title Menu, render TitleScreen
  if (gameStatus === 'menu' || !engine) {
    return (
      <div className={`w-screen h-screen overflow-y-auto bg-zinc-950 font-ui select-none ${crtEnabled ? 'crt-scanlines' : ''}`}>
        <TitleScreen
          levels={levels}
          selectedLevelIndex={currentLevelIndex}
          maxUnlockedLevelIndex={maxUnlockedLevelIndex}
          marioControls={marioControls}
          luigiControls={luigiControls}
          onSelectLevel={(idx) => setCurrentLevelIndex(idx)}
          onStartGame={handleStartGame}
          onOpenControls={() => setShowControlsModal(true)}
          soundEnabled={soundEnabled}
          musicEnabled={musicEnabled}
          crtEnabled={crtEnabled}
          gamepadVisible={gamepadVisible}
          onToggleSound={handleToggleSound}
          onToggleMusic={handleToggleMusic}
          onToggleCrt={() => setCrtEnabled((prev) => !prev)}
          onToggleGamepad={() => setGamepadVisible((prev) => !prev)}
        />

        <ControlsModal
          isOpen={showControlsModal}
          onClose={() => setShowControlsModal(false)}
          marioControls={marioControls}
          luigiControls={luigiControls}
          onUpdateControls={handleUpdateControls}
        />
      </div>
    );
  }

  return (
    <div className={`w-screen h-screen overflow-hidden flex flex-col bg-zinc-950 font-ui select-none relative ${crtEnabled ? 'crt-scanlines' : ''}`}>
      {/* Top HUD */}
      <HUD
        mario={engine.mario}
        luigi={engine.luigi}
        level={engine.level}
        timeLeft={engine.timeLeft}
        soundEnabled={soundEnabled}
        musicEnabled={musicEnabled}
        crtEnabled={crtEnabled}
        gamepadVisible={gamepadVisible}
        onToggleSound={handleToggleSound}
        onToggleMusic={handleToggleMusic}
        onToggleHelp={() => setShowControlsModal(true)}
        onToggleCrt={() => setCrtEnabled((prev) => !prev)}
        onToggleGamepad={() => setGamepadVisible((prev) => !prev)}
        onPause={handlePause}
        onRestart={handleReplay}
      />

      {/* Main Game Screen */}
      <div className="flex-1 min-h-0 relative flex items-center justify-center overflow-hidden p-1 sm:p-2 md:p-3">
        <GameCanvas engine={engine} isPaused={gameStatus !== 'playing'} />
        {/* Virtual on-screen Gamepad if enabled */}
        <VirtualGamepad engine={engine} isVisible={gamepadVisible && gameStatus === 'playing'} />

        {/* Stage Transition Title Card Overlay */}
        {stageBanner && gameStatus === 'playing' && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20 animate-in fade-in zoom-in duration-300">
            <div className="bg-black/90 border-2 border-amber-400 rounded-2xl px-6 py-4 text-center shadow-[0_0_30px_rgba(251,191,36,0.3)] backdrop-blur-md">
              <span className="text-[10px] sm:text-[11px] font-arcade text-amber-400 block mb-1">
                {stageBanner.theme === 'castle'
                  ? '🏰 FINAL BOSS WORLD'
                  : stageBanner.theme === 'underground'
                  ? '💎 WORLD 1-2'
                  : '🌲 WORLD 1-1'}
              </span>
              <h2 className="text-lg sm:text-2xl font-arcade text-white tracking-wider">
                {stageBanner.name}
              </h2>
              <p className="text-xs font-mono text-zinc-400 mt-1">{stageBanner.subtitle}</p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom 2-Player Co-op Cheat Sheet */}
      <div className="w-full bg-zinc-900/95 border-t border-zinc-800 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
            <span className="text-red-400 font-bold">Mario:</span>
            <span className="text-zinc-300">W (Jump) • A/D (Walk) • S (Crouch) • F (Action/Fire)</span>
          </div>
          <div className="hidden sm:block text-zinc-600">|</div>
          <div className="flex items-center gap-1.5 font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span className="text-emerald-400 font-bold">Luigi:</span>
            <span className="text-zinc-300">↑ (Jump) • ←/→ (Walk) • ↓ (Crouch) • Enter (Action/Fire)</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-amber-400 text-[11px] font-arcade hidden md:inline">
            ✨ Jump on brother's head to Buddy Boost!
          </span>
          <button
            onClick={() => setShowControlsModal(true)}
            className="text-zinc-400 hover:text-white underline text-[11px] font-mono"
          >
            Rebind Keys
          </button>
        </div>
      </div>

      {/* Modals */}
      <ControlsModal
        isOpen={showControlsModal}
        onClose={() => setShowControlsModal(false)}
        marioControls={marioControls}
        luigiControls={luigiControls}
        onUpdateControls={handleUpdateControls}
      />

      <PauseModal
        isOpen={gameStatus === 'paused'}
        level={engine.level}
        onResume={handlePause}
        onRestart={handleReplay}
        onHome={handleHome}
        onOpenControls={() => setShowControlsModal(true)}
      />

      <LevelClearModal
        isOpen={gameStatus === 'levelClear'}
        level={engine.level}
        mario={engine.mario}
        luigi={engine.luigi}
        hasNextLevel={currentLevelIndex < levels.length - 1}
        nextLevel={currentLevelIndex < levels.length - 1 ? levels[currentLevelIndex + 1] : undefined}
        onNextLevel={handleNextLevel}
        onReplay={handleReplay}
        onLevelSelect={handleHome}
      />

      <GameOverModal
        isOpen={gameStatus === 'gameOver'}
        level={engine.level}
        onRetry={handleReplay}
        onHome={handleHome}
      />
    </div>
  );
}
