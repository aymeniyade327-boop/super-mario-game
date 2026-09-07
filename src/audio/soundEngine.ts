/**
 * Web Audio API Retro 8-bit / 16-bit Synthesizer Engine
 * Generates classic arcade sound effects and chiptune background music
 * without relying on external mp3 assets that might fail to load.
 */

class RetroSoundEngine {
  private ctx: AudioContext | null = null;
  private musicInterval: number | null = null;
  private isMusicPlaying = false;
  private currentMusicTheme: string | null = null;
  public soundEnabled = true;
  public musicEnabled = true;
  public masterVolume = 0.7;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public unlockAudio() {
    this.initContext();
  }

  // Play a synthesized tone with frequency envelope
  private playTone(
    freqStart: number,
    freqEnd: number,
    duration: number,
    type: OscillatorType = 'square',
    volume = 0.3,
    delay = 0
  ) {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = this.ctx.currentTime + delay;

      osc.type = type;
      osc.frequency.setValueAtTime(freqStart, startTime);
      osc.frequency.exponentialRampToValueAtTime(Math.max(freqEnd, 20), startTime + duration);

      const actualVolume = volume * this.masterVolume;
      gain.gain.setValueAtTime(actualVolume, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    } catch {
      // Audio context might be restricted before interaction
    }
  }

  // Synthesize white/pink noise for stomps, hits, explosions
  private playNoise(duration: number, volume = 0.4, cutoffFreq = 1200) {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(cutoffFreq, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + duration);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(volume * this.masterVolume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start();
    } catch {
      // Audio error catch
    }
  }

  // Mario Classic Jump
  public playJump(character: 'mario' | 'luigi' = 'mario') {
    if (character === 'mario') {
      this.playTone(150, 480, 0.18, 'square', 0.28);
    } else {
      // Luigi: Slightly higher, double-chirp flutter sound!
      this.playTone(180, 560, 0.14, 'triangle', 0.3);
      this.playTone(320, 620, 0.16, 'triangle', 0.25, 0.08);
    }
  }

  // Co-op Head Bounce / Buddy Boost
  public playBuddyBounce() {
    this.playTone(200, 700, 0.24, 'square', 0.35);
    this.playTone(400, 950, 0.2, 'triangle', 0.25, 0.04);
  }

  // Coin Chime
  public playCoin() {
    this.playTone(987.77, 987.77, 0.08, 'square', 0.25); // B5
    this.playTone(1318.51, 1318.51, 0.28, 'square', 0.3, 0.08); // E6
  }

  // Star Coin Collect (Glorious 3-tone arpeggio)
  public playStarCoin() {
    this.playTone(523.25, 523.25, 0.08, 'square', 0.3); // C5
    this.playTone(659.25, 659.25, 0.08, 'square', 0.3, 0.08); // E5
    this.playTone(783.99, 783.99, 0.08, 'square', 0.3, 0.16); // G5
    this.playTone(1046.5, 1046.5, 0.35, 'square', 0.35, 0.24); // C6
  }

  // Stomp enemy
  public playStomp() {
    this.playNoise(0.12, 0.45, 800);
    this.playTone(280, 90, 0.12, 'triangle', 0.35);
  }

  // Kick shell
  public playKick() {
    this.playNoise(0.16, 0.5, 1500);
    this.playTone(350, 120, 0.15, 'square', 0.3);
  }

  // Block hit / bump
  public playBump() {
    this.playTone(260, 110, 0.1, 'square', 0.3);
  }

  // Brick break
  public playBreakBlock() {
    this.playNoise(0.18, 0.4, 2000);
    this.playTone(160, 70, 0.14, 'triangle', 0.3);
  }

  // Power-up spawned (sprout from question block)
  public playPowerupSprout() {
    const notes = [330, 392, 494, 587, 659];
    notes.forEach((freq, idx) => {
      this.playTone(freq, freq, 0.06, 'triangle', 0.25, idx * 0.05);
    });
  }

  // Power-up collected
  public playPowerup() {
    const notes = [330, 392, 440, 523, 587, 659, 784, 880];
    notes.forEach((freq, idx) => {
      this.playTone(freq, freq * 1.05, 0.08, 'square', 0.26, idx * 0.04);
    });
  }

  // Power down / take damage
  public playPipeDown() {
    const notes = [440, 392, 349, 311, 261, 220, 174];
    notes.forEach((freq, idx) => {
      this.playTone(freq, freq * 0.95, 0.07, 'sawtooth', 0.22, idx * 0.04);
    });
  }

  // Fireball throw
  public playFireball() {
    this.playTone(800, 200, 0.12, 'sawtooth', 0.25);
  }

  // Rescue Bubble Pop!
  public playBubblePop() {
    this.playTone(500, 1200, 0.15, 'sine', 0.4);
    this.playNoise(0.08, 0.25, 3000);
  }

