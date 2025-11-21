export async function transcribeAudioHuggingFace(
  audioBuffer: Buffer,
  _mimeType: string,
  apiKey: string
): Promise<string> {
  try {
    if (!apiKey) {
      throw new Error("HUGGING_FACE_API_KEY environment variable is required");
    }

    // Use Hugging Face Inference API with Whisper model
    const response = await fetch(
      "https://api-inference.huggingface.co/models/openai/whisper-small",
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        method: "POST",
        body: audioBuffer,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.error || `Hugging Face API error: ${response.statusText}`
      );
    }

    const result = await response.json() as { text?: string; error?: string };
    
    if (result.error) {
      throw new Error(result.error);
    }

    if (!result.text) {
      throw new Error("No transcription returned from Hugging Face");
    }

    return result.text;
  } catch (error) {
    console.error("Hugging Face transcription error:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to transcribe audio with Hugging Face"
    );
  }
}
