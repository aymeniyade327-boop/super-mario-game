import React, { useRef, useEffect } from 'react';
import { GameEngine } from '../game/engine';
import { SpriteRenderer } from '../game/sprites';
import { GAME_WIDTH, GAME_HEIGHT } from '../game/constants';

interface GameCanvasProps {
  engine: GameEngine;
  isPaused: boolean;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ engine, isPaused }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let animFrameId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Update engine if not paused
      if (!isPaused) {
        engine.update();
      }

      // Clear Canvas with level sky color
      ctx.fillStyle = engine.level.skyColor;
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      ctx.save();
      // Apply Camera Offset
      const camX = Math.round(engine.cameraX);
      ctx.translate(-camX, 0);

      // 1. Render Background Decorations (Hills, Clouds, Castle Arches)
      renderBackgroundScenery(ctx, engine, camX);

      // 2. Render Blocks & World
      for (const block of engine.level.blocks) {
        // Culling: only draw if within visible camera bounds
        if (block.x + block.width >= camX && block.x <= camX + GAME_WIDTH) {
          SpriteRenderer.renderBlock(ctx, block, engine.tick);
        }
      }

      // 3. Render Items
      for (const item of engine.level.items) {
        if (!item.isCollected && item.x + item.width >= camX && item.x <= camX + GAME_WIDTH) {
          SpriteRenderer.renderItem(ctx, item, engine.tick);
        }
      }

      // 4. Render Enemies
      for (const enemy of engine.level.enemies) {
        if (enemy.x + enemy.width >= camX - 40 && enemy.x <= camX + GAME_WIDTH + 40) {
          SpriteRenderer.renderEnemy(ctx, enemy, engine.tick);
        }
      }

      // 5. Render Fireballs
      for (const fb of engine.fireballs) {
        SpriteRenderer.renderFireball(ctx, fb, engine.tick);
      }

      // 6. Render Players (Draw Luigi, then Mario)
      SpriteRenderer.renderPlayer(ctx, engine.luigi, engine.tick);
      SpriteRenderer.renderPlayer(ctx, engine.mario, engine.tick);

      // 7. Render Particles & Floating Scores
      for (const particle of engine.particles) {
        SpriteRenderer.renderParticle(ctx, particle);
      }

      ctx.restore();

      // 8. Render Offscreen Brother HUD indicators (if one player is far ahead/behind)
      renderOffscreenPointers(ctx, engine, camX);

      // 9. Render Boss Encounter HUD Bar (When Bowser is near)
      renderBossHUD(ctx, engine, camX);

      // 10. Render Pipe Monster Warning Alerts
      renderPipeWarnings(ctx, engine, camX);

      animFrameId = requestAnimationFrame(render);
    };

    animFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [engine, isPaused]);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden p-1">
      <canvas
        ref={canvasRef}
        width={GAME_WIDTH}
        height={GAME_HEIGHT}
        className="max-w-full max-h-full aspect-[5/3] shadow-2xl border-2 border-zinc-800 rounded-lg object-contain bg-zinc-950"
      />
    </div>
  );
};

