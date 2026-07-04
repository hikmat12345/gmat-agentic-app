"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { FeatureGate } from "@/components/subscription/feature-gate";
import { useSubscription } from "@/hooks/use-subscription";
import { useTopicIsFree } from "@/hooks/use-topic-is-free";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronLeft,
  Clock,
  Brain,
  ClipboardList,
  ArrowRight,
  BookOpen,
} from "lucide-react";

type Subtopic = {
  id: string;
  slug: string;
  name: string;
  description: string;
  difficulty: string;
  estimatedMinutes: number;
};

type Problem = { id: string };

type PageData = {
  topic: { slug: string; name: string };
  subtopic: Subtopic;
  problems: Problem[];
};

const DIFFICULTY_STYLES: Record<string, string> = {
  easy:   "bg-green-500/10 text-green-600 dark:text-green-400",
  medium: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  hard:   "bg-red-500/10 text-red-600 dark:text-red-400",
};


export default function SubtopicPage() {
  const params = useParams<{ topicSlug: string; subtopicSlug: string }>();
  const router = useRouter();
  const { isPremium, isLoading: subLoading } = useSubscription();
  const { isFree, isLoading: freeLoading } = useTopicIsFree(params.topicSlug);

  const { data, isLoading, isError } = useQuery<PageData>({
    queryKey: ["learning", params.topicSlug, params.subtopicSlug],
    queryFn: () =>
      fetch(`/api/learning/${params.topicSlug}/${params.subtopicSlug}`).then((r) => {
        if (!r.ok) throw new Error("Failed to load");
        return r.json();
      }),
    staleTime: 600_000,
  });

  useEffect(() => {
    if (isError) toast.error("Failed to load subtopic");
  }, [isError]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 p-6">
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
        <div className="h-9 w-72 animate-pulse rounded bg-muted" />
        <div className="h-32 animate-pulse rounded-xl bg-muted" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-40 animate-pulse rounded-xl bg-muted" />
          <div className="h-40 animate-pulse rounded-xl bg-muted" />
        </div>
        <div className="h-36 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  if (!data) return null;

  const { topic, subtopic, problems } = data;

  // Gate locked topics for non-premium users
  if (!freeLoading && !subLoading && isFree === false && !isPremium) {
    return (
      <FeatureGate
        feature={topic.name}
        description="Unlock all GMAT topics with Athena Premium."
      >
        <div className="mx-auto max-w-3xl p-6 opacity-30 pointer-events-none select-none">
          <h1 className="text-3xl font-bold">{subtopic.name}</h1>
          <p className="mt-2 text-muted-foreground">{subtopic.description}</p>
        </div>
      </FeatureGate>
    );
  }
  const diff = DIFFICULTY_STYLES[subtopic.difficulty] ?? DIFFICULTY_STYLES.medium;

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">

      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/learning" className="hover:text-foreground transition-colors">Study Plan</Link>
        <ChevronLeft className="h-3 w-3 rotate-180" />
        <Link href={`/learning/${params.topicSlug}`} className="hover:text-foreground transition-colors font-medium">
          {topic.name}
        </Link>
        <ChevronLeft className="h-3 w-3 rotate-180" />
        <span className="text-foreground font-semibold">{subtopic.name}</span>
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
            <BookOpen className="h-3.5 w-3.5" />
            Study Topic
          </div>
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${diff}`}>
            {subtopic.difficulty}
          </span>
        </div>
        <h1 className="mb-3 text-3xl font-bold tracking-tight">{subtopic.name}</h1>
        <p className="mb-3 leading-relaxed text-muted-foreground">{subtopic.description}</p>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          {subtopic.estimatedMinutes} min estimated
        </div>
      </motion.div>

      {/* Action cards */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.08 }}
        className="mb-10 grid grid-cols-2 gap-3"
      >
        {/* Micro-Lesson */}
        <Link href={`/learning/${params.topicSlug}/${subtopic.slug}/micro-lesson`} className="block">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group relative flex h-full flex-col rounded-xl border-2 border-athena-amber/40 bg-gradient-to-b from-athena-amber/10 to-transparent p-5 cursor-pointer transition-colors hover:border-athena-amber"
          >
            <Brain className="absolute right-4 top-4 h-4 w-4 text-athena-amber/30 transition-colors group-hover:text-athena-amber/60" />
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-athena-amber/15">
              <Brain className="h-6 w-6 text-athena-amber" />
            </div>
            <p className="mb-1 text-base font-bold">Micro-Lesson</p>
            <p className="mb-4 flex-1 text-sm text-muted-foreground">Interactive lesson with whiteboard</p>
            <div className="flex items-center gap-1 text-sm font-semibold text-athena-amber">
              Start <ArrowRight className="h-4 w-4" />
            </div>
          </motion.div>
        </Link>

        {/* Quiz */}
        {problems.length > 0 ? (
          <button
            onClick={() => router.push(`/learning/${params.topicSlug}/${params.subtopicSlug}/quiz`)}
            className="block w-full text-left"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group relative flex h-full flex-col rounded-xl border-2 border-primary/40 bg-gradient-to-b from-primary/10 to-transparent p-5 cursor-pointer transition-colors hover:border-primary"
            >
              <ClipboardList className="absolute right-4 top-4 h-4 w-4 text-primary/30 transition-colors group-hover:text-primary/60" />
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15">
                <ClipboardList className="h-6 w-6 text-primary" />
              </div>
              <p className="mb-1 text-base font-bold">Take Quiz</p>
              <p className="mb-4 flex-1 text-sm text-muted-foreground">
                {problems.length} question{problems.length !== 1 ? "s" : ""} — GMAT-style practice
              </p>
              <div className="flex items-center gap-1 text-sm font-semibold text-primary">
                Enter <ArrowRight className="h-4 w-4" />
              </div>
            </motion.div>
          </button>
        ) : (
          <div className="flex h-full min-h-[160px] items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/20">
            <p className="text-xs text-muted-foreground">Quiz coming soon…</p>
          </div>
        )}
      </motion.div>

    </div>
  );
}
