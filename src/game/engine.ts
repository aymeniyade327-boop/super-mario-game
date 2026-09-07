import {
  Player,
  Enemy,
  Block,
  Item,
  Fireball,
  Particle,
  LevelData,
  PlayerControls,
} from '../types';
import { GAME_WIDTH, GAME_HEIGHT, PHYSICS, TILE_SIZE } from './constants';
import { sound } from '../audio/soundEngine';

export class GameEngine {
  public level: LevelData;
  public mario: Player;
  public luigi: Player;
  public fireballs: Fireball[] = [];
  public particles: Particle[] = [];
  public cameraX = 0;
  public tick = 0;
  public timeLeft: number;
  public isClearSequence = false;
  public clearSequenceTimer = 0;
  public isLevelClear = false;
  public isGameOver = false;
  public onLevelClear?: () => void;
  public onGameOver?: () => void;
  public onStateChange?: () => void;

  private keysDown: Set<string> = new Set();
  private marioControls: PlayerControls;
  private luigiControls: PlayerControls;

  constructor(
    level: LevelData,
    marioControls: PlayerControls,
    luigiControls: PlayerControls,
    prevMarioScore = 0,
    prevMarioCoins = 0,
    prevMarioLives = 3,
    prevLuigiScore = 0,
    prevLuigiCoins = 0,
    prevLuigiLives = 3
  ) {
    this.level = JSON.parse(JSON.stringify(level)); // Deep clone
    this.marioControls = marioControls;
    this.luigiControls = luigiControls;
    this.timeLeft = level.timeLimit;

    this.mario = this.createPlayer('mario', 'Mario', level.marioStart.x, level.marioStart.y, prevMarioScore, prevMarioCoins, prevMarioLives);
    this.luigi = this.createPlayer('luigi', 'Luigi', level.luigiStart.x, level.luigiStart.y, prevLuigiScore, prevLuigiCoins, prevLuigiLives);
  }

  private createPlayer(
    id: 'mario' | 'luigi',
    name: string,
    x: number,
    y: number,
    score = 0,
    coins = 0,
    lives = 3
  ): Player {
    return {
      id,
      name,
      x,
      y,
      vx: 0,
      vy: 0,
      width: 24,
      height: 32, // small
      isGrounded: true,
      facing: 'right',
      power: 'small',
      starTimer: 0,
      isCrouching: false,
      isInvulnerable: false,
      invulnerableTimer: 0,
      inBubble: false,
      bubbleFloatingY: y,
      lives: Math.max(1, Math.min(3, lives)),
      maxLives: 3,
      coins,
      score,
      walkFrame: 0,
      isFluttering: false,
      flutterTimer: 0,
      headSquishTimer: 0,
      carryingShellId: null,
      reachedFlag: false,
    };
  }

  public setControls(mario: PlayerControls, luigi: PlayerControls) {
    this.marioControls = mario;
    this.luigiControls = luigi;
  }

  public handleKeyDown(code: string) {
    this.keysDown.add(code);
    sound.unlockAudio();

    // Mario Action (Throw fireball or run)
    if (code === this.marioControls.action && !this.mario.inBubble && this.mario.power === 'fire') {
      this.spawnFireball(this.mario);
    }
    // Luigi Action
    if (code === this.luigiControls.action && !this.luigi.inBubble && this.luigi.power === 'fire') {
      this.spawnFireball(this.luigi);
    }
  }

  public handleKeyUp(code: string) {
    this.keysDown.delete(code);
  }

  public update(): void {
    if (this.isLevelClear || this.isGameOver) return;

    this.tick++;

    // During flagpole slide / castle entrance celebration sequence
    if (this.isClearSequence) {
      this.updateClearSequence();
      this.updateCamera();
      this.updateParticles();
      return;
    }

    // Decrease level timer every second (~60 ticks)
    if (this.tick % 60 === 0 && this.timeLeft > 0) {
      this.timeLeft--;
      if (this.timeLeft <= 0) {
        this.triggerGameOver();
        return;
      }
    }

    // 1. Update Mario & Luigi
    this.updatePlayer(this.mario, this.marioControls);
    this.updatePlayer(this.luigi, this.luigiControls);

    // 2. Co-op Inter-Player Interactions (Head bounce & Bubble Rescue)
    this.handleCoopInteractions();

    // 3. Update Camera
    this.updateCamera();

    // 4. Update Blocks & Switches
    this.updateBlocks();

    // 5. Update Items
    this.updateItems();

    // 6. Update Enemies
    this.updateEnemies();

    // 7. Update Fireballs
    this.updateFireballs();

    // 8. Update Particles
    this.updateParticles();

    // 9. Check Level Clear / Fail Conditions
    this.checkGameStatus();
  }

