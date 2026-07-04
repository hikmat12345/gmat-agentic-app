"use client";

import Link from "next/link";
import { Clock, ChevronRight, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

type SubtopicCardProps = {
  slug: string;
  name: string;
  difficulty: string;
  estimatedMinutes: number;
  description: string;
};

const DIFFICULTY_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  easy:   { bg: "bg-green-500/10",  text: "text-green-600 dark:text-green-400",  label: "Easy" },
  medium: { bg: "bg-amber-500/10",  text: "text-amber-600 dark:text-amber-400",  label: "Medium" },
  hard:   { bg: "bg-red-500/10",    text: "text-red-600 dark:text-red-400",       label: "Hard" },
};

export function SubtopicCard({
  subtopic,
  topicSlug,
  index,
  locked = false,
}: {
  subtopic: SubtopicCardProps;
  topicSlug: string;
  index: number;
  locked?: boolean;
}) {
  const diff = DIFFICULTY_STYLES[subtopic.difficulty] ?? DIFFICULTY_STYLES.medium;

  return (
    <Link
      href={locked ? "/billing" : `/learning/${topicSlug}/${subtopic.slug}`}
      className={cn(
        "group flex items-center gap-4 border-b border-border/40 px-5 py-4 transition-colors last:border-b-0",
        locked ? "bg-card/60 hover:bg-muted/20" : "bg-card hover:bg-muted/40"
      )}
    >
      {/* Index */}
      <span className={cn(
        "w-6 shrink-0 text-center text-xs font-mono",
        locked ? "text-muted-foreground/25" : "text-muted-foreground/40"
      )}>
        {String(index + 1).padStart(2, "0")}
      </span>

      {/* Name + description */}
      <div className="min-w-0 flex-1 space-y-1">
        <p className={cn(
          "text-base font-semibold leading-snug",
          locked && "text-muted-foreground/50"
        )}>
          {subtopic.name}
        </p>
        <p className={cn(
          "line-clamp-1 text-sm",
          locked ? "text-muted-foreground/30" : "text-muted-foreground"
        )}>
          {subtopic.description}
        </p>
        <div className="flex items-center gap-3 pt-0.5">
          <span className={cn(
            "rounded-full px-2 py-0.5 text-xs font-semibold capitalize",
            locked ? "bg-muted text-muted-foreground/40" : cn(diff.bg, diff.text)
          )}>
            {locked ? "Premium" : diff.label}
          </span>
          <div className={cn(
            "flex items-center gap-1 text-xs",
            locked ? "text-muted-foreground/30" : "text-muted-foreground/70"
          )}>
            <Clock className="h-3 w-3" />
            {subtopic.estimatedMinutes} min
          </div>
        </div>
      </div>

      {/* Action */}
      {locked ? (
        <div className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-muted/60 px-3.5 py-2 text-sm font-semibold text-muted-foreground">
          <Lock className="h-3.5 w-3.5" />
        </div>
      ) : (
        <div className="flex shrink-0 items-center gap-1 rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground transition-all group-hover:bg-primary/90 group-hover:shadow-md">
          Enter
          <ChevronRight className="h-4 w-4" />
        </div>
      )}
    </Link>
  );
}
