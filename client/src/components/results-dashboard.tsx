import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Copy, Mail, CheckCircle2, Download, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { MeetingAnalysis } from "@shared/schema";
import { SentimentChart } from "./sentiment-chart";
import { MeetingInsights } from "./meeting-insights";
import { SpeakerIdentification } from "./speaker-identification";
import { generatePDF } from "./pdf-export";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ResultsDashboardProps {
  analysis: MeetingAnalysis | null;
}

export function ResultsDashboard({ analysis }: ResultsDashboardProps) {
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(analysis?.isFavorite === 1);

  const favoriteMutation = useMutation({
    mutationFn: async () => {
      if (analysis?.id) {
        const response = await apiRequest("POST", `/api/meetings/${analysis.id}/toggle-favorite`, {});
        return response;
      }
    },
    onSuccess: () => {
      setIsFavorite(!isFavorite);
      toast({
        title: isFavorite ? "Removed from favorites" : "Added to favorites",
        description: "Meeting marked successfully",
      });
    },
  });

  if (!analysis) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>2. AI Meeting Intelligence Report</CardTitle>
          <CardDescription>
            Results will appear here after analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">
            Paste a meeting link and click "Analyze Meeting" to see results
          </p>
        </CardContent>
      </Card>
    );
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${type} copied to clipboard`,
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "destructive";
      case "Medium":
        return "default";
      case "Low":
        return "secondary";
      default:
        return "secondary";
    }
  };

  return (
    <Card>
      <CardHeader className="flex items-start justify-between">
        <div>
          <CardTitle>2. AI Meeting Intelligence Report</CardTitle>
          <CardDescription>
            Comprehensive analysis of your meeting
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Button
            variant={isFavorite ? "default" : "outline"}
            size="icon"
            onClick={() => favoriteMutation.mutate()}
            data-testid="button-favorite"
            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Star className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => generatePDF(analysis)}
            data-testid="button-export-pdf"
          >
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 flex-wrap h-auto">
            <TabsTrigger value="summary" data-testid="tab-summary">Summary</TabsTrigger>
            <TabsTrigger value="insights" data-testid="tab-insights">Insights</TabsTrigger>
            <TabsTrigger value="decisions" data-testid="tab-decisions">Decisions</TabsTrigger>
            <TabsTrigger value="tasks" data-testid="tab-tasks">Tasks</TabsTrigger>
            <TabsTrigger value="blockers" data-testid="tab-blockers">Blockers</TabsTrigger>
            <TabsTrigger value="sentiment" data-testid="tab-sentiment">Sentiment</TabsTrigger>
            <TabsTrigger value="speakers" data-testid="tab-speakers">Speakers</TabsTrigger>
            <TabsTrigger value="email" data-testid="tab-email">Email</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {analysis.duration && (
                <Badge variant="secondary">Duration: {analysis.duration} min</Badge>
              )}
              {analysis.participants && (
                <Badge variant="secondary">Participants: {analysis.participants}</Badge>
              )}
              {analysis.mood && (
                <Badge variant="secondary">Mood: {analysis.mood}</Badge>
              )}
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Meeting Summary</h3>
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm whitespace-pre-wrap" data-testid="text-summary">
                  {analysis.summary}
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <MeetingInsights analysis={analysis} />
          </TabsContent>

          <TabsContent value="decisions" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Decisions Taken</h3>
              <Badge variant="outline" className="gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Auto-detected by AI
              </Badge>
            </div>
            <div className="rounded-lg bg-muted p-4">
              {analysis.decisions && analysis.decisions.length > 0 ? (
                <ol className="list-decimal list-inside space-y-2">
                  {analysis.decisions.map((decision, index) => (
                    <li key={index} className="text-sm" data-testid={`text-decision-${index}`}>
                      {decision}
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm text-muted-foreground">No decisions detected</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Action Items</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const checklist = (analysis.actionItems || [])
                    .map((item) => `- [ ] ${item.task} (${item.owner}) - ${item.deadline}`)
                    .join("\n");
                  copyToClipboard(checklist, "Checklist");
                }}
                disabled={!analysis.actionItems || analysis.actionItems.length === 0}
                data-testid="button-copy-checklist"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy as checklist
              </Button>
            </div>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Priority</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analysis.actionItems && analysis.actionItems.length > 0 ? (
                    analysis.actionItems.map((item, index) => (
                      <TableRow key={index} data-testid={`row-task-${index}`}>
                        <TableCell className="font-medium">{item.task}</TableCell>
                        <TableCell>{item.owner}</TableCell>
                        <TableCell>{item.deadline}</TableCell>
                        <TableCell>
                          <Badge variant={getPriorityColor(item.priority)}>
                            {item.priority}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No action items detected
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="blockers" className="space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <h3 className="font-semibold">Problems & Blockers</h3>
            </div>
            <div className="rounded-lg bg-muted p-4">
              {analysis.blockers && analysis.blockers.length > 0 ? (
                <ul className="list-disc list-inside space-y-2">
                  {analysis.blockers.map((blocker, index) => (
                    <li key={index} className="text-sm" data-testid={`text-blocker-${index}`}>
                      {blocker}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No blockers detected</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="sentiment" className="space-y-4">
            <h3 className="font-semibold">Sentiment Over Time</h3>
            <SentimentChart data={analysis.sentimentTimeline || []} />
            <div className="flex flex-wrap gap-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-chart-2" />
                <span className="text-muted-foreground">Positive</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-chart-4" />
                <span className="text-muted-foreground">Neutral</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-chart-5" />
                <span className="text-muted-foreground">Negative</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="speakers" className="space-y-4">
            <SpeakerIdentification />
          </TabsContent>

          <TabsContent value="email" className="space-y-4">
            <h3 className="font-semibold">Follow-up Email Draft</h3>
            <Textarea
              readOnly
              value={analysis.emailDraft}
              className="min-h-[200px] font-mono text-sm"
              data-testid="textarea-email"
            />
            <div className="flex gap-3">
              <Button
                onClick={() => copyToClipboard(analysis.emailDraft, "Email")}
                data-testid="button-copy-email"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy email
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  window.location.href = `mailto:?body=${encodeURIComponent(analysis.emailDraft)}`;
                }}
                data-testid="button-open-mail"
              >
                <Mail className="mr-2 h-4 w-4" />
                Open in mail app
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