  // Co-op Switch Pressed
  public playSwitchClick() {
    this.playTone(400, 800, 0.08, 'square', 0.3);
    this.playTone(600, 1200, 0.12, 'triangle', 0.3, 0.06);
  }

  // Flagpole slide & clear
  public playFlagpole() {
    this.playTone(500, 150, 0.6, 'triangle', 0.3);
  }

  // Stage clear fanfare
  public playStageClear() {
    const melody = [
      { f: 523.25, d: 0.12, t: 0.0 }, // C5
      { f: 659.25, d: 0.12, t: 0.14 }, // E5
      { f: 783.99, d: 0.12, t: 0.28 }, // G5
      { f: 1046.5, d: 0.18, t: 0.42 }, // C6
      { f: 880.0, d: 0.14, t: 0.62 }, // A5
      { f: 1046.5, d: 0.4, t: 0.78 }, // C6
    ];
    melody.forEach((n) => {
      this.playTone(n.f, n.f, n.d, 'square', 0.35, n.t);
    });
  }

  // Game over tone
  public playGameOver() {
    const notes = [440, 415, 392, 370, 349, 311, 261];
    notes.forEach((freq, idx) => {
      this.playTone(freq, freq, 0.22, 'triangle', 0.3, idx * 0.16);
    });
  }

  // Bowser hit roar
  public playBossHit() {
    this.playNoise(0.35, 0.6, 600);
    this.playTone(180, 60, 0.3, 'sawtooth', 0.4);
  }

  // Mechanical UI click / key press feedback
  public playClick() {
    this.playTone(600, 300, 0.03, 'square', 0.12);
  }

  // Classic retro pause and resume sound
  public playPause() {
    this.playTone(660, 660, 0.07, 'square', 0.25);
    this.playTone(880, 880, 0.12, 'square', 0.25, 0.07);
  }

  public playUnpause() {
    this.playTone(880, 880, 0.07, 'square', 0.25);
    this.playTone(660, 660, 0.1, 'square', 0.25, 0.07);
  }

  // Background Chiptune Music Generator
  public startMusic(theme: 'overworld' | 'underground' | 'castle' = 'overworld') {
    if (!this.musicEnabled) return;
    if (this.isMusicPlaying && this.currentMusicTheme === theme) return;

    this.stopMusic();
    this.initContext();
    this.isMusicPlaying = true;
    this.currentMusicTheme = theme;

    let step = 0;

    // Chiptune note tables
    const overworldNotes = [
      659.25, 659.25, 0, 659.25, 0, 523.25, 659.25, 0, 783.99, 0, 0, 0, 392.0, 0, 0, 0,
      523.25, 0, 0, 392.0, 0, 0, 329.63, 0, 0, 440.0, 0, 493.88, 0, 466.16, 440.0, 0,
    ];

    const undergroundNotes = [
      130.81, 261.63, 116.54, 233.08, 110.0, 220.0, 103.83, 207.65,
      130.81, 261.63, 116.54, 233.08, 110.0, 220.0, 103.83, 207.65,
      164.81, 146.83, 130.81, 123.47, 110.0, 98.0, 123.47, 130.81,
    ];

    const castleNotes = [
      146.83, 0, 146.83, 155.56, 146.83, 0, 138.59, 146.83,
      174.61, 0, 164.81, 155.56, 146.83, 138.59, 130.81, 123.47,
    ];

    const tempoMs = theme === 'overworld' ? 140 : theme === 'castle' ? 160 : 180;

    this.musicInterval = window.setInterval(() => {
      if (!this.musicEnabled || !this.soundEnabled) return;

      const notes =
        theme === 'overworld' ? overworldNotes : theme === 'castle' ? castleNotes : undergroundNotes;
      const note = notes[step % notes.length];

      if (note > 0) {
        // Lead tone
        this.playTone(note, note, 0.09, theme === 'underground' ? 'triangle' : 'square', 0.12);
        // Bass accompaniment every 4 beats
        if (step % 4 === 0) {
          const bassNote = note / 2;
          this.playTone(bassNote, bassNote, 0.12, 'triangle', 0.15);
        }
      }

      step++;
    }, tempoMs);
  }

  public stopMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    this.isMusicPlaying = false;
    this.currentMusicTheme = null;
  }

  public toggleSound(): boolean {
    this.soundEnabled = !this.soundEnabled;
    if (!this.soundEnabled) {
      this.stopMusic();
    }
    return this.soundEnabled;
  }

  public toggleMusic(): boolean {
    this.musicEnabled = !this.musicEnabled;
    if (!this.musicEnabled) {
      this.stopMusic();
    } else if (this.currentMusicTheme) {
      this.startMusic(this.currentMusicTheme as 'overworld' | 'underground' | 'castle');
    }
    return this.musicEnabled;
  }
}

export const sound = new RetroSoundEngine();
