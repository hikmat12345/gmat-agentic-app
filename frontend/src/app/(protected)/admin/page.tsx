"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import { Users, BookOpen, ClipboardCheck, CreditCard, TrendingUp, AlertCircle } from "lucide-react";

type AdminStats = {
  users: { total: number; onboarded: number; newLast7: number; newLast30: number };
  problems: { total: number; bySource: Record<string,number>; byDifficulty: Record<string,number>; byType: Record<string,number> };
  sessions: { total: number; completed: number; last7: number };
  fullGmatTests: { total: number; completed: number; avgScore: number | null };
  subscriptions: { active: number; trialing: number; monthly: number; annual: number; estimatedMRR: number };
};

function StatCard({ label, value, sub, icon: Icon, color }: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; color: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-5 flex items-start gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" style={{ background: `${color}18` }}>
        <Icon className="h-5 w-5" style={{ color }} />
      </div>
      <div>
        <p className="text-2xl font-bold tabular-nums">{value}</p>
        <p className="text-sm font-medium">{label}</p>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { data, isLoading, isError } = useQuery<AdminStats>({
    queryKey: ["admin-stats"],
    queryFn: () => fetch("/api/admin/stats").then((r) => {
      if (r.status === 403) throw new Error("Not authorized");
      if (!r.ok) throw new Error("Failed to load");
      return r.json();
    }),
    staleTime: 2 * 60_000,
    retry: false,
  });

  useEffect(() => {
    if (isError) toast.error("Admin access denied or server error");
  }, [isError]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[1,2,3,4].map(i => <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />)}
        </div>
      </div>
    );
  }

  if (!data || isError) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <AlertCircle className="h-10 w-10 text-muted-foreground" />
        <p className="font-semibold">You are not an admin</p>
        <p className="text-sm text-muted-foreground">
          You don&apos;t have permission to access this page.
        </p>
      </div>
    );
  }

  const QUESTION_TYPE_LABELS: Record<string,string> = {
    critical_reasoning: "CR",
    reading_comprehension: "RC",
    problem_solving: "PS",
    data_sufficiency: "DS",
    multi_source_reasoning: "MSR",
    table_analysis: "TA",
    graphics_interpretation: "GI",
    two_part_analysis: "TPA",
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Admin Overview</h1>
        <p className="text-muted-foreground text-sm">Platform statistics and health</p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Users" value={data.users.total} sub={`+${data.users.newLast7} this week`} icon={Users} color="#6366f1" />
        <StatCard label="Questions" value={data.problems.total} sub="in problem bank" icon={BookOpen} color="#06b6d4" />
        <StatCard label="GMAT Tests" value={data.fullGmatTests.completed} sub={data.fullGmatTests.avgScore ? `avg score: ${data.fullGmatTests.avgScore}` : "none completed"} icon={ClipboardCheck} color="#8b5cf6" />
        <StatCard label="Active Subs" value={data.subscriptions.active} sub={`~$${data.subscriptions.estimatedMRR}/mo MRR`} icon={CreditCard} color="#f59e0b" />
      </div>

      {/* Two-column detail */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Problem bank breakdown */}
        <div className="rounded-xl border bg-card p-5 space-y-4">
          <h2 className="font-semibold text-sm">Question Bank</h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">By Source</p>
              {Object.entries(data.problems.bySource).map(([src, count]) => (
                count > 0 && (
                  <div key={src} className="flex items-center justify-between py-1 text-sm border-b border-border/30 last:border-0">
                    <span className="capitalize text-muted-foreground">{src.replace(/_/g," ")}</span>
                    <span className="font-semibold tabular-nums">{count}</span>
                  </div>
                )
              ))}
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">By Type</p>
              <div className="grid grid-cols-2 gap-1.5">
                {Object.entries(data.problems.byType).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-1.5 text-xs">
                    <span className="font-medium">{QUESTION_TYPE_LABELS[type] ?? type}</span>
                    <span className="tabular-nums font-bold">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* User & subscription breakdown */}
        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-5 space-y-3">
            <h2 className="font-semibold text-sm">User Cohorts</h2>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between py-1 border-b border-border/30">
                <span className="text-muted-foreground">Total users</span>
                <span className="font-semibold">{data.users.total}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/30">
                <span className="text-muted-foreground">Onboarded</span>
                <span className="font-semibold">{data.users.onboarded}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/30">
                <span className="text-muted-foreground">New (7 days)</span>
                <span className="font-semibold">{data.users.newLast7}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">New (30 days)</span>
                <span className="font-semibold">{data.users.newLast30}</span>
              </div>
            </div>
          </div>
          <div className="rounded-xl border bg-card p-5 space-y-3">
            <h2 className="font-semibold text-sm">Subscriptions</h2>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between py-1 border-b border-border/30">
                <span className="text-muted-foreground">Active</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{data.subscriptions.active}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/30">
                <span className="text-muted-foreground">In trial</span>
                <span className="font-semibold">{data.subscriptions.trialing}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/30">
                <span className="text-muted-foreground">Monthly plan</span>
                <span className="font-semibold">{data.subscriptions.monthly}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/30">
                <span className="text-muted-foreground">Annual plan</span>
                <span className="font-semibold">{data.subscriptions.annual}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground flex items-center gap-1"><TrendingUp className="h-3.5 w-3.5"/>Est. MRR</span>
                <span className="font-bold text-primary">${data.subscriptions.estimatedMRR}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
