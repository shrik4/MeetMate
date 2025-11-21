import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";

interface MeetingInputProps {
  onAnalyze: (data: {
    meetingLink: string;
    meetingType: string;
    language: string;
    isDemo: boolean;
  }) => void;
  onAnalyzeAudio?: (file: File, meetingType: string, language: string) => void;
  isLoading: boolean;
}

export function MeetingInput({ onAnalyze, onAnalyzeAudio, isLoading }: MeetingInputProps) {
  const [meetingLink, setMeetingLink] = useState("");
  const [meetingType, setMeetingType] = useState("Team Standup");
  const [language, setLanguage] = useState("English");
  const [isDemo, setIsDemo] = useState(false);
  const [hfApiKey, setHfApiKey] = useState(() => {
    return typeof window !== "undefined" ? localStorage.getItem("huggingface_api_key") || "" : "";
  });
  const [audioFile, setAudioFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hfApiKey) {
      localStorage.setItem("huggingface_api_key", hfApiKey);
    }
    
    // If audio file is selected, analyze it instead
    if (audioFile) {
      onAnalyzeAudio?.(audioFile, meetingType, language);
      return;
    }
    
    // Otherwise analyze the meeting link
    onAnalyze({ meetingLink, meetingType, language, isDemo, apiKey: undefined });
  };

  const useSampleLink = () => {
    setMeetingLink("https://www.youtube.com/watch?v=sample-meeting");
    setIsDemo(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>1. Paste your meeting link</CardTitle>
        <CardDescription>
          Enter a Google Meet, Zoom, Teams, or YouTube meeting link
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="hf-key">Hugging Face API Key (Required for audio transcription)</Label>
            <Input
              id="hf-key"
              type="password"
              placeholder="hf_..."
              value={hfApiKey}
              onChange={(e) => setHfApiKey(e.target.value)}
              data-testid="input-hf-key"
            />
            <p className="text-xs text-muted-foreground">
              500 free API calls/month. Get one at <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">huggingface.co/settings/tokens</a>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="meeting-link">Meeting Recording</Label>
            {audioFile ? (
              <div className="flex items-center justify-between rounded-lg border border-green-600 bg-green-50 dark:bg-green-950 p-3">
                <div>
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">✓ Audio file selected</p>
                  <p className="text-xs text-green-700 dark:text-green-300">{audioFile.name}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setAudioFile(null)}
                  data-testid="button-remove-audio"
                >
                  Remove
                </Button>
              </div>
            ) : (
              <Input
                id="meeting-link"
                type="text"
                placeholder="https://meet.google.com/... or https://zoom.us/j/... or YouTube link..."
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                data-testid="input-meeting-link"
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="audio-file">Or upload audio file (MP3, WAV, M4A)</Label>
            <Input
              id="audio-file"
              type="file"
              accept="audio/*"
              onChange={(e) => {
                setAudioFile(e.target.files?.[0] || null);
                if (e.target.files?.[0]) {
                  setMeetingLink("");
                }
              }}
              data-testid="input-audio-file"
            />
            <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-3 space-y-2">
              <p className="text-xs font-semibold text-blue-900 dark:text-blue-100">
                🎉 FREE Audio Transcription
              </p>
              <div className="space-y-1 text-xs text-blue-800 dark:text-blue-200">
                <div>• <strong>Hugging Face:</strong> 500 free API calls/month</div>
                <div>• <strong>Google Cloud:</strong> Fallback - 60 minutes/month (setup required)</div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="meeting-type">Meeting type</Label>
              <Select value={meetingType} onValueChange={setMeetingType}>
                <SelectTrigger id="meeting-type" data-testid="select-meeting-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Team Standup">Team Standup</SelectItem>
                  <SelectItem value="Client Call">Client Call</SelectItem>
                  <SelectItem value="Project Review">Project Review</SelectItem>
                  <SelectItem value="Classroom Session">Classroom Session</SelectItem>
                  <SelectItem value="Brainstorming">Brainstorming</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger id="language" data-testid="select-language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Hindi">Hindi</SelectItem>
                  <SelectItem value="Kannada">Kannada</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="demo-mode"
              checked={isDemo}
              onCheckedChange={(checked) => setIsDemo(checked === true)}
              data-testid="checkbox-demo-mode"
            />
            <label
              htmlFor="demo-mode"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              This is a short sample meeting (for demo)
            </label>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="submit"
              className="flex-1"
              disabled={isLoading || (!meetingLink && !audioFile)}
              data-testid="button-analyze"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {audioFile ? "Transcribing..." : "Analyzing..."}
                </>
              ) : (
                audioFile ? "Transcribe & Analyze" : "Analyze Meeting"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={useSampleLink}
              disabled={isLoading}
              data-testid="button-sample-link"
            >
              Use sample meeting link
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="audio-file">Upload Meeting Recording (MP3, WAV, M4A)</Label>
            <Input
              id="audio-file"
              type="file"
              accept="audio/*"
              onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
              data-testid="input-audio-file"
            />
            {audioFile && <p className="text-xs text-green-600">Selected: {audioFile.name}</p>}
            <p className="text-xs text-muted-foreground">
              Upload an audio file or paste a meeting link for analysis
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
