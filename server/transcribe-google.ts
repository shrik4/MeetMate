import speech from "@google-cloud/speech";

const client = new speech.SpeechClient();

export async function transcribeAudioGoogle(
  audioBuffer: Buffer,
  mimeType: string
): Promise<string> {
  try {
    // Detect encoding from mime type
    let encoding: "LINEAR16" | "FLAC" | "MULAW" | "AMR" = "LINEAR16";
    if (mimeType.includes("wav")) encoding = "LINEAR16";
    else if (mimeType.includes("flac")) encoding = "FLAC";
    else if (mimeType.includes("webm")) encoding = "MULAW";

    const audio = {
      content: audioBuffer.toString("base64"),
    };

    const request = {
      audio: audio,
      config: {
        encoding: encoding,
        sampleRateHertz: 16000,
        languageCode: "en-US",
        useEnhanced: false, // Free tier
      },
    };

    console.log("Transcribing with Google Cloud Speech-to-Text...");
    const [response] = await client.recognize(request as Parameters<typeof client.recognize>[0]);
    
    const transcription = response.results
      ?.map((result) => result.alternatives?.[0]?.transcript)
      .join("\n") || "";

    if (!transcription) {
      throw new Error("No speech detected in audio");
    }

    console.log("Google Cloud transcription complete");
    return transcription;
  } catch (error) {
    console.error("Google Cloud transcription error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to transcribe audio with Google Cloud"
    );
  }
}
