import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Flame, Shield } from 'lucide-react';
import { GameEngine } from '../game/engine';

interface VirtualGamepadProps {
  engine: GameEngine;
  isVisible: boolean;
}

export const VirtualGamepad: React.FC<VirtualGamepadProps> = ({ engine, isVisible }) => {
  if (!isVisible) return null;

  // Helper to trigger keydown/keyup on engine
  const pressKey = (code: string) => {
    engine.handleKeyDown(code);
  };
  const releaseKey = (code: string) => {
    engine.handleKeyUp(code);
  };

  const bindEvents = (code: string) => ({
    onMouseDown: () => pressKey(code),
    onMouseUp: () => releaseKey(code),
    onMouseLeave: () => releaseKey(code),
    onTouchStart: (e: React.TouchEvent) => {
      e.preventDefault();
      pressKey(code);
    },
    onTouchEnd: (e: React.TouchEvent) => {
      e.preventDefault();
      releaseKey(code);
    },
  });

  return (
    <div className="absolute inset-x-0 bottom-2 pointer-events-none flex justify-between px-3 md:px-8 z-30 select-none">
      {/* MARIO CONTROLLER (Left) */}
      <div className="pointer-events-auto bg-red-950/85 backdrop-blur-md border-2 border-red-500/80 p-2.5 rounded-2xl shadow-2xl flex flex-col gap-2 max-w-[200px]">
        <div className="text-[10px] font-arcade text-red-300 flex items-center justify-between border-b border-red-700/60 pb-1">
          <span>P1: MARIO</span>
          <span className="text-[9px] text-zinc-400">WASD+F</span>
        </div>

        <div className="flex items-center gap-3">
          {/* D-PAD */}
          <div className="grid grid-cols-3 gap-1">
            <div />
            <button
              {...bindEvents('KeyW')}
              className="w-9 h-9 bg-zinc-800 active:bg-red-600 border border-zinc-700 active:border-white rounded text-white flex items-center justify-center font-bold shadow active:scale-95"
              title="Mario Jump (W)"
            >
              <ArrowUp size={16} />
            </button>
            <div />

            <button
              {...bindEvents('KeyA')}
              className="w-9 h-9 bg-zinc-800 active:bg-red-600 border border-zinc-700 active:border-white rounded text-white flex items-center justify-center font-bold shadow active:scale-95"
              title="Mario Left (A)"
            >
              <ArrowLeft size={16} />
            </button>
            <button
              {...bindEvents('KeyS')}
              className="w-9 h-9 bg-zinc-800 active:bg-red-600 border border-zinc-700 active:border-white rounded text-white flex items-center justify-center font-bold shadow active:scale-95"
              title="Mario Crouch (S)"
            >
              <ArrowDown size={16} />
            </button>
            <button
              {...bindEvents('KeyD')}
              className="w-9 h-9 bg-zinc-800 active:bg-red-600 border border-zinc-700 active:border-white rounded text-white flex items-center justify-center font-bold shadow active:scale-95"
              title="Mario Right (D)"
            >
              <ArrowRight size={16} />
            </button>
          </div>

          {/* ACTION BUTTON (F) */}
          <button
            {...bindEvents('KeyF')}
            className="w-12 h-12 bg-red-600 active:bg-red-500 border-2 border-white rounded-full text-white font-arcade text-[10px] flex flex-col items-center justify-center shadow-lg active:scale-90"
            title="Mario Action / Fire (F)"
          >
            <Flame size={16} />
            <span>F</span>
          </button>
        </div>
      </div>

      {/* LUIGI CONTROLLER (Right) */}
      <div className="pointer-events-auto bg-emerald-950/85 backdrop-blur-md border-2 border-emerald-500/80 p-2.5 rounded-2xl shadow-2xl flex flex-col gap-2 max-w-[200px]">
        <div className="text-[10px] font-arcade text-emerald-300 flex items-center justify-between border-b border-emerald-700/60 pb-1">
          <span className="text-[9px] text-zinc-400">ARROWS+ENT</span>
          <span>P2: LUIGI</span>
        </div>

        <div className="flex items-center gap-3">
          {/* ACTION BUTTON (Enter) */}
          <button
            {...bindEvents('Enter')}
            className="w-12 h-12 bg-emerald-600 active:bg-emerald-500 border-2 border-white rounded-full text-white font-arcade text-[9px] flex flex-col items-center justify-center shadow-lg active:scale-90"
            title="Luigi Action / Fire (Enter)"
          >
            <Flame size={16} />
            <span>ENT</span>
          </button>

          {/* D-PAD */}
          <div className="grid grid-cols-3 gap-1">
            <div />
            <button
              {...bindEvents('ArrowUp')}
              className="w-9 h-9 bg-zinc-800 active:bg-emerald-600 border border-zinc-700 active:border-white rounded text-white flex items-center justify-center font-bold shadow active:scale-95"
              title="Luigi Jump (ArrowUp)"
            >
              <ArrowUp size={16} />
            </button>
            <div />

            <button
              {...bindEvents('ArrowLeft')}
              className="w-9 h-9 bg-zinc-800 active:bg-emerald-600 border border-zinc-700 active:border-white rounded text-white flex items-center justify-center font-bold shadow active:scale-95"
              title="Luigi Left (ArrowLeft)"
            >
              <ArrowLeft size={16} />
            </button>
            <button
              {...bindEvents('ArrowDown')}
              className="w-9 h-9 bg-zinc-800 active:bg-emerald-600 border border-zinc-700 active:border-white rounded text-white flex items-center justify-center font-bold shadow active:scale-95"
              title="Luigi Crouch (ArrowDown)"
            >
              <ArrowDown size={16} />
            </button>
            <button
              {...bindEvents('ArrowRight')}
              className="w-9 h-9 bg-zinc-800 active:bg-emerald-600 border border-zinc-700 active:border-white rounded text-white flex items-center justify-center font-bold shadow active:scale-95"
              title="Luigi Right (ArrowRight)"
            >
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
