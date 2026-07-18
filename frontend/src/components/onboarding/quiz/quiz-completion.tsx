"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Target, ArrowRight } from "lucide-react";

type GmatScores = { verbal: number; quantitative: number; dataInsights: number; composite: number };

export function QuizCompletion({
  skillScore,
  totalQuestions,
  correctCount,
  gmatScores,
  onContinue,
}: {
  skillScore: number;
  totalQuestions: number;
  correctCount: number;
  gmatScores?: GmatScores;
  onContinue: () => void;
}) {
  const composite = gmatScores?.composite ?? null;
  const scoreColor =
    (composite ?? skillScore) >= 500
      ? "text-emerald-500"
      : (composite ?? skillScore) >= 400
        ? "text-amber-500"
        : "text-destructive";

  const SECTION_CONFIG = [
    { label: "Verbal", key: "verbal" as const, color: "bg-blue-500" },
    { label: "Quant", key: "quantitative" as const, color: "bg-violet-500" },
    { label: "Data Insights", key: "dataInsights" as const, color: "bg-amber-500" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full max-w-lg mx-auto text-center">
        <CardHeader>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto mb-2"
          >
            <Trophy className="h-12 w-12 text-amber-500" />
          </motion.div>
          <CardTitle className="text-2xl">Diagnostic Complete!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Composite score */}
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              {composite != null ? "GMAT Composite Estimate" : "Your diagnostic score"}
            </p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className={`text-5xl font-bold tabular-nums ${scoreColor}`}
            >
              {composite ?? skillScore}
            </motion.p>
            {composite != null && (
              <p className="text-xs text-muted-foreground mt-1">205–805 scale</p>
            )}
          </div>

          {/* V/Q/DI breakdown */}
          {gmatScores && (
            <div className="grid grid-cols-3 gap-3">
              {SECTION_CONFIG.map(({ label, key, color }) => (
                <div key={key} className="flex flex-col items-center gap-1.5 rounded-xl border border-border/60 bg-muted/30 p-3">
                  <div className={`h-1.5 w-full rounded-full bg-muted overflow-hidden`}>
                    <div
                      className={`h-full rounded-full ${color}`}
                      style={{ width: `${((gmatScores[key] - 60) / 30) * 100}%` }}
                    />
                  </div>
                  <span className="text-lg font-bold tabular-nums">{gmatScores[key]}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Target className="h-4 w-4" />
              <span>{correctCount}/{totalQuestions} correct</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            {(composite ?? 0) >= 550
              ? "Strong GMAT foundation! Let's build a plan to push your score even higher."
              : (composite ?? 0) >= 400
                ? "Good start! Your personalized GMAT lessons will help fill the gaps."
                : "No worries — we've queued targeted GMAT lessons to get you up to speed."}
          </p>

          <Button onClick={onContinue} className="w-full" size="lg">
            Set your study schedule
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
