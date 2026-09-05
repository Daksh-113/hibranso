import type { BeatAnalysis } from "./types";

const ENERGY_WINDOW = 1024;
const HISTORY_WINDOWS = 43;
const FALLBACK_INTERVAL_SECONDS = 1.5;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function mixToMono(buffer: AudioBuffer): Float32Array {
  const { numberOfChannels, length } = buffer;
  const mono = new Float32Array(length);
  for (let ch = 0; ch < numberOfChannels; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      mono[i] += data[i] / numberOfChannels;
    }
  }
  return mono;
}

function computeEnergies(samples: Float32Array): number[] {
  const energies: number[] = [];
  for (let i = 0; i + ENERGY_WINDOW <= samples.length; i += ENERGY_WINDOW) {
    let sum = 0;
    for (let j = 0; j < ENERGY_WINDOW; j++) {
      const v = samples[i + j];
      sum += v * v;
    }
    energies.push(sum);
  }
  return energies;
}

function findBeatWindowIndices(energies: number[], sampleRate: number, minIntervalMs: number): number[] {
  const minGapWindows = Math.max(1, Math.round(((minIntervalMs / 1000) * sampleRate) / ENERGY_WINDOW));
  const beats: number[] = [];
  const history: number[] = [];
  let lastBeat = -minGapWindows;

  for (let i = 0; i < energies.length; i++) {
    const e = energies[i];
    history.push(e);
    if (history.length > HISTORY_WINDOWS) history.shift();

    if (history.length < HISTORY_WINDOWS) continue;

    const avg = history.reduce((a, b) => a + b, 0) / history.length;
    const variance = history.reduce((a, b) => a + (b - avg) * (b - avg), 0) / history.length;
    const sensitivity = clamp(-0.0025714 * variance + 1.5142857, 1.05, 1.6);

    if (avg > 1e-9 && e > sensitivity * avg && i - lastBeat >= minGapWindows) {
      beats.push(i);
      lastBeat = i;
    }
  }

  return beats;
}

function estimateBpm(beatTimes: number[]): number | null {
  if (beatTimes.length < 4) return null;
  const intervals: number[] = [];
  for (let i = 1; i < beatTimes.length; i++) {
    intervals.push(beatTimes[i] - beatTimes[i - 1]);
  }
  intervals.sort((a, b) => a - b);
  const median = intervals[Math.floor(intervals.length / 2)];
  if (median <= 0) return null;
  let bpm = 60 / median;
  while (bpm < 70) bpm *= 2;
  while (bpm > 180) bpm /= 2;
  return Math.round(bpm);
}

/**
 * Decodes an audio file and detects beat/onset timestamps using energy-based
 * onset detection (local average + variance-adaptive sensitivity threshold).
 * Falls back to fixed-interval markers if too few onsets are found so the
 * editor always has something to cut on (e.g. ambient or very quiet audio).
 */
export async function detectBeats(file: File, minIntervalMs = 200): Promise<BeatAnalysis> {
  const AudioContextClass =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) {
    throw new Error("Web Audio API is not supported in this browser.");
  }

  const arrayBuffer = await file.arrayBuffer();
  const ctx = new AudioContextClass();
  let audioBuffer: AudioBuffer;
  try {
    audioBuffer = await ctx.decodeAudioData(arrayBuffer);
  } finally {
    void ctx.close();
  }

  const duration = audioBuffer.duration;
  const mono = mixToMono(audioBuffer);
  const energies = computeEnergies(mono);
  const beatIndices = findBeatWindowIndices(energies, audioBuffer.sampleRate, minIntervalMs);

  let beats = beatIndices.map((idx) => (idx * ENERGY_WINDOW) / audioBuffer.sampleRate);
  beats = beats.filter((t) => t > 0.05 && t < duration - 0.05);

  if (beats.length < 4) {
    beats = [];
    for (let t = FALLBACK_INTERVAL_SECONDS; t < duration - 0.2; t += FALLBACK_INTERVAL_SECONDS) {
      beats.push(t);
    }
  }

  const energyCurve = downsampleForDisplay(energies, 240);

  return {
    duration,
    beats,
    bpm: estimateBpm(beats),
    energyCurve,
  };
}

function downsampleForDisplay(values: number[], targetPoints: number): number[] {
  if (values.length <= targetPoints) return values.slice();
  const bucketSize = values.length / targetPoints;
  const out: number[] = [];
  for (let i = 0; i < targetPoints; i++) {
    const start = Math.floor(i * bucketSize);
    const end = Math.max(start + 1, Math.floor((i + 1) * bucketSize));
    let max = 0;
    for (let j = start; j < end && j < values.length; j++) {
      if (values[j] > max) max = values[j];
    }
    out.push(max);
  }
  const peak = Math.max(...out, 1e-9);
  return out.map((v) => v / peak);
}

/** Keeps every Nth beat so the user can control cut density independent of raw onset detection. */
export function thinBeats(beats: number[], everyNth: number): number[] {
  if (everyNth <= 1) return beats;
  return beats.filter((_, i) => i % everyNth === 0);
}
