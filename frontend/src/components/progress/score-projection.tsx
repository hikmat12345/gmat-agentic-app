"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type HistoryPoint = { date: string; score: number };

type Props = {
  history: HistoryPoint[];
  targetScore: number | null;
  currentScore: number | null;
};

function projectScore(history: HistoryPoint[], weeksAhead: number): HistoryPoint[] {
  if (history.length < 2) return [];

  // Simple linear regression over existing history
  const n = history.length;
  const xs = history.map((_, i) => i);
  const ys = history.map((h) => h.score);

  const sumX = xs.reduce((a, b) => a + b, 0);
  const sumY = ys.reduce((a, b) => a + b, 0);
  const sumXY = xs.reduce((acc, x, i) => acc + x * ys[i], 0);
  const sumX2 = xs.reduce((acc, x) => acc + x * x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX) || 0;
  const intercept = (sumY - slope * sumX) / n;

  // Weekly intervals from last date
  const lastDate = new Date(history[history.length - 1].date);
  const projected: HistoryPoint[] = [];
  for (let w = 1; w <= weeksAhead; w++) {
    const d = new Date(lastDate);
    d.setDate(d.getDate() + w * 7);
    const predictedScore = Math.max(205, Math.min(805, Math.round(intercept + slope * (n + w - 1))));
    projected.push({ date: d.toISOString().slice(0, 10), score: predictedScore });
  }
  return projected;
}

const GMAT_TIERS = [
  { score: 705, label: "Elite", color: "#f59e0b" },
  { score: 655, label: "Master", color: "#8b5cf6" },
  { score: 605, label: "Expert", color: "#6366f1" },
  { score: 565, label: "Adept", color: "#06b6d4" },
  { score: 505, label: "Practitioner", color: "#10b981" },
];

export function ScoreProjection({ history, targetScore, currentScore }: Props) {
  const { chartData, projectedPoints } = useMemo(() => {
    if (!history || history.length === 0) return { chartData: [], projectedPoints: [] };

    const projected = projectScore(history, 8);
    const actual = history.map((h, i) => ({
      date: new Date(h.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      actual: h.score,
      projected: undefined as number | undefined,
      idx: i,
    }));

    const projData = projected.map((p, i) => ({
      date: new Date(p.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      actual: undefined as number | undefined,
      projected: p.score,
      idx: history.length + i,
    }));

    // Connect last actual to first projected
    if (actual.length > 0 && projData.length > 0) {
      projData[0] = { ...projData[0], actual: actual[actual.length - 1].actual };
    }

    return {
      chartData: [...actual, ...projData],
      projectedPoints: projected,
    };
  }, [history]);

  if (!chartData.length) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
        Complete quests to see your score projection
      </div>
    );
  }

  const allScores = chartData.flatMap((d) => [d.actual, d.projected].filter((x): x is number => x !== undefined));
  const minScore = Math.max(205, Math.min(...allScores) - 30);
  const maxScore = Math.min(805, Math.max(...allScores) + 30);

  const estimatedTarget = projectedPoints.find((p) => targetScore && p.score >= targetScore);
  const weeksToTarget = estimatedTarget
    ? Math.ceil((new Date(estimatedTarget.date).getTime() - Date.now()) / (7 * 24 * 60 * 60 * 1000))
    : null;

  return (
    <div className="space-y-3">
      {weeksToTarget !== null && targetScore && (
        <div className="rounded-lg bg-primary/5 border border-primary/20 px-4 py-2.5 text-sm">
          <span className="font-medium text-primary">Score {targetScore}</span>
          <span className="text-muted-foreground"> projected in ~{weeksToTarget} week{weeksToTarget !== 1 ? "s" : ""} at your current pace</span>
        </div>
      )}
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[minScore, maxScore]}
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
            width={36}
          />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              fontSize: 12,
            }}
            formatter={(value, name) => [(value ?? 0) as number, name === "actual" ? "Score" : "Projected"] as [number, string]}
          />
          {targetScore && (
            <ReferenceLine
              y={targetScore}
              stroke="hsl(var(--primary))"
              strokeDasharray="4 2"
              label={{ value: `Target ${targetScore}`, position: "right", fontSize: 10, fill: "hsl(var(--primary))" }}
            />
          )}
          <Line
            type="monotone"
            dataKey="actual"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ r: 3, fill: "hsl(var(--primary))" }}
            activeDot={{ r: 5 }}
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="projected"
            stroke="hsl(var(--primary))"
            strokeWidth={1.5}
            strokeDasharray="5 3"
            dot={false}
            activeDot={{ r: 4 }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
      <p className="text-[10px] text-muted-foreground">Dashed line shows projected trend based on your improvement rate.</p>
    </div>
  );
}
