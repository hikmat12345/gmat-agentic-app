"use client";

import Link from "next/link";
import { useFullGmatStatus } from "@/hooks/use-full-gmat";
import { FileText, Lock, ArrowRight, Trophy } from "lucide-react";

function formatDaysUntil(dateString: string): string {
  const diff = new Date(dateString).getTime() - Date.now();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days <= 0) return "now";
  if (days === 1) return "1 day";
  return `${days} days`;
}

export function FullGmatCard() {
  const { data: status, isLoading } = useFullGmatStatus();

  if (isLoading || !status) {
    return (
      <div className="rounded-xl border bg-card p-5">
        <div className="h-5 w-32 bg-muted animate-pulse rounded" />
        <div className="mt-3 h-4 w-48 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  if (status.currentAttempt) {
    return (
      <Link
        href={`/full-gmat/${status.currentAttempt.id}`}
        className="block rounded-xl border-2 border-primary/50 bg-card p-5 transition-colors hover:bg-primary/5"
      >
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-2.5">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold">GMAT Test In Progress</p>
            <p className="text-sm text-muted-foreground">Resume your practice test</p>
          </div>
          <ArrowRight className="h-4 w-4 text-primary shrink-0" />
        </div>
      </Link>
    );
  }

  if (status.lastAttempt) {
    return (
      <Link
        href="/full-gmat"
        className="block rounded-xl border bg-card p-5 transition-colors hover:bg-muted/50"
      >
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-amber-500/10 p-2.5">
            <Trophy className="h-6 w-6 text-amber-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold">GMAT Focus Edition</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Last: {status.lastAttempt.totalScore}/805</span>
              {!status.canTakeTest && status.nextAvailableDate && (
                <>
                  <span className="text-muted-foreground/40">|</span>
                  <span className="flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    Next in {formatDaysUntil(status.nextAvailableDate)}
                  </span>
                </>
              )}
              {status.canTakeTest && <span>Ready for next test</span>}
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
        </div>
      </Link>
    );
  }

  return (
    <Link
      href="/full-gmat"
      className="block rounded-xl border bg-card p-5 transition-colors hover:bg-muted/50"
    >
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-primary/10 p-2.5">
          <FileText className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold">GMAT Focus Edition Practice Test</p>
          <p className="text-sm text-muted-foreground">
            64-question full practice test (205–805)
          </p>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
      </div>
    </Link>
  );
}
