export type PlayerId = 'mario' | 'luigi';
export type PowerState = 'small' | 'super' | 'fire';

export interface PlayerControls {
  left: string;
  right: string;
  up: string; // Jump
  down: string; // Crouch / Down pipe
  action: string; // Run / Fireball / Grab shell
}

export interface Player {
  id: PlayerId;
  name: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  isGrounded: boolean;
  facing: 'left' | 'right';
  power: PowerState;
  starTimer: number; // Invincibility frames from star
  isCrouching: boolean;
  isInvulnerable: boolean;
  invulnerableTimer: number;
  inBubble: boolean; // Rescue bubble when defeated in co-op
  bubbleFloatingY: number;
  lives: number; // Current hearts/health (0 to 3)
  maxLives: number; // Max hearts (3)
  coins: number;
  score: number;
  walkFrame: number;
  isFluttering: boolean; // Luigi special flutter jump
  flutterTimer: number;
  headSquishTimer: number; // When buddy bounces on head
  carryingShellId: string | null;
  reachedFlag: boolean;
}

export type EnemyType = 'goomba' | 'koopa' | 'piranha' | 'bowser';

export interface Enemy {
  id: string;
  type: EnemyType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  facing: 'left' | 'right';
  isGrounded: boolean;
  isShell?: boolean; // For koopa
  isShellMoving?: boolean;
  isDead: boolean;
  deadTimer: number;
  hp?: number; // Bowser boss HP (3)
  attackTimer?: number;
  pipeOriginY?: number; // For piranha emergence
  pipeOffset?: number;
}

export type BlockType =
  | 'ground'
  | 'brick'
  | 'question'
  | 'empty'
  | 'hard'
  | 'pipe'
  | 'pipeTop'
  | 'cloud'
  | 'switch'
  | 'gate'
  | 'flagpole'
  | 'castle'
  | 'lava';

export type ItemType = 'coin' | 'mushroom' | 'fireflower' | 'star' | 'starCoin' | '1up';

export interface Block {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: BlockType;
  contents?: 'coin' | 'mushroom' | 'fireflower' | 'star' | 'none';
  isHit?: boolean;
  bumpOffset?: number;
  switchPressed?: boolean;
  switchRequiredPlayers?: 1 | 2; // 2 requires both brothers!
  switchTimer?: number;
  linkedGateId?: string;
  gateOpen?: boolean;
  gateHeight?: number;
  colorTheme?: 'overworld' | 'underground' | 'castle';
}

export interface Item {
  id: string;
  type: ItemType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  isCollected: boolean;
  isSpawning?: boolean;
  spawnProgress?: number;
  starCoinIndex?: number;
}

export interface Fireball {
  id: string;
  owner: 'mario' | 'luigi' | 'bowser';
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  bounces: number;
  isDead: boolean;
}

export interface Particle {
  id: string;
  type: 'sparkle' | 'smoke' | 'brickChunk' | 'scoreText' | 'bubblePop' | 'fireSparks';
  x: number;
  y: number;
  vx: number;
  vy: number;
  text?: string;
  color?: string;
  life: number;
  maxLife: number;
  size?: number;
}

export interface LevelData {
  id: number;
  name: string;
  subtitle: string;
  theme: 'overworld' | 'underground' | 'castle';
  skyColor: string;
  width: number;
  height: number;
  timeLimit: number;
  blocks: Block[];
  enemies: Enemy[];
  items: Item[];
  marioStart: { x: number; y: number };
  luigiStart: { x: number; y: number };
  flagX: number;
  starCoinsTotal: number;
}

export type GameStatus =
  | 'menu'
  | 'playing'
  | 'paused'
  | 'levelClear'
  | 'gameOver'
  | 'victory';
