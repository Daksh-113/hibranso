"use client";

import { removeSegment, reassignSegmentClip, totalTimelineDuration } from "@/lib/reelEditor/timeline";
import type { ClipItem, Segment } from "@/lib/reelEditor/types";

interface TimelinePanelProps {
  segments: Segment[];
  clips: ClipItem[];
  audioDuration: number;
  onSegmentsChange: (segments: Segment[]) => void;
  onRegenerate: () => void;
}

export function TimelinePanel({ segments, clips, audioDuration, onSegmentsChange, onRegenerate }: TimelinePanelProps) {
  const clipById = new Map(clips.map((c) => [c.id, c]));
  const total = totalTimelineDuration(segments);

  return (
    <section className="rounded-xl border border-line bg-white/60 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-lg text-charcoal">3. Timeline</h2>
          <p className="mt-1 text-sm text-stone">
            {segments.length} cut{segments.length === 1 ? "" : "s"} · {total.toFixed(1)}s of {audioDuration.toFixed(1)}s audio.
            Reassign the clip used for any cut, or remove one to merge it with the previous cut.
          </p>
        </div>
        <button
          type="button"
          onClick={onRegenerate}
          className="rounded-md border border-charcoal/70 px-4 py-2 text-sm font-medium text-charcoal transition hover:bg-charcoal hover:text-ivory"
        >
          Auto-arrange from beats
        </button>
      </div>

      {segments.length === 0 ? (
        <p className="mt-4 text-sm text-stone">Add audio and at least one clip to generate a timeline.</p>
      ) : (
        <ol className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {segments.map((segment) => {
            const clip = clipById.get(segment.clipId);
            return (
              <li
                key={segment.id}
                className="flex w-28 shrink-0 flex-col overflow-hidden rounded-lg border border-line bg-white"
              >
                <div className="aspect-video w-full bg-charcoal/10">
                  {clip?.thumbnail && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={clip.thumbnail} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-1 p-2">
                  <span className="text-xs text-stone">{segment.duration.toFixed(2)}s</span>
                  <select
                    value={segment.clipId}
                    onChange={(e) => onSegmentsChange(reassignSegmentClip(segments, segment.id, e.target.value))}
                    className="rounded border border-line bg-white px-1 py-0.5 text-xs text-charcoal"
                  >
                    {clips.map((c, i) => (
                      <option key={c.id} value={c.id}>
                        Clip {i + 1}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => onSegmentsChange(removeSegment(segments, segment.id))}
                    className="mt-auto rounded border border-danger/40 px-1 py-0.5 text-xs text-danger"
                  >
                    Remove
                  </button>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
