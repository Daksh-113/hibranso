import type { ClipItem, Segment } from "./types";

const CORE_BASE_URL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";

let ffmpegPromise: Promise<import("@ffmpeg/ffmpeg").FFmpeg> | null = null;

async function getFFmpeg() {
  if (!ffmpegPromise) {
    ffmpegPromise = (async () => {
      const { FFmpeg } = await import("@ffmpeg/ffmpeg");
      const { toBlobURL } = await import("@ffmpeg/util");
      const instance = new FFmpeg();
      await instance.load({
        coreURL: await toBlobURL(`${CORE_BASE_URL}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${CORE_BASE_URL}/ffmpeg-core.wasm`, "application/wasm"),
      });
      return instance;
    })();
  }
  return ffmpegPromise;
}

export interface ExportOptions {
  segments: Segment[];
  clips: ClipItem[];
  audioFile: File;
  width: number;
  height: number;
  fps?: number;
  onProgress?: (fraction: number, stage: string) => void;
}

/**
 * Renders the final reel entirely client-side with ffmpeg.wasm:
 * trims + scales each timeline segment, concatenates them, then muxes the
 * result with the chosen audio track. Returns a downloadable mp4 Blob.
 */
export async function exportReel({
  segments,
  clips,
  audioFile,
  width,
  height,
  fps = 30,
  onProgress,
}: ExportOptions): Promise<Blob> {
  if (segments.length === 0) throw new Error("Nothing to export — the timeline is empty.");

  const { fetchFile } = await import("@ffmpeg/util");
  const ffmpeg = await getFFmpeg();
  const clipById = new Map(clips.map((c) => [c.id, c]));

  const totalSteps = segments.length + 2;
  let completedSteps = 0;
  const reportStage = (stage: string) => onProgress?.(completedSteps / totalSteps, stage);

  const progressHandler = ({ progress }: { progress: number }) => {
    const clamped = Math.min(1, Math.max(0, Number.isFinite(progress) ? progress : 0));
    onProgress?.((completedSteps + clamped) / totalSteps, `Rendering segment ${completedSteps + 1} of ${segments.length}`);
  };
  ffmpeg.on("progress", progressHandler);

  try {
    const writtenClips = new Set<string>();
    const listLines: string[] = [];

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      const clip = clipById.get(segment.clipId);
      if (!clip) continue;

      const inputName = `src_${clip.id}`;
      if (!writtenClips.has(clip.id)) {
        await ffmpeg.writeFile(inputName, await fetchFile(clip.file));
        writtenClips.add(clip.id);
      }

      const outName = `seg_${i}.mp4`;
      reportStage(`Rendering segment ${i + 1} of ${segments.length}`);
      await ffmpeg.exec([
        "-ss",
        segment.sourceStart.toFixed(3),
        "-i",
        inputName,
        "-t",
        segment.duration.toFixed(3),
        "-vf",
        `scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height},fps=${fps},setsar=1`,
        "-an",
        "-c:v",
        "libx264",
        "-preset",
        "ultrafast",
        "-crf",
        "23",
        outName,
      ]);
      listLines.push(`file '${outName}'`);
      completedSteps++;
    }

    if (listLines.length === 0) throw new Error("No valid segments to export.");

    await ffmpeg.writeFile("list.txt", new TextEncoder().encode(listLines.join("\n")));

    reportStage("Stitching clips together");
    await ffmpeg.exec(["-f", "concat", "-safe", "0", "-i", "list.txt", "-c", "copy", "concat_video.mp4"]);
    completedSteps++;

    reportStage("Adding your audio track");
    await ffmpeg.writeFile("audio_input", await fetchFile(audioFile));
    await ffmpeg.exec([
      "-i",
      "concat_video.mp4",
      "-i",
      "audio_input",
      "-map",
      "0:v:0",
      "-map",
      "1:a:0",
      "-c:v",
      "copy",
      "-c:a",
      "aac",
      "-b:a",
      "192k",
      "-shortest",
      "output.mp4",
    ]);
    completedSteps++;
    onProgress?.(1, "Done");

    const data = await ffmpeg.readFile("output.mp4");
    const bytes = data as Uint8Array;
    const arrayBuffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;

    for (const name of [...writtenClips].map((id) => `src_${id}`)) {
      await ffmpeg.deleteFile(name).catch(() => {});
    }
    for (let i = 0; i < segments.length; i++) {
      await ffmpeg.deleteFile(`seg_${i}.mp4`).catch(() => {});
    }
    await ffmpeg.deleteFile("list.txt").catch(() => {});
    await ffmpeg.deleteFile("concat_video.mp4").catch(() => {});
    await ffmpeg.deleteFile("audio_input").catch(() => {});
    await ffmpeg.deleteFile("output.mp4").catch(() => {});

    return new Blob([arrayBuffer], { type: "video/mp4" });
  } finally {
    ffmpeg.off("progress", progressHandler);
  }
}
