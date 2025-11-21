import OpenAI from "openai";

export async function transcribeAudio(audioBuffer: Buffer, mimeType: string): Promise<string> {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is not set");
    }

    const openai = new OpenAI({ apiKey });
    
    // Create a File-like object for the API
    const file = new File([audioBuffer], "audio.wav", { type: mimeType });
    
    const response = await openai.audio.transcriptions.create({
      file: file,
      model: "whisper-1",
      language: "en",
    });

    return response.text;
  } catch (error) {
    console.error("Transcription error:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to transcribe audio");
  }
}
