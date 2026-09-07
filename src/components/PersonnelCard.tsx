import React, { useState, useEffect, useRef } from 'react';
import { PlayerId, PowerState, PlayerControls } from '../types';
import { SpriteRenderer } from '../game/sprites';
import { sound } from '../audio/soundEngine';
import { 
  Sparkles, 
  Volume2, 
  Flame, 
  Star, 
  Shield, 
  Wind, 
  Footprints, 
  Zap, 
  Sliders, 
  Info
} from 'lucide-react';

interface PersonnelCardProps {
  character: PlayerId;
  controls: PlayerControls;
  onOpenControls?: () => void;
  compact?: boolean;
}

export const PersonnelCard: React.FC<PersonnelCardProps> = ({
  character,
  controls,
  onOpenControls,
  compact = false,
}) => {
  const isMario = character === 'mario';
  const [selectedPower, setSelectedPower] = useState<PowerState | 'star'>('small');
  const [isJumping, setIsJumping] = useState(false);
  const [activeTab, setActiveTab] = useState<'stats' | 'abilities' | 'keys'>('stats');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number | null>(null);
  const tickRef = useRef<number>(0);

  // Sound test handler
  const handleTestSound = () => {
    sound.unlockAudio();
    if (selectedPower === 'fire') {
      sound.playFireball();
    } else if (selectedPower === 'star') {
      sound.playStarCoin();
    } else if (selectedPower === 'super') {
      sound.playPowerup();
    } else {
      sound.playJump(character);
    }

    // Trigger visual jump hop in canvas
    setIsJumping(true);
    setTimeout(() => setIsJumping(false), 600);
  };

  // Canvas animation loop rendering authentic in-game pixel art
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let running = true;

    const render = () => {
      if (!running) return;
      tickRef.current += 1;
      const tick = tickRef.current;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background subtle stage pedestal shadow
      ctx.save();
      ctx.fillStyle = isMario ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)';
      ctx.beginPath();
      ctx.ellipse(canvas.width / 2, canvas.height - 12, 32, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      const isSuper = selectedPower !== 'small';
      const pWidth = 16;
      const pHeight = isSuper ? 32 : 16;

      // Vertical position calculation (jumping or standing)
      let drawY = canvas.height - pHeight - 14;
      if (isJumping) {
        const jumpProgress = Math.sin((tick % 30) / 30 * Math.PI);
        drawY -= jumpProgress * 18;
      }

      // Mock Player object for SpriteRenderer
      const mockPlayer = {
        id: character,
        name: isMario ? 'Mario' : 'Luigi',
        x: (canvas.width - pWidth) / 2,
        y: drawY,
        vx: 1.5,
        vy: isJumping ? -3 : 0,
        width: pWidth,
        height: pHeight,
        isGrounded: !isJumping,
        facing: 'right' as const,
        power: (selectedPower === 'star' ? 'super' : selectedPower) as PowerState,
        starTimer: selectedPower === 'star' ? 100 : 0,
        isCrouching: false,
        isInvulnerable: false,
        invulnerableTimer: 0,
        inBubble: false,
        bubbleFloatingY: 0,
        lives: 3,
        maxLives: 3,
        coins: 0,
        score: 0,
        walkFrame: Math.floor(tick * 0.3),
        isFluttering: !isMario && isJumping,
        flutterTimer: 0,
        headSquishTimer: 0,
        carryingShellId: null,
        reachedFlag: false,
      };

      SpriteRenderer.renderPlayer(ctx, mockPlayer, tick);

      animRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      running = false;
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [character, selectedPower, isJumping, isMario]);

  const formatKey = (key: string) => {
    return key
      .replace('Key', '')
      .replace('Arrow', '')
      .replace('Digit', '')
      .toUpperCase();
  };

  return (
    <div
      className={`rounded-2xl border-2 transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
        isMario
          ? 'bg-gradient-to-br from-red-950/70 via-zinc-900/90 to-zinc-950 border-red-600/70 shadow-[0_0_25px_rgba(239,68,68,0.2)] hover:border-red-500'
          : 'bg-gradient-to-br from-emerald-950/70 via-zinc-900/90 to-zinc-950 border-emerald-600/70 shadow-[0_0_25px_rgba(16,185,129,0.2)] hover:border-emerald-500'
      } p-3 sm:p-4`}
    >
      {/* Top Header: Badge & Role */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-3">
          {/* Character Live Canvas Preview Pod */}
          <div 
            onClick={handleTestSound}
            title="Click to Test Voice / Jump!"
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 flex flex-col items-center justify-center relative cursor-pointer group shadow-inner transition-transform active:scale-95 ${
              isMario
                ? 'bg-gradient-to-b from-red-950/90 to-black border-red-500/80 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                : 'bg-gradient-to-b from-emerald-950/90 to-black border-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
            }`}
          >
            <canvas
              ref={canvasRef}
              width={80}
              height={80}
              className="w-full h-full object-contain pointer-events-none"
            />
            
            <div className="absolute bottom-1 right-1 bg-black/70 text-zinc-300 p-0.5 rounded-md text-[8px] opacity-70 group-hover:opacity-100 flex items-center gap-0.5">
              <Volume2 size={9} />
            </div>

            <span className={`absolute -top-1.5 -left-1.5 text-[8px] font-arcade px-1.5 py-0.5 rounded-full font-bold border ${
              isMario ? 'bg-red-600 border-red-400 text-white' : 'bg-emerald-600 border-emerald-400 text-white'
            }`}>
              {isMario ? '1P' : '2P'}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h2 className={`font-arcade text-sm sm:text-base font-bold tracking-wider ${
                isMario ? 'text-red-400' : 'text-emerald-400'
              }`}>
                {isMario ? 'MARIO' : 'LUIGI'}
              </h2>
              <span className="text-[10px] text-zinc-500 font-mono font-medium">
                {isMario ? 'マリオ' : 'ルイージ'}
              </span>
            </div>

            <div className="text-[11px] font-ui text-zinc-300 font-semibold leading-tight">
              {isMario ? 'Chief Vanguard • Ground Striker' : 'Aerial Recon • High Flutterer'}
            </div>

            <div className="flex items-center gap-1.5 mt-1">
              <span className={`text-[8px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                isMario 
                  ? 'bg-red-950 text-red-300 border-red-800'
                  : 'bg-emerald-950 text-emerald-300 border-emerald-800'
              }`}>
                {isMario ? 'LEFT KEYBOARD ZONE' : 'RIGHT KEYBOARD ZONE'}
              </span>
            </div>
          </div>
        </div>

        {/* Interactive Power-up Wardrobe Buttons */}
        <div className="flex flex-col items-end gap-1">
          <span className="text-[8px] font-arcade text-zinc-400 tracking-wider">WARDROBE</span>
          <div className="flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => setSelectedPower('small')}
              title="Small Mario/Luigi"
              className={`w-6 h-6 rounded-lg text-xs flex items-center justify-center transition-all ${
                selectedPower === 'small'
                  ? 'bg-amber-500 text-zinc-950 font-bold shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              🌱
            </button>
            <button
              onClick={() => setSelectedPower('super')}
              title="Super Mushroom Power"
              className={`w-6 h-6 rounded-lg text-xs flex items-center justify-center transition-all ${
                selectedPower === 'super'
                  ? 'bg-red-500 text-white font-bold shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              🍄
            </button>
            <button
              onClick={() => setSelectedPower('fire')}
              title="Fire Flower Power"
              className={`w-6 h-6 rounded-lg text-xs flex items-center justify-center transition-all ${
                selectedPower === 'fire'
                  ? 'bg-orange-500 text-white font-bold shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Flame size={12} />
            </button>
            <button
              onClick={() => setSelectedPower('star')}
              title="Super Star Invincibility"
              className={`w-6 h-6 rounded-lg text-xs flex items-center justify-center transition-all ${
                selectedPower === 'star'
                  ? 'bg-yellow-400 text-zinc-950 font-bold shadow animate-pulse'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Star size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-tabs inside Personnel Card */}
      <div className="flex items-center gap-1 bg-zinc-950/80 p-1 rounded-xl border border-zinc-800/80 mb-2.5">
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex-1 py-1 rounded-lg text-[9px] font-arcade transition-all cursor-pointer ${
            activeTab === 'stats'
              ? isMario
                ? 'bg-red-600 text-white font-bold shadow'
                : 'bg-emerald-600 text-white font-bold shadow'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          GAUGES
        </button>
        <button
          onClick={() => setActiveTab('abilities')}
          className={`flex-1 py-1 rounded-lg text-[9px] font-arcade transition-all cursor-pointer ${
            activeTab === 'abilities'
              ? isMario
                ? 'bg-red-600 text-white font-bold shadow'
                : 'bg-emerald-600 text-white font-bold shadow'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          SKILLS
        </button>
        <button
          onClick={() => setActiveTab('keys')}
          className={`flex-1 py-1 rounded-lg text-[9px] font-arcade transition-all cursor-pointer ${
            activeTab === 'keys'
              ? isMario
                ? 'bg-red-600 text-white font-bold shadow'
                : 'bg-emerald-600 text-white font-bold shadow'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          INPUTS
        </button>
      </div>

      {/* Content for TAB 1: RETRO ARCADE STAT GAUGES */}
      {activeTab === 'stats' && (
        <div className="space-y-2 bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/70 mb-3">
          {/* Gauge 1: Ground Traction */}
          <div>
            <div className="flex justify-between text-[10px] mb-1">
              <span className="text-zinc-400 flex items-center gap-1">
                <Footprints size={11} className={isMario ? 'text-red-400' : 'text-emerald-400'} />
                Ground Grip &amp; Traction
              </span>
              <span className="font-mono text-zinc-300 font-bold">
                {isMario ? '96% (Snappy Turn)' : '72% (Ice Slide Drift)'}
              </span>
            </div>
            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${isMario ? 'bg-red-500' : 'bg-emerald-500'}`}
                style={{ width: isMario ? '96%' : '72%' }}
              />
            </div>
          </div>

          {/* Gauge 2: Jump Height & Float */}
          <div>
            <div className="flex justify-between text-[10px] mb-1">
              <span className="text-zinc-400 flex items-center gap-1">
                <Wind size={11} className={isMario ? 'text-amber-400' : 'text-cyan-400'} />
                Jump Apex &amp; Airtime
              </span>
              <span className="font-mono text-zinc-300 font-bold">
                {isMario ? '82% (Balanced Arc)' : '98% (Flutter Float)'}
              </span>
            </div>
            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${isMario ? 'bg-amber-500' : 'bg-cyan-400'}`}
                style={{ width: isMario ? '82%' : '98%' }}
              />
            </div>
          </div>

          {/* Gauge 3: Sprint Acceleration */}
          <div>
            <div className="flex justify-between text-[10px] mb-1">
              <span className="text-zinc-400 flex items-center gap-1">
                <Zap size={11} className={isMario ? 'text-orange-400' : 'text-emerald-400'} />
                Sprint Acceleration
              </span>
              <span className="font-mono text-zinc-300 font-bold">
                {isMario ? '90% (Instant Dash)' : '85% (Momentum)'}
              </span>
            </div>
            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${isMario ? 'bg-orange-500' : 'bg-emerald-400'}`}
                style={{ width: isMario ? '90%' : '85%' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Content for TAB 2: SIGNATURE COMBAT & CO-OP MOVES */}
      {activeTab === 'abilities' && (
        <div className="space-y-1.5 bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/70 mb-3 text-[11px] font-ui">
          {isMario ? (
            <>
              <div className="flex items-start gap-2">
                <span className="text-red-400 font-bold font-mono">▸ Wall Slide:</span>
                <span className="text-zinc-300">Jump against vertical pipes or blocks and tap Jump to rebound!</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-amber-400 font-bold font-mono">▸ Heavy Stomp:</span>
                <span className="text-zinc-300">Crushes Goombas and Koopa shells with rapid downward velocity.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-400 font-bold font-mono">▸ Fire Ball:</span>
                <span className="text-zinc-300">Throws bouncing fire projectiles that defeat Piranhas and Bowser!</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold font-mono">▸ Flutter Jump:</span>
                <span className="text-zinc-300">Hold Jump in mid-air to flutter legs for extra floating hangtime!</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold font-mono">▸ High Vault:</span>
                <span className="text-zinc-300">Reaches high elevated pipes and secret star coin platforms with ease.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-teal-400 font-bold font-mono">▸ Bubble Rescue:</span>
                <span className="text-zinc-300">Glides across chasms quickly to pop Mario out of rescue bubbles.</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Content for TAB 3: KEYBOARD MAPPING */}
      {activeTab === 'keys' && (
        <div className="bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/70 mb-3">
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="flex items-center justify-between bg-zinc-900/80 p-1.5 rounded-lg">
              <span className="text-zinc-400">JUMP</span>
              <span className={`keycap ${isMario ? 'keycap-red' : 'keycap-green'} px-2 py-0.5 font-bold`}>
                {formatKey(controls.up)}
              </span>
            </div>
            <div className="flex items-center justify-between bg-zinc-900/80 p-1.5 rounded-lg">
              <span className="text-zinc-400">FIRE / RUN</span>
              <span className={`keycap ${isMario ? 'keycap-red' : 'keycap-green'} px-2 py-0.5 font-bold`}>
                {formatKey(controls.action)}
              </span>
            </div>
            <div className="flex items-center justify-between bg-zinc-900/80 p-1.5 rounded-lg">
              <span className="text-zinc-400">LEFT</span>
              <span className={`keycap ${isMario ? 'keycap-red' : 'keycap-green'} px-1.5 py-0.5 font-bold`}>
                {formatKey(controls.left)}
              </span>
            </div>
            <div className="flex items-center justify-between bg-zinc-900/80 p-1.5 rounded-lg">
              <span className="text-zinc-400">RIGHT</span>
              <span className={`keycap ${isMario ? 'keycap-red' : 'keycap-green'} px-1.5 py-0.5 font-bold`}>
                {formatKey(controls.right)}
              </span>
            </div>
          </div>

          {onOpenControls && (
            <button
              onClick={onOpenControls}
              className="w-full mt-2 py-1 px-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-[9px] font-arcade text-zinc-300 flex items-center justify-center gap-1 border border-zinc-800 cursor-pointer"
            >
              <Sliders size={11} /> REBIND CONTROLS
            </button>
          )}
        </div>
      )}

      {/* Bottom Footer: Quick Interactive Sound Trigger Button */}
      <button
        onClick={handleTestSound}
        className={`w-full py-1.5 px-3 rounded-xl font-arcade text-[10px] flex items-center justify-center gap-2 border transition-all cursor-pointer ${
          isMario
            ? 'bg-red-950/60 hover:bg-red-900/80 border-red-700/60 text-red-200'
            : 'bg-emerald-950/60 hover:bg-emerald-900/80 border-emerald-700/60 text-emerald-200'
        }`}
      >
        <Volume2 size={13} className="animate-pulse" />
        <span>TEST {isMario ? 'MARIO' : 'LUIGI'} SFX</span>
      </button>
    </div>
  );
};
