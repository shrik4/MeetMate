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

      // Use yt-dlp with cookies and headers to bypass extraction protection
      const ytdlp = spawn("yt-dlp", [
        "--extract-audio",
        "--audio-format",
        "m4a",
        "--audio-quality",
        "192",
        "-o",
        audioFile,
        "--quiet",
        "--no-warnings",
        videoUrl,
      ]);

      let stderr = "";
      let stdout = "";

      ytdlp.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      ytdlp.stdout.on("data", (data) => {
        stdout += data.toString();
      });

      ytdlp.on("close", (code) => {
        if (code === 0) {
          // Check if file was created
          if (existsSync(audioFile)) {
            resolve(audioFile);
          } else {
            reject(
              new Error(
                "YouTube download succeeded but audio file was not created"
              )
            );
          }
        } else {
          // Check for specific YouTube errors
          if (
            stderr.includes("Requested format is not available") ||
            stderr.includes("nsig extraction failed") ||
            stderr.includes("sign in to confirm")
          ) {
            reject(
              new Error(
                "This YouTube video cannot be processed. It may be age-restricted, private, or have DRM protection. Please try uploading the audio file instead."
              )
            );
          } else {
            reject(
              new Error(
                `Failed to download YouTube video. Please upload the audio file instead.`
              )
            );
          }
        }
      });

      ytdlp.on("error", (err) => {
        reject(
          new Error(
            `YouTube download tool error. Please upload the audio file instead. (${err.message})`
          )
        );
      });

      // Set a timeout for the download
      setTimeout(() => {
        ytdlp.kill();
        reject(
          new Error(
            "YouTube download timed out. Please upload the audio file instead."
          )
        );
      }, 60000); // 60 second timeout
    } catch (error) {
      reject(error);
    }
  });
}
