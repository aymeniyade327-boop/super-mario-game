import React, { useState } from 'react';
import { 
  Play, 
  Users, 
  Volume2, 
  VolumeX, 
  Music, 
  Tv, 
  Gamepad2, 
  Sparkles, 
  Flame, 
  Shield, 
  ArrowUp,
  Award,
  Zap,
  Lock,
  CheckCircle2,
  Sliders,
  UserCheck
} from 'lucide-react';
import { LevelData, PlayerControls } from '../types';
import { PersonnelCard } from './PersonnelCard';

interface TitleScreenProps {
  levels: LevelData[];
  selectedLevelIndex: number;
  maxUnlockedLevelIndex: number;
  marioControls: PlayerControls;
  luigiControls: PlayerControls;
  onSelectLevel: (index: number) => void;
  onStartGame: () => void;
  onOpenControls: () => void;
  soundEnabled: boolean;
  musicEnabled: boolean;
  crtEnabled?: boolean;
  gamepadVisible?: boolean;
  onToggleSound: () => void;
  onToggleMusic: () => void;
  onToggleCrt?: () => void;
  onToggleGamepad?: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  levels,
  selectedLevelIndex,
  maxUnlockedLevelIndex,
  marioControls,
  luigiControls,
  onSelectLevel,
  onStartGame,
  onOpenControls,
  soundEnabled,
  musicEnabled,
  crtEnabled = false,
  gamepadVisible = false,
  onToggleSound,
  onToggleMusic,
  onToggleCrt,
  onToggleGamepad,
}) => {
  const [activeTab, setActiveTab] = useState<'levels' | 'personnel' | 'synergy'>('levels');
  const [lockedNotice, setLockedNotice] = useState<string | null>(null);

  const handleLevelClick = (index: number) => {
    if (index > maxUnlockedLevelIndex) {
      const prevLevelName = levels[index - 1]?.name || 'Previous Level';
      setLockedNotice(`🔒 ${levels[index].name} is locked! Complete ${prevLevelName} first.`);
      setTimeout(() => setLockedNotice(null), 3000);
      return;
    }
    setLockedNotice(null);
    onSelectLevel(index);
  };

  return (
    <div className="w-full min-h-full bg-zinc-950 text-white flex flex-col items-center justify-between p-3 sm:p-5 select-none relative overflow-x-hidden">
      
      {/* Dynamic Background Atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/25 via-zinc-950 to-zinc-950 -z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(239,68,68,0.1),_transparent_40%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(34,197,94,0.1),_transparent_40%)] pointer-events-none" />

      {/* Top Header Bar */}
      <header className="w-full max-w-5xl flex items-center justify-between z-10 mb-2 sm:mb-3 gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="bg-red-600 text-white text-[9px] sm:text-[10px] font-arcade px-2 py-1 rounded shadow-md border border-red-400">
            2-PLAYER
          </span>
          <span className="bg-emerald-600 text-white text-[9px] sm:text-[10px] font-arcade px-2 py-1 rounded shadow-md border border-emerald-400">
            CO-OP
          </span>
          <span className="bg-amber-500/20 text-amber-300 text-[9px] sm:text-[10px] font-arcade px-2 py-1 rounded border border-amber-500/40 hidden md:inline">
            SAME KEYBOARD
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {onToggleCrt && (
            <button
              onClick={onToggleCrt}
              className={`p-1.5 sm:p-2 rounded-lg border transition-colors ${
                crtEnabled
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
              }`}
              title={crtEnabled ? 'Disable CRT Filter' : 'Enable CRT Filter'}
            >
              <Tv size={15} />
            </button>
          )}

          {onToggleGamepad && (
            <button
              onClick={onToggleGamepad}
              className={`p-1.5 sm:p-2 rounded-lg border transition-colors ${
                gamepadVisible
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
              }`}
              title={gamepadVisible ? 'Hide Virtual Gamepad' : 'Show Virtual Gamepad'}
            >
              <Gamepad2 size={15} />
            </button>
          )}

          <button
            onClick={onToggleSound}
            className="p-1.5 sm:p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300"
            title={soundEnabled ? 'Mute SFX' : 'Unmute SFX'}
          >
            {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} className="text-red-400" />}
          </button>

          <button
            onClick={onToggleMusic}
            className="p-1.5 sm:p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300"
            title={musicEnabled ? 'Mute Music' : 'Unmute Music'}
          >
            <Music size={15} className={musicEnabled ? 'text-green-400' : 'text-zinc-500'} />
          </button>

          <button
            onClick={onOpenControls}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[11px] text-zinc-300 font-arcade"
          >
            <Users size={13} /> KEYS
          </button>

          <button
            onClick={onStartGame}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-zinc-950 font-arcade text-[11px] px-3 py-1.5 rounded-lg font-bold shadow-lg shadow-amber-500/30 active:scale-95 transition-transform"
            id="btn_header_play"
          >
            <Play size={13} fill="currentColor" /> PLAY
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-4xl px-2 my-auto flex flex-col items-center">
        
        {/* Title & Brand */}
        <div className="text-center mb-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] font-arcade text-amber-300 mb-2">
            <Sparkles size={12} className="text-amber-400 animate-pulse" />
            ARCADE COOPERATIVE PLATFORMER
          </div>
          <h1 className="font-arcade text-xl sm:text-3xl md:text-4xl text-transparent bg-clip-text bg-gradient-to-b from-amber-300 via-amber-400 to-amber-600 tracking-wider mb-1 drop-shadow-[0_4px_16px_rgba(245,158,11,0.5)]">
            SUPER MARIO &amp; LUIGI
          </h1>
          <div className="font-arcade text-[11px] sm:text-xs text-red-500 tracking-[0.25em] uppercase font-bold">
            CO-OP BROS ADVENTURE
          </div>
        </div>

        {/* Character Duo Personnel Cards (Mario & Luigi) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full max-w-3xl mb-4">
          <PersonnelCard
            character="mario"
            controls={marioControls}
            onOpenControls={onOpenControls}
          />
          <PersonnelCard
            character="luigi"
            controls={luigiControls}
            onOpenControls={onOpenControls}
          />
        </div>

        {/* Stage Selection, Personnel & Co-op Synergy Tabs */}
        <div className="w-full max-w-3xl mb-5">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2 font-arcade text-[10px]">
              <button
                onClick={() => setActiveTab('levels')}
                className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'levels'
                    ? 'bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/30'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                SELECT WORLD
              </button>
              <button
                onClick={() => setActiveTab('personnel')}
                className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
                  activeTab === 'personnel'
                    ? 'bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/30'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                <UserCheck size={12} /> BROS DOSSIER
              </button>
              <button
                onClick={() => setActiveTab('synergy')}
                className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'synergy'
                    ? 'bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/30'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                CO-OP MECHANICS
              </button>
            </div>
            <span className="text-[11px] text-amber-400/80 font-arcade hidden sm:inline">
              ★ 3 Star Coins per World
            </span>
          </div>

          {/* Locked stage warning alert banner */}
          {lockedNotice && (
            <div className="mb-2.5 p-2 bg-red-950/90 border border-red-500 rounded-xl text-center font-arcade text-[10px] text-red-300 animate-in fade-in duration-200">
              {lockedNotice}
            </div>
          )}

          {activeTab === 'levels' ? (
            <div className="grid grid-cols-3 gap-3">
              {levels.map((lvl, index) => {
                const isSelected = index === selectedLevelIndex;
                const isCastle = lvl.theme === 'castle';
                const isUnderground = lvl.theme === 'underground';
                const isLocked = index > maxUnlockedLevelIndex;
                const isCleared = index < maxUnlockedLevelIndex;
                const isCurrent = index === maxUnlockedLevelIndex;

                return (
                  <button
                    key={lvl.id}
                    onClick={() => handleLevelClick(index)}
                    className={`p-3 rounded-2xl border-2 text-left transition-all relative overflow-hidden group ${
                      isLocked
                        ? 'border-zinc-800/80 bg-zinc-950/70 opacity-60 cursor-not-allowed'
                        : isSelected
                        ? 'border-amber-400 bg-amber-500/15 shadow-[0_0_20px_rgba(245,158,11,0.35)] scale-102 ring-2 ring-amber-400/40 cursor-pointer'
                        : 'border-zinc-800 bg-zinc-900/80 hover:border-zinc-700 text-zinc-400 cursor-pointer'
                    }`}
                  >
                    {/* World Theme Preview Gradient */}
                    <div className={`h-12 w-full rounded-xl mb-2 flex items-center justify-center text-xl shadow-inner border relative ${
                      isLocked
                        ? 'bg-zinc-900 border-zinc-800 text-zinc-600'
                        : isCastle 
                        ? 'bg-gradient-to-tr from-red-950 via-zinc-900 to-amber-950 border-white/10'
                        : isUnderground
                        ? 'bg-gradient-to-tr from-blue-950 via-indigo-950 to-slate-900 border-white/10'
                        : 'bg-gradient-to-tr from-emerald-950 via-teal-950 to-sky-950 border-white/10'
                    }`}>
                      <span>{isCastle ? '🏰' : isUnderground ? '💎' : '🌲'}</span>
                      {isLocked && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center rounded-xl">
                          <Lock size={18} className="text-zinc-400" />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-arcade text-[10px] ${
                        isLocked ? 'text-zinc-500' : isSelected ? 'text-amber-300 font-bold' : 'text-zinc-300'
                      }`}>
                        {lvl.name}
                      </span>
                      {isLocked ? (
                        <span className="bg-zinc-800 text-zinc-400 text-[7px] font-arcade px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5">
                          <Lock size={8} /> LOCKED
                        </span>
                      ) : isCleared ? (
                        <span className="bg-emerald-900/80 text-emerald-300 text-[7px] font-arcade px-1.5 py-0.5 rounded font-bold border border-emerald-500/40">
                          ✓ CLEAR
                        </span>
                      ) : isCastle ? (
                        <span className="bg-red-600 text-white text-[7px] font-arcade px-1.5 py-0.5 rounded font-bold">
                          BOSS
                        </span>
                      ) : (
                        <span className="bg-amber-500/30 text-amber-300 text-[7px] font-arcade px-1.5 py-0.5 rounded font-bold">
                          READY
                        </span>
                      )}
                    </div>
                    <div className={`text-xs sm:text-sm font-bold block truncate mb-1 ${
                      isLocked ? 'text-zinc-500' : 'text-white'
                    }`}>
                      {lvl.subtitle}
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono border-t border-zinc-800/80 pt-1.5">
                      {isLocked ? (
                        <span className="text-zinc-500 text-[9px]">Clear World 1-{index}</span>
                      ) : (
                        <span className={`tracking-widest ${isCleared ? 'text-amber-400' : 'text-zinc-600'}`}>
                          ★ ★ ★
                        </span>
                      )}
                      <span className="text-zinc-500 text-[9px] uppercase">
                        {isCastle ? 'Hard' : isUnderground ? 'Medium' : 'Normal'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : activeTab === 'personnel' ? (
            <div className="bg-zinc-900/95 border border-zinc-800 p-4 rounded-2xl text-xs space-y-3.5">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <div>
                  <h3 className="font-arcade text-xs text-amber-400 font-bold">BROS PERSONNEL COMPARATIVE MATRIX</h3>
                  <p className="text-[11px] text-zinc-400 font-ui">Authentic Nintendo physics differences between the brothers</p>
                </div>
                <button
                  onClick={onOpenControls}
                  className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-arcade text-[9px] flex items-center gap-1.5 border border-zinc-700 cursor-pointer"
                >
                  <Sliders size={11} /> REBIND CONTROLS
                </button>
              </div>

              {/* Head-to-Head Attributes Table */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-zinc-300">
                {/* Mario Profile Summary */}
                <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-arcade text-[11px] text-red-400 font-bold">MARIO (PLAYER 1)</span>
                    <span className="text-[9px] font-mono bg-red-900/80 text-red-200 px-1.5 py-0.5 rounded">GROUND SPECIALIST</span>
                  </div>
                  <ul className="space-y-1.5 text-[11px] font-ui">
                    <li className="flex items-center justify-between">
                      <span className="text-zinc-400">Ground Traction:</span>
                      <span className="font-mono text-red-300 font-bold">Instant Stop (0.15 decel)</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-zinc-400">Jump Arc:</span>
                      <span className="font-mono text-red-300 font-bold">Standard 4-block leap</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-zinc-400">Wall Rebound:</span>
                      <span className="font-mono text-emerald-400 font-bold">Full Rebound Kick</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-zinc-400">Sprint Dash:</span>
                      <span className="font-mono text-amber-300 font-bold">Instant Top Speed</span>
                    </li>
                  </ul>
                </div>

                {/* Luigi Profile Summary */}
                <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-arcade text-[11px] text-emerald-400 font-bold">LUIGI (PLAYER 2)</span>
                    <span className="text-[9px] font-mono bg-emerald-900/80 text-emerald-200 px-1.5 py-0.5 rounded">AERIAL RECON</span>
                  </div>
                  <ul className="space-y-1.5 text-[11px] font-ui">
                    <li className="flex items-center justify-between">
                      <span className="text-zinc-400">Ground Traction:</span>
                      <span className="font-mono text-amber-300 font-bold">Ice Slide (0.05 decel)</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-zinc-400">Jump Arc:</span>
                      <span className="font-mono text-emerald-300 font-bold">5-block flutter leap</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-zinc-400">Flutter Hangtime:</span>
                      <span className="font-mono text-cyan-400 font-bold">Hold Jump in mid-air</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-zinc-400">Ceiling Reach:</span>
                      <span className="font-mono text-emerald-300 font-bold">+25% Vertical Apex</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Co-op Synergy Callout */}
              <div className="p-2.5 bg-black/40 border border-zinc-800 rounded-xl flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🤝</span>
                  <span className="text-zinc-300">
                    <strong className="text-amber-400">Head-Bounce Boost:</strong> Jump directly on your brother's head for a colossal leap to reach hidden pipe secrets!
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-zinc-900/95 border border-zinc-800 p-3.5 rounded-2xl text-xs">
              <div className="p-2.5 bg-zinc-950/70 rounded-xl border border-zinc-800 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <Zap size={15} />
                  <span className="font-arcade text-[10px]">Buddy Boost</span>
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed">
                  Jump directly on your brother's cap for a super-high vertical bounce! Reach secret pipes and hidden Star Coins.
                </p>
              </div>

              <div className="p-2.5 bg-zinc-950/70 rounded-xl border border-zinc-800 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                  <Shield size={15} />
                  <span className="font-arcade text-[10px]">Rescue Bubble</span>
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed">
                  If either brother runs out of hearts, he floats in a safe rescue bubble. Touch or shoot it to revive him with 3 full hearts!
                </p>
              </div>

              <div className="p-2.5 bg-zinc-950/70 rounded-xl border border-zinc-800 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-red-400 font-bold">
                  <Award size={15} />
                  <span className="font-arcade text-[10px]">Dual Switches</span>
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed">
                  Heavy stone switches require both Mario &amp; Luigi standing together to trigger drawbridges and unlock Bowser's chamber.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Big Arcade Start Button */}
        <button
          onClick={onStartGame}
          className="w-full max-w-sm mx-auto bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-zinc-950 font-arcade text-xs sm:text-sm py-3.5 px-6 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-amber-500/35 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          id="btn_start_game"
        >
          <Play size={18} fill="currentColor" />
          <span>START CO-OP ADVENTURE</span>
        </button>

      </main>

      {/* Footer Quick Keys Cheat Sheet */}
      <footer className="w-full max-w-3xl bg-zinc-900/90 border border-zinc-800/90 rounded-xl p-2.5 mt-2 flex flex-wrap items-center justify-between text-[10px] sm:text-xs text-zinc-400 font-mono gap-1 shadow-md">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          <span className="text-red-400 font-bold">P1 Mario:</span>
          <span>W (Jump), A/D (Run), S (Duck), F (Fire/Sprint)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-emerald-400 font-bold">P2 Luigi:</span>
          <span>↑ (Flutter), ←/→ (Run), ↓ (Duck), Enter (Fire/Sprint)</span>
        </div>
      </footer>

    </div>
  );
};
