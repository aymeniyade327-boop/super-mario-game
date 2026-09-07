import { PlayerControls } from '../types';

export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 480;
export const TILE_SIZE = 32;

export const PHYSICS = {
  GRAVITY: 0.52,
  MAX_FALL_SPEED: 11,
  
  // Mario properties: Balanced, responsive, classic traction
  MARIO: {
    ACCEL: 0.45,
    FRICTION: 0.82,
    MAX_WALK_SPEED: 3.5,
    MAX_RUN_SPEED: 5.2,
    JUMP_POWER: -10.8,
  },

  // Luigi properties: Higher jump, flutter kick, floaty slide!
  LUIGI: {
    ACCEL: 0.38,
    FRICTION: 0.91, // Slippery slide
    MAX_WALK_SPEED: 3.7,
    MAX_RUN_SPEED: 5.5,
    JUMP_POWER: -11.8, // Jumps noticeably higher
    FLUTTER_EXTRA: -0.22,
  },

  BUDDY_BOUNCE_IMPULSE: -14.8, // Jumping on brother's head sends you soaring!
  STOMP_BOUNCE: -8.0,
  SHELL_SPEED: 6.5,
  FIREBALL_SPEED: 6.0,
  FIREBALL_BOUNCE: -4.5,
};

export const DEFAULT_CONTROLS: { mario: PlayerControls; luigi: PlayerControls } = {
  mario: {
    left: 'KeyA',
    right: 'KeyD',
    up: 'KeyW',
    down: 'KeyS',
    action: 'KeyF', // F or Space
  },
  luigi: {
    left: 'ArrowLeft',
    right: 'ArrowRight',
    up: 'ArrowUp',
    down: 'ArrowDown',
    action: 'Enter', // Enter or Shift
  },
};