  // Update Individual Player
  private updatePlayer(p: Player, controls: PlayerControls) {
    if (p.inBubble) {
      // In bubble: smoothly float towards the other brother!
      const other = p.id === 'mario' ? this.luigi : this.mario;
      const targetX = other.inBubble ? p.x : other.x;
      const targetY = other.inBubble ? p.y : other.y - 40;

      p.x += (targetX - p.x) * 0.02;
      p.y += (targetY - p.y) * 0.02 + Math.sin(this.tick * 0.1) * 0.5;
      return;
    }

    const isMario = p.id === 'mario';
    const props = isMario ? PHYSICS.MARIO : PHYSICS.LUIGI;

    // Head squish recovery
    if (p.headSquishTimer > 0) {
      p.headSquishTimer--;
    }

    // Invulnerability decay
    if (p.isInvulnerable) {
      p.invulnerableTimer--;
      if (p.invulnerableTimer <= 0) {
        p.isInvulnerable = false;
      }
    }

    // Star power timer
    if (p.starTimer > 0) {
      p.starTimer--;
    }

    // Crouching
    const isDownPressed = this.keysDown.has(controls.down);
    p.isCrouching = isDownPressed && p.isGrounded && p.power !== 'small';

    // Horizontal Movement
    const leftPressed = this.keysDown.has(controls.left);
    const rightPressed = this.keysDown.has(controls.right);
    const isRunning = this.keysDown.has(controls.action);
    const maxSpeed = isRunning ? props.MAX_RUN_SPEED : props.MAX_WALK_SPEED;

    if (leftPressed && !p.isCrouching) {
      p.vx = Math.max(p.vx - props.ACCEL, -maxSpeed);
      p.facing = 'left';
      p.walkFrame++;
    } else if (rightPressed && !p.isCrouching) {
      p.vx = Math.min(p.vx + props.ACCEL, maxSpeed);
      p.facing = 'right';
      p.walkFrame++;
    } else {
      p.vx *= props.FRICTION;
      if (Math.abs(p.vx) < 0.1) p.vx = 0;
    }

    // Jump Handling
    const jumpPressed = this.keysDown.has(controls.up);
    if (jumpPressed && p.isGrounded && !p.isCrouching) {
      p.vy = props.JUMP_POWER;
      p.isGrounded = false;
      p.isFluttering = false;
      sound.playJump(p.id);
    } else if (!jumpPressed && p.vy < -3) {
      // Variable jump height
      p.vy *= 0.6;
    }

    // Luigi Flutter Jump Mechanic
    if (!isMario && !p.isGrounded && p.vy > -2 && p.vy < 5 && jumpPressed) {
      p.isFluttering = true;
      p.vy += PHYSICS.LUIGI.FLUTTER_EXTRA;
    } else {
      p.isFluttering = false;
    }

    // Gravity
    p.vy = Math.min(p.vy + PHYSICS.GRAVITY, PHYSICS.MAX_FALL_SPEED);

    // Apply Velocities with Tile Collisions
    this.movePlayerWithCollisions(p);

    // Pit fall check
    if (p.y > this.level.height + 40) {
      this.damagePlayer(p, true);
    }
  }

  // Co-op Specific: Head Bouncing, Boosting & Bubble Popping
  private handleCoopInteractions() {
    const m = this.mario;
    const l = this.luigi;

    // Case 1: Mario in bubble, Luigi active -> Luigi pops Mario's bubble!
    if (m.inBubble && !l.inBubble) {
      if (this.checkAABBOverlap(m, l, 20)) {
        this.rescuePlayer(m, l);
      }
    } else if (l.inBubble && !m.inBubble) {
      if (this.checkAABBOverlap(l, m, 20)) {
        this.rescuePlayer(l, m);
      }
    }

    // Case 2: Both active -> Head Bounce / Buddy Boost!
    if (!m.inBubble && !l.inBubble) {
      // Mario jumping on Luigi's head
      if (
        m.vy > 0 &&
        m.y + m.height <= l.y + 14 &&
        m.y + m.height >= l.y - 6 &&
        m.x + m.width > l.x + 4 &&
        m.x < l.x + l.width - 4
      ) {
        m.vy = PHYSICS.BUDDY_BOUNCE_IMPULSE;
        l.headSquishTimer = 18;
        sound.playBuddyBounce();
        this.spawnScoreText(m.x + m.width / 2, m.y, 'BOOST! +200', '#FACC15');
        m.score += 200;
        this.spawnSparkles(m.x + m.width / 2, m.y + m.height, '#60A5FA');
      }
      // Luigi jumping on Mario's head
      else if (
        l.vy > 0 &&
        l.y + l.height <= m.y + 14 &&
        l.y + l.height >= m.y - 6 &&
        l.x + l.width > m.x + 4 &&
        l.x < m.x + m.width - 4
      ) {
        l.vy = PHYSICS.BUDDY_BOUNCE_IMPULSE;
        m.headSquishTimer = 18;
        sound.playBuddyBounce();
        this.spawnScoreText(l.x + l.width / 2, l.y, 'BOOST! +200', '#4ADE80');
        l.score += 200;
        this.spawnSparkles(l.x + l.width / 2, l.y + l.height, '#4ADE80');
      }
    }
  }

