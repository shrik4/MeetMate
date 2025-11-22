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
      throw new Error('Invalid YouTube URL');
    }

    // Fetch transcript
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    
    // Combine all transcript entries into single string
    return transcript.map((entry: any) => entry.text).join(' ');
  } catch (error) {
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Unable to fetch YouTube captions. Video may not have captions available.'
    );
  }
}
