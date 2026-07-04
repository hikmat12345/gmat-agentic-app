"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Target, Clock, Zap, TrendingUp, BarChart3, ChevronRight } from "lucide-react";

// ── Data ─────────────────────────────────────────────────────────────────────

const SCORE_TARGETS = [
  { score: "600+", pct: "44th", tag: null },
  { score: "650+", pct: "61st", tag: null },
  { score: "700+", pct: "79th", tag: "Top 50 programs" },
  { score: "720+", pct: "84th", tag: "Top 20 programs" },
  { score: "740+", pct: "90th", tag: "HBS · Wharton" },
  { score: "760+", pct: "94th", tag: "Elite tier" },
];

const TIMELINE_OPTIONS = [
  { value: "lt4w",     label: "Less than 4 weeks",  sub: "Intensive sprint",                    daily: "2–3 hrs / day", Icon: Zap },
  { value: "1-3mo",   label: "1–3 months",           sub: "Focused, structured preparation",     daily: "90 min / day",  Icon: Target },
  { value: "3-6mo",   label: "3–6 months",           sub: "Steady pacing with room to review",   daily: "60 min / day",  Icon: TrendingUp },
  { value: "6mo+",    label: "6+ months",            sub: "Long-range, comprehensive plan",       daily: "45 min / day",  Icon: Clock },
  { value: "no-date", label: "No test date yet",     sub: "Still exploring my options",           daily: "Flexible",      Icon: BarChart3 },
];

const EXPERIENCE_OPTIONS = [
  { value: "first",            label: "First attempt",              sub: "Haven't taken the GMAT before" },
  { value: "retake-below600",  label: "Retaking — scored below 600", sub: "Building from the foundation up" },
  { value: "retake-600",       label: "Retaking — scored 600–699",  sub: "Breaking into the 700s" },
  { value: "retake-700",       label: "Retaking — scored 700+",     sub: "Pushing for an elite score" },
];

const SECTIONS = [
  {
    value: "verbal",
    label: "Verbal Reasoning",
    badge: "CR · RC",
    sub: "Critical Reasoning and Reading Comprehension",
    types: ["Critical Reasoning", "Reading Comprehension"],
  },
  {
    value: "quantitative",
    label: "Quantitative",
    badge: "PS",
    sub: "Problem Solving — algebra, arithmetic, geometry, statistics",
    types: ["Problem Solving"],
  },
  {
    value: "data_insights",
    label: "Data Insights",
    badge: "DS · MSR · TA · GI · TPA",
    sub: "Five question types spanning data analysis and reasoning",
    types: ["Data Sufficiency", "Multi-Source", "Table Analysis", "Graphics", "Two-Part"],
  },
  {
    value: "all",
    label: "All sections equally",
    badge: "BALANCED",
    sub: "Comprehensive coverage across all three GMAT sections",
    types: ["Full coverage"],
  },
];

const PANEL = [
  {
    num: "01", label: "PROFILE",
    title: "Your Athena\ncoach starts here",
    sub: "Takes about 90 seconds. Every answer shapes a daily study plan built specifically around your goals.",
    stat: { value: "2.3×", detail: "more likely to reach their target score with a fully personalized prep plan" },
  },
  {
    num: "02", label: "TARGET",
    title: "Set a clear,\nambitious goal",
    sub: "Top MBA programs require strong GMAT Focus Edition scores. We build your plan backwards from your number.",
    stat: { value: "730", detail: "median GMAT score across Harvard, Wharton, and Booth MBA programs" },
  },
  {
    num: "03", label: "TIMELINE",
    title: "Time is your\nbiggest lever",
    sub: "Your runway determines daily intensity and how aggressively we sequence topics toward your target.",
    stat: { value: "100–200 hrs", detail: "of focused preparation to improve 100+ points — we'll pace every hour" },
  },
  {
    num: "04", label: "EXPERIENCE",
    title: "Starting from\nwhere you are",
    sub: "Your history with the GMAT changes which content we introduce first and how we pace the early weeks.",
    stat: { value: "+63 pts", detail: "average score gain for retakers who changed their preparation approach" },
  },
  {
    num: "05", label: "FOCUS",
    title: "Target your\nweakest section",
    sub: "60% of your daily practice targets this section. Athena's adaptive engine then finds the gaps within it.",
    stat: { value: "40–90 pts", detail: "typical total score gain from systematically fixing one weak section" },
  },
];