  private rescuePlayer(rescued: Player, rescuer: Player) {
    rescued.inBubble = false;
    rescued.lives = 3; // Fully restore all 3 hearts!
    rescued.vy = -6;
    rescued.isInvulnerable = true;
    rescued.invulnerableTimer = 120; // 2 seconds invulnerability
    sound.playBubblePop();
    this.spawnScoreText(rescued.x, rescued.y, 'RESCUED! ❤️❤️❤️ +500', '#F59E0B');
    rescuer.score += 500;
    this.spawnSparkles(rescued.x, rescued.y, '#38BDF8', 12);
    if (this.onStateChange) this.onStateChange();
  }

  // Damage or Bubble Player
  private damagePlayer(p: Player, immediateDeath = false) {
    if (p.isInvulnerable || p.inBubble) return;

    const other = p.id === 'mario' ? this.luigi : this.mario;

    if (immediateDeath) {
      // Lava or Pit fall: lose all hearts and enter rescue bubble immediately
      p.lives = 0;
      p.power = 'small';
      p.height = 32;
      sound.playPipeDown();
      this.spawnScoreText(p.x, Math.max(30, p.y - 20), '-3 ❤️ HAZARD!', '#EF4444');

      if (!other.inBubble) {
        p.inBubble = true;
        p.vx = 0;
        p.vy = 0;
        p.x = other.x;
        p.y = Math.max(30, other.y - 80);
      } else {
        this.triggerGameOver();
      }
      if (this.onStateChange) this.onStateChange();
      return;
    }

    // Standard Hit: Deduct 1 heart!
    p.lives = Math.max(0, p.lives - 1);
    p.isInvulnerable = true;
    p.invulnerableTimer = 90; // ~1.5s invulnerability frames with visual blinking

    // Power degradation
    if (p.power === 'fire') {
      p.power = 'super';
    } else if (p.power === 'super') {
      p.power = 'small';
      p.height = 32;
    }

    // Knockback bounce from impact
    p.vy = -3.5;
    p.vx = p.facing === 'right' ? -2.5 : 2.5;

    sound.playPipeDown();
    this.spawnScoreText(p.x, p.y - 12, '-1 ❤️', '#EF4444');
    this.spawnSparkles(p.x + p.width / 2, p.y + p.height / 2, '#EF4444', 8);

    // If all hearts lost (0 hearts left) -> Enters Rescue Bubble!
    if (p.lives <= 0) {
      if (!other.inBubble) {
        // Co-op rescue bubble!
        p.inBubble = true;
        p.power = 'small';
        p.height = 32;
        p.vx = 0;
        p.vy = 0;
        // Reposition above active brother
        p.x = other.x;
        p.y = Math.max(30, other.y - 80);
        sound.playPipeDown();
        this.spawnScoreText(p.x, p.y, 'BUBBLED! HELP!', '#EF4444');
      } else {
        // Both brothers fell -> Level failed!
        this.triggerGameOver();
      }
    }

    if (this.onStateChange) this.onStateChange();
  }

  // Move Player with Horizontal & Vertical Collision Resolution
  private movePlayerWithCollisions(p: Player) {
    // 1. Horizontal
    p.x += p.vx;
    for (const block of this.level.blocks) {
      if (!this.isSolidBlock(block)) continue;
      if (this.checkCollision(p, block)) {
        if (p.vx > 0) {
          p.x = block.x - p.width;
        } else if (p.vx < 0) {
          p.x = block.x + block.width;
        }
        p.vx = 0;
      }
    }

    // Clamping to level left bound
    if (p.x < 0) {
      p.x = 0;
      p.vx = 0;
    }

    // 2. Vertical
    p.y += p.vy;
    p.isGrounded = false;

    for (const block of this.level.blocks) {
      if (!this.isSolidBlock(block)) continue;
      if (this.checkCollision(p, block)) {
        if (p.vy > 0) {
          // Landing on block
          p.y = block.y - p.height;
          p.vy = 0;
          p.isGrounded = true;

          // Lava check
          if (block.type === 'lava') {
            this.damagePlayer(p, true);
          }
        } else if (p.vy < 0) {
          // Head hit block from below
          p.y = block.y + block.height;
          p.vy = 0;
          this.handleBlockHit(p, block);
        }
      }
    }
  }

  private isSolidBlock(block: Block): boolean {
    if (block.type === 'gate' && block.gateOpen) return false;
    if (block.type === 'flagpole' || block.type === 'castle') return false;
    return true;
  }

