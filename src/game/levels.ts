import { LevelData, Block, Enemy, Item } from '../types';
import { TILE_SIZE } from './constants';

export function getLevels(): LevelData[] {
  return [
    createLevel1(),
    createLevel2(),
    createLevel3(),
  ];
}

// ----------------------------------------------------
// LEVEL 1: MUSHROOM MEADOWS
// ----------------------------------------------------
function createLevel1(): LevelData {
  const blocks: Block[] = [];
  const enemies: Enemy[] = [];
  const items: Item[] = [];

  const width = 110 * TILE_SIZE; // 3520px wide
  const height = 15 * TILE_SIZE; // 480px high
  const groundY = 13 * TILE_SIZE;

  // 1. Base Ground with Pits
  for (let col = 0; col < 110; col++) {
    // Pit at col 28-30 and col 68-70
    if ((col >= 28 && col <= 30) || (col >= 68 && col <= 70)) {
      continue;
    }
    blocks.push({
      id: `ground_${col}_13`,
      x: col * TILE_SIZE,
      y: groundY,
      width: TILE_SIZE,
      height: TILE_SIZE,
      type: 'ground',
      colorTheme: 'overworld',
    });
    blocks.push({
      id: `ground_${col}_14`,
      x: col * TILE_SIZE,
      y: groundY + TILE_SIZE,
      width: TILE_SIZE,
      height: TILE_SIZE,
      type: 'ground',
      colorTheme: 'overworld',
    });
  }

  // 2. Initial Question Blocks & Bricks
  blocks.push(
    { id: 'q1', x: 8 * TILE_SIZE, y: 9 * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE, type: 'question', contents: 'coin' },
    { id: 'b1', x: 10 * TILE_SIZE, y: 9 * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE, type: 'brick' },
    { id: 'q2', x: 11 * TILE_SIZE, y: 9 * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE, type: 'question', contents: 'mushroom' },
    { id: 'b2', x: 12 * TILE_SIZE, y: 9 * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE, type: 'brick' },
    { id: 'q3', x: 13 * TILE_SIZE, y: 9 * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE, type: 'question', contents: 'coin' }
  );

  // 3. Green Warp Pipes
  createPipe(blocks, enemies, 16, 11, 2, false);
  createPipe(blocks, enemies, 22, 10, 3, true); // Piranha plant

  // 4. Co-op High Secret (Only reachable via Buddy Boost!)
  blocks.push(
    { id: 'cloud_boost_1', x: 24 * TILE_SIZE, y: 4 * TILE_SIZE, width: 2 * TILE_SIZE, height: TILE_SIZE, type: 'cloud' },
    { id: 'q_secret', x: 25 * TILE_SIZE, y: 1 * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE, type: 'question', contents: 'star' }
  );
  // High Star Coin #1
  items.push({
    id: 'star_coin_1',
    type: 'starCoin',
    x: 25 * TILE_SIZE + 4,
    y: 2 * TILE_SIZE,
    vx: 0,
    vy: 0,
    width: 24,
    height: 24,
    isCollected: false,
    starCoinIndex: 1,
  });

  // 5. Co-op 2P Pressure Switch & Gate Section
  // Switch at col 40 requires both brothers or a heavy switch coordination!
  blocks.push({
    id: 'switch_1',
    x: 39 * TILE_SIZE,
    y: groundY - 14,
    width: 2 * TILE_SIZE,
    height: 14,
    type: 'switch',
    switchRequiredPlayers: 2,
    linkedGateId: 'gate_1',
  });

  // Co-op Gate at col 45
  blocks.push({
    id: 'gate_1',
    x: 45 * TILE_SIZE,
    y: 7 * TILE_SIZE,
    width: TILE_SIZE,
    height: 6 * TILE_SIZE,
    type: 'gate',
    gateOpen: false,
    gateHeight: 0,
  });

  // Inside co-op gate treasure vault
  for (let c = 47; c <= 52; c++) {
    items.push({
      id: `coin_vault_${c}`,
      type: 'coin',
      x: c * TILE_SIZE + 8,
      y: 11 * TILE_SIZE,
      vx: 0,
      vy: 0,
      width: 16,
      height: 16,
      isCollected: false,
    });
  }
  // Star Coin #2 in vault
  items.push({
    id: 'star_coin_2',
    type: 'starCoin',
    x: 50 * TILE_SIZE + 4,
    y: 10 * TILE_SIZE,
    vx: 0,
    vy: 0,
    width: 24,
    height: 24,
    isCollected: false,
    starCoinIndex: 2,
  });

  // 6. High Brick Bridge with Koopas
  for (let c = 55; c <= 65; c++) {
    blocks.push({
      id: `bridge_brick_${c}`,
      x: c * TILE_SIZE,
      y: 8 * TILE_SIZE,
      width: TILE_SIZE,
      height: TILE_SIZE,
      type: 'brick',
    });
  }
  blocks.push({
    id: 'q_fireflower',
    x: 60 * TILE_SIZE,
    y: 5 * TILE_SIZE,
    width: TILE_SIZE,
    height: TILE_SIZE,
    type: 'question',
    contents: 'fireflower',
  });

  // 7. Staircase to Flagpole
  createStairs(blocks, 82, groundY, 6, 'up');
  createStairs(blocks, 92, groundY, 6, 'down');

  // Star Coin #3 on peak of stairs
  items.push({
    id: 'star_coin_3',
    type: 'starCoin',
    x: 87 * TILE_SIZE + 4,
    y: 6 * TILE_SIZE,
    vx: 0,
    vy: 0,
    width: 24,
    height: 24,
    isCollected: false,
    starCoinIndex: 3,
  });

  // 8. Flagpole & Castle
  const flagCol = 100;
  blocks.push({
    id: 'flagpole_1',
    x: flagCol * TILE_SIZE,
    y: 3 * TILE_SIZE,
    width: TILE_SIZE,
    height: 10 * TILE_SIZE,
    type: 'flagpole',
  });

  blocks.push({
    id: 'castle_1',
    x: (flagCol + 5) * TILE_SIZE,
    y: 7 * TILE_SIZE,
    width: 4 * TILE_SIZE,
    height: 6 * TILE_SIZE,
    type: 'castle',
  });

  // Enemies
  enemies.push(
    { id: 'g1', type: 'goomba', x: 14 * TILE_SIZE, y: groundY - 24, vx: -1, vy: 0, width: 24, height: 24, facing: 'left', isGrounded: true, isDead: false, deadTimer: 0 },
    { id: 'g2', type: 'goomba', x: 19 * TILE_SIZE, y: groundY - 24, vx: -1, vy: 0, width: 24, height: 24, facing: 'left', isGrounded: true, isDead: false, deadTimer: 0 },
    { id: 'k1', type: 'koopa', x: 34 * TILE_SIZE, y: groundY - 32, vx: -1, vy: 0, width: 24, height: 32, facing: 'left', isGrounded: true, isDead: false, deadTimer: 0 },
    { id: 'k2', type: 'koopa', x: 58 * TILE_SIZE, y: 7 * TILE_SIZE, vx: 1, vy: 0, width: 24, height: 32, facing: 'right', isGrounded: true, isDead: false, deadTimer: 0 },
    { id: 'g3', type: 'goomba', x: 74 * TILE_SIZE, y: groundY - 24, vx: -1, vy: 0, width: 24, height: 24, facing: 'left', isGrounded: true, isDead: false, deadTimer: 0 },
    { id: 'g4', type: 'goomba', x: 77 * TILE_SIZE, y: groundY - 24, vx: -1, vy: 0, width: 24, height: 24, facing: 'left', isGrounded: true, isDead: false, deadTimer: 0 }
  );

  return {
    id: 1,
    name: 'World 1-1',
    subtitle: 'Mushroom Meadows',
    theme: 'overworld',
    skyColor: '#60A5FA', // Sky blue
    width,
    height,
    timeLimit: 300,
    blocks,
    enemies,
    items,
    marioStart: { x: 2 * TILE_SIZE, y: groundY - 32 },
    luigiStart: { x: 3 * TILE_SIZE + 10, y: groundY - 32 },
    flagX: flagCol * TILE_SIZE,
    starCoinsTotal: 3,
  };
}

