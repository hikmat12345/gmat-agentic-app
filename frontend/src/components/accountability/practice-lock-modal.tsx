"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Shield, Calendar, ArrowRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PracticeLockModalProps = {
  open: boolean;
  missedDate?: string;
  onRecommit: () => void;
  recommitting?: boolean;
};

function formatDate(dateStr?: string) {
  if (!dateStr) return "a scheduled day";
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

export function PracticeLockModal({
  open,
  missedDate,
  onRecommit,
  recommitting,
}: PracticeLockModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<"lock" | "choice">("lock");

  const handleRecommit = () => {
    onRecommit();
  };

  const handleAdjustSchedule = () => {
    onRecommit();
    router.push("/onboarding/schedule");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-2xl"
          >
            {step === "lock" ? (
              <div className="space-y-6 text-center">
                <div className="flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                    <Shield className="h-8 w-8 text-destructive" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h2 className="text-xl font-bold tracking-tight">Study Session Missed</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    You had a scheduled GMAT study session on{" "}
                    <span className="font-medium text-foreground">{formatDate(missedDate)}</span> that
                    wasn&apos;t completed. Consistency is what builds your score — let&apos;s get back on track.
                  </p>
                </div>

                <div className="rounded-lg border bg-muted/30 p-4 text-left space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Why this matters
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Research shows that spaced practice is 2-3x more effective than cramming.
                    Missing sessions breaks the learning cycle that Athena builds for you.
                  </p>
                </div>

                <Button
                  className="w-full"
                  onClick={() => setStep("choice")}
                >
                  I understand — let&apos;s continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-1 text-center">
                  <h2 className="text-xl font-bold tracking-tight">How would you like to proceed?</h2>
                  <p className="text-sm text-muted-foreground">
                    Choose what works best for your situation.
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleRecommit}
                    disabled={recommitting}
                    className={cn(
                      "w-full rounded-xl border-2 p-4 text-left transition-all",
                      "hover:border-primary hover:bg-primary/5",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <RefreshCw className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Recommit and continue</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Keep your current schedule and pick up where you left off. Best for a one-off miss.
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={handleAdjustSchedule}
                    disabled={recommitting}
                    className={cn(
                      "w-full rounded-xl border-2 p-4 text-left transition-all",
                      "hover:border-primary hover:bg-primary/5",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/10">
                        <Calendar className="h-4 w-4 text-amber-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Adjust my schedule</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Your current schedule isn&apos;t working. Update it to something more realistic.
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