  // Handle player bumping a block from below
  private handleBlockHit(p: Player, block: Block) {
    if (block.type === 'question' && !block.isHit) {
      block.isHit = true;
      block.bumpOffset = 8;
      sound.playBump();

      if (block.contents === 'coin') {
        p.coins++;
        p.score += 200;
        sound.playCoin();
        this.spawnScoreText(block.x + 8, block.y - 10, '+200', '#FACC15');
        this.spawnItem('coin', block.x + 8, block.y - 24);
      } else if (block.contents === 'mushroom' || block.contents === 'fireflower' || block.contents === 'star') {
        sound.playPowerupSprout();
        // If already super, give fireflower
        const itemType = block.contents === 'mushroom' && p.power !== 'small' ? 'fireflower' : block.contents;
        this.spawnItem(itemType, block.x, block.y - 28);
      }
    } else if (block.type === 'brick') {
      if (p.power !== 'small') {
        // Break brick!
        sound.playBreakBlock();
        p.score += 50;
        this.spawnBrickParticles(block.x, block.y, block.colorTheme === 'castle' ? '#4B5563' : '#B24502');
        this.level.blocks = this.level.blocks.filter((b) => b.id !== block.id);
      } else {
        block.bumpOffset = 6;
        sound.playBump();
      }
    }
  }

  // Spawn an item into the world
  private spawnItem(type: Item['type'], x: number, y: number) {
    this.level.items.push({
      id: `item_${Date.now()}_${Math.random()}`,
      type,
      x,
      y,
      vx: type === 'mushroom' || type === 'star' ? 1.5 : 0,
      vy: -3,
      width: type === 'starCoin' ? 24 : 20,
      height: type === 'starCoin' ? 24 : 20,
      isCollected: false,
    });
  }

  // Fireball Spawner
  private spawnFireball(p: Player) {
    const activeFireballs = this.fireballs.filter((f) => f.owner === p.id && !f.isDead);
    if (activeFireballs.length >= 2) return; // Limit 2

    sound.playFireball();
    this.fireballs.push({
      id: `fb_${Date.now()}_${Math.random()}`,
      owner: p.id,
      x: p.facing === 'right' ? p.x + p.width : p.x - 10,
      y: p.y + 12,
      vx: p.facing === 'right' ? PHYSICS.FIREBALL_SPEED : -PHYSICS.FIREBALL_SPEED,
      vy: 2,
      radius: 6,
      bounces: 0,
      isDead: false,
    });
  }

  // Update Fireballs
  private updateFireballs() {
    for (const fb of this.fireballs) {
      if (fb.isDead) continue;

      fb.x += fb.vx;
      fb.y += fb.vy;
      fb.vy += 0.4;

      // Bounce on ground/blocks
      for (const block of this.level.blocks) {
        if (!this.isSolidBlock(block)) continue;
        if (
          fb.x + fb.radius > block.x &&
          fb.x - fb.radius < block.x + block.width &&
          fb.y + fb.radius > block.y &&
          fb.y - fb.radius < block.y + block.height
        ) {
          fb.vy = PHYSICS.FIREBALL_BOUNCE;
          fb.bounces++;
          if (fb.bounces > 4) {
            fb.isDead = true;
          }
        }
      }

      // Hit Enemies
      for (const e of this.level.enemies) {
        if (e.isDead) continue;
        if (
          fb.x + fb.radius > e.x &&
          fb.x - fb.radius < e.x + e.width &&
          fb.y + fb.radius > e.y &&
          fb.y - fb.radius < e.y + e.height
        ) {
          fb.isDead = true;
          this.damageEnemy(e, true);
        }
      }

      // Bowser Fireball vs Players
      if (fb.owner === 'bowser') {
        const players = [this.mario, this.luigi];
        for (const p of players) {
          if (!p.inBubble && !p.isInvulnerable) {
            if (
              fb.x + fb.radius > p.x &&
              fb.x - fb.radius < p.x + p.width &&
              fb.y + fb.radius > p.y &&
              fb.y - fb.radius < p.y + p.height
            ) {
              fb.isDead = true;
              this.damagePlayer(p);
            }
          }
        }
      }

      // Hit Brother's Rescue Bubble (Can shoot bubble from afar to pop it!)
      const targetBubble = fb.owner === 'mario' ? this.luigi : this.mario;
      if (targetBubble.inBubble) {
        if (
          fb.x + fb.radius > targetBubble.x &&
          fb.x - fb.radius < targetBubble.x + targetBubble.width &&
          fb.y + fb.radius > targetBubble.y &&
          fb.y - fb.radius < targetBubble.y + targetBubble.height
        ) {
          fb.isDead = true;
          this.rescuePlayer(targetBubble, fb.owner === 'mario' ? this.mario : this.luigi);
        }
      }

      // Distance limit
      if (fb.y > this.level.height || fb.bounces > 5) {
        fb.isDead = true;
      }
    }

    this.fireballs = this.fireballs.filter((f) => !f.isDead);
  }

