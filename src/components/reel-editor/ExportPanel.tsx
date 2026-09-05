"use client";

import { useState } from "react";
import { exportReel } from "@/lib/reelEditor/ffmpegExport";
import { ASPECT_DIMENSIONS } from "@/lib/reelEditor/types";
import type { ClipItem, ExportAspect, Segment } from "@/lib/reelEditor/types";

interface ExportPanelProps {
  segments: Segment[];
  clips: ClipItem[];
  audioFile: File;
}

type Status = { kind: "idle" } | { kind: "rendering"; progress: number; stage: string } | { kind: "done"; url: string } | { kind: "error"; message: string };

export function ExportPanel({ segments, clips, audioFile }: ExportPanelProps) {
  const [aspect, setAspect] = useState<ExportAspect>("reel");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function handleExport() {
    const { width, height } = ASPECT_DIMENSIONS[aspect];
    setStatus({ kind: "rendering", progress: 0, stage: "Starting up ffmpeg…" });
    try {
      const blob = await exportReel({
        segments,
        clips,
        audioFile,
        width,
        height,
        onProgress: (progress, stage) => setStatus({ kind: "rendering", progress, stage }),
      });
      const url = URL.createObjectURL(blob);
      setStatus({ kind: "done", url });
    } catch (err) {
      setStatus({ kind: "error", message: err instanceof Error ? err.message : "Export failed." });
    }
  }

  const rendering = status.kind === "rendering";

  return (
    <section className="rounded-xl border border-line bg-white/60 p-5">
      <h2 className="font-serif text-lg text-charcoal">5. Export</h2>
      <p className="mt-1 text-sm text-stone">
        Rendering happens entirely in your browser (no upload to any server) using ffmpeg.wasm. Longer reels take
        longer to render — keep this tab open until it finishes.
      </p>

      <label className="mt-4 block max-w-xs text-sm text-charcoal">
        Export size
        <select
          value={aspect}
          onChange={(e) => setAspect(e.target.value as ExportAspect)}
          disabled={rendering}
          className="mt-1 block w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-charcoal disabled:opacity-50"
        >
          {(Object.keys(ASPECT_DIMENSIONS) as ExportAspect[]).map((key) => (
            <option key={key} value={key}>
              {ASPECT_DIMENSIONS[key].label}
            </option>
          ))}
        </select>
      </label>

      <button
        type="button"
        onClick={handleExport}
        disabled={rendering || segments.length === 0}
        className="mt-4 inline-flex items-center gap-2 rounded-md bg-gold px-6 py-3 text-sm font-medium text-charcoal transition hover:bg-gold-light disabled:opacity-50"
      >
        {rendering ? "Rendering…" : "Export reel"}
      </button>

      {status.kind === "rendering" && (
        <div className="mt-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-cream">
            <div
              className="h-full rounded-full bg-gold transition-all"
              style={{ width: `${Math.round(status.progress * 100)}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-stone">{status.stage}</p>
        </div>
      )}

      {status.kind === "error" && <p className="mt-4 text-sm text-danger">{status.message}</p>}

      {status.kind === "done" && (
        <div className="mt-4 space-y-3">
          <video controls src={status.url} className="mx-auto aspect-[9/16] w-full max-w-[260px] rounded-lg bg-black" />
          <a
            href={status.url}
            download="reel.mp4"
            className="inline-flex items-center gap-2 rounded-md bg-charcoal px-5 py-2.5 text-sm font-medium text-ivory transition hover:bg-charcoal-soft"
          >
            Download reel.mp4
          </a>
        </div>
      )}
    </section>
  );
}
