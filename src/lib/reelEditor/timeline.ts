import type { ClipItem, Segment } from "./types";

const MIN_SEGMENT_SECONDS = 0.12;

/**
 * Builds a cut list by slicing the audio's duration at each beat timestamp and
 * assigning clips to the resulting slots in rotation. Each clip remembers how
 * much of itself has already been used (its "cursor") so repeated uses of the
 * same clip continue from where they left off instead of always starting at 0,
 * looping back to the start once a clip runs out of fresh footage.
 */
export function buildTimeline(beats: number[], duration: number, clips: ClipItem[]): Segment[] {
  if (clips.length === 0 || duration <= 0) return [];

  const boundarySet = new Set<number>([0, duration]);
  for (const b of beats) {
    if (b > 0.02 && b < duration - 0.02) boundarySet.add(Math.round(b * 1000) / 1000);
  }
  const boundaries = Array.from(boundarySet).sort((a, b) => a - b);

  const segments: Segment[] = [];
  const cursors = new Map<string, number>(clips.map((c) => [c.id, 0]));
  let clipIndex = 0;

  for (let i = 0; i < boundaries.length - 1; i++) {
    const timelineStart = boundaries[i];
    const segDuration = boundaries[i + 1] - timelineStart;
    if (segDuration < MIN_SEGMENT_SECONDS) continue;

    const clip = clips[clipIndex % clips.length];
    clipIndex++;

    let cursor = cursors.get(clip.id) ?? 0;
    if (cursor + segDuration > clip.duration) cursor = 0;
    if (segDuration > clip.duration) {
      cursor = 0;
    }

    segments.push({
      id: `seg-${timelineStart.toFixed(3)}-${clip.id}`,
      clipId: clip.id,
      sourceStart: cursor,
      duration: Math.min(segDuration, clip.duration),
      timelineStart,
    });

    cursors.set(clip.id, cursor + Math.min(segDuration, clip.duration));
  }

  return segments;
}

export function totalTimelineDuration(segments: Segment[]): number {
  if (segments.length === 0) return 0;
  const last = segments[segments.length - 1];
  return last.timelineStart + last.duration;
}

export function findActiveSegmentIndex(segments: Segment[], time: number): number {
  if (segments.length === 0) return -1;
  for (let i = segments.length - 1; i >= 0; i--) {
    if (time >= segments[i].timelineStart - 0.001) return i;
  }
  return 0;
}

/** Reassigns a segment to a different clip, restarting that clip's footage from 0. */
export function reassignSegmentClip(segments: Segment[], segmentId: string, clipId: string): Segment[] {
  return segments.map((seg) => (seg.id === segmentId ? { ...seg, clipId, sourceStart: 0 } : seg));
}

/** Removes a segment, extending the previous segment (or the next one, if it's first) to fill the gap. */
export function removeSegment(segments: Segment[], segmentId: string): Segment[] {
  const idx = segments.findIndex((s) => s.id === segmentId);
  if (idx === -1) return segments;

  const next = segments.slice();
  const removed = next[idx];
  next.splice(idx, 1);

  if (next.length === 0) return next;

  if (idx > 0) {
    next[idx - 1] = { ...next[idx - 1], duration: next[idx - 1].duration + removed.duration };
  } else {
    next[0] = {
      ...next[0],
      timelineStart: removed.timelineStart,
      duration: next[0].duration + removed.duration,
    };
  }
  return next;
}