  // Update Items
  private updateItems() {
    for (const item of this.level.items) {
      if (item.isCollected) continue;

      if (item.type === 'mushroom' || item.type === 'star') {
        item.x += item.vx;
        item.vy = Math.min(item.vy + 0.35, 7);
        item.y += item.vy;

        // Block collisions for moving powerups
        for (const block of this.level.blocks) {
          if (!this.isSolidBlock(block)) continue;
          if (this.checkCollision(item, block)) {
            if (item.vy > 0) {
              item.y = block.y - item.height;
              item.vy = item.type === 'star' ? -6 : 0; // Star bounces!
            } else if (item.vx > 0) {
              item.vx = -item.vx;
            } else if (item.vx < 0) {
              item.vx = -item.vx;
            }
          }
        }
      }

      // Check collection by Mario or Luigi
      this.checkItemCollection(item, this.mario);
      this.checkItemCollection(item, this.luigi);
    }
  }

  private checkItemCollection(item: Item, p: Player) {
    if (item.isCollected || p.inBubble) return;

    if (this.checkCollision(p, item)) {
      item.isCollected = true;

      switch (item.type) {
        case 'coin':
          p.coins++;
          p.score += 200;
          sound.playCoin();
          if (p.coins >= 100) {
            p.coins -= 100;
            p.lives = Math.min(3, p.lives + 1);
            this.spawnScoreText(item.x, item.y - 14, '1-UP! +1 ❤️', '#22C55E');
          } else {
            this.spawnScoreText(item.x, item.y, '+200', '#FACC15');
          }
          break;

        case 'starCoin':
          p.score += 1000;
          sound.playStarCoin();
          this.spawnScoreText(item.x, item.y, 'STAR COIN! +1000', '#F59E0B');
          this.spawnSparkles(item.x + 12, item.y + 12, '#F59E0B', 15);
          break;

        case 'mushroom':
          if (p.power === 'small') {
            p.power = 'super';
            p.height = 44;
            p.y -= 12;
          }
          // Restore 1 lost heart!
          if (p.lives < 3) {
            p.lives = Math.min(3, p.lives + 1);
            this.spawnScoreText(item.x, item.y, '+1 ❤️ SUPER! +1000', '#22C55E');
          } else {
            this.spawnScoreText(item.x, item.y, 'SUPER! +1000', '#22C55E');
          }
          p.score += 1000;
          sound.playPowerup();
          break;

        case 'fireflower':
          p.power = 'fire';
          p.height = 44;
          p.lives = 3; // Fully restore all 3 hearts!
          p.score += 1000;
          sound.playPowerup();
          this.spawnScoreText(item.x, item.y, 'FIRE BROS! MAX ❤️', '#EF4444');
          break;

        case 'star':
          p.starTimer = 600; // 10 seconds of invincibility
          p.score += 1000;
          sound.playPowerup();
          this.spawnScoreText(item.x, item.y, 'INVINCIBLE! +1000', '#A855F7');
          break;
      }

      if (this.onStateChange) this.onStateChange();
    }
  }

  // Update Enemies
  private updateEnemies() {
    for (const e of this.level.enemies) {
      if (e.isDead) {
        e.deadTimer++;
        continue;
      }

      if (e.type === 'piranha') {
        // Emerge / retract from pipe
        const originY = e.pipeOriginY ?? e.y;
        const cycle = Math.sin(this.tick * 0.04);
        e.y = originY + (cycle > 0 ? 0 : 36);
      } else if (e.type === 'bowser') {
        this.updateBowser(e);
      } else {
        // Standard Goomba / Koopa
        if (e.isShell && !e.isShellMoving) {
          // Stationary shell, wait for kick
        } else {
          e.x += e.vx;
          e.vy = Math.min(e.vy + PHYSICS.GRAVITY, 9);
          e.y += e.vy;

          // Block collisions
          for (const block of this.level.blocks) {
            if (!this.isSolidBlock(block)) continue;
            if (this.checkCollision(e, block)) {
              if (e.vy > 0) {
                e.y = block.y - e.height;
                e.vy = 0;
                e.isGrounded = true;
              } else if (e.vx > 0) {
                e.vx = -e.vx;
                e.facing = 'left';
              } else if (e.vx < 0) {
                e.vx = -e.vx;
                e.facing = 'right';
              }
            }
          }
        }
      }

      // Player vs Enemy Collision
      this.handlePlayerEnemyCollision(this.mario, e);
      this.handlePlayerEnemyCollision(this.luigi, e);

      // Shell vs other enemies
      if (e.isShell && e.isShellMoving) {
        for (const other of this.level.enemies) {
          if (other.id !== e.id && !other.isDead && this.checkCollision(e, other)) {
            this.damageEnemy(other, true);
          }
        }
      }
    }

    // Clean up expired dead enemies
    this.level.enemies = this.level.enemies.filter((e) => !e.isDead || e.deadTimer < 30);
  }

