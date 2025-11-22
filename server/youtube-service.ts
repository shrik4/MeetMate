export async function getYouTubeTranscript(videoUrl: string): Promise<string> {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      throw new Error('YouTube API key not configured');
    }

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

    // Fetch captions list using YouTube API
    const captionsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/captions?videoId=${videoId}&key=${apiKey}`
    );

    if (!captionsResponse.ok) {
      throw new Error('Unable to fetch captions for this video. Please ensure the video has captions enabled.');
    }

    const captionsData = await captionsResponse.json();
    const captions = captionsData.items || [];

    if (!captions || captions.length === 0) {
      throw new Error('No captions found for this video. Please ensure the video has captions enabled.');
    }

    // Get the first available caption track
    const captionId = captions[0].id;

    // Download caption content using YouTube API
    const contentResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/captions/${captionId}?key=${apiKey}`,
      {
        headers: {
          Accept: 'text/plain',
        },
      }
    );

    if (!contentResponse.ok) {
      throw new Error('Unable to download caption content');
    }

    const transcript = await contentResponse.text();
    return transcript;
  } catch (error) {
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Unable to fetch YouTube captions. Video may not have captions available.'
    );
  }
}
