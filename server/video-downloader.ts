import { execSync } from "child_process";
import { unlinkSync } from "fs";
import { join } from "path";

export async function downloadYouTubeAudio(videoUrl: string): Promise<string> {
  const tempFile = join("/tmp", `video-${Date.now()}.m4a`);
  
  try {
    // Use yt-dlp to download audio
    execSync(`yt-dlp -f bestaudio -x --audio-format m4a -o "${tempFile}" "${videoUrl}"`, {
      stdio: "pipe",
      timeout: 60000,
      maxBuffer: 10 * 1024 * 1024,
    });
    return tempFile;
  } catch (error) {
    // Clean up temp file on error
    try {
      unlinkSync(tempFile);
    } catch (e) {
      // Ignore cleanup errors
    }
    throw new Error("Unable to download YouTube video. The video may be age-restricted, private, or protected by YouTube. Please try uploading an audio file instead.");
  }
}