  // Boss AI (Bowser)
  private updateBowser(b: Enemy) {
    b.attackTimer = (b.attackTimer ?? 0) + 1;

    // Jump periodically
    if (b.attackTimer % 180 === 0 && b.isGrounded) {
      b.vy = -9;
      b.isGrounded = false;
      b.vx = Math.random() > 0.5 ? -1.5 : 1.5;
    }

    // Shoot fireball periodically
    if (b.attackTimer % 120 === 60) {
      sound.playFireball();
      this.fireballs.push({
        id: `bowser_fb_${Date.now()}`,
        owner: 'bowser',
        x: b.x - 10,
        y: b.y + 20,
        vx: -4,
        vy: 0,
        radius: 10,
        bounces: 0,
        isDead: false,
      });
    }

    // Physics
    b.x += b.vx;
    b.vy = Math.min(b.vy + PHYSICS.GRAVITY, 9);
    b.y += b.vy;

    for (const block of this.level.blocks) {
      if (!this.isSolidBlock(block)) continue;
      if (this.checkCollision(b, block)) {
        if (b.vy > 0) {
          b.y = block.y - b.height;
          b.vy = 0;
          b.isGrounded = true;
        }
      }
    }
  }

  // Player vs Enemy Collisions (Stomp, Shell Kick, Star Destroy, or Damage)
  private handlePlayerEnemyCollision(p: Player, e: Enemy) {
    if (p.inBubble || e.isDead) return;

    if (this.checkCollision(p, e)) {
      // Star power instant kill
      if (p.starTimer > 0) {
        this.damageEnemy(e, true);
        p.score += 200;
        return;
      }

      // Bowser damage check
      if (e.type === 'bowser') {
        this.damagePlayer(p);
        return;
      }

      // Stomp check (Player falling onto enemy head)
      const isStomp = p.vy > 0 && p.y + p.height <= e.y + 16;

      if (isStomp) {
        p.vy = PHYSICS.STOMP_BOUNCE;
        sound.playStomp();

        if (e.type === 'goomba') {
          e.isDead = true;
          e.deadTimer = 0;
          p.score += 100;
          this.spawnScoreText(e.x + 8, e.y, '+100', '#FACC15');
        } else if (e.type === 'koopa') {
          if (!e.isShell) {
            e.isShell = true;
            e.height = 22;
            e.y += 10;
            p.score += 100;
            this.spawnScoreText(e.x + 8, e.y, '+100', '#FACC15');
          } else if (!e.isShellMoving) {
            e.isShellMoving = true;
            e.vx = p.facing === 'right' ? PHYSICS.SHELL_SPEED : -PHYSICS.SHELL_SPEED;
            sound.playKick();
          } else {
            // Stop moving shell
            e.isShellMoving = false;
            e.vx = 0;
          }
        }
      } else {
        // Side collision with stationary shell kicks it!
        if (e.isShell && !e.isShellMoving) {
          e.isShellMoving = true;
          e.vx = p.x < e.x ? PHYSICS.SHELL_SPEED : -PHYSICS.SHELL_SPEED;
          sound.playKick();
        } else {
          // Player takes damage
          this.damagePlayer(p);
        }
      }
    }
  }

  private damageEnemy(e: Enemy, instant = false) {
    if (e.type === 'bowser') {
      e.hp = (e.hp ?? 3) - 1;
      sound.playBossHit();
      this.spawnScoreText(e.x + 20, e.y - 10, 'HIT!', '#EF4444');
      if (e.hp <= 0) {
        e.isDead = true;
        this.spawnScoreText(e.x + 20, e.y - 20, 'DEFEATED! +5000', '#FACC15');
        this.mario.score += 2500;
        this.luigi.score += 2500;
        // Open boss victory door
        const gate = this.level.blocks.find((b) => b.id === 'boss_victory_door');
        if (gate) gate.gateOpen = true;
      }
      return;
    }

    e.isDead = true;
    e.deadTimer = 0;
    sound.playStomp();
    this.spawnScoreText(e.x + 8, e.y, '+200', '#FACC15');
  }