// ----------------------------------------------------
// LEVEL 2: CRYSTAL CAVERN (UNDERGROUND)
// ----------------------------------------------------
function createLevel2(): LevelData {
  const blocks: Block[] = [];
  const enemies: Enemy[] = [];
  const items: Item[] = [];

  const width = 115 * TILE_SIZE;
  const height = 15 * TILE_SIZE;
  const groundY = 13 * TILE_SIZE;

  // Ceiling & Floor
  for (let c = 0; c < 115; c++) {
    // Ceiling
    blocks.push({
      id: `ceil_${c}`,
      x: c * TILE_SIZE,
      y: 0,
      width: TILE_SIZE,
      height: TILE_SIZE,
      type: 'ground',
      colorTheme: 'underground',
    });

    // Floor (with lava gap at 50-56)
    if (c >= 50 && c <= 56) {
      blocks.push({
        id: `lava_${c}`,
        x: c * TILE_SIZE,
        y: groundY + 10,
        width: TILE_SIZE,
        height: 2 * TILE_SIZE,
        type: 'lava',
      });
      continue;
    }

    blocks.push({
      id: `ground2_${c}_13`,
      x: c * TILE_SIZE,
      y: groundY,
      width: TILE_SIZE,
      height: TILE_SIZE,
      type: 'ground',
      colorTheme: 'underground',
    });
    blocks.push({
      id: `ground2_${c}_14`,
      x: c * TILE_SIZE,
      y: groundY + TILE_SIZE,
      width: TILE_SIZE,
      height: TILE_SIZE,
      type: 'ground',
      colorTheme: 'underground',
    });
  }

  // Upper dual pathways
  for (let c = 12; c <= 25; c++) {
    blocks.push({
      id: `upper_path_${c}`,
      x: c * TILE_SIZE,
      y: 7 * TILE_SIZE,
      width: TILE_SIZE,
      height: TILE_SIZE,
      type: 'brick',
      colorTheme: 'underground',
    });
  }

  // Question blocks in cavern
  blocks.push(
    { id: 'q_u1', x: 15 * TILE_SIZE, y: 4 * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE, type: 'question', contents: 'mushroom' },
    { id: 'q_u2', x: 18 * TILE_SIZE, y: 4 * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE, type: 'question', contents: 'fireflower' },
    { id: 'q_u3', x: 21 * TILE_SIZE, y: 4 * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE, type: 'question', contents: 'coin' }
  );

  // Star Coin #1 high in crystals
  items.push({
    id: 'star_c2_1',
    type: 'starCoin',
    x: 18 * TILE_SIZE + 4,
    y: 2 * TILE_SIZE,
    vx: 0,
    vy: 0,
    width: 24,
    height: 24,
    isCollected: false,
    starCoinIndex: 1,
  });

  // Co-op Lava Bridge Mechanism
  // Switch on upper tier (col 46) opens bridge across the lava gap (col 50-56)
  blocks.push({
    id: 'switch_lava_bridge',
    x: 46 * TILE_SIZE,
    y: groundY - 14,
    width: 2 * TILE_SIZE,
    height: 14,
    type: 'switch',
    switchRequiredPlayers: 1,
    linkedGateId: 'gate_lava_bridge',
  });

  // The gate acting as a horizontal drawbridge or barrier
  blocks.push({
    id: 'gate_lava_bridge',
    x: 50 * TILE_SIZE,
    y: 7 * TILE_SIZE,
    width: TILE_SIZE,
    height: 6 * TILE_SIZE,
    type: 'gate',
    gateOpen: false,
    gateHeight: 0,
  });

  // Moving/Floating stepping stones across the lava
  blocks.push(
    { id: 'stone_1', x: 51 * TILE_SIZE, y: 10 * TILE_SIZE, width: 2 * TILE_SIZE, height: TILE_SIZE / 2, type: 'cloud' },
    { id: 'stone_2', x: 54 * TILE_SIZE, y: 10 * TILE_SIZE, width: 2 * TILE_SIZE, height: TILE_SIZE / 2, type: 'cloud' }
  );

  // Star Coin #2 floating right above lava (demands precision teamwork or buddy jump!)
  items.push({
    id: 'star_c2_2',
    type: 'starCoin',
    x: 53 * TILE_SIZE,
    y: 7 * TILE_SIZE,
    vx: 0,
    vy: 0,
    width: 24,
    height: 24,
    isCollected: false,
    starCoinIndex: 2,
  });

  // Underworld Pipes
  createPipe(blocks, enemies, 35, 10, 3, true);
  createPipe(blocks, enemies, 65, 11, 2, false);
  createPipe(blocks, enemies, 72, 10, 3, true);

  // 2P Simultaneous Switch to access Star Coin #3
  blocks.push({
    id: 'switch_2p_cavern',
    x: 80 * TILE_SIZE,
    y: groundY - 14,
    width: 2 * TILE_SIZE,
    height: 14,
    type: 'switch',
    switchRequiredPlayers: 2,
    linkedGateId: 'gate_star3',
  });

  blocks.push({
    id: 'gate_star3',
    x: 88 * TILE_SIZE,
    y: 8 * TILE_SIZE,
    width: TILE_SIZE,
    height: 5 * TILE_SIZE,
    type: 'gate',
    gateOpen: false,
    gateHeight: 0,
  });

  items.push({
    id: 'star_c2_3',
    type: 'starCoin',
    x: 91 * TILE_SIZE + 4,
    y: 11 * TILE_SIZE,
    vx: 0,
    vy: 0,
    width: 24,
    height: 24,
    isCollected: false,
    starCoinIndex: 3,
  });

  // Flagpole & Exit Castle
  const flagCol = 104;
  blocks.push({
    id: 'flagpole_2',
    x: flagCol * TILE_SIZE,
    y: 3 * TILE_SIZE,
    width: TILE_SIZE,
    height: 10 * TILE_SIZE,
    type: 'flagpole',
  });

  blocks.push({
    id: 'castle_2',
    x: (flagCol + 4) * TILE_SIZE,
    y: 7 * TILE_SIZE,
    width: 4 * TILE_SIZE,
    height: 6 * TILE_SIZE,
    type: 'castle',
  });

  // Enemies
  enemies.push(
    { id: 'c_g1', type: 'goomba', x: 20 * TILE_SIZE, y: groundY - 24, vx: -1, vy: 0, width: 24, height: 24, facing: 'left', isGrounded: true, isDead: false, deadTimer: 0 },
    { id: 'c_k1', type: 'koopa', x: 28 * TILE_SIZE, y: groundY - 32, vx: -1, vy: 0, width: 24, height: 32, facing: 'left', isGrounded: true, isDead: false, deadTimer: 0 },
    { id: 'c_k2', type: 'koopa', x: 62 * TILE_SIZE, y: groundY - 32, vx: 1, vy: 0, width: 24, height: 32, facing: 'right', isGrounded: true, isDead: false, deadTimer: 0 },
    { id: 'c_g2', type: 'goomba', x: 77 * TILE_SIZE, y: groundY - 24, vx: -1, vy: 0, width: 24, height: 24, facing: 'left', isGrounded: true, isDead: false, deadTimer: 0 },
    { id: 'c_g3', type: 'goomba', x: 95 * TILE_SIZE, y: groundY - 24, vx: -1, vy: 0, width: 24, height: 24, facing: 'left', isGrounded: true, isDead: false, deadTimer: 0 }
  );

  return {
    id: 2,
    name: 'World 1-2',
    subtitle: 'Crystal Cavern',
    theme: 'underground',
    skyColor: '#0B132B', // Deep navy
    width,
    height,
    timeLimit: 300,
    blocks,
    enemies,
    items,
    marioStart: { x: 2 * TILE_SIZE, y: groundY - 32 },
    luigiStart: { x: 3 * TILE_SIZE + 10, y: groundY - 32 },
    flagX: flagCol * TILE_SIZE,
    starCoinsTotal: 3,
  };
}

