"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart, Bar, LineChart, Line, ScatterChart, Scatter,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";
import { MathContent } from "./math-content";
import type {
  GmatChartData,
  GmatBarChartData,
  GmatLineChartData,
  GmatScatterPlotData,
  GmatPieChartData,
} from "@/types/full-gmat";

const CHART_COLORS = [
  "#6366f1", "#f59e0b", "#10b981", "#ef4444",
  "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6",
];

// ── Individual chart renderers ──

function BarChartView({ data: d }: { data: GmatBarChartData }) {
  return (
    <div className="space-y-2">
      {d.title && <p className="text-center text-xs font-semibold text-muted-foreground">{d.title}</p>}
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={d.data} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} label={d.xLabel ? { value: d.xLabel, position: "insideBottom", offset: -4, fontSize: 11 } : undefined} />
          <YAxis tick={{ fontSize: 11 }} label={d.yLabel ? { value: d.yLabel, angle: -90, position: "insideLeft", fontSize: 11 } : undefined} />
          <Tooltip contentStyle={{ fontSize: 12 }} />
          <Bar dataKey="value" fill={CHART_COLORS[0]} radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function LineChartView({ data: d }: { data: GmatLineChartData }) {
  // Flatten series into recharts-compatible format
  const merged: Record<string, any>[] = [];
  for (const series of d.series) {
    for (const point of series.data) {
      const existing = merged.find((m) => m.x === point.x);
      if (existing) {
        existing[series.name] = point.y;
      } else {
        merged.push({ x: point.x, [series.name]: point.y });
      }
    }
  }
  return (
    <div className="space-y-2">
      {d.title && <p className="text-center text-xs font-semibold text-muted-foreground">{d.title}</p>}
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={merged} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="x" tick={{ fontSize: 11 }} label={d.xLabel ? { value: d.xLabel, position: "insideBottom", offset: -4, fontSize: 11 } : undefined} />
          <YAxis tick={{ fontSize: 11 }} label={d.yLabel ? { value: d.yLabel, angle: -90, position: "insideLeft", fontSize: 11 } : undefined} />
          <Tooltip contentStyle={{ fontSize: 12 }} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {d.series.map((s, idx) => (
            <Line
              key={s.name}
              type="monotone"
              dataKey={s.name}
              stroke={CHART_COLORS[idx % CHART_COLORS.length]}
              dot={false}
              strokeWidth={2}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function ScatterPlotView({ data: d }: { data: GmatScatterPlotData }) {
  return (
    <div className="space-y-2">
      {d.title && <p className="text-center text-xs font-semibold text-muted-foreground">{d.title}</p>}
      <ResponsiveContainer width="100%" height={220}>
        <ScatterChart margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis type="number" dataKey="x" name={d.xLabel ?? "x"} tick={{ fontSize: 11 }} label={d.xLabel ? { value: d.xLabel, position: "insideBottom", offset: -4, fontSize: 11 } : undefined} />
          <YAxis type="number" dataKey="y" name={d.yLabel ?? "y"} tick={{ fontSize: 11 }} label={d.yLabel ? { value: d.yLabel, angle: -90, position: "insideLeft", fontSize: 11 } : undefined} />
          <Tooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={{ fontSize: 12 }} />
          <Scatter data={d.data} fill={CHART_COLORS[0]} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

function PieChartView({ data: d }: { data: GmatPieChartData }) {
  return (
    <div className="space-y-2">
      {d.title && <p className="text-center text-xs font-semibold text-muted-foreground">{d.title}</p>}
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={d.data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ""} ${((percent ?? 0) * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {d.data.map((_, idx) => (
              <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function ChartRenderer({ chartData }: { chartData: GmatChartData }) {
  switch (chartData.type) {
    case "bar":
      return <BarChartView data={chartData} />;
    case "line":
      return <LineChartView data={chartData} />;
    case "scatter":
      return <ScatterPlotView data={chartData} />;
    case "pie":
      return <PieChartView data={chartData} />;
  }
}

// ── Main component ──

export type GIFeedbackState = {
  type: "correct" | "wrong";
  correctOption: number;
};

type GraphicsInterpretationQuestionProps = {
  questionText: string;
  options: string[];
  chartData: GmatChartData;
  selectedOption: number | undefined;
  onSelect: (optionIndex: number) => void;
  feedbackState?: GIFeedbackState;
  disabled?: boolean;
  direction?: number;
};

/**
 * Renders a GMAT Graphics Interpretation question.
 * Shows a Recharts chart above the question stem and A/B/C/D/E choices.
 */
export function GraphicsInterpretationQuestion({
  questionText,
  options,
  chartData,
  selectedOption,
  onSelect,
  feedbackState,
  disabled,
  direction = 1,
}: GraphicsInterpretationQuestionProps) {
  return (
    <div className="space-y-5">
      {/* Chart */}
      <div className="rounded-lg border bg-card p-4">
        <ChartRenderer chartData={chartData} />
      </div>

      {/* Question */}
      <div className="text-sm leading-relaxed">
        <MathContent content={questionText} />
      </div>

      {/* Answer choices */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={questionText}
          custom={direction}
          initial={{ opacity: 0, x: direction * 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -20 }}
          transition={{ duration: 0.2 }}
          className="space-y-2"
        >
          {options.map((optText, i) => {
            const letter = String.fromCharCode(65 + i);
            const isSelected = selectedOption === i;
            const isCorrectFeedback =
              feedbackState?.type === "correct" && i === feedbackState.correctOption;
            const isWrongFeedback =
              feedbackState?.type === "wrong" && isSelected;

            return (
              <motion.button
                key={i}
                whileTap={!disabled ? { scale: 0.98 } : undefined}
                onClick={() => !disabled && onSelect(i)}
                disabled={disabled}
                className={cn(
                  "flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors",
                  !feedbackState && isSelected
                    ? "border-primary bg-primary/10"
                    : !feedbackState && !disabled
                      ? "hover:border-primary/50 hover:bg-accent/50"
                      : "",
                  isCorrectFeedback && "border-athena-success bg-athena-success/10",
                  isWrongFeedback && "border-destructive bg-destructive/10",
                  feedbackState && !isCorrectFeedback && !isWrongFeedback && "opacity-50",
                  disabled && "cursor-default"
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium",
                    !feedbackState && isSelected && "border-primary bg-primary text-primary-foreground",
                    isCorrectFeedback && "border-athena-success bg-athena-success text-white",
                    isWrongFeedback && "border-destructive bg-destructive text-white"
                  )}
                >
                  {letter}
                </span>
                <span className="pt-0.5">
                  <MathContent content={optText} />
                </span>
              </motion.button>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
