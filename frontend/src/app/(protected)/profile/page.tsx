"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useCurrentUser } from "@/hooks/use-current-user";
import { AnimatedSprite } from "@/components/pixel-art/animated-sprite";
import { ProfileNameEditor } from "@/components/profile/profile-name-editor";
import { ProfileStreak } from "@/components/profile/profile-streak";
import { GmatScoreHistory } from "@/components/profile/gmat-score-history";
import { ScheduleEditor } from "@/components/profile/schedule-editor";
import {
  ClipboardList,
  Clock,
  Flame,
  Target,
  Trophy,
  TrendingUp,
  ChevronRight,
} from "lucide-react";
import { AchievementsGrid } from "@/components/profile/achievements-grid";

type TierInfo = { name: string; threshold: number; weapon: string; emoji: string; active: boolean };
type GmatAttempt = {
  id: string; totalScore: number | null;
  verbalScaledScore: number | null; quantitativeScaledScore: number | null;
  dataInsightsScaledScore: number | null; completedAt: string | null;
};
type StreakDay = { day: string; completed: boolean; isPast: boolean };

type ProfileData = {
  user: { displayName: string | null; avatarUrl: string | null; createdAt: string; targetScore: number | null; bestStreak: number } | null;
  totalScore: number; questsDone: number; totalTimeSeconds: number; accuracy: number;
  streak: number; bestStreak: number; latestGmatAttempt: GmatAttempt | null;
  weeklyStreakDays: StreakDay[];
  rank: {
    current: { name: string; weapon: string; emoji: string; threshold: number };
    next: { name: string; weapon: string; emoji: string; threshold: number } | null;
    pct: number; pointsToNext: number;
  };
  tiers: TierInfo[];
};

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const fadeUp = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

