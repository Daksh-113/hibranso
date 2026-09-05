"use client";

import { useMemo, useState } from "react";
import { thinBeats } from "@/lib/reelEditor/beatDetection";
import { buildTimeline } from "@/lib/reelEditor/timeline";
import type { BeatAnalysis, ClipItem, CutDensity, Segment } from "@/lib/reelEditor/types";
import { AudioPanel } from "./AudioPanel";
import { ClipsPanel } from "./ClipsPanel";
import { TimelinePanel } from "./TimelinePanel";
import { PreviewPlayer } from "./PreviewPlayer";
import { ExportPanel } from "./ExportPanel";

export function ReelEditor() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<BeatAnalysis | null>(null);
  const [cutDensity, setCutDensity] = useState<CutDensity>(2);
  const [clips, setClips] = useState<ClipItem[]>([]);
  const [autoArrangeKey, setAutoArrangeKey] = useState(0);

  const clipIds = clips.map((c) => c.id).join(",");

  // The auto-arranged baseline, recomputed whenever the beat, density, clip
  // set, or an explicit "auto-arrange" request changes.
  const autoSegments = useMemo(() => {
    if (!analysis || clips.length === 0) return [];
    const activeBeats = thinBeats(analysis.beats, cutDensity);
    return buildTimeline(activeBeats, analysis.duration, clips);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analysis, cutDensity, clipIds, autoArrangeKey]);

  // `segments` starts from the auto-arranged baseline but can be hand-edited
  // (reassign/remove a cut) in TimelinePanel; it snaps back to a fresh
  // baseline whenever that baseline changes. Adjusting state during render
  // (rather than in an effect) avoids an extra cascading render.
  const [segments, setSegments] = useState<Segment[]>(autoSegments);
  const [prevAutoSegments, setPrevAutoSegments] = useState(autoSegments);
  if (autoSegments !== prevAutoSegments) {
    setPrevAutoSegments(autoSegments);
    setSegments(autoSegments);
  }

  return (
    <div className="space-y-6">
      <AudioPanel
        audioFile={audioFile}
        analysis={analysis}
        cutDensity={cutDensity}
        onAudioChange={(file, result) => {
          setAudioFile(file);
          setAnalysis(result);
        }}
        onDensityChange={setCutDensity}
      />

      <ClipsPanel clips={clips} onClipsChange={setClips} />

      {analysis && (
        <TimelinePanel
          segments={segments}
          clips={clips}
          audioDuration={analysis.duration}
          onSegmentsChange={setSegments}
          onRegenerate={() => setAutoArrangeKey((k) => k + 1)}
        />
      )}

      {audioFile && segments.length > 0 && <PreviewPlayer segments={segments} clips={clips} audioFile={audioFile} />}

      {audioFile && segments.length > 0 && <ExportPanel segments={segments} clips={clips} audioFile={audioFile} />}
    </div>
  );
}
