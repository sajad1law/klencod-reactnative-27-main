/**
 * Khaleeji 27 Sound Engine
 * Synthesizes tournament sounds (whistle, kicks, goal horns, crowd ambiance) using Web Audio API.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export const soundEngine = {
  muted: false,

  init() {
    getAudioContext();
  },

  isMuted() {
    return this.muted;
  },

  setMuted(m: boolean) {
    this.muted = m;
  },

  playClick() {
    if (this.muted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(250, ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {
      // Audio autoplay policy fallback
    }
  },

  playKick(intensity = 1) {
    if (this.muted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140 + intensity * 60, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.12);

      const vol = Math.min(0.4 * intensity, 0.5);
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.13);
    } catch {
      // Audio autoplay policy fallback
    }
  },

  playCollision() {
    if (this.muted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.07);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.07);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {
      // ignore
    }
  },

  playPost() {
    if (this.muted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.16);
    } catch {
      // ignore
    }
  },

  playWhistle(type: 'kickoff' | 'goal' | 'fulltime' = 'kickoff') {
    if (this.muted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const playTone = (startDelay: number, duration: number) => {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sine';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(2600, ctx.currentTime + startDelay);
        osc2.frequency.setValueAtTime(2850, ctx.currentTime + startDelay);

        gain.gain.setValueAtTime(0, ctx.currentTime + startDelay);
        gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + startDelay + 0.02);
        gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + startDelay + duration - 0.03);
        gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + startDelay + duration);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(ctx.currentTime + startDelay);
        osc2.start(ctx.currentTime + startDelay);
        osc1.stop(ctx.currentTime + startDelay + duration);
        osc2.stop(ctx.currentTime + startDelay + duration);
      };

      if (type === 'kickoff') {
        playTone(0, 0.4);
      } else if (type === 'goal') {
        playTone(0, 0.2);
        playTone(0.28, 0.6);
      } else if (type === 'fulltime') {
        playTone(0, 0.25);
        playTone(0.35, 0.25);
        playTone(0.7, 0.8);
      }
    } catch {
      // ignore
    }
  },

  playGoalRoar() {
    if (this.muted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      this.playWhistle('goal');

      // Synthesize deep celebration horn
      const horn = ctx.createOscillator();
      const hornGain = ctx.createGain();
      horn.type = 'sawtooth';
      horn.frequency.setValueAtTime(220, ctx.currentTime);
      horn.frequency.linearRampToValueAtTime(330, ctx.currentTime + 0.6);
      horn.frequency.setValueAtTime(440, ctx.currentTime + 0.8);

      hornGain.gain.setValueAtTime(0.2, ctx.currentTime);
      hornGain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.5);
      hornGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8);

      horn.connect(hornGain);
      hornGain.connect(ctx.destination);
      horn.start(ctx.currentTime);
      horn.stop(ctx.currentTime + 1.8);

      // Noise buffer for crowd cheer
      const bufferSize = ctx.sampleRate * 2.2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(900, ctx.currentTime);
      filter.Q.setValueAtTime(1.5, ctx.currentTime);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.01, ctx.currentTime);
      noiseGain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.3);
      noiseGain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 1.2);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.2);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      noise.start(ctx.currentTime);
    } catch {
      // ignore
    }
  },

  playTrophyFanfare() {
    if (this.muted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);

        gain.gain.setValueAtTime(0.18, ctx.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 0.65);
      });
    } catch {
      // ignore
    }
  }
};

/**
 * Master audio mute state that silences ALL sounds:
 * 1. SoundEngine (whistle, kicks, collisions, crowd roars)
 * 2. Background YouTube Tournament Music
 */
export function setGlobalMute(mute: boolean) {
  soundEngine.setMuted(mute);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('khaleeji_music_cmd', {
        detail: { action: mute ? 'mute' : 'unmute' }
      })
    );
  }
}

export function toggleGlobalMute(): boolean {
  const newMuteState = !soundEngine.isMuted();
  setGlobalMute(newMuteState);
  return newMuteState;
}

export function isGlobalMuted(): boolean {
  return soundEngine.isMuted();
}
