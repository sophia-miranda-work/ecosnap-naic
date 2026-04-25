/**
 * Tiny synthesized nature-ambience engine, time-of-day aware.
 *
 * Picks a soundscape by local hour:
 *   05–10  dawn      → birdsong (chirps over a soft breeze)
 *   10–17  midday    → ocean waves (filtered surf)
 *   17–20  evening   → ocean waves with warmer tone
 *   20–05  night     → crickets (pulsed band-pass noise)
 *
 * Everything is generated with Web Audio — no network, no assets, no key.
 * The `AmbiencePlayer` exposes start()/stop() with a short fade so it feels
 * like the woods leaning in and out, not a switch.
 */

export type AmbienceKind = "birdsong" | "ocean" | "evening-ocean" | "crickets";

export function pickAmbienceForHour(hour: number): AmbienceKind {
  if (hour >= 5 && hour < 10) return "birdsong";
  if (hour >= 10 && hour < 17) return "ocean";
  if (hour >= 17 && hour < 20) return "evening-ocean";
  return "crickets";
}

export function ambienceLabel(kind: AmbienceKind): string {
  switch (kind) {
    case "birdsong":
      return "Morning birdsong";
    case "ocean":
      return "Midday ocean";
    case "evening-ocean":
      return "Evening surf";
    case "crickets":
      return "Night crickets";
  }
}

/** Build a long looping noise buffer once and reuse for all noise sources. */
function buildPinkNoiseBuffer(ctx: AudioContext, seconds = 4): AudioBuffer {
  const len = ctx.sampleRate * seconds;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  // Voss-McCartney pink noise approximation.
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < len; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.969 * b2 + white * 0.153852;
    b3 = 0.8665 * b3 + white * 0.3104856;
    b4 = 0.55 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.016898;
    data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
    b6 = white * 0.115926;
  }
  return buf;
}

type Voice = {
  stop(when: number): void;
};

/** Ocean surf: slow LFO-modulated low-passed pink noise. */
function buildOcean(ctx: AudioContext, dest: AudioNode, warm = false): Voice {
  const noise = ctx.createBufferSource();
  noise.buffer = buildPinkNoiseBuffer(ctx, 6);
  noise.loop = true;
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = warm ? 700 : 900;
  lp.Q.value = 0.4;
  const surfGain = ctx.createGain();
  surfGain.gain.value = 0.0;
  // Slow swell LFO 0.08–0.13 Hz
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.1;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 0.45;
  const baseGain = ctx.createConstantSource();
  baseGain.offset.value = 0.55;
  lfo.connect(lfoGain).connect(surfGain.gain);
  baseGain.connect(surfGain.gain);
  noise.connect(lp).connect(surfGain).connect(dest);
  noise.start();
  lfo.start();
  baseGain.start();
  return {
    stop(when) {
      try { noise.stop(when); } catch { /* */ }
      try { lfo.stop(when); } catch { /* */ }
      try { baseGain.stop(when); } catch { /* */ }
    },
  };
}

/** Quiet wind/breeze bed used under birdsong. */
function buildBreeze(ctx: AudioContext, dest: AudioNode): Voice {
  const noise = ctx.createBufferSource();
  noise.buffer = buildPinkNoiseBuffer(ctx, 5);
  noise.loop = true;
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 600;
  bp.Q.value = 0.6;
  const g = ctx.createGain();
  g.gain.value = 0.18;
  noise.connect(bp).connect(g).connect(dest);
  noise.start();
  return {
    stop(when) {
      try { noise.stop(when); } catch { /* */ }
    },
  };
}

/** Schedule a single bird-chirp at time `t`. */
function scheduleChirp(ctx: AudioContext, dest: AudioNode, t: number) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = "sine";
  const baseFreq = 1800 + Math.random() * 1800; // 1.8–3.6 kHz
  const peakFreq = baseFreq + 400 + Math.random() * 600;
  o.frequency.setValueAtTime(baseFreq, t);
  o.frequency.exponentialRampToValueAtTime(peakFreq, t + 0.04);
  o.frequency.exponentialRampToValueAtTime(baseFreq * 0.9, t + 0.12);
  const peak = 0.05 + Math.random() * 0.06;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(peak, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0008, t + 0.18);
  o.connect(g).connect(dest);
  o.start(t);
  o.stop(t + 0.22);
}

