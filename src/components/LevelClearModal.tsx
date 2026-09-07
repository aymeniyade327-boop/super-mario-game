import React, { useEffect, useState, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, ArrowRight, RotateCcw, Award, Crown, Sparkles } from 'lucide-react';
import { LevelData, Player } from '../types';

interface LevelClearModalProps {
  isOpen: boolean;
  level: LevelData;
  mario: Player;
  luigi: Player;
  hasNextLevel: boolean;
  nextLevel?: LevelData;
  onNextLevel: () => void;
  onReplay: () => void;
  onLevelSelect: () => void;
}

export const LevelClearModal: React.FC<LevelClearModalProps> = ({
  isOpen,
  level,
  mario,
  luigi,
  hasNextLevel,
  nextLevel,
  onNextLevel,
  onReplay,
  onLevelSelect,
}) => {
  const [countdown, setCountdown] = useState(4);
  const advancedRef = useRef(false);

  // Trigger celebration confetti and reset advance state
  useEffect(() => {
    if (isOpen) {
      setCountdown(4);
      advancedRef.current = false;
      confetti({
        particleCount: 110,
        spread: 80,
        origin: { y: 0.6 },
      });
      const timeoutId = setTimeout(() => {
        confetti({
          particleCount: 65,
          angle: 60,
          spread: 60,
          origin: { x: 0.1, y: 0.7 },
        });
        confetti({
          particleCount: 65,
          angle: 120,
          spread: 60,
          origin: { x: 0.9, y: 0.7 },
        });
      }, 250);
      return () => clearTimeout(timeoutId);
    }
  }, [isOpen]);

  const handleAdvance = useCallback(() => {
    if (advancedRef.current) return;
    advancedRef.current = true;
    if (hasNextLevel) {
      onNextLevel();
    } else {
      onLevelSelect();
    }
  }, [hasNextLevel, onNextLevel, onLevelSelect]);

  // Auto-advance countdown timer
  useEffect(() => {
    if (!isOpen) return;

    if (countdown <= 0) {
      handleAdvance();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isOpen, countdown, handleAdvance]);

  // Keyboard navigation: Space / Enter / W / D / ArrowUp / ArrowRight to advance!
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        ['Enter', 'Space', 'KeyW', 'KeyD', 'ArrowRight', 'ArrowUp', 'KeyF'].includes(e.code)
      ) {
        e.preventDefault();
        handleAdvance();
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        onReplay();
      } else if (e.code === 'Escape') {
        e.preventDefault();
        onLevelSelect();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleAdvance, onReplay, onLevelSelect]);

  if (!isOpen) return null;

  const collectedStarCoins = level.items.filter(
    (i) => i.type === 'starCoin' && i.isCollected
  ).length;

  const teamScore = mario.score + luigi.score;

  // Grade calculation
  const grade = collectedStarCoins === 3 ? 'S' : collectedStarCoins === 2 ? 'A' : 'B';
  const gradeTitle = !hasNextLevel
    ? 'CAMPAIGN CONQUERED!'
    : collectedStarCoins === 3
    ? 'LEGENDARY DUO!'
    : collectedStarCoins === 2
    ? 'GREAT TEAMWORK!'
    : 'STAGE CLEARED!';

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none">
      <div className="bg-zinc-950 border-4 border-amber-500 rounded-2xl max-w-md w-full p-5 sm:p-6 text-center text-white shadow-2xl animate-in fade-in zoom-in duration-300">
        
        {/* Trophy & Rank Badge */}
        <div className="relative w-16 h-16 mx-auto mb-2">
          <div className="w-16 h-16 bg-gradient-to-tr from-amber-600 to-amber-400 text-zinc-950 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30">
            {!hasNextLevel ? <Crown size={36} className="text-zinc-950" /> : <Trophy size={34} />}
          </div>
          <span className="absolute -bottom-2 -right-2 bg-red-600 text-white font-arcade text-[10px] w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow">
            {grade}
          </span>
        </div>

        <h2 className="font-arcade text-base sm:text-lg text-amber-400 mb-0.5 tracking-wider">
          {gradeTitle}
        </h2>
        <p className="text-xs font-mono text-zinc-400 mb-3">{level.name} - {level.subtitle}</p>

        {/* Co-op Star Coins Earned */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3 mb-3">
          <span className="text-[10px] uppercase text-zinc-400 font-arcade block mb-1">Co-op Star Coins</span>
          <div className="flex justify-center items-center gap-3 my-1">
            {[0, 1, 2].map((idx) => {
              const isGot = idx < collectedStarCoins;
              return (
                <div
                  key={idx}
                  className={`w-11 h-11 rounded-full border-2 flex items-center justify-center text-lg transition-all ${
                    isGot
                      ? 'border-amber-400 bg-amber-500/25 text-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.6)] scale-105'
                      : 'border-zinc-800 bg-zinc-950 text-zinc-700'
                  }`}
                >
                  ★
                </div>
              );
            })}
          </div>
          <span className="text-[11px] text-amber-300 font-bold">
            {collectedStarCoins} of 3 Found
          </span>
        </div>

        {/* Scores Breakdown */}
        <div className="grid grid-cols-2 gap-2.5 mb-3">
          <div className="bg-red-950/40 border border-red-600/50 rounded-xl p-2.5">
            <span className="font-arcade text-[9px] text-red-400 block mb-0.5 font-bold">MARIO</span>
            <span className="font-mono text-sm text-white font-bold block">{mario.score.toLocaleString()}</span>
            <span className="text-[11px] text-amber-400 block mt-0.5">🪙 {mario.coins} Coins</span>
          </div>

          <div className="bg-emerald-950/40 border border-emerald-600/50 rounded-xl p-2.5">
            <span className="font-arcade text-[9px] text-emerald-400 block mb-0.5 font-bold">LUIGI</span>
            <span className="font-mono text-sm text-white font-bold block">{luigi.score.toLocaleString()}</span>
            <span className="text-[11px] text-amber-400 block mt-0.5">🪙 {luigi.coins} Coins</span>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-2 mb-3 text-xs text-zinc-300 flex justify-between px-3">
          <span className="text-zinc-400 font-mono">Combined Team Score:</span>
          <span className="text-amber-400 font-arcade text-xs">{teamScore.toLocaleString()}</span>
        </div>

        {/* Next Stage Preview Box */}
        {hasNextLevel && nextLevel ? (
          <div className="bg-gradient-to-r from-amber-950/40 via-zinc-900/60 to-amber-950/40 border border-amber-500/40 rounded-xl p-2.5 mb-3 text-left">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-arcade text-amber-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles size={11} /> UP NEXT
              </span>
              <span className="text-[9px] font-arcade text-zinc-400">
                Starting in {countdown}s...
              </span>
            </div>
            <div className="mt-1 font-arcade text-xs text-white">
              {nextLevel.theme === 'castle' ? '🏰' : '💎'} {nextLevel.name}
            </div>
            <div className="text-[11px] font-mono text-zinc-400 mt-0.5">
              {nextLevel.subtitle}
            </div>
            {/* Animated countdown bar */}
            <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-amber-400 h-full transition-all duration-1000 ease-linear rounded-full"
                style={{ width: `${(countdown / 4) * 100}%` }}
              />
            </div>
          </div>
        ) : !hasNextLevel ? (
          <div className="bg-gradient-to-r from-pink-950/40 via-zinc-900/60 to-pink-950/40 border border-pink-500/40 rounded-xl p-3 mb-3 text-center">
            <Crown size={24} className="text-amber-400 mx-auto mb-1 animate-bounce" />
            <span className="text-xs font-arcade text-pink-300 block">PRINCESS PEACH RESCUED!</span>
            <span className="text-[11px] font-mono text-zinc-300 block mt-1">You saved the Mushroom Kingdom!</span>
          </div>
        ) : null}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          {hasNextLevel ? (
            <button
              onClick={onNextLevel}
              className="flex-1 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-zinc-950 font-arcade text-[11px] py-3.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
            >
              <span>{nextLevel ? `PLAY ${nextLevel.name.split(':')[0]}` : 'NEXT WORLD'}</span>
              <ArrowRight size={15} />
            </button>
          ) : (
            <button
              onClick={onLevelSelect}
              className="flex-1 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-zinc-950 font-arcade text-[11px] py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
            >
              STAGE SELECT
            </button>
          )}

          <button
            onClick={onReplay}
            className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-arcade text-[10px] py-3 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <RotateCcw size={14} /> REPLAY
          </button>
        </div>

        {/* Keyboard shortcut hint */}
        <p className="text-[9px] font-mono text-zinc-500 mt-2.5">
          Tip: Press <kbd className="px-1 py-0.5 bg-zinc-800 text-zinc-300 rounded text-[8px] font-mono">SPACE</kbd> or <kbd className="px-1 py-0.5 bg-zinc-800 text-zinc-300 rounded text-[8px] font-mono">ENTER</kbd> to continue
        </p>

      </div>
    </div>
  );
};
