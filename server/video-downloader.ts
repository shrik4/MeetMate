import { spawn } from "child_process";
import path from "path";
import { existsSync } from "fs";

export async function downloadYouTubeAudio(videoUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // Validate it's a YouTube URL
      if (!videoUrl.includes("youtube.com") && !videoUrl.includes("youtu.be")) {
        reject(new Error("Only YouTube URLs are supported for meeting links"));
        return;
      }

      const audioFile = path.join("/tmp", `video-${Date.now()}.m4a`);

      // Use yt-dlp to download audio
      const ytdlp = spawn("yt-dlp", [
        "-f",
        "bestaudio[ext=m4a]/bestaudio",
        "-o",
        audioFile,
        videoUrl,
      ]);

      let stderr = "";

      ytdlp.stderr.on("data", (data) => {
        stderr += data.toString();
        console.log("yt-dlp:", data.toString());
      });

      ytdlp.stdout.on("data", (data) => {
        console.log("yt-dlp output:", data.toString());
      });

      ytdlp.on("close", (code) => {
        if (code === 0) {
          // Check if file was created
          if (existsSync(audioFile)) {
            resolve(audioFile);
          } else {
            reject(new Error("Failed to create audio file"));
          }
        } else {
          reject(
            new Error(
              `yt-dlp failed with code ${code}: ${stderr || "Unknown error"}`
            )
          );
        }
      });

      ytdlp.on("error", (err) => {
        reject(new Error(`Failed to start yt-dlp: ${err.message}`));
      });
    } catch (error) {
      reject(error);
    }
  });
}
