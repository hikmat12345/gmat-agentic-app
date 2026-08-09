"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, BookOpen, ClipboardCheck, Trophy, Clock, TrendingUp, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  {
    icon: Trophy,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    title: "1. Daily Quest (Dashboard)",
    where: "Click \"Start Quest\" on this page",
    what: "After finishing, you get: coaching feedback on weak areas, avg time per question vs GMAT pace, and smart next-step links.",
  },
  {
    icon: BookOpen,
    color: "text-primary",
    bg: "bg-primary/10",
    title: "2. Study Plan (Sidebar → Study Plan)",
    where: "/learning",
    whereLabel: "Go to Study Plan →",
    what: "Topics are grouped into Foundation → Practice → Mastery phases. A yellow banner appears when Athena detects a weak area to focus on. Each phase has a milestone card showing your score target.",
  },
  {
    icon: ClipboardCheck,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    title: "3. Full GMAT Exam (Sidebar → Exam)",
    where: "/full-gmat",
    whereLabel: "Go to Exam →",
    what: "After completing all 3 sections you get: a time management panel with section-by-section bars vs 45-min budget, per-section coaching messages, and 3 personalised next-step cards.",
  },
];

export function HowItWorksCard() {
  const [open, setOpen] = useState(true);

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-muted/40 transition-colors"
      >
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">Where to find your insights</span>
          <span className="text-xs text-muted-foreground ml-1">— coaching, time analysis &amp; next steps</span>
        </div>
        {open
          ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
          : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        }
      </button>

      {open && (
        <div className="border-t divide-y">
          {steps.map((s) => (
            <div key={s.title} className="flex gap-3 px-4 py-3.5">
              <div className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", s.bg)}>
                <s.icon className={cn("h-4 w-4", s.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{s.title}</p>
                {s.whereLabel && s.where ? (
                  <Link
                    href={s.where}
                    className={cn("inline-flex items-center gap-1 text-xs font-medium mt-0.5", s.color, "hover:underline")}
                  >
                    {s.whereLabel}
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                ) : (
                  <p className="text-xs text-muted-foreground mt-0.5">{s.where}</p>
                )}
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{s.what}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
