import { execSync } from "child_process";
import { writeFileSync, unlinkSync } from "fs";
import { join } from "path";

export async function downloadYouTubeAudio(videoUrl: string): Promise<string> {
  const tempFile = join("/tmp", `video-${Date.now()}.m4a`);
  
  try {
    // Try using yt-dlp first
    try {
      execSync(`yt-dlp -f bestaudio -x --audio-format m4a -o "${tempFile}" "${videoUrl}"`, {
        stdio: "pipe",
        timeout: 30000,
      });
      return tempFile;
    } catch (e) {
      // If yt-dlp fails, try ffmpeg with youtube-dl
      try {
        execSync(`youtube-dl -f bestaudio -o "${tempFile}.%(ext)s" "${videoUrl}"`, {
          stdio: "pipe",
          timeout: 30000,
        });
        return tempFile;
      } catch (innerError) {
        throw new Error("Unable to download video. YouTube may block automated downloads. Please upload an audio file instead.");
      }
    }
  } catch (error) {
    if (tempFile) {
      try {
        unlinkSync(tempFile);
      } catch (e) {
        // Ignore cleanup errors
      }
    }
    throw error instanceof Error ? error : new Error("Failed to download video");
  }
}
