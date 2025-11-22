import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Upload, Mail, Link2, FileText } from "lucide-react";
import type { MeetingAnalysis } from "@shared/schema";

export default function Home() {
  const [videoUrl, setVideoUrl] = useState("");
  const [transcript, setTranscript] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<MeetingAnalysis | null>(null);
  const [recipientEmail, setRecipientEmail] = useState("");
  const { toast } = useToast();

  const transcriptMutation = useMutation({
    mutationFn: async (text: string) => {
      const response = await apiRequest("POST", "/api/analyze-transcript", {
        transcript: text,
      });
      return response as unknown as MeetingAnalysis;
    },
    onSuccess: (data) => {
      setAnalysis(data);
      setTranscript("");
      toast({
        title: "Analysis Complete!",
        description: "Your meeting transcript has been analyzed.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const urlMutation = useMutation({
    mutationFn: async (url: string) => {
      const response = await apiRequest("POST", "/api/analyze-meeting", {
        videoUrl: url,
      });
      return response as unknown as MeetingAnalysis;
    },
    onSuccess: (data) => {
      setAnalysis(data);
      setVideoUrl("");
      toast({
        title: "Analysis Complete!",
        description: "Your meeting has been analyzed.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

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

  const isLoading = audioMutation.isPending || urlMutation.isPending || transcriptMutation.isPending;

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
              {/* Paste Transcript */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Paste Transcript
                  </CardTitle>
                  <CardDescription>Meeting text or captions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <textarea
                    placeholder="Paste meeting transcript, captions, or notes here..."
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    className="w-full h-32 bg-slate-700 border border-slate-600 rounded-md p-3 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                    data-testid="textarea-transcript"
                  />
                  <Button
                    onClick={() => transcript.trim() && transcriptMutation.mutate(transcript)}
                    disabled={!transcript.trim() || isLoading}
                    className="w-full"
                    data-testid="button-analyze-transcript"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      "Analyze Transcript"
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* YouTube Link */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Link2 className="h-5 w-5" />
                    YouTube Video
                  </CardTitle>
                  <CardDescription>Uses captions when available</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-slate-200">Video URL</Label>
                    <Input
                      type="url"
                      placeholder="https://youtube.com/watch?v=..."
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      className="bg-slate-700 border-slate-600"
                      disabled={isLoading}
                      data-testid="input-video-url"
                    />
                  </div>
                  <Button
                    onClick={() => videoUrl && urlMutation.mutate(videoUrl)}
                    disabled={!videoUrl || isLoading}
                    className="w-full"
                    data-testid="button-analyze-url"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      "Analyze Link"
                    )}
                  </Button>
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
