"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { getTopicIcon } from "@/lib/topic-icons";

type Topic = {
  slug: string;
  name: string;
  subject: string;
  isFree?: boolean;
};

const SUBJECT_LABELS: Record<string, string> = {
  math:              "Math",
  "reading-writing": "Reading & Writing",
  "reading_writing": "Reading & Writing",
  verbal:            "Verbal",
  quantitative:      "Quantitative",
  data_insights:     "Data Insights",
};

const SUBJECT_ORDER = [
  "verbal", "quantitative", "data_insights",
  "math", "reading-writing", "reading_writing",
];

function sortedSubjects(topics: Topic[]): string[] {
  const unique = [...new Set(topics.map((t) => t.subject))];
  return unique.sort(
    (a, b) => SUBJECT_ORDER.indexOf(a) - SUBJECT_ORDER.indexOf(b)
  );
}

export function TopicSidebar({
  topics,
  activeSlug,
  isPremium = false,
}: {
  topics: Topic[];
  activeSlug: string;
  isPremium?: boolean;
}) {
  const subjects = sortedSubjects(topics);

  return (
    <nav className="w-52 shrink-0 space-y-5">
      {subjects.map((subject) => (
        <div key={subject}>
          <p className="px-2 pb-1.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60">
            {SUBJECT_LABELS[subject] ?? subject}
          </p>
          <div className="space-y-0.5">
            {topics
              .filter((t) => t.subject === subject)
              .map((topic) => {
                const isActive = topic.slug === activeSlug;
                const isLocked = !isPremium && topic.isFree === false;
                const Icon = getTopicIcon(topic.slug);
                return (
                  <Link
                    key={topic.slug}
                    href={isLocked ? "/billing" : `/learning/${topic.slug}`}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : isLocked
                        ? "text-muted-foreground/40 hover:bg-muted/30"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0",
                        isActive ? "text-primary" : isLocked ? "text-muted-foreground/30" : "text-muted-foreground/60"
                      )}
                    />
                    <span className="truncate">{topic.name}</span>
                    {isActive && !isLocked && (
                      <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    )}
                    {isLocked && (
                      <Lock className="ml-auto h-3 w-3 shrink-0 text-muted-foreground/40" />
                    )}
                  </Link>
                );
              })}
          </div>
        </div>
      ))}
    </nav>
  );
}
