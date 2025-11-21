import ytdl from "ytdl-core";
import { createWriteStream } from "fs";
import { createReadStream } from "fs";
import path from "path";
import { spawn } from "child_process";

export async function downloadYouTubeAudio(videoUrl: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      // Validate it's a YouTube URL
      if (!videoUrl.includes("youtube.com") && !videoUrl.includes("youtu.be")) {
        reject(new Error("Only YouTube URLs are supported for meeting links"));
        return;
      }

      const audioFile = path.join("/tmp", `video-${Date.now()}.mp4`);

      // Download highest quality audio
      const stream = ytdl(videoUrl, {
        quality: "highestaudio",
        filter: "audioonly",
      });

      const writeStream = createWriteStream(audioFile);

      stream.pipe(writeStream);

      stream.on("error", (err) => {
        reject(new Error(`Failed to download video: ${err.message}`));
      });

      writeStream.on("finish", () => {
        resolve(audioFile);
      });

      writeStream.on("error", (err) => {
        reject(new Error(`Failed to save audio: ${err.message}`));
      });
    } catch (error) {
      reject(error);
    }
  });
}
