export interface ClipItem {
  id: string;
  file: File;
  url: string;
  duration: number;
  thumbnail: string | null;
}

export interface Segment {
  id: string;
  clipId: string;
  sourceStart: number;
  duration: number;
  timelineStart: number;
}

export interface BeatAnalysis {
  duration: number;
  beats: number[];
  bpm: number | null;
  energyCurve: number[];
}

export type CutDensity = 1 | 2 | 4 | 8;

export type ExportAspect = "reel" | "square" | "landscape";

export const ASPECT_DIMENSIONS: Record<ExportAspect, { width: number; height: number; label: string }> = {
  reel: { width: 1080, height: 1920, label: "Reel / Story (9:16)" },
  square: { width: 1080, height: 1080, label: "Square (1:1)" },
  landscape: { width: 1920, height: 1080, label: "Landscape (16:9)" },
};
