import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Users } from "lucide-react";

interface SpeakerIdentificationProps {
  onSpeakersChange?: (speakers: string[]) => void;
}

export function SpeakerIdentification({ onSpeakersChange }: SpeakerIdentificationProps) {
  const [speakers, setSpeakers] = useState<string[]>(["Speaker 1", "Speaker 2"]);
  const [newSpeaker, setNewSpeaker] = useState("");

  const handleAddSpeaker = () => {
    if (newSpeaker.trim()) {
      const updated = [...speakers, newSpeaker];
      setSpeakers(updated);
      setNewSpeaker("");
      onSpeakersChange?.(updated);
    }
  };

  const handleRemoveSpeaker = (idx: number) => {
    const updated = speakers.filter((_, i) => i !== idx);
    setSpeakers(updated);
    onSpeakersChange?.(updated);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <CardTitle>Speaker Identification</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {speakers.map((speaker, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-muted">
              <span className="font-medium text-sm">{speaker}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveSpeaker(idx)}
                data-testid={`button-remove-speaker-${idx}`}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>

        <div className="space-y-2 pt-4 border-t">
          <Label htmlFor="new-speaker">Add Speaker Name</Label>
          <div className="flex gap-2">
            <Input
              id="new-speaker"
              placeholder="Enter speaker name"
              value={newSpeaker}
              onChange={(e) => setNewSpeaker(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddSpeaker()}
              data-testid="input-speaker-name"
            />
            <Button onClick={handleAddSpeaker} data-testid="button-add-speaker">
              Add
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