  // Update Blocks, Bump Offsets, and Co-op Switches
  private updateBlocks() {
    for (const block of this.level.blocks) {
      // Bump recoil decay
      if (block.bumpOffset && block.bumpOffset > 0) {
        block.bumpOffset -= 1;
      }

      // Check co-op switches
      if (block.type === 'switch') {
        const marioOnSwitch = !this.mario.inBubble && this.isPlayerOnSwitch(this.mario, block);
        const luigiOnSwitch = !this.luigi.inBubble && this.isPlayerOnSwitch(this.luigi, block);

        const required = block.switchRequiredPlayers ?? 1;
        const nowPressed = required === 2 ? marioOnSwitch && luigiOnSwitch : marioOnSwitch || luigiOnSwitch;

        if (nowPressed && !block.switchPressed) {
          sound.playSwitchClick();
          this.spawnScoreText(block.x + block.width / 2, block.y - 14, 'CO-OP UNLOCKED!', '#38BDF8');
        }

        block.switchPressed = nowPressed;

        // If linked to a gate, open or close the gate
        if (block.linkedGateId) {
          const gate = this.level.blocks.find((b) => b.id === block.linkedGateId);
          if (gate) {
            gate.gateOpen = nowPressed;
            const targetH = nowPressed ? gate.height : 0;
            gate.gateHeight = (gate.gateHeight ?? 0) + (targetH - (gate.gateHeight ?? 0)) * 0.15;
          }
        }
      }
    }
  }

  private isPlayerOnSwitch(p: Player, block: Block): boolean {
    return (
      p.x + p.width > block.x + 2 &&
      p.x < block.x + block.width - 2 &&
      p.y + p.height >= block.y - 4 &&
      p.y + p.height <= block.y + 8
    );
  }

  // Camera tracking both Mario and Luigi
  private updateCamera() {
    let focusX: number;

    if (this.mario.inBubble && !this.luigi.inBubble) {
      focusX = this.luigi.x;
    } else if (this.luigi.inBubble && !this.mario.inBubble) {
      focusX = this.mario.x;
    } else {
      // Midpoint between both brothers
      focusX = (this.mario.x + this.luigi.x) / 2;
    }

    const targetCameraX = focusX - GAME_WIDTH / 2;
    this.cameraX += (targetCameraX - this.cameraX) * 0.1;

    // Clamp camera within level bounds
    this.cameraX = Math.max(0, Math.min(this.cameraX, this.level.width - GAME_WIDTH));
  }

  // Update Particles
  private updateParticles() {
    for (const p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
    }
    this.particles = this.particles.filter((p) => p.life > 0);
  }

  private spawnScoreText(x: number, y: number, text: string, color = '#FACC15') {
    this.particles.push({
      id: `score_${Date.now()}_${Math.random()}`,
      type: 'scoreText',
      x,
      y,
      vx: 0,
      vy: -1.2,
      text,
      color,
      life: 50,
      maxLife: 50,
    });
  }

