"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { findActiveSegmentIndex, totalTimelineDuration } from "@/lib/reelEditor/timeline";
import type { ClipItem, Segment } from "@/lib/reelEditor/types";

interface PreviewPlayerProps {
  segments: Segment[];
  clips: ClipItem[];
  audioFile: File;
}

const DRIFT_TOLERANCE = 0.18;

export function PreviewPlayer({ segments, clips, audioFile }: PreviewPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const rafRef = useRef<number | null>(null);
  const lastClipIdRef = useRef<string | null>(null);

  const audioUrl = useMemo(() => URL.createObjectURL(audioFile), [audioFile]);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const clipById = new Map(clips.map((c) => [c.id, c]));
  const duration = totalTimelineDuration(segments);

  // Reset playback position whenever the timeline is regenerated (a new baseline
  // `segments` reference). Adjusting state during render, per React's guidance,
  // avoids the cascading-render effect this would otherwise cause.
  const [prevSegments, setPrevSegments] = useState(segments);
  if (segments !== prevSegments) {
    setPrevSegments(segments);
    setCurrentTime(0);
  }

  useEffect(() => () => URL.revokeObjectURL(audioUrl), [audioUrl]);

  useEffect(() => {
    lastClipIdRef.current = null;
    if (audioRef.current) audioRef.current.currentTime = 0;
  }, [segments]);

  function syncVideoToTime(time: number, shouldBePlaying: boolean) {
    const video = videoRef.current;
    if (!video || segments.length === 0) return;

    const idx = findActiveSegmentIndex(segments, time);
    const segment = segments[idx];
    const clip = clipById.get(segment.clipId);
    if (!clip) return;

    const expectedVideoTime = segment.sourceStart + Math.max(0, time - segment.timelineStart);

    if (lastClipIdRef.current !== clip.id + segment.id) {
      lastClipIdRef.current = clip.id + segment.id;
      video.src = clip.url;
      video.currentTime = expectedVideoTime;
    } else if (Math.abs(video.currentTime - expectedVideoTime) > DRIFT_TOLERANCE) {
      video.currentTime = expectedVideoTime;
    }

    // Seeking (above) or the browser buffering can silently abort/pause the
    // video's own playback even though we still want it playing — re-issue
    // play() whenever that happens instead of leaving the frame frozen.
    if (shouldBePlaying && video.paused) {
      void video.play().catch(() => {});
    }
  }

  useEffect(() => {
    if (!playing) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }
    const tick = () => {
      const audio = audioRef.current;
      if (audio) {
        setCurrentTime(audio.currentTime);
        syncVideoToTime(audio.currentTime, true);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, segments]);

  function togglePlay() {
    const audio = audioRef.current;
    const video = videoRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      video?.pause();
      setPlaying(false);
    } else {
      void audio.play();
      syncVideoToTime(audio.currentTime, true);
      setPlaying(true);
    }
  }

  function handleSeek(time: number) {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time;
    setCurrentTime(time);
    syncVideoToTime(time, playing);
  }

  function handleEnded() {
    setPlaying(false);
    videoRef.current?.pause();
  }

  if (segments.length === 0) return null;

  return (
    <section className="rounded-xl border border-line bg-white/60 p-5">
      <h2 className="font-serif text-lg text-charcoal">4. Preview</h2>
      <p className="mt-1 text-sm text-stone">Playback is synced to the audio as the master clock.</p>

      <div className="mt-4 mx-auto aspect-[9/16] w-full max-w-[260px] overflow-hidden rounded-lg bg-black">
        <video ref={videoRef} muted playsInline className="h-full w-full object-cover" />
      </div>

      {audioUrl && <audio ref={audioRef} src={audioUrl} onEnded={handleEnded} className="hidden" />}

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={togglePlay}
          className="rounded-md bg-charcoal px-4 py-2 text-sm font-medium text-ivory transition hover:bg-charcoal-soft"
        >
          {playing ? "Pause" : "Play"}
        </button>
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.05}
          value={Math.min(currentTime, duration)}
          onChange={(e) => handleSeek(Number(e.target.value))}
          className="flex-1"
        />
        <span className="w-16 text-right text-xs text-stone">
          {currentTime.toFixed(1)}s / {duration.toFixed(1)}s
        </span>
      </div>
    </section>
  );
}
