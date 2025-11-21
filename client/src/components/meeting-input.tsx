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
  isLoading: boolean;
}

export function MeetingInput({ onAnalyze, isLoading }: MeetingInputProps) {
  const [meetingLink, setMeetingLink] = useState("");
  const [meetingType, setMeetingType] = useState("Team Standup");
  const [language, setLanguage] = useState("English");
  const [isDemo, setIsDemo] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAnalyze({ meetingLink, meetingType, language, isDemo });
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
            <Label htmlFor="meeting-link">Meeting recording link</Label>
            <Input
              id="meeting-link"
              type="url"
              placeholder="https://meet.google.com/... or https://zoom.us/j/... or YouTube link..."
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              required
              data-testid="input-meeting-link"
            />
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
              disabled={isLoading || !meetingLink}
              data-testid="button-analyze"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Analyze Meeting"
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

          <p className="text-xs text-muted-foreground">
            Note: In this hackathon version, analysis is simulated with sample AI output. 
            Backend can be connected later to process real meeting recordings.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