// ── Types ─────────────────────────────────────────────────────────────────────

interface FormData {
  name: string;
  targetScore: string;
  targetSchool: string;
  timeline: string;
  experience: string;
  weakSection: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function OnboardingPlanPage() {
  const router = useRouter();
  const { data: userData } = useCurrentUser();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<FormData>({
    name: "", targetScore: "", targetSchool: "",
    timeline: "", experience: "", weakSection: "",
  });
  const [nameInitialized, setNameInitialized] = useState(false);

  useEffect(() => {
    if (!nameInitialized && userData?.user.displayName) {
      setForm(f => ({ ...f, name: userData.user.displayName! }));
      setNameInitialized(true);
    }
  }, [userData, nameInitialized]);

  const canContinue = useCallback(() => {
    if (step === 0) return form.name.trim().length > 0;
    if (step === 1) return form.targetScore.length > 0;
    if (step === 2) return form.timeline.length > 0;
    if (step === 3) return form.experience.length > 0;
    if (step === 4) return form.weakSection.length > 0;
    return false;
  }, [step, form]);

  const complete = async () => {
    setSubmitting(true);
    try {
      await fetch("/api/onboarding/plan/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          grade: form.experience,
          learnerTypes: [],
          interests: [form.targetScore, form.targetSchool, form.timeline].filter(Boolean),
          strugglingTopic: form.weakSection,
        }),
      });
      router.push("/onboarding/quiz");
    } catch {
      setSubmitting(false);
    }
  };

  const next = () => {
    if (step < 4) setStep(step + 1);
    else complete();
  };

  const ctx = PANEL[step];

  return (
    <div className="fixed inset-0 z-50 flex overflow-hidden bg-background">

      {/* ── Left panel ────────────────────────────────────────────────────── */}
      <div
        className="hidden md:flex w-[40%] xl:w-[38%] shrink-0 relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #0b1424 0%, #0f1d3c 55%, #111f42 100%)" }}
      >
        {/* Dot grid texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.045) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
          }}
        />
        {/* Top-left amber glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 10% 15%, rgba(232,168,56,0.10) 0%, transparent 55%)" }}
        />
        {/* Bottom-right navy glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 90% 85%, rgba(17,40,100,0.55) 0%, transparent 55%)" }}
        />

        {/* Content column */}
        <div className="relative z-10 flex flex-col h-full w-full justify-between px-10 py-12">

          {/* Brand mark */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black tracking-[0.35em] text-white/20 uppercase">
              ATHENA GMAT
            </span>
          </div>

          {/* Step content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.38, ease: "easeOut" }}
              className="space-y-7"
            >
              {/* Step label */}
              <div>
                <p className="mb-4 text-[10px] font-black tracking-[0.28em] text-white/22 uppercase">
                  {ctx.num} / 05 &mdash; {ctx.label}
                </p>
                <h2
                  className="text-[2.6rem] font-black leading-[1.08] tracking-tight text-white whitespace-pre-line"
                  style={{ textShadow: "0 2px 24px rgba(0,0,0,0.4)" }}
                >
                  {ctx.title}
                </h2>
                <p className="mt-5 text-sm leading-relaxed text-white/42 max-w-[268px]">
                  {ctx.sub}
                </p>
              </div>

              {/* Stat callout */}
              <div
                className="rounded-2xl px-5 py-4"
                style={{
                  background: "rgba(232,168,56,0.08)",
                  border: "1px solid rgba(232,168,56,0.22)",
                }}
              >
                <p
                  className="text-2xl font-black tracking-tight"
                  style={{ color: "#e8a838" }}
                >
                  {ctx.stat.value}
                </p>
                <p className="mt-1 text-xs leading-snug text-white/38">
                  {ctx.stat.detail}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Bottom: progress + tagline */}
          <div className="space-y-5">
            <div className="flex items-center gap-1.5">
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} className="relative h-[3px] flex-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                  <AnimatePresence>
                    {i <= step && (
                      <motion.div
                        key={`bar-${i}-${step}`}
                        className="absolute inset-y-0 left-0 w-full rounded-full"
                        style={{ background: i < step ? "rgba(255,255,255,0.28)" : "#e8a838" }}
                        initial={{ scaleX: 0, originX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.45, ease: "easeOut" }}
                      />
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
            <p className="text-[9px] font-bold tracking-[0.3em] text-white/18 uppercase">
              Personalized GMAT Intelligence
            </p>
          </div>
        </div>
      </div>

      {/* ── Right panel ───────────────────────────────────────────────────── */}
      <div className="relative flex flex-1 flex-col overflow-hidden">

        {/* Subtle top-right ambient glow */}
        <div
          className="pointer-events-none absolute top-0 right-0 h-80 w-80 opacity-40"
          style={{ background: "radial-gradient(circle at top right, oklch(0.75 0.16 75 / 0.07), transparent 70%)" }}
        />

        {/* Mobile step bar */}
        <div className="md:hidden px-5 pt-5">
          <div className="flex items-center gap-1">
            {[0, 1, 2, 3, 4].map(i => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= step ? "bg-athena-amber" : "bg-border"}`}
              />
            ))}
          </div>
          <p className="mt-2 text-[10px] font-bold text-muted-foreground tracking-widest uppercase">
            Step {step + 1} of 5
          </p>
        </div>

        {/* Scrollable content */}
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center overflow-y-auto px-6 py-10 md:px-14 lg:px-20">
          <div className="w-full max-w-[420px]">

            {/* Desktop step counter */}
            <p className="mb-7 hidden text-[11px] font-bold tracking-widest text-muted-foreground uppercase md:block">
              Step {step + 1} of 5
            </p>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 32 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -22 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="w-full"
              >

                {/* ── Step 0: Name ──────────────────────────────────────── */}
                {step === 0 && (
                  <div className="space-y-7">
                    <div>
                      <h1 className="text-[2rem] font-black tracking-tight leading-tight">
                        What should we call you?
                      </h1>
                      <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                        We&apos;ll use your name across your dashboard, AI tutor sessions, and weekly score reports.
                      </p>
                    </div>
                    <input
                      className="w-full rounded-xl border-2 border-border bg-card px-5 py-4 text-base font-semibold outline-none transition-all placeholder:text-muted-foreground/40 focus:border-athena-navy dark:focus:border-athena-amber"
                      placeholder="Your first name"
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      onKeyDown={e => e.key === "Enter" && canContinue() && next()}
                      autoFocus
                    />
                  </div>
                )}

                {/* ── Step 1: Target Score ──────────────────────────────── */}
                {step === 1 && (
                  <div className="space-y-7">
                    <div>
                      <h1 className="text-[2rem] font-black tracking-tight leading-tight">
                        What&apos;s your target score?
                      </h1>
                      <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                        GMAT Focus Edition scores range 205–805. Select the band you&apos;re aiming for.
                      </p>
                    </div>

                    {/* Score grid with percentiles */}
                    <div className="grid grid-cols-2 gap-3">
                      {SCORE_TARGETS.map(s => {
                        const sel = form.targetScore === s.score;
                        return (
                          <button
                            key={s.score}
                            onClick={() => setForm({ ...form, targetScore: s.score })}
                            className={`relative flex flex-col items-start rounded-xl border-2 px-4 py-3.5 text-left transition-all ${
                              sel
                                ? "border-athena-navy bg-athena-navy dark:border-athena-amber dark:bg-athena-amber/12"
                                : "border-border bg-card hover:border-foreground/25"
                            }`}
                          >
                            <span className={`text-xl font-black tabular-nums leading-none ${sel ? "text-white dark:text-athena-amber" : "text-foreground"}`}>
                              {s.score}
                            </span>
                            <span className={`mt-1 text-[11px] font-semibold ${sel ? "text-white/55 dark:text-athena-amber/55" : "text-muted-foreground"}`}>
                              {s.pct} percentile
                            </span>
                            {s.tag && (
                              <span className={`mt-2.5 rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
                                sel
                                  ? "bg-white/15 text-white/80 dark:bg-athena-amber/20 dark:text-athena-amber"
                                  : "bg-muted text-muted-foreground"
                              }`}>
                                {s.tag}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Target school */}
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground">
                        Target School <span className="ml-1 normal-case font-normal tracking-normal opacity-70">(optional)</span>
                      </label>
                      <input
                        className="mt-2.5 w-full rounded-xl border-2 border-border bg-card px-4 py-3.5 text-sm font-medium outline-none transition-all placeholder:text-muted-foreground/40 focus:border-athena-navy dark:focus:border-athena-amber"
                        placeholder="e.g. HBS, Wharton, Booth, Kellogg…"
                        value={form.targetSchool}
                        onChange={e => setForm({ ...form, targetSchool: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {/* ── Step 2: Timeline ──────────────────────────────────── */}
                {step === 2 && (
                  <div className="space-y-7">
                    <div>
                      <h1 className="text-[2rem] font-black tracking-tight leading-tight">
                        When is your test date?
                      </h1>
                      <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                        Your runway determines daily session length and how aggressively we pace topics toward your goal.
                      </p>
                    </div>
                    <div className="space-y-2.5">
                      {TIMELINE_OPTIONS.map(t => {
                        const Icon = t.Icon;
                        const sel = form.timeline === t.value;
                        return (
                          <button
                            key={t.value}
                            onClick={() => setForm({ ...form, timeline: t.value })}
                            className={`flex w-full items-center gap-4 rounded-xl border-2 px-4 py-3.5 text-left transition-all ${
                              sel
                                ? "border-athena-navy bg-athena-navy dark:border-athena-amber dark:bg-athena-amber/12"
                                : "border-border bg-card hover:border-foreground/25"
                            }`}
                          >
                            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
                              sel ? "bg-white/14 dark:bg-athena-amber/20" : "bg-muted"
                            }`}>
                              <Icon className={`h-4 w-4 ${sel ? "text-white dark:text-athena-amber" : "text-muted-foreground"}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-bold leading-none ${sel ? "text-white dark:text-athena-amber" : "text-foreground"}`}>
                                {t.label}
                              </p>
                              <p className={`mt-1 text-xs truncate ${sel ? "text-white/50 dark:text-athena-amber/50" : "text-muted-foreground"}`}>
                                {t.sub}
                              </p>
                            </div>
                            <span className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-bold tabular-nums transition-colors ${
                              sel
                                ? "bg-white/14 text-white/90 dark:bg-athena-amber/20 dark:text-athena-amber"
                                : "bg-muted text-muted-foreground"
                            }`}>
                              {t.daily}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ── Step 3: Experience ────────────────────────────────── */}
                {step === 3 && (
                  <div className="space-y-7">
                    <div>
                      <h1 className="text-[2rem] font-black tracking-tight leading-tight">
                        Have you taken the GMAT before?
                      </h1>
                      <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                        Your experience level shapes the content we introduce first and how we sequence the early weeks.
                      </p>
                    </div>
                    <div className="space-y-2.5">
                      {EXPERIENCE_OPTIONS.map((opt, idx) => {
                        const sel = form.experience === opt.value;
                        return (
                          <button
                            key={opt.value}
                            onClick={() => setForm({ ...form, experience: opt.value })}
                            className={`flex w-full items-center gap-4 rounded-xl border-2 px-4 py-3.5 text-left transition-all ${
                              sel
                                ? "border-athena-navy bg-athena-navy dark:border-athena-amber dark:bg-athena-amber/12"
                                : "border-border bg-card hover:border-foreground/25"
                            }`}
                          >
                            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-black transition-colors ${
                              sel
                                ? "bg-white/18 text-white dark:bg-athena-amber/20 dark:text-athena-amber"
                                : "bg-muted text-muted-foreground"
                            }`}>
                              {idx + 1}
                            </div>
                            <div>
                              <p className={`text-sm font-bold leading-none ${sel ? "text-white dark:text-athena-amber" : "text-foreground"}`}>
                                {opt.label}
                              </p>
                              <p className={`mt-1 text-xs ${sel ? "text-white/50 dark:text-athena-amber/50" : "text-muted-foreground"}`}>
                                {opt.sub}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ── Step 4: Weak Section ──────────────────────────────── */}
                {step === 4 && (
                  <div className="space-y-7">
                    <div>
                      <h1 className="text-[2rem] font-black tracking-tight leading-tight">
                        Which section needs the most work?
                      </h1>
                      <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                        60% of your daily practice targets this section. Athena&apos;s adaptive engine locates the gaps within it.
                      </p>
                    </div>
                    <div className="space-y-2.5">
                      {SECTIONS.map(s => {
                        const sel = form.weakSection === s.value;
                        return (
                          <button
                            key={s.value}
                            onClick={() => setForm({ ...form, weakSection: s.value })}
                            className={`w-full rounded-xl border-2 px-4 py-4 text-left transition-all ${
                              sel
                                ? "border-athena-navy bg-athena-navy dark:border-athena-amber dark:bg-athena-amber/12"
                                : "border-border bg-card hover:border-foreground/25"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className={`text-sm font-bold leading-none ${sel ? "text-white dark:text-athena-amber" : "text-foreground"}`}>
                                  {s.label}
                                </p>
                                <p className={`mt-1 text-xs leading-snug ${sel ? "text-white/50 dark:text-athena-amber/50" : "text-muted-foreground"}`}>
                                  {s.sub}
                                </p>
                              </div>
                              <span className={`shrink-0 rounded-md px-2 py-1 text-[9px] font-bold tracking-wider uppercase ${
                                sel
                                  ? "bg-white/14 text-white/80 dark:bg-athena-amber/18 dark:text-athena-amber"
                                  : "bg-muted text-muted-foreground"
                              }`}>
                                {s.badge}
                              </span>
                            </div>
                            {/* Question type chips */}
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {s.types.map(type => (
                                <span
                                  key={type}
                                  className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                                    sel
                                      ? "bg-white/10 text-white/65 dark:bg-athena-amber/10 dark:text-athena-amber/65"
                                      : "bg-muted/70 text-muted-foreground"
                                  }`}
                                >
                                  {type}
                                </span>
                              ))}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>

            {/* ── Navigation ────────────────────────────────────────────── */}
            <div className="mt-8 flex items-center gap-3">
              {step > 0 ? (
                <button
                  onClick={() => setStep(step - 1)}
                  className="rounded-xl border-2 border-border px-5 py-3.5 text-sm font-bold text-muted-foreground transition-all hover:border-foreground/30 hover:text-foreground"
                >
                  Back
                </button>
              ) : (
                <div />
              )}
              <button
                onClick={next}
                disabled={!canContinue() || submitting}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold transition-all hover:opacity-90 disabled:opacity-25 md:flex-none md:min-w-[180px] bg-athena-navy text-white dark:bg-athena-amber dark:text-athena-navy"
              >
                {submitting
                  ? "Building your plan…"
                  : step === 4
                  ? "Build My Plan"
                  : "Continue"}
                {!submitting && <ChevronRight className="h-4 w-4" />}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
