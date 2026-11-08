/**
 * Procedural Web Audio Engine for POND_OS 99
 * Synthesizes vintage mechanical teletype clicks, camera shutter snaps,
 * low-frequency dread drones, and violent audio glitches entirely in browser AudioContext.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private droneOsc: OscillatorNode | null = null;
  private droneGain: GainNode | null = null;
  private isMuted: boolean = false;

  private initContext() {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
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
   * Archaic camera snapshot shutter sound
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
   * Violent jumpscare audio impact
   */
  public playJumpscareSting() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(80, t);
    osc.frequency.exponentialRampToValueAtTime(680, t + 0.08);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.7);

    gain.gain.setValueAtTime(0.9, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.85);

    this.playGlitchSting();
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
  }

  public stopAllSound() {
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
