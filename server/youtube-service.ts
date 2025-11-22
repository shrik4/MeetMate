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

    console.log(`⬇️ Fetching captions for video: ${videoId}...`);

    // Get caption tracks for the video
    const captionsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/captions?videoId=${videoId}&key=${apiKey}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }
    );

    if (!captionsResponse.ok) {
      throw new Error(`YouTube API error: ${captionsResponse.status}`);
    }

    const captionsData = await captionsResponse.json();
    const captions = captionsData.items || [];

    if (!captions || captions.length === 0) {
      throw new Error('No captions found for this video. Please ensure the video has captions enabled.');
    }

    // Get the first available caption track (prefer English)
    let captionId = captions[0].id;
    const englishCaption = captions.find((c: any) => 
      c.language === 'en' || c.name?.value?.includes('English')
    );
    if (englishCaption) {
      captionId = englishCaption.id;
    }

    console.log(`✅ Found caption track: ${captionId}`);
    console.log(`(Downloading caption content...)`);

    // Download caption content
    const contentResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/captions/${captionId}?key=${apiKey}`,
      {
        headers: {
          'Accept': 'text/plain',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }
    );

    if (!contentResponse.ok) {
      throw new Error('Unable to download caption content. Please ensure the video has captions enabled.');
    }

    const transcript = await contentResponse.text();
    
    if (!transcript || transcript.trim().length === 0) {
      throw new Error('Caption content is empty. Please ensure the video has captions enabled.');
    }

    console.log(`✅ Caption Download Complete`);
    return transcript;
  } catch (error) {
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Unable to fetch YouTube captions. Video may not have captions available.'
    );
  }
}