// Render parallax background clouds / mountains / castle torches
function renderBackgroundScenery(
  ctx: CanvasRenderingContext2D,
  engine: GameEngine,
  camX: number
) {
  const theme = engine.level.theme;

  if (theme === 'overworld') {
    // Distant Green Hills
    ctx.fillStyle = '#15803D';
    for (let i = 0; i < 20; i++) {
      const hillX = i * 280 - (camX * 0.3) % 280;
      ctx.beginPath();
      ctx.arc(hillX + 140, GAME_HEIGHT - 30, 90, Math.PI, 0);
      ctx.fill();
    }

    // Fluffy Background Clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    for (let i = 0; i < 15; i++) {
      const cloudX = i * 320 - (camX * 0.15) % 320;
      const cloudY = 60 + (i % 3) * 40;
      ctx.beginPath();
      ctx.arc(cloudX, cloudY, 20, 0, Math.PI * 2);
      ctx.arc(cloudX + 24, cloudY - 8, 26, 0, Math.PI * 2);
      ctx.arc(cloudX + 50, cloudY, 18, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (theme === 'underground') {
    // Glowing stalactites & crystals
    ctx.fillStyle = '#1E3A8A';
    for (let i = 0; i < 30; i++) {
      const stalX = i * 140;
      ctx.beginPath();
      ctx.moveTo(stalX, 32);
      ctx.lineTo(stalX + 20, 32);
      ctx.lineTo(stalX + 10, 80 + (i % 4) * 20);
      ctx.fill();
    }
  } else if (theme === 'castle') {
    // Fiery castle pillars & torches
    ctx.fillStyle = '#27272A';
    for (let i = 0; i < 20; i++) {
      const archX = i * 240;
      ctx.fillRect(archX, 32, 24, GAME_HEIGHT - 64);

      // Flickering torch
      const flameFlicker = Math.sin(engine.tick * 0.3 + i) * 3;
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.arc(archX + 12, 140, 6 + flameFlicker, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.arc(archX + 12, 140, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#27272A';
    }
  }
}

// Draw indicator arrows at screen edge if a brother is offscreen
function renderOffscreenPointers(
  ctx: CanvasRenderingContext2D,
  engine: GameEngine,
  camX: number
) {
  const players = [engine.mario, engine.luigi];

  players.forEach((p) => {
    const screenX = p.x - camX;
    const isOffLeft = screenX < 0;
    const isOffRight = screenX > GAME_WIDTH - p.width;

    if (isOffLeft || isOffRight) {
      const isMario = p.id === 'mario';
      const pointerX = isOffLeft ? 24 : GAME_WIDTH - 24;
      const pointerY = Math.max(30, Math.min(p.y, GAME_HEIGHT - 40));

      ctx.save();
      // Circular badge
      ctx.fillStyle = isMario ? '#E52521' : '#00A800';
      ctx.beginPath();
      ctx.arc(pointerX, pointerY, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Letter
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 10px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(isMario ? 'M' : 'L', pointerX, pointerY);

      // Indicator Arrow
      ctx.fillStyle = isMario ? '#E52521' : '#00A800';
      ctx.beginPath();
      if (isOffLeft) {
        ctx.moveTo(pointerX - 18, pointerY);
        ctx.lineTo(pointerX - 10, pointerY - 6);
        ctx.lineTo(pointerX - 10, pointerY + 6);
      } else {
        ctx.moveTo(pointerX + 18, pointerY);
        ctx.lineTo(pointerX + 10, pointerY - 6);
        ctx.lineTo(pointerX + 10, pointerY + 6);
      }
      ctx.fill();

      ctx.restore();
    }
  });
}

// Top-screen Arcade Boss Health Bar UI when facing Bowser
function renderBossHUD(
  ctx: CanvasRenderingContext2D,
  engine: GameEngine,
  camX: number
) {
  const bowser = engine.level.enemies.find((e) => e.type === 'bowser');
  if (!bowser || bowser.isDead) return;

  const isNearBoss = bowser.x - camX <= GAME_WIDTH + 100;
  if (!isNearBoss) return;

  const barW = 280;
  const barH = 26;
  const barX = Math.round((GAME_WIDTH - barW) / 2);
  const barY = 10;
  const hp = bowser.hp ?? 3;

  ctx.save();

  // Dark Arcade Boss Header Frame with Gold Border
  ctx.fillStyle = 'rgba(15, 15, 20, 0.94)';
  ctx.beginPath();
  ctx.roundRect(barX, barY, barW, barH, 6);
  ctx.fill();

  ctx.strokeStyle = hp === 1 ? '#EF4444' : '#F59E0B';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Boss Crown & Name
  ctx.font = 'bold 8px "Press Start 2P", monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#FACC15';
  ctx.fillText('👑 BOWSER', barX + 10, barY + barH / 2);

  // Boss HP Hearts on Right
  const heartStartX = barX + barW - 85;
  for (let i = 0; i < 3; i++) {
    const isAlive = i < hp;
    const hx = heartStartX + i * 25;

    ctx.fillStyle = isAlive ? 'rgba(220, 38, 38, 0.25)' : 'rgba(255, 255, 255, 0.05)';
    ctx.beginPath();
    ctx.roundRect(hx, barY + 4, 21, 18, 4);
    ctx.fill();
    ctx.strokeStyle = isAlive ? '#DC2626' : 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = isAlive ? '#EF4444' : '#475569';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(isAlive ? '♥' : '♡', hx + 10, barY + barH / 2);
  }

  ctx.restore();
}

// Pipe emergence warning indicator for Piranha Plants
function renderPipeWarnings(
  ctx: CanvasRenderingContext2D,
  engine: GameEngine,
  camX: number
) {
  const piranhas = engine.level.enemies.filter(
    (e) => e.type === 'piranha' && !e.isDead
  );

  piranhas.forEach((p) => {
    const screenX = p.x - camX;
    if (screenX >= -20 && screenX <= GAME_WIDTH + 20) {
      const isEmerging = p.vy < 0 || (p.pipeOffset && p.pipeOffset < 15);
      if (isEmerging) {
        ctx.save();
        const warnY = (p.pipeOriginY ?? p.y) - 14 + Math.sin(engine.tick * 0.3) * 2;
        ctx.fillStyle = '#EF4444';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('⚠️', screenX + p.width / 2, warnY);
        ctx.restore();
      }
    }
  });
}

