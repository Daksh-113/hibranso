"use client";

import { useRef, useState } from "react";
import { loadClip, revokeClip } from "@/lib/reelEditor/media";
import type { ClipItem } from "@/lib/reelEditor/types";

interface ClipsPanelProps {
  clips: ClipItem[];
  onClipsChange: (clips: ClipItem[]) => void;
}

export function ClipsPanel({ clips, onClipsChange }: ClipsPanelProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList) {
    setError(null);
    setLoading(true);
    try {
      const loaded = await Promise.all(Array.from(files).map(loadClip));
      onClipsChange([...clips, ...loaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read one of those video files.");
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= clips.length) return;
    const next = clips.slice();
    [next[index], next[target]] = [next[target], next[index]];
    onClipsChange(next);
  }

  function remove(index: number) {
    const clip = clips[index];
    revokeClip(clip);
    onClipsChange(clips.filter((_, i) => i !== index));
  }

  return (
    <section className="rounded-xl border border-line bg-white/60 p-5">
      <h2 className="font-serif text-lg text-charcoal">2. Video clips</h2>
      <p className="mt-1 text-sm text-stone">
        Upload the raw footage for your reel. Clips are used in order and repeat/loop if there are more beats than
        footage — reorder them below to change the sequence.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) void handleFiles(e.target.files);
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-md bg-charcoal px-5 py-2.5 text-sm font-medium text-ivory transition hover:bg-charcoal-soft disabled:opacity-50"
        >
          {loading ? "Loading…" : "Add video clips"}
        </button>
        {clips.length > 0 && <span className="text-sm text-stone">{clips.length} clip(s)</span>}
      </div>

      {error && <p className="mt-3 text-sm text-danger">{error}</p>}

      {clips.length > 0 && (
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {clips.map((clip, i) => (
            <li key={clip.id} className="overflow-hidden rounded-lg border border-line bg-white">
              <div className="aspect-video w-full bg-charcoal/10">
                {clip.thumbnail && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={clip.thumbnail} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <div className="p-2">
                <p className="truncate text-xs font-medium text-charcoal" title={clip.file.name}>
                  {i + 1}. {clip.file.name}
                </p>
                <p className="text-xs text-stone">{clip.duration.toFixed(1)}s</p>
                <div className="mt-2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    className="rounded border border-line px-2 py-0.5 text-xs text-charcoal disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={i === clips.length - 1}
                    className="rounded border border-line px-2 py-0.5 text-xs text-charcoal disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    className="ml-auto rounded border border-danger/40 px-2 py-0.5 text-xs text-danger"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