  private spawnSparkles(x: number, y: number, color = '#FFFFFF', count = 8) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = 1.5 + Math.random() * 2;
      this.particles.push({
        id: `spark_${Date.now()}_${i}`,
        type: 'sparkle',
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        life: 25,
        maxLife: 25,
        size: 3,
      });
    }
  }

  private spawnBrickParticles(x: number, y: number, color = '#B24502') {
    const velocities = [
      { vx: -2.5, vy: -6 },
      { vx: 2.5, vy: -6 },
      { vx: -2, vy: -3.5 },
      { vx: 2, vy: -3.5 },
    ];
    velocities.forEach((v, i) => {
      this.particles.push({
        id: `brick_${Date.now()}_${i}`,
        type: 'brickChunk',
        x: x + 8,
        y: y + 8,
        vx: v.vx,
        vy: v.vy,
        color,
        life: 40,
        maxLife: 40,
        size: 7,
      });
    });
  }

  // Check Game Clear or Game Over
  private checkGameStatus() {
    if (this.isClearSequence || this.isLevelClear || this.isGameOver) return;

    // Flagpole or stage end goal touch
    const marioReached = !this.mario.inBubble && this.mario.x >= this.level.flagX - 10;
    const luigiReached = !this.luigi.inBubble && this.luigi.x >= this.level.flagX - 10;

    if (marioReached || luigiReached) {
      this.isClearSequence = true;
      this.clearSequenceTimer = 0;
      sound.stopMusic();

      const flagpole = this.level.blocks.find((b) => b.type === 'flagpole');

      // Play flagpole slide sound if flagpole exists, or stage clear
      if (flagpole) {
        sound.playFlagpole();
      } else {
        sound.playStageClear();
      }

      // Calculate score based on player contact height
      const scoringPlayer = marioReached ? this.mario : this.luigi;
      let points = 1000;
      if (flagpole) {
        const distFromTop = Math.max(0, scoringPlayer.y - flagpole.y);
        if (distFromTop < 40) points = 5000;
        else if (distFromTop < 100) points = 2000;
        else if (distFromTop < 180) points = 1000;
        else if (distFromTop < 250) points = 400;
        else points = 100;
      } else {
        // Boss Castle win
        points = 5000;
      }

      scoringPlayer.score += points;
      this.spawnScoreText(this.level.flagX, scoringPlayer.y - 10, `+${points}`, '#FACC15');
      this.spawnSparkles(this.level.flagX, scoringPlayer.y, '#FACC15', 12);

      // Snap position for sliding
      if (marioReached) {
        this.mario.reachedFlag = true;
        this.mario.vx = 0;
        this.mario.x = this.level.flagX - 6;
      }
      if (luigiReached) {
        this.luigi.reachedFlag = true;
        this.luigi.vx = 0;
        this.luigi.x = this.level.flagX + 6;
      }

      // If one player was floating in a rescue bubble, pop them to celebrate!
      if (this.mario.inBubble) {
        this.mario.inBubble = false;
        this.mario.x = this.level.flagX - 24;
        this.mario.y = 13 * TILE_SIZE - this.mario.height;
        this.mario.reachedFlag = true;
      }
      if (this.luigi.inBubble) {
        this.luigi.inBubble = false;
        this.luigi.x = this.level.flagX - 16;
        this.luigi.y = 13 * TILE_SIZE - this.luigi.height;
        this.luigi.reachedFlag = true;
      }
    }
  }

  // Flagpole slide & victory castle walk
  private updateClearSequence() {
    this.clearSequenceTimer++;
    const timer = this.clearSequenceTimer;

    const flagpole = this.level.blocks.find((b) => b.type === 'flagpole');
    const castle = this.level.blocks.find((b) => b.type === 'castle');
    const groundY = 13 * TILE_SIZE;

    // Slide the flag on flagpole
    if (flagpole) {
      const maxSlide = flagpole.height - 30;
      flagpole.bumpOffset = Math.min(maxSlide, (timer / 40) * maxSlide);
    }

    // Phase 1 (frames 1 to 45): Slide down flagpole
    if (timer <= 45 && flagpole) {
      [this.mario, this.luigi].forEach((p) => {
        if (p.reachedFlag) {
          if (p.y + p.height < groundY) {
            p.vy = 3.5;
            p.y += p.vy;
            p.isGrounded = false;
          } else {
            p.y = groundY - p.height;
            p.vy = 0;
            p.isGrounded = true;
          }
        }
      });
    }

    // At frame 46: play Stage Clear Fanfare as they hit the ground and walk!
    if (timer === 46) {
      sound.playStageClear();
    }

    // Phase 2 (frames 46 to 125): Walk right towards the castle entrance
    if (timer >= 46) {
      const targetCastleX = castle ? castle.x + castle.width / 2 - 10 : this.level.flagX + 160;

      [this.mario, this.luigi].forEach((p, idx) => {
        p.facing = 'right';
        p.walkFrame = Math.floor(timer / 4);

        if (p.x < targetCastleX) {
          p.vx = 2.2;
          p.x += p.vx;
          p.y = groundY - p.height;
          p.isGrounded = true;
        } else {
          p.vx = 0;
          p.x = targetCastleX + idx * 4;
        }
      });

      // Castle victory flag raises on roof!
      if (castle && timer >= 65) {
        castle.bumpOffset = Math.min(22, (timer - 65) * 0.9);
      }

      // Fireworks burst in the sky above the castle!
      if (castle && timer % 18 === 0 && timer < 120) {
        const fwX = castle.x + 15 + Math.random() * (castle.width - 30);
        const fwY = castle.y - 25 - Math.random() * 35;
        const colors = ['#FACC15', '#EF4444', '#22C55E', '#38BDF8', '#F472B6', '#A855F7'];
        const chosenColor = colors[Math.floor(Math.random() * colors.length)];
        this.spawnSparkles(fwX, fwY, chosenColor, 16);
        sound.playFireball();
      }

      // Convert remaining seconds to bonus score!
      if (this.timeLeft > 0 && timer % 2 === 0) {
        const step = Math.min(5, this.timeLeft);
        this.timeLeft -= step;
        this.mario.score += step * 25;
        this.luigi.score += step * 25;
        if (timer % 6 === 0) {
          sound.playCoin();
        }
      }
    }

    // Phase 3 (frame 125): Finish sequence and open level clear / next level modal!
    if (timer >= 125) {
      this.isClearSequence = false;
      this.isLevelClear = true;
      if (this.onLevelClear) {
        this.onLevelClear();
      }
    }
  }

  private triggerGameOver() {
    this.isGameOver = true;
    sound.playGameOver();
    if (this.onGameOver) {
      this.onGameOver();
    }
  }

  // Helper AABB Collision
  private checkCollision(
    a: { x: number; y: number; width: number; height: number },
    b: { x: number; y: number; width: number; height: number }
  ): boolean {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  private checkAABBOverlap(
    a: { x: number; y: number; width: number; height: number },
    b: { x: number; y: number; width: number; height: number },
    padding = 0
  ): boolean {
    return (
      a.x - padding < b.x + b.width &&
      a.x + a.width + padding > b.x &&
      a.y - padding < b.y + b.height &&
      a.y + a.height + padding > b.y
    );
  }
}
