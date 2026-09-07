import React, { useEffect } from 'react';
import { RotateCcw, Home, Skull } from 'lucide-react';
import { LevelData } from '../types';

interface GameOverModalProps {
  isOpen: boolean;
  level: LevelData;
  onRetry: () => void;
  onHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  level,
  onRetry,
  onHome,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['Enter', 'Space', 'KeyR'].includes(e.code)) {
        e.preventDefault();
        onRetry();
      } else if (['Escape', 'KeyH'].includes(e.code)) {
        e.preventDefault();
        onHome();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onRetry, onHome]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-zinc-950 border-4 border-red-700 rounded-2xl max-w-md w-full p-6 text-center text-white shadow-2xl animate-in fade-in zoom-in duration-300">
        
        <div className="w-16 h-16 bg-red-900/60 border-2 border-red-500 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <Skull size={32} />
        </div>

        <h2 className="font-arcade text-xl text-red-500 mb-2">GAME OVER</h2>
        <p className="text-sm font-ui text-zinc-300 mb-1">Both Mario & Luigi fell!</p>
        <p className="text-xs font-mono text-amber-400 mb-5">{level.name} - {level.subtitle}</p>

        <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-300 mb-5 text-left">
          <span className="text-amber-400 font-bold block mb-1">💡 Co-op Tip:</span>
          When one brother is defeated, he turns into a floating bubble! Pop his bubble before both brothers get wiped out!
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={onRetry}
            id="btn_game_over_retry"
            className="w-full bg-red-600 hover:bg-red-500 text-white font-arcade text-xs py-3.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-900/40 transition-transform active:scale-95 cursor-pointer"
          >
            <RotateCcw size={16} /> RETRY {level.name}
          </button>

          <button
            onClick={onHome}
            id="btn_game_over_home"
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-arcade text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Home size={16} /> STAGE SELECT
          </button>
        </div>

        <p className="text-[10px] font-mono text-zinc-500 mt-3">
          Press <kbd className="px-1.5 py-0.5 bg-zinc-800 text-zinc-300 rounded text-[9px]">SPACE</kbd> or <kbd className="px-1.5 py-0.5 bg-zinc-800 text-zinc-300 rounded text-[9px]">ENTER</kbd> to retry
        </p>

      </div>
    </div>
  );
};