// ----------------------------------------------------
// LEVEL 3: BOWSER'S MAGMA KEEP (BOSS CASTLE)
// ----------------------------------------------------
function createLevel3(): LevelData {
  const blocks: Block[] = [];
  const enemies: Enemy[] = [];
  const items: Item[] = [];

  const width = 110 * TILE_SIZE;
  const height = 15 * TILE_SIZE;
  const groundY = 13 * TILE_SIZE;

  // Castle brick ceiling & floor
  for (let c = 0; c < 110; c++) {
    blocks.push({
      id: `c_ceil_${c}`,
      x: c * TILE_SIZE,
      y: 0,
      width: TILE_SIZE,
      height: TILE_SIZE,
      type: 'ground',
      colorTheme: 'castle',
    });

    // Lava pits
    if ((c >= 18 && c <= 23) || (c >= 45 && c <= 52) || (c >= 78 && c <= 92)) {
      blocks.push({
        id: `c_lava_${c}`,
        x: c * TILE_SIZE,
        y: groundY + 10,
        width: TILE_SIZE,
        height: 2 * TILE_SIZE,
        type: 'lava',
      });
      continue;
    }

    blocks.push({
      id: `c_ground_${c}`,
      x: c * TILE_SIZE,
      y: groundY,
      width: TILE_SIZE,
      height: TILE_SIZE,
      type: 'ground',
      colorTheme: 'castle',
    });
    blocks.push({
      id: `c_subground_${c}`,
      x: c * TILE_SIZE,
      y: groundY + TILE_SIZE,
      width: TILE_SIZE,
      height: TILE_SIZE,
      type: 'ground',
      colorTheme: 'castle',
    });
  }

  // Floating battlements & powerup blocks
  blocks.push(
    { id: 'c_q1', x: 8 * TILE_SIZE, y: 9 * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE, type: 'question', contents: 'mushroom' },
    { id: 'c_q2', x: 12 * TILE_SIZE, y: 9 * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE, type: 'question', contents: 'fireflower' },
    { id: 'c_b1', x: 10 * TILE_SIZE, y: 9 * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE, type: 'brick', colorTheme: 'castle' }
  );

  // Moving platforms over first lava pit
  blocks.push(
    { id: 'c_plat_1', x: 19 * TILE_SIZE, y: 9 * TILE_SIZE, width: 2 * TILE_SIZE, height: TILE_SIZE / 2, type: 'cloud' },
    { id: 'c_plat_2', x: 22 * TILE_SIZE, y: 9 * TILE_SIZE, width: 2 * TILE_SIZE, height: TILE_SIZE / 2, type: 'cloud' }
  );

  // Star Coin #1 over the first lava pit
  items.push({
    id: 'star_c3_1',
    type: 'starCoin',
    x: 20 * TILE_SIZE + 10,
    y: 6 * TILE_SIZE,
    vx: 0,
    vy: 0,
    width: 24,
    height: 24,
    isCollected: false,
    starCoinIndex: 1,
  });

  // Second section: Dual Pressure Plate Gate
  blocks.push({
    id: 'switch_castle_dual',
    x: 35 * TILE_SIZE,
    y: groundY - 14,
    width: 2 * TILE_SIZE,
    height: 14,
    type: 'switch',
    switchRequiredPlayers: 2,
    linkedGateId: 'gate_castle_boss',
  });

  blocks.push({
    id: 'gate_castle_boss',
    x: 40 * TILE_SIZE,
    y: 7 * TILE_SIZE,
    width: TILE_SIZE,
    height: 6 * TILE_SIZE,
    type: 'gate',
    gateOpen: false,
    gateHeight: 0,
  });

  // Star Coin #2 on high perch requiring buddy bounce
  blocks.push({
    id: 'high_perch',
    x: 30 * TILE_SIZE,
    y: 4 * TILE_SIZE,
    width: 2 * TILE_SIZE,
    height: TILE_SIZE,
    type: 'brick',
    colorTheme: 'castle',
  });
  items.push({
    id: 'star_c3_2',
    type: 'starCoin',
    x: 30 * TILE_SIZE + 8,
    y: 2 * TILE_SIZE,
    vx: 0,
    vy: 0,
    width: 24,
    height: 24,
    isCollected: false,
    starCoinIndex: 2,
  });

  // ------------------------------------------------
  // BOWSER'S BOSS ARENA (col 75 to 100)
  // ------------------------------------------------
  // Bridge across the lava pit
  for (let c = 78; c <= 92; c++) {
    blocks.push({
      id: `boss_bridge_${c}`,
      x: c * TILE_SIZE,
      y: groundY,
      width: TILE_SIZE,
      height: TILE_SIZE / 2,
      type: 'brick',
      colorTheme: 'castle',
    });
  }

  // Behind Bowser: Golden Axe Switch that collapses bridge!
  blocks.push({
    id: 'bowser_axe_switch',
    x: 94 * TILE_SIZE,
    y: groundY - 14,
    width: 2 * TILE_SIZE,
    height: 14,
    type: 'switch',
    switchRequiredPlayers: 1,
    linkedGateId: 'boss_victory_door',
  });

  // Final Victory Gate
  blocks.push({
    id: 'boss_victory_door',
    x: 98 * TILE_SIZE,
    y: 7 * TILE_SIZE,
    width: TILE_SIZE,
    height: 6 * TILE_SIZE,
    type: 'gate',
    gateOpen: false,
    gateHeight: 0,
  });

  // Princess Peach Peach Cage / Star Coin #3
  items.push({
    id: 'star_c3_3',
    type: 'starCoin',
    x: 101 * TILE_SIZE,
    y: 11 * TILE_SIZE,
    vx: 0,
    vy: 0,
    width: 24,
    height: 24,
    isCollected: false,
    starCoinIndex: 3,
  });

  // Final Castle Goal
  const flagCol = 104;
  blocks.push({
    id: 'castle_final_3',
    x: flagCol * TILE_SIZE,
    y: 6 * TILE_SIZE,
    width: 5 * TILE_SIZE,
    height: 7 * TILE_SIZE,
    type: 'castle',
  });

  // BOSS: Bowser in the arena!
  enemies.push(
    {
      id: 'bowser_boss',
      type: 'bowser',
      x: 86 * TILE_SIZE,
      y: groundY - 56,
      vx: -1,
      vy: 0,
      width: 52,
      height: 56,
      facing: 'left',
      isGrounded: true,
      isDead: false,
      deadTimer: 0,
      hp: 3,
      attackTimer: 0,
    },
    // Supporting enemies
    { id: 'c_k1', type: 'koopa', x: 26 * TILE_SIZE, y: groundY - 32, vx: -1, vy: 0, width: 24, height: 32, facing: 'left', isGrounded: true, isDead: false, deadTimer: 0 },
    { id: 'c_k2', type: 'koopa', x: 60 * TILE_SIZE, y: groundY - 32, vx: 1, vy: 0, width: 24, height: 32, facing: 'right', isGrounded: true, isDead: false, deadTimer: 0 }
  );

  return {
    id: 3,
    name: 'World 1-3',
    subtitle: "Bowser's Magma Keep",
    theme: 'castle',
    skyColor: '#1A0B0B', // Fiery dark
    width,
    height,
    timeLimit: 300,
    blocks,
    enemies,
    items,
    marioStart: { x: 2 * TILE_SIZE, y: groundY - 32 },
    luigiStart: { x: 3 * TILE_SIZE + 10, y: groundY - 32 },
    flagX: flagCol * TILE_SIZE,
    starCoinsTotal: 3,
  };
}

