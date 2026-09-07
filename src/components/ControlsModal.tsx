import React, { useState, useEffect } from 'react';
import { PlayerControls } from '../types';
import { X, RotateCcw, Keyboard, Sparkles, Users, CheckCircle2, AlertTriangle } from 'lucide-react';
import { DEFAULT_CONTROLS } from '../game/constants';
import { sound } from '../audio/soundEngine';

interface ControlsModalProps {
  isOpen: boolean;
  onClose: () => void;
  marioControls: PlayerControls;
  luigiControls: PlayerControls;
  onUpdateControls: (mario: PlayerControls, luigi: PlayerControls) => void;
}

export const ControlsModal: React.FC<ControlsModalProps> = ({
  isOpen,
  onClose,
  marioControls,
  luigiControls,
  onUpdateControls,
}) => {
  const [activeRebind, setActiveRebind] = useState<{
    player: 'mario' | 'luigi';
    action: keyof PlayerControls;
  } | null>(null);

  const [lastPressedKey, setLastPressedKey] = useState<string>('');
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());

  // Real-time key testing listener
  useEffect(() => {
    if (!isOpen) return;

    const handleDown = (e: KeyboardEvent) => {
      setLastPressedKey(e.code);
      setPressedKeys((prev) => new Set(prev).add(e.code));
      sound.playClick();
    };

    const handleUp = (e: KeyboardEvent) => {
      setPressedKeys((prev) => {
        const next = new Set(prev);
        next.delete(e.code);
        return next;
      });
    };

    window.addEventListener('keydown', handleDown);
    window.addEventListener('keyup', handleUp);

    return () => {
      window.removeEventListener('keydown', handleDown);
      window.removeEventListener('keyup', handleUp);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleKeyRebind = (e: React.KeyboardEvent) => {
    if (!activeRebind) return;
    e.preventDefault();

    const newControls = {
      mario: { ...marioControls },
      luigi: { ...luigiControls },
    };

    if (activeRebind.player === 'mario') {
      newControls.mario[activeRebind.action] = e.code;
    } else {
      newControls.luigi[activeRebind.action] = e.code;
    }

    onUpdateControls(newControls.mario, newControls.luigi);
    setActiveRebind(null);
  };

  const resetDefaults = () => {
    onUpdateControls(DEFAULT_CONTROLS.mario, DEFAULT_CONTROLS.luigi);
  };

  const formatKeyName = (code: string) => {
    return code
      .replace('Key', '')
      .replace('Arrow', '')
      .replace('Digit', '')
      .toUpperCase();
  };

  // Check if any keys conflict between players
  const conflicts: string[] = [];
  const marioValues = Object.values(marioControls) as string[];
  const luigiValues = Object.values(luigiControls) as string[];
  marioValues.forEach((mKey) => {
    if (luigiValues.includes(mKey)) {
      conflicts.push(formatKeyName(mKey));
    }
  });

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none"
      onKeyDown={activeRebind ? handleKeyRebind : undefined}
      tabIndex={0}
    >
      <div className="bg-gradient-to-b from-zinc-900 via-zinc-920 to-zinc-950 border-2 border-zinc-700/80 rounded-3xl max-w-2xl w-full p-4 sm:p-6 text-white shadow-2xl overflow-y-auto max-h-[92vh] animate-in fade-in zoom-in-95 duration-200 relative">
        
        {/* Decorative corner bolts */}
        <div className="absolute top-3 left-3 w-2 h-2 rounded-full bg-zinc-600 border border-zinc-400 shadow-inner" />
        <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-zinc-600 border border-zinc-400 shadow-inner" />
        <div className="absolute bottom-3 left-3 w-2 h-2 rounded-full bg-zinc-600 border border-zinc-400 shadow-inner" />
        <div className="absolute bottom-3 right-3 w-2 h-2 rounded-full bg-zinc-600 border border-zinc-400 shadow-inner" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3.5 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/20">
              <Users size={22} />
            </div>
            <div>
              <h2 className="font-arcade text-xs sm:text-sm text-amber-300 tracking-wide">2-PLAYER CONTROLS &amp; INPUT LAB</h2>
              <p className="text-xs text-zinc-400">Tactile rebinds, key ghosting tester &amp; co-op split</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer border border-zinc-700"
          >
            <X size={18} />
          </button>
        </div>

        {/* Conflict Warning if any */}
        {conflicts.length > 0 && (
          <div className="mb-4 p-3 rounded-2xl bg-red-950/70 border border-red-500/70 text-xs text-red-200 flex items-center gap-2.5 shadow-lg">
            <AlertTriangle size={18} className="text-red-400 shrink-0" />
            <span>
              Key Conflict Detected: <strong className="text-white underline">{conflicts.join(', ')}</strong> is mapped to both Mario and Luigi!
            </span>
          </div>
        )}

        {/* Live Interactive Key Tester */}
        <div className="bg-zinc-950/90 border border-zinc-800/90 rounded-2xl p-3.5 mb-4 shadow-inner">
          <div className="flex items-center justify-between text-[11px] mb-2.5 font-mono">
            <span className="text-zinc-400 flex items-center gap-1.5">
              <Keyboard size={14} className="text-amber-400" />
              Live Key Sensor:
            </span>
            <span className="text-amber-300 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
              {lastPressedKey ? `Last: ${formatKeyName(lastPressedKey)}` : 'Press any key on keyboard...'}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 justify-center py-1">
            {/* Display active controls as 3D keycaps */}
            {(Object.entries(marioControls) as [keyof PlayerControls, string][]).map(([action, code]) => {
              const isHeld = pressedKeys.has(code);
              return (
                <div
                  key={`mario-${action}`}
                  className={`keycap keycap-red flex items-center gap-1.5 transition-all text-xs ${
                    isHeld ? 'active ring-2 ring-red-400 shadow-[0_0_14px_rgba(239,68,68,0.8)]' : ''
                  }`}
                >
                  <span className="font-bold">M:{formatKeyName(code)}</span>
                  <span className="text-[9px] opacity-75 font-ui uppercase">({action})</span>
                </div>
              );
            })}

            {(Object.entries(luigiControls) as [keyof PlayerControls, string][]).map(([action, code]) => {
              const isHeld = pressedKeys.has(code);
              return (
                <div
                  key={`luigi-${action}`}
                  className={`keycap keycap-green flex items-center gap-1.5 transition-all text-xs ${
                    isHeld ? 'active ring-2 ring-emerald-400 shadow-[0_0_14px_rgba(34,197,94,0.8)]' : ''
                  }`}
                >
                  <span className="font-bold">L:{formatKeyName(code)}</span>
                  <span className="text-[9px] opacity-75 font-ui uppercase">({action})</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Keyboard Layout Split & Rebinds */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-5">
          {/* MARIO CONTROLS */}
          <div className="bg-red-950/40 border-2 border-red-700/60 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-red-600 text-white font-arcade text-[10px] flex items-center justify-center font-bold">M</span>
                <span className="font-arcade text-xs text-red-400 font-bold">MARIO (PLAYER 1)</span>
              </div>
              <span className="text-[10px] bg-red-900/70 text-red-200 px-2 py-0.5 rounded-full font-mono">Left Hand</span>
            </div>
            <div className="space-y-2 text-xs">
              {(['up', 'left', 'down', 'right', 'action'] as (keyof PlayerControls)[]).map((action) => {
                const isRebinding = activeRebind?.player === 'mario' && activeRebind.action === action;
                return (
                  <div key={action} className="flex items-center justify-between p-1.5 rounded-xl bg-zinc-950/40 border border-red-900/30">
                    <span className="text-zinc-400 uppercase text-[11px] font-medium">
                      {action === 'action' ? 'Fire / Run' : action === 'up' ? 'Jump / Up' : action}:
                    </span>
                    <button
                      onClick={() => setActiveRebind({ player: 'mario', action })}
                      className={`keycap keycap-red text-xs px-3 py-1 font-bold cursor-pointer transition-all ${
                        isRebinding ? 'active ring-2 ring-amber-400 text-amber-200 animate-pulse' : ''
                      }`}
                    >
                      {isRebinding ? 'PRESS KEY...' : formatKeyName(marioControls[action])}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* LUIGI CONTROLS */}
          <div className="bg-emerald-950/40 border-2 border-emerald-700/60 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-arcade text-[10px] flex items-center justify-center font-bold">L</span>
                <span className="font-arcade text-xs text-emerald-400 font-bold">LUIGI (PLAYER 2)</span>
              </div>
              <span className="text-[10px] bg-emerald-900/70 text-emerald-200 px-2 py-0.5 rounded-full font-mono">Right Hand</span>
            </div>
            <div className="space-y-2 text-xs">
              {(['up', 'left', 'down', 'right', 'action'] as (keyof PlayerControls)[]).map((action) => {
                const isRebinding = activeRebind?.player === 'luigi' && activeRebind.action === action;
                return (
                  <div key={action} className="flex items-center justify-between p-1.5 rounded-xl bg-zinc-950/40 border border-emerald-900/30">
                    <span className="text-zinc-400 uppercase text-[11px] font-medium">
                      {action === 'action' ? 'Fire / Run' : action === 'up' ? 'Jump / Up' : action}:
                    </span>
                    <button
                      onClick={() => setActiveRebind({ player: 'luigi', action })}
                      className={`keycap keycap-green text-xs px-3 py-1 font-bold cursor-pointer transition-all ${
                        isRebinding ? 'active ring-2 ring-amber-400 text-amber-200 animate-pulse' : ''
                      }`}
                    >
                      {isRebinding ? 'PRESS KEY...' : formatKeyName(luigiControls[action])}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-zinc-800/80 pt-3.5">
          <button
            onClick={resetDefaults}
            className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer bg-zinc-800/60 hover:bg-zinc-800 px-3 py-1.5 rounded-xl border border-zinc-700"
          >
            <RotateCcw size={14} />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={onClose}
            className="bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-zinc-950 font-arcade text-xs px-6 py-2.5 rounded-xl shadow-lg shadow-amber-500/30 font-bold transition-transform active:scale-95 cursor-pointer"
          >
            DONE
          </button>
        </div>

      </div>
    </div>
  );
};
