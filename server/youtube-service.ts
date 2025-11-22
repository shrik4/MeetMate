import YoutubeTranscript from 'youtube-transcript';

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

    // Fetch transcript using youtube-transcript
    const transcripts = await YoutubeTranscript.fetchTranscript(videoId);
    
    if (!transcripts || transcripts.length === 0) {
      throw new Error('No captions found for this video. Please ensure the video has captions enabled.');
    }

    // Combine all transcript entries into a single string
    const transcript = transcripts.map((entry: any) => entry.text).join(' ');
    return transcript;
  } catch (error) {
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Unable to fetch YouTube captions. Video may not have captions available.'
    );
  }
}
