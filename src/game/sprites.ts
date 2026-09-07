import { Player, Enemy, Block, Item, Fireball, Particle } from '../types';

export class SpriteRenderer {
  // Render Mario or Luigi
  public static renderPlayer(
    ctx: CanvasRenderingContext2D,
    player: Player,
    tick: number
  ) {
    ctx.save();
    ctx.translate(Math.round(player.x), Math.round(player.y));

    // Handle bubble rescue state
    if (player.inBubble) {
      this.renderRescueBubble(ctx, player, tick);
      ctx.restore();
      return;
    }

    const isMario = player.id === 'mario';
    const isSuper = player.power !== 'small';
    const isFire = player.power === 'fire';
    const w = player.width;
    const h = player.height;

    // Ground shadow beneath player feet
    if (player.isGrounded) {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
      ctx.beginPath();
      ctx.ellipse(w / 2, h - 1, w / 2 - 2, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Sprinting dust puff when moving fast on ground
    if (player.isGrounded && Math.abs(player.vx) > 2.8) {
      const dustOffset = player.facing === 'right' ? -4 : w + 4;
      const dustSize = 2 + (Math.sin(tick * 0.5) + 1) * 1.5;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.beginPath();
      ctx.arc(dustOffset, h - 3, dustSize, 0, Math.PI * 2);
      ctx.fill();
    }

    // Luigi flutter kicks legs in air with wind dust particles
    const isJumping = !player.isGrounded;
    const isFluttering = !isMario && isJumping && player.isFluttering;
    if (isFluttering) {
      const windPuffX = (tick % 6) * 3 - 8;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.beginPath();
      ctx.arc(w / 2 + windPuffX, h + 3, 3, 0, Math.PI * 2);
      ctx.arc(w / 2 - windPuffX, h + 5, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Star power rainbow effect
    if (player.starTimer > 0) {
      const hues = [0, 60, 120, 180, 240, 300];
      const hue = hues[Math.floor(tick / 4) % hues.length];
      ctx.filter = `hue-rotate(${hue}deg) brightness(1.25)`;
    }

    // Invulnerability blink
    if (player.isInvulnerable && Math.floor(player.invulnerableTimer / 4) % 2 === 0) {
      ctx.globalAlpha = 0.35;
    }

    // Direction flip
    ctx.save();
    if (player.facing === 'left') {
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
    }

    // Palettes
    let capColor = isMario ? '#E52521' : '#16A34A';
    let shirtColor = capColor;
    let overallColor = isMario ? '#1D4ED8' : '#1E3A8A';

    if (isFire) {
      capColor = '#FFFFFF';
      shirtColor = '#FFFFFF';
      overallColor = isMario ? '#DC2626' : '#16A34A';
    }

    const skinColor = '#FCD0A1';
    const skinShadow = '#E6AF7E';
    const hairColor = '#4A2805';
    const shoeColor = '#3B1F04';
    const buttonColor = '#FACC15';

    // Head squish when brother bounces on head
    const squishY = player.headSquishTimer > 0 ? 4 : 0;

    // Jump frame or walk animation
    const walkOffset = !isJumping && Math.abs(player.vx) > 0.2
      ? Math.sin(player.walkFrame * 0.4) * 3
      : 0;

    const luigiFlutter = isFluttering ? Math.sin(tick * 0.8) * 4 : 0;

    // 1. Shoes
    ctx.fillStyle = shoeColor;
    if (isJumping) {
      ctx.fillRect(2, h - 7, 10, 6);
      ctx.fillRect(w - 12, h - 10 + luigiFlutter, 11, 6);
      // Shoe sole highlight
      ctx.fillStyle = '#78350F';
      ctx.fillRect(2, h - 3, 10, 2);
      ctx.fillRect(w - 12, h - 6 + luigiFlutter, 11, 2);
    } else {
      ctx.fillRect(2 + walkOffset, h - 6, 9, 6);
      ctx.fillRect(w - 11 - walkOffset, h - 6, 9, 6);
      // Shoe sole highlight
      ctx.fillStyle = '#78350F';
      ctx.fillRect(2 + walkOffset, h - 2, 9, 2);
      ctx.fillRect(w - 11 - walkOffset, h - 2, 9, 2);
    }

    // 2. Overalls / Legs
    ctx.fillStyle = overallColor;
    const bodyHeight = isSuper ? 18 : 12;
    const bodyY = h - bodyHeight - 6 + squishY;
    ctx.fillRect(4, bodyY, w - 8, bodyHeight);

    // Overalls straps
    ctx.fillRect(6, bodyY - (isSuper ? 6 : 4), 4, isSuper ? 7 : 5);
    ctx.fillRect(w - 10, bodyY - (isSuper ? 6 : 4), 4, isSuper ? 7 : 5);

    // Yellow overall buttons with 3D highlight
    ctx.fillStyle = buttonColor;
    ctx.fillRect(7, bodyY - 1, 2, 2);
    ctx.fillRect(w - 9, bodyY - 1, 2, 2);

    // 3. Shirt / Sleeves & Torso
    ctx.fillStyle = shirtColor;
    ctx.fillRect(9, bodyY - 2, w - 18, 4);

    // Arms
    if (isJumping) {
      // Leading arm punches up!
      ctx.fillRect(w - 8, bodyY - 10, 6, 9);
      ctx.fillRect(0, bodyY + 2, 6, 7);
    } else {
      ctx.fillRect(0, bodyY + walkOffset, 5, 8);
      ctx.fillRect(w - 5, bodyY - walkOffset, 5, 8);
    }

    // White Gloves
    ctx.fillStyle = '#FFFFFF';
    if (isJumping) {
      ctx.fillRect(w - 9, bodyY - 14, 8, 6); // punching fist
      ctx.fillRect(0, bodyY + 7, 5, 5);
    } else {
      ctx.fillRect(0, bodyY + 6 + walkOffset, 5, 5);
      ctx.fillRect(w - 5, bodyY + 6 - walkOffset, 5, 5);
    }

    // 4. Head & Face
    const headH = isSuper ? 16 : 14;
    const headW = isMario ? 18 : 16;
    const headX = (w - headW) / 2;
    const headY = bodyY - headH + 4 + squishY;

    // Skin (Face) with cheek shading
    ctx.fillStyle = skinColor;
    ctx.fillRect(headX + 2, headY + 3, headW - 3, headH - 4);
    ctx.fillStyle = skinShadow;
    ctx.fillRect(headX + 2, headY + headH - 3, headW - 5, 2);

    // Big Nose
    ctx.fillStyle = skinColor;
    ctx.fillRect(headX + headW - 4, headY + 5, 5, 5);
    ctx.fillStyle = skinShadow;
    ctx.fillRect(headX + headW - 2, headY + 9, 3, 1);

    // Expressive Eye with specular catchlight
    ctx.fillStyle = '#000000';
    ctx.fillRect(headX + headW - 7, headY + 4, 2, 4);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(headX + headW - 7, headY + 4, 1, 2);

    // Mustache (Iconic!)
    ctx.fillStyle = hairColor;
    if (isMario) {
      ctx.fillRect(headX + 6, headY + 8, headW - 5, 4);
      ctx.fillRect(headX + headW - 3, headY + 9, 3, 3);
    } else {
      ctx.fillRect(headX + 5, headY + 8, headW - 4, 3);
      ctx.fillRect(headX + headW - 2, headY + 9, 3, 2);
    }

    // Sideburn / Hair back
    ctx.fillRect(headX, headY + 4, 4, 7);

    // 5. Cap & Emblem
    ctx.fillStyle = capColor;
    // Cap brim
    ctx.fillRect(headX + 2, headY - 1, headW + 2, 4);
    // Cap crown
    ctx.fillRect(headX + 1, headY - 5, headW - 2, 5);
    // Cap highlight brim
    ctx.fillStyle = isFire ? '#E2E8F0' : isMario ? '#EF4444' : '#22C55E';
    ctx.fillRect(headX + 2, headY - 2, headW, 1);

    // Cap White Emblem Circle
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(headX + 9, headY - 2, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // 'M' or 'L' Letter on Cap
    ctx.fillStyle = isMario ? '#DC2626' : '#16A34A';
    ctx.font = 'bold 5px sans-serif';
    ctx.fillText(isMario ? 'M' : 'L', headX + 7, headY);

    ctx.restore(); // Undo flip

    // ==========================================
    // 6. IN-GAME OVERHEAD UI (Player Tags & Health Hearts)
    // ==========================================
    const tagY = bodyY - headH - 12 + squishY;
    const tagX = w / 2;

    // Draw Player Overhead Badge (P1 MARIO / P2 LUIGI)
    ctx.save();
    ctx.font = 'bold 7px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const pLabel = isMario ? 'P1' : 'P2';
    const tagBg = isMario ? '#DC2626' : '#16A34A';

    // Badge pill background
    const pillW = 20;
    const pillH = 9;
    ctx.fillStyle = tagBg;
    ctx.beginPath();
    ctx.roundRect(tagX - pillW / 2, tagY - pillH / 2, pillW, pillH, 3);
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Downward pointer arrow
    ctx.fillStyle = tagBg;
    ctx.beginPath();
    ctx.moveTo(tagX - 3, tagY + pillH / 2);
    ctx.lineTo(tagX + 3, tagY + pillH / 2);
    ctx.lineTo(tagX, tagY + pillH / 2 + 3);
    ctx.fill();

    // Text P1 or P2
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(pLabel, tagX, tagY);

    // Power-Up Badge Floating Icon
    if (player.power === 'fire') {
      ctx.fillStyle = '#F97316';
      ctx.font = 'bold 7px sans-serif';
      ctx.fillText('🔥', tagX + pillW / 2 + 5, tagY);
    } else if (player.starTimer > 0) {
      ctx.fillStyle = '#FACC15';
      ctx.font = 'bold 7px sans-serif';
      ctx.fillText('★', tagX + pillW / 2 + 5, tagY);
    }

    // Mini Health Hearts overhead (Displays when damaged, invulnerable, or low health)
    if (player.invulnerableTimer > 0 || player.lives < 3) {
      const heartY = tagY - 9;
      for (let i = 0; i < player.maxLives; i++) {
        const hx = tagX + (i - 1) * 7;
        const isFilled = i < player.lives;
        ctx.fillStyle = isFilled
          ? isMario
            ? '#EF4444'
            : '#10B981'
          : 'rgba(100, 116, 139, 0.45)';
        ctx.font = 'bold 8px sans-serif';
        ctx.fillText(isFilled ? '♥' : '♡', hx, heartY);
      }
    }

    ctx.restore();
    ctx.restore();
  }

  // Floating Rescue Bubble when brother is knocked out
  private static renderRescueBubble(
    ctx: CanvasRenderingContext2D,
    player: Player,
    tick: number
  ) {
    const floatBob = Math.sin(tick * 0.08) * 4;
    const centerX = player.width / 2;
    const centerY = player.height / 2 + floatBob;
    const radius = 22;

    // Glowing outer bubble aura
    const gradient = ctx.createRadialGradient(
      centerX - 5,
      centerY - 5,
      4,
      centerX,
      centerY,
      radius
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
    gradient.addColorStop(0.3, 'rgba(120, 220, 255, 0.6)');
    gradient.addColorStop(0.8, 'rgba(50, 150, 255, 0.3)');
    gradient.addColorStop(1, 'rgba(0, 100, 255, 0.7)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();

    // Bubble rim
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Bubble shine highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.ellipse(centerX - 8, centerY - 8, 5, 2.5, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();

    // Mini sleeping/waiting brother inside
    ctx.save();
    ctx.translate(centerX - 10, centerY - 10);
    ctx.scale(0.65, 0.65);
    const isMario = player.id === 'mario';
    ctx.fillStyle = isMario ? '#E52521' : '#00A800';
    ctx.fillRect(4, 2, 16, 12);
    ctx.fillStyle = '#FCD0A1';
    ctx.fillRect(8, 6, 10, 8);
    ctx.fillStyle = isMario ? '#0025D0' : '#001A88';
    ctx.fillRect(4, 14, 16, 10);
    ctx.restore();

    // "TOUCH TO RESCUE!" indicator tag
    const bounceText = Math.sin(tick * 0.15) * 2;
    ctx.fillStyle = '#FFE600';
    ctx.font = 'bold 8px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('POP ME!', centerX, centerY - radius - 6 + bounceText);
  }

  // Render Enemy
  public static renderEnemy(
    ctx: CanvasRenderingContext2D,
    enemy: Enemy,
    tick: number
  ) {
    ctx.save();
    ctx.translate(Math.round(enemy.x), Math.round(enemy.y));

    if (enemy.facing === 'right') {
      ctx.translate(enemy.width, 0);
      ctx.scale(-1, 1);
    }

    if (enemy.type === 'goomba') {
      this.renderGoomba(ctx, enemy, tick);
    } else if (enemy.type === 'koopa') {
      this.renderKoopa(ctx, enemy, tick);
    } else if (enemy.type === 'piranha') {
      this.renderPiranha(ctx, enemy, tick);
    } else if (enemy.type === 'bowser') {
      this.renderBowser(ctx, enemy, tick);
    }

    ctx.restore();
  }

  // ==========================================
  // GOOMBA MONSTER (Upgraded Pixel Art & UI)
  // ==========================================
  private static renderGoomba(ctx: CanvasRenderingContext2D, enemy: Enemy, tick: number) {
    const w = enemy.width;
    const h = enemy.height;

    // Ground drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(w / 2, h - 1, w / 2 - 1, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    if (enemy.isDead) {
      // Squished flat goomba with cartoon dizzy stars and X_X eyes!
      ctx.fillStyle = '#853A00';
      ctx.fillRect(1, h - 8, w - 2, 8);
      ctx.fillStyle = '#FCD0A1';
      ctx.fillRect(3, h - 6, w - 6, 4);

      // Cartoon X_X Eyes
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1.5;
      // Left eye X
      ctx.beginPath();
      ctx.moveTo(5, h - 6);
      ctx.lineTo(8, h - 2);
      ctx.moveTo(8, h - 6);
      ctx.lineTo(5, h - 2);
      ctx.stroke();

      // Right eye X
      ctx.beginPath();
      ctx.moveTo(w - 8, h - 6);
      ctx.lineTo(w - 5, h - 2);
      ctx.moveTo(w - 5, h - 6);
      ctx.lineTo(w - 8, h - 2);
      ctx.stroke();

      // Rotating cartoon dizziness stars
      const starAngle = tick * 0.15;
      ctx.fillStyle = '#FACC15';
      ctx.font = 'bold 8px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('💫', w / 2 + Math.cos(starAngle) * 6, h - 12);
      return;
    }

    const step = Math.floor(tick / 8) % 2;

    // 1. Shaded Walking Feet (Dark Chocolate Brown)
    ctx.fillStyle = '#261405';
    if (step === 0) {
      // Left foot forward, right foot back
      ctx.fillRect(1, h - 6, 8, 6);
      ctx.fillStyle = '#4A2805';
      ctx.fillRect(2, h - 5, 6, 2); // foot highlight
      ctx.fillStyle = '#261405';
      ctx.fillRect(w - 8, h - 4, 7, 4);
    } else {
      // Right foot forward, left foot back
      ctx.fillRect(2, h - 4, 7, 4);
      ctx.fillRect(w - 9, h - 6, 8, 6);
      ctx.fillStyle = '#4A2805';
      ctx.fillRect(w - 8, h - 5, 6, 2); // foot highlight
    }

    // 2. Stem / Body (Cream Shaded)
    ctx.fillStyle = '#E8BD8C';
    ctx.fillRect(5, h - 14, w - 10, 10);
    ctx.fillStyle = '#FCD0A1';
    ctx.fillRect(6, h - 13, w - 12, 8);

    // 3. Brown Mushroom Head with 3D highlight & contour
    ctx.fillStyle = '#9C4A00';
    ctx.beginPath();
    ctx.moveTo(w / 2, 0);
    ctx.quadraticCurveTo(w + 4, 3, w - 1, h - 10);
    ctx.lineTo(1, h - 10);
    ctx.quadraticCurveTo(-4, 3, w / 2, 0);
    ctx.fill();

    // Cap glossy highlight
    ctx.fillStyle = '#BD620D';
    ctx.beginPath();
    ctx.ellipse(w / 2 - 2, 4, 5, 2.5, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Cap bottom rim contour
    ctx.fillStyle = '#6E3200';
    ctx.fillRect(2, h - 11, w - 4, 2);

    // 4. Angry Eyebrows
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(2, h - 18);
    ctx.lineTo(10, h - 14);
    ctx.lineTo(10, h - 12);
    ctx.lineTo(2, h - 16);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(w - 2, h - 18);
    ctx.lineTo(w - 10, h - 14);
    ctx.lineTo(w - 10, h - 12);
    ctx.lineTo(w - 2, h - 16);
    ctx.fill();

    // 5. Expressive Animated Eyes
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(4, h - 14, 5, 7);
    ctx.fillRect(w - 9, h - 14, 5, 7);

    // Pupils that glance forward
    ctx.fillStyle = '#000000';
    ctx.fillRect(6, h - 13, 3, 5);
    ctx.fillRect(w - 7, h - 13, 3, 5);

    // Pupil white catchlight
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(6, h - 13, 1, 2);
    ctx.fillRect(w - 7, h - 13, 1, 2);

    // 6. Little white fangs
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(6, h - 9, 2, 2);
    ctx.fillRect(w - 8, h - 9, 2, 2);
  }

  // ==========================================
  // KOOPA TROOPA (Upgraded Turtle Monster & Shell UI)
  // ==========================================
  private static renderKoopa(ctx: CanvasRenderingContext2D, enemy: Enemy, tick: number) {
    const w = enemy.width;
    const h = enemy.height;

    // Ground shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(w / 2, h - 1, w / 2 - 1, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    if (enemy.isShell) {
      // Retracted Koopa Shell
      const isMoving = !!enemy.isShellMoving;
      const spinTick = isMoving ? Math.floor(tick * 0.7) % 4 : 0;

      // Friction sparks if moving fast
      if (isMoving) {
        ctx.fillStyle = '#F59E0B';
        const sparkY = h - 2 + (Math.sin(tick * 0.9) * 2);
        ctx.fillRect(-4, sparkY, 3, 2);
        ctx.fillStyle = '#EF4444';
        ctx.fillRect(-7, sparkY + 1, 2, 2);

        // Motion speed trail lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-10, h - 12);
        ctx.lineTo(-2, h - 12);
        ctx.moveTo(-14, h - 16);
        ctx.lineTo(-4, h - 16);
        ctx.stroke();
      }

      // Shell Body (Vibrant Green with 3D gradient)
      ctx.fillStyle = '#15803D';
      ctx.beginPath();
      ctx.roundRect(2, h - 22, w - 4, 18, 6);
      ctx.fill();

      // Shell highlight
      ctx.fillStyle = '#22C55E';
      ctx.beginPath();
      ctx.roundRect(4, h - 20, w - 8, 8, 4);
      ctx.fill();

      // White Scalloped Shell Rim
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, h - 6, w, 5);
      ctx.fillStyle = '#CBD5E1';
      ctx.fillRect(0, h - 2, w, 1);

      // Distinct Hexagonal Shell Plates (spin during movement)
      ctx.fillStyle = '#14532D';
      const offset = spinTick * 3;
      ctx.fillRect(4 + offset, h - 17, 5, 8);
      ctx.fillRect(w - 11 + offset, h - 17, 5, 8);
      return;
    }

    const step = Math.floor(tick / 8) % 2;

    // 1. Green Shell (Carapace)
    ctx.fillStyle = '#15803D';
    ctx.beginPath();
    ctx.roundRect(3, h - 23, w - 7, 18, 6);
    ctx.fill();

    // Shell highlight
    ctx.fillStyle = '#22C55E';
    ctx.beginPath();
    ctx.roundRect(5, h - 21, w - 11, 7, 4);
    ctx.fill();

    // Shell Rim (Cream/White)
    ctx.fillStyle = '#FEF08A';
    ctx.fillRect(2, h - 8, w - 4, 4);
    ctx.fillStyle = '#CA8A04';
    ctx.fillRect(2, h - 5, w - 4, 1);

    // 2. Beak & Head (Cute Yellow Turtle)
    ctx.fillStyle = '#FACC15';
    ctx.fillRect(w - 13, h - 31, 13, 11);

    // Snout / Beak
    ctx.fillStyle = '#EAB308';
    ctx.fillRect(w - 4, h - 26, 4, 6);

    // Eye with catchlight
    ctx.fillStyle = '#000000';
    ctx.fillRect(w - 7, h - 29, 2, 4);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(w - 7, h - 29, 1, 2);

    // 3. Red / Orange Walking Boots
    ctx.fillStyle = '#DC2626';
    if (step === 0) {
      ctx.fillRect(2, h - 6, 7, 6);
      ctx.fillRect(w - 9, h - 8, 7, 6);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(2, h - 2, 7, 2); // White shoe soles
      ctx.fillRect(w - 9, h - 4, 7, 2);
    } else {
      ctx.fillRect(2, h - 8, 7, 6);
      ctx.fillRect(w - 9, h - 6, 7, 6);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(2, h - 4, 7, 2); // White shoe soles
      ctx.fillRect(w - 9, h - 2, 7, 2);
    }
  }

  // ==========================================
  // PIRANHA PLANT (Pipe Monster with Snapping Jaws & Warning UI)
  // ==========================================
  private static renderPiranha(ctx: CanvasRenderingContext2D, enemy: Enemy, tick: number) {
    const w = enemy.width;
    const h = enemy.height;
    const chomp = Math.floor(tick / 5) % 2 === 0;

    // Green Flexible Stalk with stem shading
    ctx.fillStyle = '#15803D';
    ctx.fillRect(w / 2 - 4, 16, 8, h - 16);
    ctx.fillStyle = '#22C55E';
    ctx.fillRect(w / 2 - 2, 16, 4, h - 16);

    // Leaves with vein texture
    ctx.fillStyle = '#16A34A';
    ctx.beginPath();
    ctx.ellipse(w / 2 - 10, 22, 6, 4, -0.4, 0, Math.PI * 2);
    ctx.ellipse(w / 2 + 10, 24, 6, 4, 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Red Predatory Head with gloss
    ctx.fillStyle = '#DC2626';
    ctx.beginPath();
    ctx.arc(w / 2, 10, 13, 0, Math.PI * 2);
    ctx.fill();

    // Glossy White Polka Dots
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(w / 2 - 7, 5, 2.5, 0, Math.PI * 2);
    ctx.arc(w / 2 + 6, 6, 2.5, 0, Math.PI * 2);
    ctx.arc(w / 2 - 2, 2, 2, 0, Math.PI * 2);
    ctx.fill();

    // Ferocious Jagged White Teeth & Articulated Jaws
    ctx.fillStyle = '#FFFFFF';
    if (chomp) {
      // Jaws snapped closed!
      ctx.fillRect(w / 2 - 9, 9, 18, 4);
      ctx.fillStyle = '#7F1D1D';
      ctx.fillRect(w / 2 - 7, 10, 14, 2);
    } else {
      // Jaws open wide with razor-sharp fangs!
      ctx.fillRect(w / 2 - 9, 7, 18, 2);
      ctx.fillRect(w / 2 - 9, 14, 18, 2);

      // Sharp upper fangs
      ctx.beginPath();
      ctx.moveTo(w / 2 - 6, 9);
      ctx.lineTo(w / 2 - 4, 12);
      ctx.lineTo(w / 2 - 2, 9);
      ctx.moveTo(w / 2 + 2, 9);
      ctx.lineTo(w / 2 + 4, 12);
      ctx.lineTo(w / 2 + 6, 9);
      ctx.fill();

      // Sharp lower fangs
      ctx.beginPath();
      ctx.moveTo(w / 2 - 4, 14);
      ctx.lineTo(w / 2 - 2, 11);
      ctx.lineTo(w / 2, 14);
      ctx.moveTo(w / 2 + 4, 14);
      ctx.lineTo(w / 2 + 6, 11);
      ctx.lineTo(w / 2 + 8, 14);
      ctx.fill();
    }
  }

  // ==========================================
  // BOWSER THE KOOPA KING (Epic Boss Monster & HP Meter UI)
  // ==========================================
  private static renderBowser(ctx: CanvasRenderingContext2D, enemy: Enemy, tick: number) {
    const w = enemy.width;
    const h = enemy.height;
    const breathFire = (enemy.attackTimer ?? 0) > 35;
    const hp = enemy.hp ?? 3;

    // Ground Boss Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(w / 2, h - 2, w / 2 - 4, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 1. Spiked Green Shell with Golden Rim
    ctx.fillStyle = '#065F46';
    ctx.beginPath();
    ctx.roundRect(8, 12, w - 18, h - 22, 10);
    ctx.fill();

    // Shell scute patterns
    ctx.fillStyle = '#047857';
    ctx.fillRect(14, 18, w - 30, h - 34);

    // Shell Red/Orange Spiked Rim
    ctx.fillStyle = '#EA580C';
    ctx.fillRect(3, 10, 6, h - 18);

    // Ivory Shell Spikes with Yellow Bases
    for (let i = 0; i < 3; i++) {
      const sy = 16 + i * 14;
      ctx.fillStyle = '#FACC15';
      ctx.fillRect(0, sy + 1, 4, 5);
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.moveTo(4, sy);
      ctx.lineTo(-3, sy + 3);
      ctx.lineTo(4, sy + 6);
      ctx.fill();
    }

    // 2. Muscular Body / Belly with Plates
    ctx.fillStyle = '#FBBF24';
    ctx.fillRect(16, 20, w - 24, h - 28);
    ctx.fillStyle = '#D97706';
    ctx.fillRect(18, 28, w - 28, 2);
    ctx.fillRect(18, 38, w - 28, 2);

    // 3. Heavy Clawed Feet
    ctx.fillStyle = '#065F46';
    ctx.fillRect(8, h - 10, 15, 10);
    ctx.fillRect(w - 25, h - 10, 15, 10);
    // Razor talons
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(6, h - 3, 5, 3);
    ctx.fillRect(w - 15, h - 3, 5, 3);

    // 4. Fiery Spiky Mohawk / Mane & Ivory Horns
    // Fiery hair that waves
    const hairWave = Math.sin(tick * 0.4) * 3;
    ctx.fillStyle = '#DC2626';
    ctx.beginPath();
    ctx.moveTo(w - 32, 2);
    ctx.lineTo(w - 18, -4 + hairWave);
    ctx.lineTo(w - 10, 8);
    ctx.lineTo(w - 32, 12);
    ctx.fill();
    ctx.fillStyle = '#F97316';
    ctx.fillRect(w - 24, 0, 8, 8);

    // Bull Horns
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(w - 18, 6);
    ctx.lineTo(w - 12, -6);
    ctx.lineTo(w - 6, 6);
    ctx.fill();
    ctx.fillStyle = '#E2E8F0';
    ctx.fillRect(w - 14, 4, 4, 4);

    // 5. Head, Jaws & Snout
    ctx.fillStyle = '#065F46';
    ctx.fillRect(w - 28, 10, 26, 18);
    ctx.fillStyle = '#FBBF24';
    ctx.fillRect(w - 20, 16, 20, 14);

    // Glowing Ruby-Red Eyes
    ctx.fillStyle = '#DC2626';
    ctx.fillRect(w - 16, 11, 5, 5);
    ctx.fillStyle = '#FACC15';
    ctx.fillRect(w - 14, 12, 2, 2); // fiery pupil

    // Razor-Sharp Fangs
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(w - 14, 22, 4, 5);
    ctx.fillRect(w - 5, 22, 4, 5);

    // Spiked Black Wristbands on Arms
    ctx.fillStyle = '#18181B';
    ctx.fillRect(w - 10, 28, 6, 6);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(w - 11, 29, 2, 2);
    ctx.fillRect(w - 11, 32, 2, 2);

    // 6. Dynamic Billowing Fire Breath
    if (breathFire) {
      const firePhase = (tick % 6);
      const fireRadius = 8 + firePhase * 2;
      const fireY = 24 + Math.sin(tick * 0.5) * 3;

      // Inner white-hot flame
      ctx.fillStyle = '#FEF08A';
      ctx.beginPath();
      ctx.arc(w + 10, fireY, fireRadius * 0.5, 0, Math.PI * 2);
      ctx.fill();

      // Middle blazing orange fireball
      ctx.fillStyle = '#F97316';
      ctx.beginPath();
      ctx.arc(w + 16, fireY, fireRadius * 0.8, 0, Math.PI * 2);
      ctx.fill();

      // Outer crimson flame burst
      ctx.fillStyle = '#DC2626';
      ctx.beginPath();
      ctx.arc(w + 24, fireY + (firePhase % 2 === 0 ? 3 : -3), fireRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    // ==========================================
    // 7. BOWSER BOSS OVERHEAD UI BADGE & HP HEARTS
    // ==========================================
    ctx.save();
    const bossUiY = -18;
    const bossUiW = 54;
    const bossUiH = 14;
    const centerX = w / 2;

    // Gold / Dark Arcade Frame
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.beginPath();
    ctx.roundRect(centerX - bossUiW / 2, bossUiY, bossUiW, bossUiH, 4);
    ctx.fill();
    ctx.strokeStyle = '#FACC15';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Boss Skull Icon / Crown
    ctx.fillStyle = '#FACC15';
    ctx.font = 'bold 8px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('👑', centerX - bossUiW / 2 + 7, bossUiY + bossUiH / 2);

    // 3 Segmented Boss Health Hearts
    for (let i = 0; i < 3; i++) {
      const heartX = centerX - 6 + i * 11;
      const isAlive = i < hp;
      ctx.fillStyle = isAlive ? '#EF4444' : 'rgba(255, 255, 255, 0.2)';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText(isAlive ? '♥' : '♡', heartX, bossUiY + bossUiH / 2);
    }

    ctx.restore();
  }

  // Render Blocks
  public static renderBlock(
    ctx: CanvasRenderingContext2D,
    block: Block,
    tick: number
  ) {
    ctx.save();
    const bump = block.bumpOffset ?? 0;
    ctx.translate(block.x, block.y - bump);

    const w = block.width;
    const h = block.height;

    switch (block.type) {
      case 'ground': {
        const isUnderground = block.colorTheme === 'underground';
        const isCastle = block.colorTheme === 'castle';

        ctx.fillStyle = isCastle ? '#3F3F46' : isUnderground ? '#1E293B' : '#8B5A2B';
        ctx.fillRect(0, 0, w, h);

        // Top grass/highlight edge
        ctx.fillStyle = isCastle ? '#71717A' : isUnderground ? '#38BDF8' : '#22C55E';
        ctx.fillRect(0, 0, w, 4);

        // Texture specks
        ctx.fillStyle = isCastle ? '#27272A' : isUnderground ? '#0F172A' : '#654321';
        ctx.fillRect(4, 8, 4, 4);
        ctx.fillRect(18, 16, 5, 4);
        break;
      }

      case 'question': {
        if (block.isHit) {
          // Empty bronze block
          ctx.fillStyle = '#8B6508';
          ctx.fillRect(0, 0, w, h);
          ctx.fillStyle = '#553A00';
          ctx.fillRect(2, 2, w - 4, h - 4);
          ctx.fillStyle = '#000000';
          ctx.fillRect(3, 3, 2, 2);
          ctx.fillRect(w - 5, 3, 2, 2);
          ctx.fillRect(3, h - 5, 2, 2);
          ctx.fillRect(w - 5, h - 5, 2, 2);
        } else {
          // Golden animated pulsing question block
          const pulse = Math.sin(tick * 0.1) * 15;
          ctx.fillStyle = `rgb(${248 + pulse}, ${170 + pulse}, 0)`;
          ctx.fillRect(0, 0, w, h);

          // Inner border
          ctx.fillStyle = '#C88000';
          ctx.strokeRect(1.5, 1.5, w - 3, h - 3);

          // Corner rivets
          ctx.fillStyle = '#804000';
          ctx.fillRect(2, 2, 3, 3);
          ctx.fillRect(w - 5, 2, 3, 3);
          ctx.fillRect(2, h - 5, 3, 3);
          ctx.fillRect(w - 5, h - 5, 3, 3);

          // Animated Question Mark '?'
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 16px "Press Start 2P", monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('?', w / 2, h / 2 + 1);
        }
        break;
      }

      case 'brick': {
        const isCastle = block.colorTheme === 'castle';
        const isUnderground = block.colorTheme === 'underground';
        ctx.fillStyle = isCastle ? '#4B5563' : isUnderground ? '#0369A1' : '#B24502';
        ctx.fillRect(0, 0, w, h);

        // Mortar lines
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, w, 1);
        ctx.fillRect(0, h / 2, w, 1);
        ctx.fillRect(w / 2, 0, 1, h / 2);
        ctx.fillRect(w / 4, h / 2, 1, h / 2);
        ctx.fillRect((3 * w) / 4, h / 2, 1, h / 2);
        break;
      }

      case 'pipe':
      case 'pipeTop': {
        const isTop = block.type === 'pipeTop';
        const grad = ctx.createLinearGradient(0, 0, w, 0);
        grad.addColorStop(0, '#005000');
        grad.addColorStop(0.25, '#00A800');
        grad.addColorStop(0.5, '#40E040');
        grad.addColorStop(0.85, '#00A800');
        grad.addColorStop(1, '#003800');

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = '#002500';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, w, h);

        if (isTop) {
          // Top rim dark opening
          ctx.fillStyle = '#001A00';
          ctx.fillRect(2, 2, w - 4, 3);
        }
        break;
      }

      case 'cloud': {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.beginPath();
        ctx.roundRect(0, 4, w, h - 8, 12);
        ctx.fill();
        ctx.strokeStyle = '#93C5FD';
        ctx.lineWidth = 2;
        ctx.stroke();
        break;
      }

      case 'switch': {
        // Co-op Pressure Switch (Requires both players or one player standing)
        const isPressed = block.switchPressed;
        const required = block.switchRequiredPlayers ?? 1;

        // Base plate
        ctx.fillStyle = '#3F3F46';
        ctx.fillRect(0, h - 6, w, 6);

        // Switch button
        const buttonH = isPressed ? 4 : 12;
        const buttonY = h - 6 - buttonH;

        ctx.fillStyle = required === 2 ? '#EF4444' : '#EAB308';
        ctx.fillRect(4, buttonY, w - 8, buttonH);

        // Label on switch
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 7px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(required === 2 ? '2P' : '1P', w / 2, buttonY + (buttonH / 2) + 2);
        break;
      }

      case 'gate': {
        // Co-op barrier gate that slides open
        const openH = block.gateHeight ?? 0;
        ctx.fillStyle = '#64748B';
        ctx.fillRect(0, 0, w, h - openH);

        // Bars pattern
        ctx.fillStyle = '#334155';
        for (let x = 4; x < w; x += 8) {
          ctx.fillRect(x, 0, 3, h - openH);
        }

        // Lock icon
        if (!block.gateOpen) {
          ctx.fillStyle = '#F59E0B';
          ctx.fillRect(w / 2 - 5, (h - openH) / 2 - 5, 10, 10);
        }
        break;
      }

      case 'flagpole': {
        // Flagpole pole
        ctx.fillStyle = '#D4D4D8';
        ctx.fillRect(w / 2 - 2, 0, 4, h);

        // Golden ball top
        ctx.fillStyle = '#FACC15';
        ctx.beginPath();
        ctx.arc(w / 2, 6, 6, 0, Math.PI * 2);
        ctx.fill();

        // Flag sliding down (using block.bumpOffset as slide distance from top)
        const slide = block.bumpOffset ?? 0;
        const flagY = Math.min(h - 26, 10 + slide);

        // Green flag body
        ctx.fillStyle = '#22C55E';
        ctx.beginPath();
        ctx.moveTo(w / 2 - 2, flagY);
        ctx.lineTo(w / 2 - 22, flagY + 10);
        ctx.lineTo(w / 2 - 2, flagY + 20);
        ctx.closePath();
        ctx.fill();

        // Border around flag
        ctx.strokeStyle = '#15803D';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Mario/Luigi white circle emblem on flag
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(w / 2 - 11, flagY + 10, 3.5, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'castle': {
        // Castle entrance
        ctx.fillStyle = '#475569';
        ctx.fillRect(0, 0, w, h);

        // Castle battlements / crenellations
        ctx.fillStyle = '#334155';
        const merlonWidth = w / 7;
        for (let i = 0; i < 7; i += 2) {
          ctx.fillRect(i * merlonWidth, -8, merlonWidth, 8);
        }

        // Arched door
        ctx.fillStyle = '#0F172A';
        ctx.beginPath();
        ctx.arc(w / 2, h - 20, 16, Math.PI, 0);
        ctx.lineTo(w / 2 + 16, h);
        ctx.lineTo(w / 2 - 16, h);
        ctx.fill();

        // Victory flagpole raised on top of castle when cleared
        if (block.bumpOffset && block.bumpOffset > 0) {
          const rise = Math.min(22, block.bumpOffset);
          // Pole
          ctx.fillStyle = '#D4D4D8';
          ctx.fillRect(w / 2 - 1, -8 - rise, 2, rise);
          // Small red banner
          ctx.fillStyle = '#EF4444';
          ctx.fillRect(w / 2 + 1, -8 - rise, 12, 8);
        }
        break;
      }

      case 'lava': {
        // Bubbling castle lava
        const wave = Math.sin(tick * 0.15) * 3;
        ctx.fillStyle = '#EF4444';
        ctx.fillRect(0, 4 + wave, w, h - 4);
        ctx.fillStyle = '#F59E0B';
        ctx.fillRect(0, 0 + wave, w, 4);
        break;
      }
    }

    ctx.restore();
  }

  // Render Items (Coins, Mushrooms, Fire Flowers, Stars, Star Coins)
  public static renderItem(
    ctx: CanvasRenderingContext2D,
    item: Item,
    tick: number
  ) {
    if (item.isCollected) return;

    ctx.save();
    ctx.translate(Math.round(item.x), Math.round(item.y));
    const w = item.width;
    const h = item.height;

    switch (item.type) {
      case 'coin': {
        // Spinning golden coin
        const spin = Math.sin(tick * 0.2);
        const coinW = Math.max(2, Math.abs(spin) * w);
        ctx.fillStyle = '#FACC15';
        ctx.fillRect((w - coinW) / 2, 0, coinW, h);
        ctx.fillStyle = '#CA8A04';
        ctx.fillRect((w - coinW) / 2 + 1, 2, Math.max(1, coinW - 2), h - 4);
        break;
      }

      case 'starCoin': {
        // Huge golden star medallion
        const spin = Math.sin(tick * 0.12);
        const coinW = Math.max(4, Math.abs(spin) * w);
        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.ellipse(w / 2, h / 2, coinW / 2, h / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#FDE047';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Star inside
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('★', w / 2, h / 2);
        break;
      }

      case 'mushroom':
      case '1up': {
        const is1up = item.type === '1up';
        const capColor = is1up ? '#22C55E' : '#EF4444';

        // Cap
        ctx.fillStyle = capColor;
        ctx.beginPath();
        ctx.arc(w / 2, 10, 10, Math.PI, 0);
        ctx.fill();

        // White spots
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(w / 2 - 3, 2, 6, 6);
        ctx.fillRect(w / 2 - 9, 6, 4, 4);
        ctx.fillRect(w / 2 + 5, 6, 4, 4);

        // Stalk
        ctx.fillStyle = '#FCD0A1';
        ctx.fillRect(w / 2 - 6, 10, 12, 10);
        ctx.fillStyle = '#000000';
        ctx.fillRect(w / 2 - 4, 12, 2, 4);
        ctx.fillRect(w / 2 + 2, 12, 2, 4);
        break;
      }

      case 'fireflower': {
        // Animated petal colors
        const colors = ['#EF4444', '#F59E0B', '#F8FAFC'];
        const frame = Math.floor(tick / 6) % 3;

        // Stem
        ctx.fillStyle = '#22C55E';
        ctx.fillRect(w / 2 - 2, 12, 4, 10);

        // Outer petals
        ctx.fillStyle = colors[frame];
        ctx.beginPath();
        ctx.arc(w / 2, 8, 8, 0, Math.PI * 2);
        ctx.fill();

        // Inner center
        ctx.fillStyle = '#FCD0A1';
        ctx.beginPath();
        ctx.arc(w / 2, 8, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000000';
        ctx.fillRect(w / 2 - 1, 6, 2, 4);
        break;
      }

      case 'star': {
        // Rainbow star
        const hues = [0, 60, 120, 180, 240, 300];
        const hue = hues[Math.floor(tick / 4) % hues.length];
        ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
        ctx.font = 'bold 20px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('★', w / 2, h / 2);
        break;
      }
    }

    ctx.restore();
  }

  // Render Fireball
  public static renderFireball(
    ctx: CanvasRenderingContext2D,
    fb: Fireball,
    tick: number
  ) {
    ctx.save();
    ctx.translate(Math.round(fb.x), Math.round(fb.y));

    const spin = tick * 0.4;
    ctx.rotate(spin);

    const isBowser = fb.owner === 'bowser';
    const radius = isBowser ? fb.radius * 1.5 : fb.radius;

    // Glowing core
    const grad = ctx.createRadialGradient(0, 0, 1, 0, 0, radius);
    grad.addColorStop(0, '#FFFFFF');
    grad.addColorStop(0.3, isBowser ? '#FF2200' : '#F59E0B');
    grad.addColorStop(1, isBowser ? '#990000' : '#DC2626');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Render Particles
  public static renderParticle(
    ctx: CanvasRenderingContext2D,
    p: Particle
  ) {
    ctx.save();
    const alpha = Math.max(0, p.life / p.maxLife);
    ctx.globalAlpha = alpha;

    if (p.type === 'scoreText' && p.text) {
      ctx.fillStyle = p.color || '#FACC15';
      ctx.font = 'bold 10px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(p.text, p.x, p.y);
    } else if (p.type === 'brickChunk') {
      ctx.fillStyle = p.color || '#B24502';
      const sz = p.size || 6;
      ctx.fillRect(p.x - sz / 2, p.y - sz / 2, sz, sz);
    } else {
      ctx.fillStyle = p.color || '#FFFFFF';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size || 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}