// Helper: Build green warp pipe
function createPipe(
  blocks: Block[],
  enemies: Enemy[],
  col: number,
  row: number,
  heightInTiles: number,
  hasPiranha: boolean
) {
  const x = col * TILE_SIZE;
  const y = row * TILE_SIZE;
  const width = 2 * TILE_SIZE;

  // Pipe Top Rim
  blocks.push({
    id: `pipe_top_${col}_${row}`,
    x,
    y,
    width,
    height: TILE_SIZE,
    type: 'pipeTop',
  });

  // Pipe Body
  for (let h = 1; h < heightInTiles; h++) {
    blocks.push({
      id: `pipe_body_${col}_${row + h}`,
      x,
      y: y + h * TILE_SIZE,
      width,
      height: TILE_SIZE,
      type: 'pipe',
    });
  }

  // Piranha Plant
  if (hasPiranha) {
    enemies.push({
      id: `piranha_${col}_${row}`,
      type: 'piranha',
      x: x + 16,
      y: y - 24,
      vx: 0,
      vy: 0,
      width: 32,
      height: 32,
      facing: 'left',
      isGrounded: true,
      isDead: false,
      deadTimer: 0,
      pipeOriginY: y - 24,
      pipeOffset: 0,
    });
  }
}

// Helper: Build stairs
function createStairs(
  blocks: Block[],
  startCol: number,
  groundY: number,
  steps: number,
  direction: 'up' | 'down'
) {
  for (let s = 0; s < steps; s++) {
    const col = direction === 'up' ? startCol + s : startCol + s;
    const stepHeight = direction === 'up' ? s + 1 : steps - s;
    for (let h = 0; h < stepHeight; h++) {
      blocks.push({
        id: `stair_${col}_${h}`,
        x: col * TILE_SIZE,
        y: groundY - (h + 1) * TILE_SIZE,
        width: TILE_SIZE,
        height: TILE_SIZE,
        type: 'hard',
      });
    }
  }
}
