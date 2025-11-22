import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Upload, Mail, Mic, Square } from "lucide-react";
import type { MeetingAnalysis } from "@shared/schema";

export default function Home() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<MeetingAnalysis | null>(null);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const { toast } = useToast();

  const audioMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("audioFile", file);
      formData.append("title", file.name);
      const response = await fetch("/api/upload-audio", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Failed to process audio");
      }
      return response.json() as Promise<MeetingAnalysis>;
    },
    onSuccess: (data) => {
      setAnalysis(data);
      setAudioFile(null);
      toast({
        title: "Audio Processed!",
        description: "Your audio has been transcribed and analyzed.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Processing Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const emailMutation = useMutation({
    mutationFn: async () => {
      if (!analysis) throw new Error("No analysis to email");
      const response = await apiRequest("POST", "/api/send-email", {
        analysisId: analysis.id,
        recipientEmail,
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Email Sent!",
        description: `Analysis sent to ${recipientEmail}`,
      });
      setRecipientEmail("");
    },
    onError: (error: Error) => {
      toast({
        title: "Email Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const isLoading = audioMutation.isPending;

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Setup audio visualization
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      const analyser = audioContext.createAnalyser();
      analyserRef.current = analyser;
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 256;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      dataArrayRef.current = dataArray;

      // Visualization loop
      const visualize = () => {
        analyser.getByteFrequencyData(dataArray);
        setWaveformData(Array.from(dataArray).slice(0, 40));
        if (isRecording) requestAnimationFrame(visualize);
      };
      visualize();

      mediaRecorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const file = new File([audioBlob], "recording.webm", { type: "audio/webm" });
        setAudioFile(file);
        setRecordingTime(0);
        setWaveformData([]);
      };

      mediaRecorder.start();
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);

      toast({
        title: "Recording Started",
        description: "Click stop when you're done",
      });
    } catch (err) {
      toast({
        title: "Microphone Access Denied",
        description: "Please allow microphone access to record meetings",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
      toast({
        title: "Recording Stopped",
        description: "Your audio is ready to analyze",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-white mb-2">MeetMate AI</h1>
            <p className="text-xl text-slate-300">
              Analyze meetings instantly. Get summaries, action items, and insights in seconds.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Input Panel */}
            <div className="lg:col-span-1 space-y-4">
              {/* Live Recording */}
              <Card className={`border-2 transition-all ${isRecording ? "bg-red-900/20 border-red-500" : "bg-slate-800 border-slate-700"}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mic className={`h-5 w-5 ${isRecording ? "animate-pulse text-red-500" : ""}`} />
                    {isRecording ? "Recording Meeting" : "Live Recording"}
                  </CardTitle>
                  <CardDescription>
                    {isRecording ? `Recording: ${recordingTime}s` : "Capture audio with your microphone"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isRecording && waveformData.length > 0 && (
                    <div className="flex items-center justify-center gap-1 bg-slate-700 p-3 rounded-lg h-16">
                      {waveformData.map((value, i) => (
                        <div
                          key={i}
                          className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-sm transition-all"
                          style={{
                            height: `${Math.max(10, (value / 255) * 100)}%`,
                            width: "3px",
                          }}
                          data-testid={`waveform-bar-${i}`}
                        />
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`flex-1 ${isRecording ? "bg-red-600 hover:bg-red-700" : ""}`}
                      data-testid={isRecording ? "button-stop-recording" : "button-start-recording"}
                    >
                      {isRecording ? (
                        <>
                          <Square className="mr-2 h-4 w-4" />
                          Stop Recording
                        </>
                      ) : (
                        <>
                          <Mic className="mr-2 h-4 w-4" />
                          Start Recording
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Audio Upload */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Upload Audio
                  </CardTitle>
                  <CardDescription>MP3, WAV, M4A</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-slate-200">Audio File</Label>
                    <Input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                      className="bg-slate-700 border-slate-600"
                      disabled={isLoading}
                      data-testid="input-audio-file"
                    />
                  </div>
                  <Button
                    onClick={() => audioFile && audioMutation.mutate(audioFile)}
                    disabled={!audioFile || isLoading}
                    className="w-full"
                    data-testid="button-analyze-audio"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Analyze Audio"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Analysis Results */}
            <div className="lg:col-span-2">
              {analysis && analysis.executiveSummary ? (
                <div className="space-y-4">
                  {/* Summary Card */}
                  <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-0 text-white">
                    <CardHeader>
                      <CardTitle data-testid="text-summary-title">Executive Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-lg" data-testid="text-summary-content">
                        {analysis.executiveSummary}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-slate-800 border-slate-700">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div
                            className="text-3xl font-bold text-blue-400"
                            data-testid="text-efficiency-score"
                          >
                            {analysis.efficiencyScore}%
                          </div>
                          <p className="text-slate-400 text-sm">Efficiency Score</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-slate-800 border-slate-700">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-400" data-testid="text-sentiment">
                            {analysis.sentiment}
                          </div>
                          <p className="text-slate-400 text-sm">Meeting Sentiment</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Key Points */}
                  {Array.isArray(analysis.keyPoints) && analysis.keyPoints.length > 0 && (
                    <Card className="bg-slate-800 border-slate-700">
                      <CardHeader>
                        <CardTitle>Key Discussion Points</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {analysis.keyPoints.map((point, i) => (
                            <li
                              key={i}
                              className="flex gap-2 text-slate-200"
                              data-testid={`text-key-point-${i}`}
                            >
                              <span className="text-blue-400">•</span>
                              {point}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {/* Action Items */}
                  {Array.isArray(analysis.actionItems) && analysis.actionItems.length > 0 && (
                    <Card className="bg-slate-800 border-slate-700">
                      <CardHeader>
                        <CardTitle>Action Items</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {analysis.actionItems.map((item, i) => (
                            <div
                              key={i}
                              className="p-3 bg-slate-700 rounded-lg"
                              data-testid={`card-action-item-${i}`}
                            >
                              <div className="font-semibold text-white">{item.assignee}</div>
                              <div className="text-slate-300">{item.task}</div>
                              <div className="text-sm text-slate-400 mt-1">Due: {item.deadline}</div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Email Section */}
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5" />
                        Send Report
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Input
                        type="email"
                        placeholder="recipient@example.com"
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                        className="bg-slate-700 border-slate-600"
                        data-testid="input-recipient-email"
                      />
                      <Button
                        onClick={() => emailMutation.mutate()}
                        disabled={!recipientEmail || emailMutation.isPending}
                        className="w-full"
                        data-testid="button-send-email"
                      >
                        {emailMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          "Send Email"
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card className="bg-slate-800 border-slate-700 h-full flex items-center justify-center min-h-96">
                  <CardContent className="text-center">
                    <p className="text-slate-400 text-lg" data-testid="text-placeholder">
                      Upload an audio file to analyze your meeting
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
