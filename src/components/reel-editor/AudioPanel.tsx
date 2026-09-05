"use client";

import { useRef, useState } from "react";
import { detectBeats, thinBeats } from "@/lib/reelEditor/beatDetection";
import type { BeatAnalysis, CutDensity } from "@/lib/reelEditor/types";

const DENSITY_OPTIONS: { value: CutDensity; label: string }[] = [
  { value: 1, label: "Every beat — fastest cuts" },
  { value: 2, label: "Every 2nd beat" },
  { value: 4, label: "Every 4th beat" },
  { value: 8, label: "Every 8th beat — slowest cuts" },
];

interface AudioPanelProps {
  audioFile: File | null;
  analysis: BeatAnalysis | null;
  cutDensity: CutDensity;
  onAudioChange: (file: File, analysis: BeatAnalysis) => void;
  onDensityChange: (density: CutDensity) => void;
}

export function AudioPanel({ audioFile, analysis, cutDensity, onAudioChange, onDensityChange }: AudioPanelProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);
    setLoading(true);
    try {
      const result = await detectBeats(file);
      onAudioChange(file, result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not analyze that audio file.");
    } finally {
      setLoading(false);
    }
  }

  const activeBeatCount = analysis ? thinBeats(analysis.beats, cutDensity).length : 0;

  return (
    <section className="rounded-xl border border-line bg-white/60 p-5">
      <h2 className="font-serif text-lg text-charcoal">1. Audio track</h2>
      <p className="mt-1 text-sm text-stone">
        Upload the song or voiceover for your reel — beats are detected automatically so clips can be cut in time
        with the music.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-md bg-charcoal px-5 py-2.5 text-sm font-medium text-ivory transition hover:bg-charcoal-soft disabled:opacity-50"
        >
          {loading ? "Analyzing…" : audioFile ? "Replace audio" : "Choose audio file"}
        </button>
        {audioFile && <span className="text-sm text-stone">{audioFile.name}</span>}
      </div>

      {error && <p className="mt-3 text-sm text-danger">{error}</p>}

      {analysis && (
        <div className="mt-5">
          <Waveform energyCurve={analysis.energyCurve} beats={analysis.beats} duration={analysis.duration} />

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-stone">
            <span>
              {analysis.bpm ? `~${analysis.bpm} BPM · ` : ""}
              {analysis.beats.length} beats detected · {activeBeatCount} cuts at current density ·{" "}
              {analysis.duration.toFixed(1)}s total
            </span>
          </div>

          <label className="mt-3 block text-sm text-charcoal">
            Cut density
            <select
              value={cutDensity}
              onChange={(e) => onDensityChange(Number(e.target.value) as CutDensity)}
              className="mt-1 block w-full max-w-xs rounded-md border border-line bg-white px-3 py-2 text-sm text-charcoal"
            >
              {DENSITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
    </section>
  );
}

function Waveform({ energyCurve, beats, duration }: { energyCurve: number[]; beats: number[]; duration: number }) {
  return (
    <div className="relative h-20 w-full overflow-hidden rounded-md bg-cream">
      <div className="absolute inset-0 flex items-end gap-px px-1 pb-1">
        {energyCurve.map((v, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm bg-gold-light"
            style={{ height: `${Math.max(4, v * 100)}%` }}
          />
        ))}
      </div>
      <div className="absolute inset-0">
        {beats.map((b, i) => (
          <div
            key={i}
            className="absolute top-0 h-full w-px bg-charcoal/40"
            style={{ left: `${(b / duration) * 100}%` }}
          />
        ))}
      </div>
    </div>
  );
}
