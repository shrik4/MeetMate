import { execSync } from "child_process";
import { unlinkSync, existsSync } from "fs";
import { join } from "path";

export async function downloadYouTubeAudio(videoUrl: string): Promise<{ filePath: string; title: string }> {
  const tempDir = "/tmp";
  const timestamp = Date.now();
  const outputTemplate = join(tempDir, `yt-${timestamp}-%(id)s.%(ext)s`);

  try {
    // Extract video ID from URL
    const urlObj = new URL(videoUrl);
    let videoId = '';
    
    if (urlObj.hostname.includes('youtube.com')) {
      videoId = urlObj.searchParams.get('v') || '';
    } else if (urlObj.hostname.includes('youtu.be')) {
      videoId = urlObj.pathname.slice(1);
    }
    
    if (!videoId) {
      throw new Error('Invalid YouTube URL. Please check the link format.');
    }

    console.log(`⬇️ Processing YouTube Link: ${videoUrl}...`);
    console.log(`(Downloading compressed audio...)`);

    // 1. Extract metadata first
    const metadataCmd = `yt-dlp --no-warnings -j "${videoUrl}"`;
    const metadataOutput = execSync(metadataCmd, { encoding: 'utf-8' });
    const metadata = JSON.parse(metadataOutput);
    const title = metadata.title || 'Meeting';

    console.log(`✅ Validated Link: '${title}'`);
    console.log(`(Downloading stream now...)`);

    // 2. Download worst quality audio (compressed) - usually 32k-64k m4a
    const downloadCmd = `yt-dlp --no-warnings -f "worstaudio[ext=m4a]/worstaudio[ext=webm]/worst" -o "${outputTemplate}" "${videoUrl}"`;
    execSync(downloadCmd, { stdio: 'pipe' });

    // 3. Find the downloaded file
    let audioFile = join(tempDir, `yt-${timestamp}-${videoId}.m4a`);
    
    if (!existsSync(audioFile)) {
      const webmFile = join(tempDir, `yt-${timestamp}-${videoId}.webm`);
      const mp3File = join(tempDir, `yt-${timestamp}-${videoId}.mp3`);
      const opusFile = join(tempDir, `yt-${timestamp}-${videoId}.opus`);
      
      if (existsSync(webmFile)) {
        audioFile = webmFile;
      } else if (existsSync(mp3File)) {
        audioFile = mp3File;
      } else if (existsSync(opusFile)) {
        audioFile = opusFile;
      } else {
        throw new Error('Downloaded file not found');
      }
    }

    // 4. Check file size (Groq has 25MB limit)
    const fs = await import('fs');
    const stats = fs.statSync(audioFile);
    const sizeMb = stats.size / (1024 * 1024);
    
    console.log(`✅ Download Complete: ${audioFile}`);
    console.log(`📊 File Size: ${sizeMb.toFixed(2)} MB`);

    if (sizeMb > 25) {
      unlinkSync(audioFile);
      throw new Error(`Audio file too large (${sizeMb.toFixed(1)}MB). Meeting may be too long (>30-40 mins). Try uploading a shorter segment.`);
    }

    return { filePath: audioFile, title };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`❌ ERROR: Could not access that link.`);
    console.error(`Reason: ${errorMsg}`);
    throw new Error(`Unable to download YouTube video: ${errorMsg}`);
  }
}
