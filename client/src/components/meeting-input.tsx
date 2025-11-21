import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface MeetingInputProps {
  onAnalyze: (data: {
    meetingLink: string;
    meetingType: string;
    language: string;
  }) => void;
  isLoading: boolean;
}

export function MeetingInput({ onAnalyze, isLoading }: MeetingInputProps) {
  const [meetingLink, setMeetingLink] = useState("");
  const [meetingType, setMeetingType] = useState("Team Standup");
  const [language, setLanguage] = useState("English");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAnalyze({ meetingLink, meetingType, language });
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
            <Label htmlFor="meeting-link">Meeting Link</Label>
            <Input
              id="meeting-link"
              type="text"
              placeholder="https://meet.google.com/... or https://zoom.us/j/... or YouTube link..."
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
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

          <Button
            type="submit"
            className="w-full"
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
        </form>
      </CardContent>
    </Card>
  );
}