/** Birdsong: schedule random chirps in batches; reschedule every 4s. */
function buildBirdsong(
  ctx: AudioContext,
  dest: AudioNode,
  alive: { current: boolean },
): Voice {
  const breeze = buildBreeze(ctx, dest);
  function schedule() {
    if (!alive.current) return;
    const now = ctx.currentTime;
    const windowSec = 4;
    const chirps = 6 + Math.floor(Math.random() * 6); // 6–11 chirps / 4s
    for (let i = 0; i < chirps; i++) {
      const t = now + Math.random() * windowSec;
      scheduleChirp(ctx, dest, t);
      // Sometimes a quick "tweet-tweet" pair.
      if (Math.random() < 0.35) scheduleChirp(ctx, dest, t + 0.18);
    }
    setTimeout(schedule, windowSec * 1000);
  }
  schedule();
  return {
    stop(when) {
      breeze.stop(when);
      // chirps stop themselves shortly after their scheduled time
    },
  };
}

/** Crickets: pulsed band-pass noise around 4 kHz. */
function buildCrickets(ctx: AudioContext, dest: AudioNode): Voice {
  const noise = ctx.createBufferSource();
  noise.buffer = buildPinkNoiseBuffer(ctx, 4);
  noise.loop = true;
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 4200;
  bp.Q.value = 18;
  const g = ctx.createGain();
  g.gain.value = 0;
  // Trill pulse ~12 Hz
  const lfo = ctx.createOscillator();
  lfo.type = "square";
  lfo.frequency.value = 12;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 0.35;
  const base = ctx.createConstantSource();
  base.offset.value = 0.35;
  lfo.connect(lfoGain).connect(g.gain);
  base.connect(g.gain);
  noise.connect(bp).connect(g).connect(dest);
  noise.start();
  lfo.start();
  base.start();
  return {
    stop(when) {
      try { noise.stop(when); } catch { /* */ }
      try { lfo.stop(when); } catch { /* */ }
      try { base.stop(when); } catch { /* */ }
    },
  };
}

export class AmbiencePlayer {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private voices: Voice[] = [];
  private alive = { current: false };
  private currentKind: AmbienceKind | null = null;

  constructor(private getContext: () => AudioContext | null) {}

  isPlaying(): boolean {
    return this.alive.current;
  }

  kind(): AmbienceKind | null {
    return this.currentKind;
  }

  start(kind: AmbienceKind, targetVolume = 0.35) {
    if (this.alive.current && this.currentKind === kind) return;
    if (this.alive.current) this.stop(0.15);
    const ctx = this.getContext();
    if (!ctx) return;
    if (ctx.state === "suspended") void ctx.resume();
    this.ctx = ctx;
    this.alive.current = true;
    this.currentKind = kind;
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    this.master = master;
    switch (kind) {
      case "birdsong":
        this.voices.push(buildBirdsong(ctx, master, this.alive));
        break;
      case "ocean":
        this.voices.push(buildOcean(ctx, master, false));
        break;
      case "evening-ocean":
        this.voices.push(buildOcean(ctx, master, true));
        break;
      case "crickets":
        this.voices.push(buildCrickets(ctx, master));
        break;
    }
    const now = ctx.currentTime;
    master.gain.setValueAtTime(0, now);
    master.gain.linearRampToValueAtTime(targetVolume, now + 1.2);
  }

  stop(fadeSec = 0.6) {
    if (!this.alive.current) return;
    this.alive.current = false;
    const ctx = this.ctx;
    const master = this.master;
    const voices = this.voices;
    this.voices = [];
    this.currentKind = null;
    if (!ctx || !master) return;
    const now = ctx.currentTime;
    const end = now + Math.max(0.05, fadeSec);
    try {
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value, now);
      master.gain.linearRampToValueAtTime(0.0001, end);
    } catch { /* */ }
    voices.forEach((v) => v.stop(end + 0.05));
    setTimeout(() => {
      try { master.disconnect(); } catch { /* */ }
    }, (end - now) * 1000 + 200);
    this.master = null;
    this.ctx = null;
  }
}