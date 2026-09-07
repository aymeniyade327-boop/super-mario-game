import React, { useState, useEffect } from 'react';
import { Player, LevelData } from '../types';
import { 
  Volume2, 
  VolumeX, 
  Music, 
  HelpCircle, 
  Pause, 
  RotateCcw, 
  Tv, 
  Gamepad2,
  Heart,
  Sparkles,
  Flame,
  Clock,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface HUDProps {
  mario: Player;
  luigi: Player;
  level: LevelData;
  timeLeft: number;
  soundEnabled: boolean;
  musicEnabled: boolean;
  crtEnabled?: boolean;
  gamepadVisible?: boolean;
  onToggleSound: () => void;
  onToggleMusic: () => void;
  onToggleHelp: () => void;
  onToggleCrt?: () => void;
  onToggleGamepad?: () => void;
  onPause: () => void;
  onRestart: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  mario,
  luigi,
  level,
  timeLeft,
  soundEnabled,
  musicEnabled,
  crtEnabled = false,
  gamepadVisible = false,
  onToggleSound,
  onToggleMusic,
  onToggleHelp,
  onToggleCrt,
  onToggleGamepad,
  onPause,
  onRestart,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Count collected star coins in level
  const collectedStarCoins = level.items.filter(
    (i) => i.type === 'starCoin' && i.isCollected
  ).length;

  const isMarioCritical = mario.lives === 1 && !mario.inBubble;
  const isLuigiCritical = luigi.lives === 1 && !luigi.inBubble;

  // Co-op proximity & synergy calculations
  const distance = Math.abs(mario.x - luigi.x);
  const isClose = distance < 200 && !mario.inBubble && !luigi.inBubble;
  const isHeadBoost = Math.abs(mario.x - luigi.x) < 28 && Math.abs(mario.y - luigi.y) < 44;
  const hasBubble = mario.inBubble || luigi.inBubble;

  return (
    <header className="w-full bg-gradient-to-b from-zinc-900/95 via-zinc-950/95 to-black/95 backdrop-blur-md border-b-2 border-zinc-800 text-white px-2 sm:px-4 py-2 select-none shadow-[0_4px_25px_rgba(0,0,0,0.8)] z-30">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        
        {/* MARIO (Player 1) PERSONNEL ARCADE POD */}
        <div className={`flex items-center gap-2.5 bg-gradient-to-r from-red-950/80 via-zinc-900/90 to-zinc-900/70 border-2 ${
          mario.inBubble 
            ? 'border-cyan-400/90 shadow-[0_0_20px_rgba(34,211,238,0.5)]' 
            : mario.power === 'star'
            ? 'border-amber-400/90 shadow-[0_0_20px_rgba(251,191,36,0.6)] animate-pulse'
            : mario.power === 'fire'
            ? 'border-orange-500/90 shadow-[0_0_15px_rgba(249,115,22,0.4)]'
            : 'border-red-600/80 shadow-[0_0_14px_rgba(239,68,68,0.3)]'
        } rounded-2xl px-3 py-1.5 transition-all duration-300 relative overflow-hidden group`}>
          
          {/* Avatar Icon */}
          <div className="relative">
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-b from-red-500 via-red-600 to-red-700 border-2 border-white flex flex-col items-center justify-center font-arcade text-white shadow-lg ${
              mario.power === 'star' ? 'animate-bounce border-amber-300' : ''
            }`}>
              <span className="text-base font-black leading-none drop-shadow">M</span>
              <span className="text-[7px] tracking-tighter opacity-90 font-bold">1P</span>
            </div>
            
            {/* Status Badges */}
            {mario.inBubble ? (
              <span className="absolute -top-2 -right-2 bg-cyan-400 text-zinc-950 text-[7px] font-bold rounded-full px-1.5 py-0.5 animate-pulse border border-white shadow">
                BUBBLE
              </span>
            ) : mario.power === 'star' ? (
              <span className="absolute -top-2 -right-2 bg-amber-400 text-zinc-950 text-[8px] font-bold rounded-full px-1 animate-spin shadow">
                ★
              </span>
            ) : mario.power === 'fire' ? (
              <span className="absolute -top-1.5 -right-2 bg-orange-500 text-white text-[7px] font-bold rounded-full p-0.5 border border-white shadow">
                <Flame size={10} />
              </span>
            ) : null}
          </div>

          {/* Stats Column */}
          <div className="min-w-[110px]">
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-1.5">
                <span className="font-arcade text-[11px] text-red-400 tracking-wider font-bold">MARIO</span>
                {mario.isCrouching ? (
                  <span className="text-[7px] font-mono bg-zinc-800 text-zinc-400 px-1 rounded">DUCK</span>
                ) : !mario.isGrounded ? (
                  <span className="text-[7px] font-mono bg-red-950 text-red-300 px-1 rounded">AIR</span>
                ) : null}
              </div>
              
              {/* Hearts Health Meter */}
              <div className="flex items-center gap-1" title={`${mario.lives} / 3 Hearts`}>
                {[0, 1, 2].map((idx) => {
                  const isAlive = idx < mario.lives;
                  return isAlive ? (
                    <Heart
                      key={idx}
                      size={12}
                      className={`text-red-500 fill-red-500 transition-all duration-300 ${
                        isMarioCritical ? 'heart-critical' : 'drop-shadow-[0_0_6px_rgba(239,68,68,0.9)]'
                      }`}
                    />
                  ) : (
                    <Heart
                      key={idx}
                      size={12}
                      className="text-zinc-700/40 fill-transparent scale-75 opacity-25"
                    />
                  );
                })}
              </div>
            </div>

            {/* Score, Coins & Power Status */}
            <div className="flex items-center gap-2 font-arcade text-[10px] mt-1">
              <span className="text-amber-400 flex items-center gap-1">
                <span className="inline-block w-3 h-3 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 border border-amber-200 text-[8px] text-amber-950 font-bold text-center leading-tight shadow-sm coin-shine">
                  🪙
                </span>
                {mario.coins}
              </span>
              <span className="text-zinc-100 font-mono text-xs tracking-wider">{mario.score.toString().padStart(6, '0')}</span>
              {mario.power === 'fire' ? (
                <span className="text-[7px] uppercase px-1.5 py-0.5 rounded bg-orange-600/90 text-white font-bold border border-orange-400/50 flex items-center gap-0.5">
                  <Flame size={8} /> FIRE
                </span>
              ) : mario.power === 'super' ? (
                <span className="text-[7px] uppercase px-1.5 py-0.5 rounded bg-red-600/90 text-white font-bold border border-red-400/50">
                  SUPER
                </span>
              ) : mario.power === 'star' ? (
                <span className="text-[7px] uppercase px-1.5 py-0.5 rounded bg-amber-500 text-zinc-950 font-bold border border-amber-300">
                  ★ STAR
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {/* CENTER: STAGE BANNER & CO-OP MISSION TRACKER */}
        <div className="flex flex-col items-center justify-center text-center px-2 py-0.5">
          <div className="flex items-center gap-1.5">
            <span className="bg-zinc-900/90 border border-amber-500/40 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-arcade text-amber-300 tracking-wider uppercase font-bold drop-shadow-[0_2px_8px_rgba(245,158,11,0.3)] flex items-center gap-1.5">
              <span>{level.theme === 'castle' ? '🏰' : level.theme === 'underground' ? '💎' : '🌲'}</span>
              <span>{level.name}</span>
            </span>
          </div>
          
          {/* Co-op Synergy Pulse Status */}
          {hasBubble ? (
            <div className="my-0.5 px-2 py-0.5 bg-cyan-950 border border-cyan-400 text-cyan-300 text-[8px] font-arcade rounded-full animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.5)]">
              🫧 S.O.S. POP BUBBLE TO REVIVE
            </div>
          ) : isHeadBoost ? (
            <div className="my-0.5 px-2 py-0.5 bg-amber-950 border border-amber-400 text-amber-300 text-[8px] font-arcade rounded-full animate-bounce shadow-[0_0_10px_rgba(251,191,36,0.5)]">
              ⚡ HEAD BOUNCE BOOST READY!
            </div>
          ) : isClose ? (
            <div className="my-0.5 px-2 py-0.5 bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-[8px] font-arcade rounded-full">
              🤝 BROS IN SYNERGY
            </div>
          ) : (
            /* Star Coins Collection Slots */
            <div className="flex items-center gap-2.5 my-1" title="3 Star Coins Hidden in this World">
              {[0, 1, 2].map((idx) => {
                const isFound = idx < collectedStarCoins;
                return (
                  <div
                    key={idx}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                      isFound
                        ? 'border-amber-300 bg-gradient-to-tr from-amber-600 to-amber-400 text-zinc-950 shadow-[0_0_12px_rgba(251,191,36,0.9)] scale-110 coin-shine'
                        : 'border-zinc-700/80 bg-zinc-900/90 text-zinc-600'
                    }`}
                    title={`Star Coin ${idx + 1}`}
                  >
                    ★
                  </div>
                );
              })}
            </div>
          )}

          {/* Time Limit Badge */}
          <div className="flex items-center gap-1.5 font-arcade text-[9px] sm:text-[10px]">
            <span
              className={`px-2 py-0.5 rounded-full flex items-center gap-1 border transition-all ${
                timeLeft < 60
                  ? 'bg-red-950/90 text-red-300 border-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                  : 'bg-zinc-900/80 text-zinc-300 border-zinc-800'
              }`}
            >
              <Clock size={11} className={timeLeft < 60 ? 'text-red-400' : 'text-zinc-400'} />
              <span>TIME {timeLeft}</span>
            </span>
          </div>
        </div>

        {/* LUIGI (Player 2) PERSONNEL ARCADE POD */}
        <div className={`flex items-center gap-2.5 bg-gradient-to-l from-emerald-950/80 via-zinc-900/90 to-zinc-900/70 border-2 ${
          luigi.inBubble 
            ? 'border-cyan-400/90 shadow-[0_0_20px_rgba(34,211,238,0.5)]' 
            : luigi.power === 'star'
            ? 'border-amber-400/90 shadow-[0_0_20px_rgba(251,191,36,0.6)] animate-pulse'
            : luigi.power === 'fire'
            ? 'border-orange-500/90 shadow-[0_0_15px_rgba(249,115,22,0.4)]'
            : 'border-emerald-600/80 shadow-[0_0_14px_rgba(16,185,129,0.3)]'
        } rounded-2xl px-3 py-1.5 transition-all duration-300 relative overflow-hidden group`}>
          
          {/* Stats Column */}
          <div className="min-w-[110px] text-right">
            <div className="flex items-center justify-between gap-1 flex-row-reverse">
              <div className="flex items-center gap-1.5 flex-row-reverse">
                <span className="font-arcade text-[11px] text-emerald-400 tracking-wider font-bold">LUIGI</span>
                {luigi.isFluttering ? (
                  <span className="text-[7px] font-mono bg-cyan-950 text-cyan-300 px-1 rounded animate-pulse">FLUTTER</span>
                ) : luigi.isCrouching ? (
                  <span className="text-[7px] font-mono bg-zinc-800 text-zinc-400 px-1 rounded">DUCK</span>
                ) : !luigi.isGrounded ? (
                  <span className="text-[7px] font-mono bg-emerald-950 text-emerald-300 px-1 rounded">AIR</span>
                ) : null}
              </div>
              
              {/* Hearts Health Meter */}
              <div className="flex items-center gap-1" title={`${luigi.lives} / 3 Hearts`}>
                {[0, 1, 2].map((idx) => {
                  const isAlive = idx < luigi.lives;
                  return isAlive ? (
                    <Heart
                      key={idx}
                      size={12}
                      className={`text-emerald-500 fill-emerald-500 transition-all duration-300 ${
                        isLuigiCritical ? 'heart-critical' : 'drop-shadow-[0_0_6px_rgba(16,185,129,0.9)]'
                      }`}
                    />
                  ) : (
                    <Heart
                      key={idx}
                      size={12}
                      className="text-zinc-700/40 fill-transparent scale-75 opacity-25"
                    />
                  );
                })}
              </div>
            </div>

            {/* Score, Coins & Power Status */}
            <div className="flex items-center justify-end gap-2 font-arcade text-[10px] mt-1">
              {luigi.power === 'fire' ? (
                <span className="text-[7px] uppercase px-1.5 py-0.5 rounded bg-orange-600/90 text-white font-bold border border-orange-400/50 flex items-center gap-0.5">
                  <Flame size={8} /> FIRE
                </span>
              ) : luigi.power === 'super' ? (
                <span className="text-[7px] uppercase px-1.5 py-0.5 rounded bg-emerald-600/90 text-white font-bold border border-emerald-400/50">
                  SUPER
                </span>
              ) : luigi.power === 'star' ? (
                <span className="text-[7px] uppercase px-1.5 py-0.5 rounded bg-amber-500 text-zinc-950 font-bold border border-amber-300">
                  ★ STAR
                </span>
              ) : null}
              <span className="text-zinc-100 font-mono text-xs tracking-wider">{luigi.score.toString().padStart(6, '0')}</span>
              <span className="text-amber-400 flex items-center gap-1">
                <span className="inline-block w-3 h-3 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 border border-amber-200 text-[8px] text-amber-950 font-bold text-center leading-tight shadow-sm coin-shine">
                  🪙
                </span>
                {luigi.coins}
              </span>
            </div>
          </div>

          {/* Avatar Icon */}
          <div className="relative">
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-b from-emerald-500 via-emerald-600 to-emerald-700 border-2 border-white flex flex-col items-center justify-center font-arcade text-white shadow-lg ${
              luigi.power === 'star' ? 'animate-bounce border-amber-300' : ''
            }`}>
              <span className="text-base font-black leading-none drop-shadow">L</span>
              <span className="text-[7px] tracking-tighter opacity-90 font-bold">2P</span>
            </div>
            
            {/* Status Badges */}
            {luigi.inBubble ? (
              <span className="absolute -top-2 -left-2 bg-cyan-400 text-zinc-950 text-[7px] font-bold rounded-full px-1.5 py-0.5 animate-pulse border border-white shadow">
                BUBBLE
              </span>
            ) : luigi.power === 'star' ? (
              <span className="absolute -top-2 -left-2 bg-amber-400 text-zinc-950 text-[8px] font-bold rounded-full px-1 animate-spin shadow">
                ★
              </span>
            ) : luigi.power === 'fire' ? (
              <span className="absolute -top-1.5 -left-2 bg-orange-500 text-white text-[7px] font-bold rounded-full p-0.5 border border-white shadow">
                <Flame size={10} />
              </span>
            ) : null}
          </div>
        </div>

        {/* TOOLBAR CONTROLS */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {onToggleCrt && (
            <button
              onClick={onToggleCrt}
              className={`p-2 rounded-xl border transition-all ${
                crtEnabled
                  ? 'bg-amber-500/25 border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                  : 'bg-zinc-900/90 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
              }`}
              title={crtEnabled ? 'Disable CRT Scanlines' : 'Enable CRT Scanlines'}
            >
              <Tv size={15} />
            </button>
          )}

          {onToggleGamepad && (
            <button
              onClick={onToggleGamepad}
              className={`p-2 rounded-xl border transition-all ${
                gamepadVisible
                  ? 'bg-cyan-500/25 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.3)]'
                  : 'bg-zinc-900/90 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
              }`}
              title={gamepadVisible ? 'Hide On-Screen Controls' : 'Show On-Screen Controls'}
            >
              <Gamepad2 size={15} />
            </button>
          )}

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-colors hidden sm:flex"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>

          <button
            onClick={onToggleSound}
            className="p-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-colors"
            title={soundEnabled ? 'Mute SFX' : 'Unmute SFX'}
            id="btn_toggle_sound"
          >
            {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} className="text-red-400" />}
          </button>
          
          <button
            onClick={onToggleMusic}
            className="p-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-colors"
            title={musicEnabled ? 'Mute Music' : 'Unmute Music'}
            id="btn_toggle_music"
          >
            <Music size={15} className={musicEnabled ? 'text-green-400' : 'text-zinc-500'} />
          </button>

          <button
            onClick={onToggleHelp}
            className="p-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-colors"
            title="Keyboard & Co-op Guide"
            id="btn_toggle_help"
          >
            <HelpCircle size={15} />
          </button>

          <button
            onClick={onRestart}
            className="p-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-colors"
            title="Restart Stage"
            id="btn_restart_stage"
          >
            <RotateCcw size={15} />
          </button>

          <button
            onClick={onPause}
            className="px-2.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-zinc-950 font-bold transition-all shadow-md active:scale-95 flex items-center gap-1"
            title="Pause Game (Esc)"
            id="btn_pause_game"
          >
            <Pause size={15} />
            <span className="text-[10px] font-arcade hidden md:inline">PAUSE</span>
          </button>
        </div>

      </div>
    </header>
  );
};
