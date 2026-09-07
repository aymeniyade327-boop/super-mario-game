import React from 'react';
import { Play, RotateCcw, Home, HelpCircle } from 'lucide-react';
import { LevelData } from '../types';

interface PauseModalProps {
  isOpen: boolean;
  level: LevelData;
  onResume: () => void;
  onRestart: () => void;
  onHome: () => void;
  onOpenControls: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  isOpen,
  level,
  onResume,
  onRestart,
  onHome,
  onOpenControls,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border-2 border-zinc-700 rounded-2xl max-w-sm w-full p-6 text-center text-white shadow-2xl">
        <h2 className="font-arcade text-lg text-amber-400 mb-1">PAUSED</h2>
        <p className="text-xs text-zinc-400 mb-6">{level.name}: {level.subtitle}</p>

        <div className="space-y-3 font-arcade text-xs">
          <button
            onClick={onResume}
            className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
          >
            <Play size={16} /> RESUME
          </button>

          <button
            onClick={onOpenControls}
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <HelpCircle size={16} /> CONTROLS & TIPS
          </button>

          <button
            onClick={onRestart}
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCcw size={16} /> RESTART LEVEL
          </button>

          <button
            onClick={onHome}
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <Home size={16} /> MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );
};
