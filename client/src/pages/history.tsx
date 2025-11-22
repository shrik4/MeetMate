import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Heart, Trash2, Eye } from "lucide-react";

interface MeetingWithAnalysis {
  id: string;
  meetingId: string;
  executiveSummary: string;
  keyPoints: string[];
  actionItems: Array<{ assignee: string; task: string; deadline: string }>;
  sentiment: string;
  efficiencyScore: number;
  isFavorite: number;
  notes: string | null;
  transcript: string | null;
  createdAt: string;
  meeting?: {
    id: string;
    title: string;
    videoUrl: string;
  };
}

export default function History() {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: meetings = [], isLoading } = useQuery<MeetingWithAnalysis[]>({
    queryKey: ["/api/meetings"],
  });

  const filteredMeetings = meetings.filter(
    (m) =>
      m.meeting?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.executiveSummary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Meeting History</h1>
          <p className="text-slate-300">View and manage all your analyzed meetings</p>
        </div>

        <div className="mb-8">
          <Input
            type="text"
            placeholder="Search meetings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
            data-testid="input-search"
          />
        </div>

        {isLoading ? (
          <div className="text-center text-slate-300">Loading meetings...</div>
        ) : filteredMeetings.length === 0 ? (
          <div className="text-center text-slate-300">No meetings found</div>
        ) : (
          <div className="grid gap-4">
            {filteredMeetings.map((meeting) => (
              <Card
                key={meeting.id}
                className="bg-slate-800 border-slate-700 p-4 hover:bg-slate-700 transition-colors cursor-pointer"
                data-testid={`card-meeting-${meeting.id}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1" onClick={() => navigate(`/meeting/${meeting.id}`)}>
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {meeting.meeting?.title || "Unknown Meeting"}
                    </h3>
                    <p className="text-sm text-slate-400 mb-2">
                      {new Date(meeting.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-slate-300 line-clamp-2">{meeting.executiveSummary}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => navigate(`/meeting/${meeting.id}`)}
                      data-testid={`button-view-${meeting.id}`}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      data-testid={`button-favorite-${meeting.id}`}
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          meeting.isFavorite ? "fill-red-500 text-red-500" : ""
                        }`}
                      />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
