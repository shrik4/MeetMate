import { YoutubeTranscript } from 'youtube-transcript';

export async function getYouTubeTranscript(videoUrl: string): Promise<string> {
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

    console.log(`⬇️ Fetching transcript for video: ${videoId}...`);

    // Fetch transcript using youtube-transcript library
    const transcripts = await YoutubeTranscript.fetchTranscript(videoId);
    
    if (!transcripts || transcripts.length === 0) {
      throw new Error('No transcript found for this video. Please ensure the video has captions enabled.');
    }

    // Combine all transcript entries into a single string
    const transcript = transcripts.map((entry: any) => entry.text).join(' ');
    
    if (!transcript || transcript.trim().length === 0) {
      throw new Error('Transcript content is empty. Please ensure the video has captions enabled.');
    }

    console.log(`✅ Transcript fetched successfully`);
    return transcript;
  } catch (error) {
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Unable to fetch YouTube transcript. Video may not have captions available.'
    );
  }
}
