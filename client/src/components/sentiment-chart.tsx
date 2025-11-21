import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { SentimentPoint } from "@shared/schema";

interface SentimentChartProps {
  data: SentimentPoint[];
}

export function SentimentChart({ data }: SentimentChartProps) {
  const getColor = (sentiment: number) => {
    if (sentiment >= 0.6) return "hsl(var(--chart-2))";
    if (sentiment <= 0.4) return "hsl(var(--chart-5))";
    return "hsl(var(--chart-4))";
  };

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] rounded-lg bg-muted">
        <p className="text-sm text-muted-foreground">No sentiment data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="label" 
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis 
              domain={[0, 1]} 
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
              labelStyle={{ color: "hsl(var(--popover-foreground))" }}
            />
            <Line 
              type="monotone" 
              dataKey="sentiment" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              dot={{ fill: "hsl(var(--primary))", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {data[0]?.description && (
        <p className="text-sm text-muted-foreground italic">
          {data[0].description}
        </p>
      )}
    </div>
  );
}
