/**
 * Procedural Web Audio Engine for "Still Here?"
 * Synthesizes vintage mechanical teletype clicks, camera shutter snaps,
 * low-frequency 48Hz dread drone, distant procedural breathing,
 * and sudden dead silence right before scares.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private droneOsc: OscillatorNode | null = null;
  private droneGain: GainNode | null = null;
  private breathInterval: any = null;
  private isMuted: boolean = false;
  private isUnlocked: boolean = false;

  public initContext() {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    this.isUnlocked = true;
    return this.ctx;
  }

  /**
   * Crisp mechanical typewriter click with dynamic pitch decay
   */
  public playKeystroke(pitchMultiplier: number = 1.0) {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const clampedPitch = Math.max(0.35, Math.min(1.2, pitchMultiplier));

    // 1. Noise burst
    const bufferSize = ctx.sampleRate * 0.035;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.setValueAtTime(1400 * clampedPitch, t);
    bandpass.Q.setValueAtTime(4.0, t);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.35, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

    noise.connect(bandpass);
    bandpass.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(t);

    // 2. Tonal metal clack
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(320 * clampedPitch, t);
    osc.frequency.exponentialRampToValueAtTime(80 * clampedPitch, t + 0.04);

    oscGain.gain.setValueAtTime(0.25, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.05);
  }

  /**
   * Vintage camera snapshot shutter sound
   */
  public playCameraShutter() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const t = ctx.currentTime;

    // First shutter snap
    this.playKeystroke(1.2);

    // Second curtain clack 110ms later
    setTimeout(() => {
      if (this.ctx) {
        const t2 = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(240, t2);
        osc.frequency.exponentialRampToValueAtTime(60, t2 + 0.06);
        gain.gain.setValueAtTime(0.4, t2);
        gain.gain.exponentialRampToValueAtTime(0.001, t2 + 0.06);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t2);
        osc.stop(t2 + 0.065);
      }
    }, 110);
  }

  /**
   * Violent screen glitch sting
   */
  public playGlitchSting() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const bufferSize = ctx.sampleRate * 0.35;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "notch";
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.linearRampToValueAtTime(120, t + 0.3);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.55, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(t);
  }

  /**
   * Distant procedural breathing synthesis (low, uncanny rhythm)
   */
  public playDistantBreath() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const duration = 3.6; // Inhale + exhale cycle
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;

    // Resonant bandpass filter sweeping to simulate throat resonance
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.Q.setValueAtTime(6.0, t);

    // Inhale sweep up
    filter.frequency.setValueAtTime(180, t);
    filter.frequency.exponentialRampToValueAtTime(480, t + 1.6);
    // Exhale sweep down
    filter.frequency.exponentialRampToValueAtTime(140, t + duration);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.075, t + 1.4);
    gain.gain.linearRampToValueAtTime(0.001, t + duration);

    noiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noiseSource.start(t);
    noiseSource.stop(t + duration + 0.1);
  }

  /**
   * Ambient 48Hz paranoia sub-drone
   */
  public startAmbientDrone() {
    const ctx = this.initContext();
    if (!ctx || this.droneOsc) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(48, t);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.12, t + 3);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);

    this.droneOsc = osc;
    this.droneGain = gain;

    // Start periodic distant breath every 18 seconds
    if (!this.breathInterval) {
      this.breathInterval = setInterval(() => {
        this.playDistantBreath();
      }, 18000);
    }
  }

  /**
   * Sudden dead silence right before a scare
   * Cuts the drone and audio abruptly, then restores after durationMs
   */
  public triggerSuddenSilence(durationMs: number = 2400) {
    if (!this.ctx || !this.droneGain) return;
    try {
      const t = this.ctx.currentTime;
      // Abrupt cutoff to silence
      this.droneGain.gain.cancelScheduledValues(t);
      this.droneGain.gain.setValueAtTime(0.0001, t);

      setTimeout(() => {
        if (this.droneGain && this.ctx) {
          const tResume = this.ctx.currentTime;
          this.droneGain.gain.setValueAtTime(0.0001, tResume);
          this.droneGain.gain.linearRampToValueAtTime(0.12, tResume + 2);
        }
      }, durationMs);
    } catch (_) {}
  }

  public stopAllSound() {
    if (this.breathInterval) {
      clearInterval(this.breathInterval);
      this.breathInterval = null;
    }
    if (this.droneGain && this.ctx) {
      try {
        this.droneGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      } catch (_) {}
    }
    if (this.droneOsc) {
      try {
        this.droneOsc.stop();
        this.droneOsc.disconnect();
      } catch (_) {}
      this.droneOsc = null;
    }
  }
}

export const soundEngine = new SoundEngine();
