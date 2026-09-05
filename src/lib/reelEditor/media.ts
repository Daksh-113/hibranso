import type { ClipItem } from "./types";

let clipCounter = 0;

/** Loads video metadata (duration) and grabs a frame as a thumbnail, off-DOM. */
export function loadClip(file: File): Promise<ClipItem> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.src = url;

    const id = `clip-${Date.now()}-${clipCounter++}`;

    const cleanup = () => {
      video.removeAttribute("src");
      video.load();
    };

    video.onloadedmetadata = () => {
      const duration = video.duration;
      const seekTo = Math.min(0.3, Math.max(0, duration / 4));
      video.currentTime = seekTo;
    };

    video.onseeked = () => {
      let thumbnail: string | null = null;
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 160;
        canvas.height = Math.round((160 * video.videoHeight) / video.videoWidth) || 160;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          thumbnail = canvas.toDataURL("image/jpeg", 0.7);
        }
      } catch {
        thumbnail = null;
      }
      cleanup();
      resolve({ id, file, url, duration: video.duration, thumbnail });
    };

    video.onerror = () => {
      cleanup();
      URL.revokeObjectURL(url);
      reject(new Error(`Could not read video file "${file.name}". It may be an unsupported format.`));
    };
  });
}

export function revokeClip(clip: ClipItem): void {
  URL.revokeObjectURL(clip.url);
}
