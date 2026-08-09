"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useCurrentUser } from "@/hooks/use-current-user";
import { getGreeting } from "@/lib/utils";
import { DailyQuestCard } from "@/components/dashboard/daily-quest-card";
import { QuestStreak } from "@/components/dashboard/quest-streak";
import { CompanionCard } from "@/components/dashboard/companion-card";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { FriendsLeaderboard } from "@/components/dashboard/friends-leaderboard";
import { FullGmatCard } from "@/components/dashboard/full-gmat-card";
import { RankCard } from "@/components/dashboard/rank-card";
import { FocusRecommendationCard } from "@/components/dashboard/focus-recommendation-card";
import { HowItWorksCard } from "@/components/dashboard/how-it-works-card";

type StreakDay = { day: string; completed: boolean; isPast: boolean };
type FriendScore = {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
  totalScore: number;
  weeklyDelta: number;
};
type DashboardData = {
  user: {
    displayName: string | null;
    skillScore: number | null;
    avatarUrl: string | null;
    targetScore: number | null;
  };
  sectionScores: {
    verbal: number | null;
    quantitative: number | null;
    dataInsights: number | null;
  };
  upcomingSessions: any[];
  queueItems: any[];
  totalQueueCount: number;
  completedLessonCount: number;
  completedSessions: number;
  totalSessions: number;
  streak: number;
  totalScore: number;
  weeklyDelta: number;
  topics: { slug: string; name: string; subtopicCount: number }[];
  weeklyStreakDays: StreakDay[];
  battleZones: { name: string; slug: string; done: number }[];
  todayStudyTime: string | null;
  targetScore: number | null;
  friendsScores: FriendScore[];
};

const fade = {
  hidden: { opacity: 0, y: 10 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, delay: i * 0.06 },
  }),
};

export default function DashboardPage() {
  const router = useRouter();
  const { data: userData, loading: userLoading } = useCurrentUser();

  const readyToLoad = !userLoading && !!userData && userData.user.onboardingCompleted;

  const { data, isLoading: dashLoading, isError } = useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: () =>
      fetch("/api/dashboard").then((r) => {
        if (!r.ok) throw new Error("Failed to load");
        return r.json();
      }),
    staleTime: 60_000,
    enabled: readyToLoad,
  });

  useEffect(() => {
    if (!userLoading && userData && !userData.user.onboardingCompleted) {
      router.replace("/onboarding");
    }
  }, [userData, userLoading, router]);

  useEffect(() => {
    if (isError) toast.error("Failed to load dashboard data");
  }, [isError]);

  const loading = userLoading || dashLoading;

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl p-6 space-y-5">
        <div className="h-7 w-44 animate-pulse rounded bg-muted" />
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-3">
            <div className="h-40 animate-pulse rounded-xl bg-muted" />
            <div className="h-24 animate-pulse rounded-xl bg-muted" />
            <div className="h-24 animate-pulse rounded-xl bg-muted" />
          </div>
          <div className="space-y-4 lg:col-span-2">
            <div className="h-48 animate-pulse rounded-xl bg-muted" />
            <div className="h-24 animate-pulse rounded-xl bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const name = data.user.displayName?.split(" ")[0] || "there";

  return (
    <div className="mx-auto max-w-7xl p-6">
      {/* ── Compact header ── */}
      <motion.div custom={0} variants={fade} initial="hidden" animate="show" className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {getGreeting()}
          </p>
          <h1 className="text-2xl font-bold tracking-tight">{name}</h1>
        </div>
        {data.todayStudyTime && (
          <div className="hidden sm:flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-xs text-muted-foreground">
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            Study time: {data.todayStudyTime}
          </div>
        )}
      </motion.div>

      {/* ── Two-column layout ── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">

        {/* ── Left: action feed ── */}
        <div className="space-y-4 lg:col-span-3">

          {/* 1. TODAY'S QUEST — hero of the page */}
          <motion.div custom={1} variants={fade} initial="hidden" animate="show">
            <DailyQuestCard />
          </motion.div>

          {/* 2. Feature discovery guide */}
          <motion.div custom={2} variants={fade} initial="hidden" animate="show">
            <HowItWorksCard />
          </motion.div>

          {/* 3. Focus areas — proactive coaching from stuck-points API */}
          <motion.div custom={3} variants={fade} initial="hidden" animate="show">
            <FocusRecommendationCard />
          </motion.div>

          {/* 4. Full GMAT practice test */}
          <motion.div custom={4} variants={fade} initial="hidden" animate="show">
            <FullGmatCard />
          </motion.div>

          {/* 5. Weekly streak */}
          <motion.div custom={5} variants={fade} initial="hidden" animate="show">
            <QuestStreak streak={data.streak} days={data.weeklyStreakDays} />
          </motion.div>
        </div>

        {/* ── Right: stats sidebar ── */}
        <div className="space-y-4 lg:col-span-2">

          {/* 1. Score & tier — informational, not the hero */}
          <motion.div custom={1} variants={fade} initial="hidden" animate="show">
            <RankCard
              totalScore={data.totalScore}
              weeklyDelta={data.weeklyDelta}
              sectionScores={data.sectionScores}
            />
          </motion.div>

          {/* 2. Target score + sessions */}
          <motion.div custom={2} variants={fade} initial="hidden" animate="show">
            <StatsCards
              targetScore={data.user.targetScore ?? data.targetScore}
              sessionsCount={data.completedSessions}
            />
          </motion.div>

          {/* 3. AI companion */}
          <motion.div custom={3} variants={fade} initial="hidden" animate="show">
            <CompanionCard />
          </motion.div>

          {/* 4. Friends leaderboard */}
          <motion.div custom={4} variants={fade} initial="hidden" animate="show">
            <FriendsLeaderboard friends={data.friendsScores} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
