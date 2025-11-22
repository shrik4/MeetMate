import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface MeetingWithAnalysis {
  id: string;
  executiveSummary: string;
  sentiment: string;
  efficiencyScore: number;
  createdAt: string;
  meeting?: {
    title: string;
  };
}

export default function Dashboard() {
  const { data: meetings = [], isLoading } = useQuery<MeetingWithAnalysis[]>({
    queryKey: ["/api/meetings"],
  });

  const stats = {
    totalMeetings: meetings.length,
    avgEfficiency:
      meetings.length > 0
        ? Math.round(
            meetings.reduce((sum, m) => sum + m.efficiencyScore, 0) / meetings.length
          )
        : 0,
    sentimentBreakdown: meetings.reduce(
      (acc, m) => {
        acc[m.sentiment] = (acc[m.sentiment] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    ),
  };

  const chartData = Object.entries(stats.sentimentBreakdown).map(([sentiment, count]) => ({
    sentiment,
    count,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-slate-300">Meeting analytics and insights</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-slate-800 border-slate-700 p-6" data-testid="card-total-meetings">
            <div className="text-slate-400 mb-2">Total Meetings</div>
            <div className="text-4xl font-bold text-white">{stats.totalMeetings}</div>
          </Card>

          <Card className="bg-slate-800 border-slate-700 p-6" data-testid="card-avg-efficiency">
            <div className="text-slate-400 mb-2">Average Efficiency Score</div>
            <div className="text-4xl font-bold text-white">{stats.avgEfficiency}%</div>
          </Card>
        </div>

        {chartData.length > 0 && (
          <Card className="bg-slate-800 border-slate-700 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Sentiment Breakdown</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="sentiment" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }}
                />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>
    </div>
  );
}
