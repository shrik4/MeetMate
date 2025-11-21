import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, TrendingUp } from "lucide-react";
import type { MeetingAnalysis } from "@shared/schema";

interface MeetingInsightsProps {
  analysis: MeetingAnalysis;
}

export function MeetingInsights({ analysis }: MeetingInsightsProps) {
  const calculateEfficiencyScore = (): number => {
    let score = 50;
    if (analysis.actionItems) score += analysis.actionItems.length * 5;
    if (analysis.decisions) score += analysis.decisions.length * 3;
    if (analysis.blockers) score -= analysis.blockers.length * 5;
    const avgSentiment = analysis.sentimentTimeline?.reduce((sum, s) => sum + s.sentiment, 0) || 0;
    const sentimentScore = Math.min(20, Math.max(0, (avgSentiment / analysis.sentimentTimeline?.length || 1) * 10));
    score += sentimentScore;
    return Math.min(100, Math.max(0, score));
  };

  const generateInsights = () => {
    const insights = [];
    if (analysis.actionItems && analysis.actionItems.length > 3) {
      insights.push("High action item count - strong outcomes");
    }
    if (analysis.decisions && analysis.decisions.length > 2) {
      insights.push("Multiple decisions made - productive meeting");
    }
    if (analysis.blockers && analysis.blockers.length === 0) {
      insights.push("No blockers identified - smooth progress");
    }
    if (analysis.mood === "Positive") {
      insights.push("Positive team sentiment throughout");
    }
    return insights.length > 0 ? insights : ["Meeting completed successfully"];
  };

  const getTags = () => {
    const tags: string[] = [];
    if (analysis.actionItems?.length) tags.push("Action Items");
    if (analysis.decisions?.length) tags.push("Strategic");
    if (analysis.blockers?.length) tags.push("Challenges");
    if (analysis.sentimentTimeline?.some(s => s.sentiment > 0.7)) tags.push("Positive");
    return tags;
  };

  const score = calculateEfficiencyScore();
  const insights = generateInsights();
  const tags = getTags();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Efficiency Score</p>
              <p className="text-3xl font-bold">{score}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-500" />
          </div>
          <div className="mt-3 bg-secondary rounded-full h-2 w-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-500"
              style={{ width: `${score}%` }}
            />
          </div>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-3">Meeting Tags</p>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          <h3 className="font-semibold">Smart Insights</h3>
        </div>
        <ul className="space-y-2">
          {insights.map((insight, idx) => (
            <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
              <span className="text-amber-500 font-bold mt-0.5">•</span>
              {insight}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