function formatTime(s: number) {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function ProfilePage() {
  const router = useRouter();
  const { data: userData, loading: userLoading } = useCurrentUser();
  const readyToLoad = !userLoading && !!userData && userData.user.onboardingCompleted;

  const { data, isLoading: profileLoading, isError } = useQuery<ProfileData>({
    queryKey: ["profile"],
    queryFn: () => fetch("/api/profile").then((r) => { if (!r.ok) throw new Error(); return r.json(); }),
    staleTime: 2 * 60_000,
    enabled: readyToLoad,
  });

  useEffect(() => {
    if (!userLoading && userData && !userData.user.onboardingCompleted) router.replace("/onboarding");
  }, [userData, userLoading, router]);

  useEffect(() => { if (isError) toast.error("Failed to load profile"); }, [isError]);

  if (userLoading || profileLoading) {
    return (
      <div className="mx-auto max-w-7xl p-6 space-y-5">
        <div className="h-32 animate-pulse rounded-2xl bg-muted" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[1,2,3,4].map(i => <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />)}
        </div>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_280px]">
          <div className="space-y-5">
            {[1,2,3].map(i => <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />)}
          </div>
          <div className="space-y-4">
            {[1,2].map(i => <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!data || !data.user) return null;

  const { user, totalScore, questsDone, totalTimeSeconds, accuracy, rank, tiers } = data;
  const bestStreak = Math.max(data.bestStreak, data.streak);
  const progressPct = user.targetScore
    ? Math.min(Math.round((totalScore / user.targetScore) * 100), 100)
    : rank.pct;

  const statBoxes = [
    { icon: ClipboardList, label: "Quests Done",  value: questsDone,           color: "#60a5fa", bg: "#2563eb" },
    { icon: Clock,         label: "Total Time",   value: formatTime(totalTimeSeconds), color: "#2dd4bf", bg: "#0d9488" },
    { icon: Flame,         label: "Best Streak",  value: `${bestStreak}d`,      color: "#fb923c", bg: "#c2410c" },
    { icon: Target,        label: "Accuracy",     value: `${accuracy}%`,        color: "#a78bfa", bg: "#7c3aed" },
  ];

  return (
    <div className="mx-auto max-w-7xl p-6">
      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-5">

        {/* ── Hero card ── */}
        <motion.div variants={fadeUp} className="rounded-2xl border border-border/60 bg-card overflow-hidden">
          <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <AnimatedSprite src="/images/pixel-art/profile-avatar.png" alt="Avatar" width={72} height={72} />
              <div className="min-w-0">
                <ProfileNameEditor displayName={user.displayName} />
                <p className="text-sm text-muted-foreground">Quest started {formatDate(user.createdAt)}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-base">{rank.current.emoji}</span>
                  <span className="text-sm font-semibold">{rank.current.name}</span>
                  <span className="text-xs text-muted-foreground">· {rank.current.weapon}</span>
                </div>
              </div>
            </div>

            {/* Progress to goal */}
            <div className="sm:ml-auto sm:w-52">
              <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-semibold uppercase tracking-wider">Goal</span>
                <span>{totalScore} / {user.targetScore ?? rank.next?.threshold ?? "—"}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                />
              </div>
              {rank.next && (
                <p className="mt-1 text-xs text-muted-foreground">{rank.pointsToNext} pts to {rank.next.name}</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── Stat boxes ── */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {statBoxes.map(({ icon: Icon, label, value, color, bg }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-1.5 rounded-2xl border border-border/60 bg-card py-5"
              style={{ background: `linear-gradient(160deg, ${bg}10, transparent 60%)` }}
            >
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl"
                style={{ background: `${bg}22` }}
              >
                <Icon className="h-4.5 w-4.5" style={{ color }} />
              </div>
              <span className="text-2xl font-bold tabular-nums">{value}</span>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
            </div>
          ))}
        </motion.div>

        {/* ── Two-column body ── */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_280px]">

          {/* Left */}
          <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">

            {/* Streak */}
            <motion.div variants={fadeUp} className="rounded-xl border border-border/60 bg-card p-5">
              <ProfileStreak streak={data.streak} bestStreak={bestStreak} weeklyStreakDays={data.weeklyStreakDays} />
            </motion.div>

            {/* GMAT Score History */}
            <motion.div variants={fadeUp} className="rounded-xl border border-border/60 bg-card p-5">
              <GmatScoreHistory latestAttempt={data.latestGmatAttempt} />
            </motion.div>

          </motion.div>

          {/* Right */}
          <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">

            {/* Schedule */}
            <motion.div variants={fadeUp}>
              <ScheduleEditor />
            </motion.div>

            {/* Current Tier */}
            <motion.div variants={fadeUp} className="rounded-xl border border-border/60 bg-card p-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">Current Tier</p>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{rank.current.emoji}</span>
                <div>
                  <p className="text-base font-bold">{rank.current.name}</p>
                  <p className="text-sm text-muted-foreground">{rank.current.weapon}</p>
                </div>
              </div>
            </motion.div>

            {/* All Tiers */}
            <motion.div variants={fadeUp} className="overflow-hidden rounded-xl border border-border/60 bg-card">
              <div className="border-b border-border/40 bg-muted/40 px-5 py-3">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">All Tiers</p>
              </div>
              <div className="divide-y divide-border/30">
                {tiers.map((tier) => (
                  <div
                    key={tier.name}
                    className={`flex items-center gap-3 px-5 py-2.5 text-sm ${
                      tier.active ? "bg-primary/5 font-semibold text-foreground" : "text-muted-foreground/50"
                    }`}
                  >
                    <span className="text-base">{tier.emoji}</span>
                    <span className="flex-1">{tier.name}</span>
                    <span className="tabular-nums text-xs">{tier.threshold}</span>
                    {tier.active && <ChevronRight className="h-3.5 w-3.5 text-primary" />}
                  </div>
                ))}
              </div>
            </motion.div>

          </motion.div>
        </div>

        {/* ── Achievements ── */}
        <motion.div variants={fadeUp} className="rounded-xl border border-border/60 bg-card p-5">
          <AchievementsGrid />
        </motion.div>

        {/* ── Journey strip ── */}
        <motion.div variants={fadeUp} className="rounded-xl border border-border/60 bg-card px-5 py-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">Journey</p>
          <div className="flex gap-4 overflow-x-auto pb-1">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`flex shrink-0 flex-col items-center gap-1 transition-opacity ${tier.active ? "opacity-100" : "opacity-25"}`}
              >
                <span className="text-2xl">{tier.emoji}</span>
                <span className={`text-[10px] font-semibold ${tier.active ? "text-foreground" : "text-muted-foreground"}`}>
                  {tier.name.split(" ")[0]}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}
