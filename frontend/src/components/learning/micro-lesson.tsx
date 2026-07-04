"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import type { WhiteboardStep, CheckInAction, PredictAction, FillBlankAction } from "@/types/whiteboard";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Brain, ChevronLeft, BookOpen, ChevronRight, Check, X,
  Send, Mic, CheckCircle, Volume2, VolumeX, SkipForward, SkipBack,
  Play, Pause,
} from "lucide-react";
import { useMicroLesson } from "@/hooks/use-micro-lesson";
import { useLessonChat } from "@/hooks/use-lesson-chat";
import { WhiteboardCanvas } from "@/components/whiteboard/whiteboard-canvas";
import { PresenceLayer } from "@/components/learning/observation/presence-layer";
import type { BoardPoint, StepFocus } from "@/components/whiteboard/pen-tip";
import { isDiagramStep } from "@/components/whiteboard/pen-tip";
import { WbCoordinatePlane } from "@/components/whiteboard/elements/wb-coordinate-plane";
import { WbGeometry } from "@/components/whiteboard/elements/wb-geometry";
import type { CoordinatePlaneAction, GeometryAction } from "@/types/whiteboard";
import { useStepPlayer } from "@/hooks/use-step-player";
import { MessageBubble } from "@/components/lessons/message-bubble";
import { ThinkingIndicator } from "@/components/lessons/thinking-indicator";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useSound } from "@/hooks/useSound";
import { MathContent } from "@/components/quiz/math-content";
import { PracticeGradientCard } from "@/components/quiz/practice-gradient-card";
import type { Problem } from "@/components/quiz/types";
import { WhiteboardSkeleton } from "@/components/whiteboard/whiteboard-skeleton";
import { GenerationProgress } from "@/components/lessons/generation-progress";
import { WhyThisMattersModal } from "@/components/learning/why-this-matters-modal";

type MicroLessonProps = {
  topic: string;
  subtopic: string;
  metadata: {
    description?: string;
    learningObjectives?: string[];
    keyFormulas?: { latex: string; description: string }[];
    commonMistakes?: { mistake: string; correction: string; why: string }[];
    tipsAndTricks?: string[];
    conceptualOverview?: {
      definition: string;
      realWorldExample: string;
      satContext: string;
    };
  };
  onClose: () => void;
  practiceProblems?: Problem[];
  streamUrl?: string;
  chatStreamUrl?: string;
  existingLesson?: { lessonContent: string; whiteboardSteps: WhiteboardStep[] } | null;
  subtopicApiPath?: string;
  practiceMode?: {
    subject?: "math" | "reading-writing";
    quizStreamUrl?: string;
  };
  tracking?: {
    microLessonId: string;
    subtopicId: string;
  };
};

// ── Circular control button ───────────────────────────────────────────

function CircleBtn({
  icon, active, onClick, title, disabled,
}: {
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  title?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all",
        active
          ? "border-athena-amber bg-athena-amber/20 text-athena-amber"
          : "border-border/60 bg-background text-muted-foreground hover:border-border hover:text-foreground",
        disabled && "opacity-40 cursor-not-allowed pointer-events-none",
      )}
    >
      {icon}
    </button>
  );
}

// ── Check-in question UI ──────────────────────────────────────────────

function CheckInConfetti() {
  const colors = [
    "hsl(var(--green))",
    "hsl(var(--blue))",
    "hsl(var(--yellow))",
    "hsl(var(--pink))",
    "hsl(var(--orange))",
  ];
  const particles = Array.from({ length: 14 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.4,
    size: 3 + Math.random() * 3,
    color: colors[i % colors.length],
  }));
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            bottom: "30%",
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
          }}
          initial={{ y: 0, opacity: 1 }}
          animate={{
            y: -180 - Math.random() * 120,
            opacity: [1, 1, 0],
            x: (Math.random() - 0.5) * 80,
          }}
          transition={{
            duration: 1.2 + Math.random() * 0.4,
            delay: p.delay,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

function CheckInCard({
  checkIn,
  onAnswer,
  onNarrate,
  onHintPhase,
}: {
  checkIn: CheckInAction;
  onAnswer: () => void;
  onNarrate?: (text: string) => void;
  onHintPhase?: (phase: "none" | "hinted" | "detailed") => void;
}) {
  const [phase, setPhase] = useState<"answering" | "hinted" | "detailed" | "revealed">("answering");
  const [selected, setSelected] = useState<number | null>(null);
  const [wrongIndices, setWrongIndices] = useState<Set<number>>(new Set());
  const [justWrong, setJustWrong] = useState<number | null>(null);
  const sound = useSound();

  const isCorrect = selected === checkIn.correctOption;
  const isRevealed = phase === "revealed";

  const handleSelect = (index: number) => {
    if (isRevealed) return;
    if (wrongIndices.has(index)) return;

    setSelected(index);

    if (index === checkIn.correctOption) {
      sound.achievement();
      setPhase("revealed");
      onNarrate?.(checkIn.explanation || "That's exactly right.");
      return;
    }

    // Wrong answer — progressive gradient
    sound.wrong();
    const next = new Set(wrongIndices);
    next.add(index);
    setWrongIndices(next);
    setJustWrong(index);
    setTimeout(() => setJustWrong(null), 2000);

    if (phase === "answering" && checkIn.hint) {
      setPhase("hinted");
      onHintPhase?.("hinted");
      onNarrate?.(checkIn.hint);
    } else if (phase === "hinted" && checkIn.detailedHint) {
      setPhase("detailed");
      onHintPhase?.("detailed");
      onNarrate?.(checkIn.detailedHint);
    } else {
      setPhase("revealed");
      // Reveal with explanation even when no more attempts
      onNarrate?.(checkIn.explanation || "Here is the correct answer.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-3 relative"
    >
      {isRevealed && isCorrect && <CheckInConfetti />}
      <p className="text-lg font-semibold text-foreground leading-snug mb-4">{checkIn.question}</p>

      <div className="flex flex-col gap-2">
        {checkIn.options.map((option, i) => {
          const isThis = selected === i;
          const isRight = i === checkIn.correctOption;
          const isWrong = wrongIndices.has(i);
          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={isRevealed || isWrong}
              className={cn(
                "relative flex w-full items-center gap-2 rounded-xl border px-4 py-3 text-sm transition-all overflow-hidden text-left",
                !isRevealed && !isWrong && "hover:bg-muted/80 hover:border-border/80 cursor-pointer",
                isRevealed && isRight && "border-green-500/70 bg-green-500/10",
                isRevealed && isThis && !isRight && "border-red-500/70 bg-red-500/10",
                isRevealed && !isThis && !isRight && "opacity-40",
                isWrong && !isRevealed && "border-red-500/30 bg-red-500/5 opacity-50",
              )}
              style={
                isRevealed && isRight
                  ? { boxShadow: "0 0 0 1px rgba(34,197,94,0.5), 0 0 20px rgba(34,197,94,0.12)" }
                  : undefined
              }
            >
              {/* Red flash on wrong selection */}
              {justWrong === i && (
                <motion.div
                  className="absolute inset-0 rounded-xl bg-red-500/30 pointer-events-none"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: 2, ease: "easeOut" }}
                />
              )}
              <span className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold",
                isRevealed && isRight && "border-green-500 text-green-500",
                ((isRevealed && isThis && !isRight) || isWrong) && "border-red-500 text-red-500",
              )}>
                {isRevealed && isRight ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (isRevealed && isThis && !isRight) || isWrong ? (
                  <X className="h-3 w-3 text-red-500" />
                ) : (
                  String.fromCharCode(65 + i)
                )}
              </span>
              <span>{option}</span>
            </button>
          );
        })}
      </div>

      {(phase === "hinted" || phase === "detailed") && checkIn.hint && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-athena-amber/40 bg-athena-amber/[0.08] px-4 py-3"
        >
          <p className="text-xs font-bold uppercase tracking-wider text-athena-amber mb-1">
            Not quite — here&apos;s a clue:
          </p>
          <p className="text-sm text-foreground/80 leading-relaxed">{checkIn.hint}</p>
        </motion.div>
      )}

      {phase === "detailed" && checkIn.detailedHint && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-blue-500/40 bg-blue-500/[0.08] px-4 py-3"
        >
          <p className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-1">
            Let me walk you through it:
          </p>
          <p className="text-sm text-foreground/80 leading-relaxed">{checkIn.detailedHint}</p>
        </motion.div>
      )}

      {isRevealed && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 space-y-3"
        >
          {isCorrect && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="flex items-center gap-2 text-green-500"
            >
              <Check className="h-5 w-5" />
              <span className="text-base font-bold">Correct!</span>
            </motion.div>
          )}
          <p className="text-sm text-muted-foreground leading-relaxed">{checkIn.explanation}</p>
          <Button size="sm" className="gap-1.5" onClick={onAnswer}>
            {isCorrect ? "Continue" : "Got it, continue"}
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}

// ── Predict question UI ──────────────────────────────────────────────

function PredictCard({
  predict,
  onAnswer,
  onNarrate,
  onHintPhase,
}: {
  predict: PredictAction;
  onAnswer: () => void;
  onNarrate?: (text: string) => void;
  onHintPhase?: (phase: "none" | "hinted" | "detailed") => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [wrongIndices, setWrongIndices] = useState<Set<number>>(new Set());
  const [justWrong, setJustWrong] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const answeredRef = useRef(false);
  const sound = useSound();

  const isCorrect = selected === predict.correctOption;

  const handleSelect = (index: number) => {
    if (revealed || wrongIndices.has(index)) return;
    setSelected(index);

    if (index === predict.correctOption) {
      sound.achievement();
      setRevealed(true);
      onNarrate?.(predict.explanation || "That's exactly right.");
      return;
    }

    // Wrong — disable this option, show hint, let student retry remaining
    sound.wrong();
    const next = new Set(wrongIndices);
    next.add(index);
    setWrongIndices(next);
    setJustWrong(index);
    setTimeout(() => setJustWrong(null), 2000);

    // Show hint after first wrong if available
    if (predict.hint && !showHint) {
      setShowHint(true);
      onHintPhase?.("hinted");
      onNarrate?.(predict.hint);
    }

    // If all wrong options exhausted, reveal (only correct one remains)
    const wrongCount = next.size;
    if (wrongCount >= predict.options.length - 1) {
      setSelected(predict.correctOption);
      setRevealed(true);
    }
  };

  // Auto-advance after reveal
  useEffect(() => {
    if (revealed && !answeredRef.current) {
      answeredRef.current = true;
      onAnswer();
    }
  }, [revealed, onAnswer]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-2 relative"
    >
      <p className="text-lg font-semibold text-foreground leading-snug mb-4">{predict.question}</p>

      <div className="flex  gap-2">
        {predict.options.map((option, i) => {
          const isThis = selected === i;
          const isRight = i === predict.correctOption;
          const isWrong = wrongIndices.has(i);
          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={revealed || isWrong}
              className={cn(
                "relative flex w-full items-center gap-2 rounded-xl border px-4 py-3 text-sm transition-all overflow-hidden text-left",
                !revealed && !isWrong && "hover:bg-muted/80 hover:border-border/80 cursor-pointer",
                revealed && isRight && "border-green-500/70 bg-green-500/10",
                revealed && isThis && !isRight && "border-red-500/70 bg-red-500/10",
                revealed && !isThis && !isRight && "opacity-40",
                isWrong && !revealed && "border-red-500/30 bg-red-500/5 opacity-50",
              )}
            >
              {/* Red flash on wrong selection */}
              {justWrong === i && (
                <motion.div
                  className="absolute inset-0 rounded-xl bg-red-500/30 pointer-events-none"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: 2, ease: "easeOut" }}
                />
              )}
              <span className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold",
                revealed && isRight && "border-green-500 text-green-500",
                ((revealed && isThis && !isRight) || isWrong) && "border-red-500 text-red-500",
              )}>
                {revealed && isRight ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (revealed && isThis && !isRight) || isWrong ? (
                  <X className="h-3 w-3 text-red-500" />
                ) : (
                  String.fromCharCode(65 + i)
                )}
              </span>
              <span>{option}</span>
            </button>
          );
        })}
      </div>

      {showHint && !revealed && predict.hint && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-athena-amber/40 bg-athena-amber/[0.08] px-4 py-3"
        >
          <p className="text-xs font-bold uppercase tracking-wider text-athena-amber mb-1">
            Think about it:
          </p>
          <p className="text-sm text-foreground/80 leading-relaxed">{predict.hint}</p>
        </motion.div>
      )}

      {revealed && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 space-y-2"
        >
          {isCorrect && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="flex items-center gap-2 text-green-500"
            >
              <Check className="h-5 w-5" />
              <span className="text-base font-bold">Correct</span>
            </motion.div>
          )}
          <p className="text-sm text-muted-foreground leading-relaxed">{predict.explanation}</p>
        </motion.div>
      )}
    </motion.div>
  );
}

// ── Fill-blank question UI ──────────────────────────────────────────

function FillBlankCard({
  fillBlank,
  onAnswer,
  onNarrate,
  onHintPhase,
}: {
  fillBlank: FillBlankAction;
  onAnswer: () => void;
  onNarrate?: (text: string) => void;
  onHintPhase?: (phase: "none" | "hinted" | "detailed") => void;
}) {
  const [input, setInput] = useState("");
  const [attempts, setAttempts] = useState(0);
  // answering → hinted (nudge) → detailed (walk-through) → revealed
  const [phase, setPhase] = useState<"answering" | "hinted" | "detailed" | "revealed">("answering");
  const [lastWrong, setLastWrong] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const answeredRef = useRef(false);
  const sound = useSound();

  const isRevealed = phase === "revealed";

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Clear shake animation after short delay
  useEffect(() => {
    if (lastWrong) {
      const t = setTimeout(() => setLastWrong(false), 500);
      return () => clearTimeout(t);
    }
  }, [lastWrong]);

  // Auto-advance after reveal
  useEffect(() => {
    if (isRevealed && !answeredRef.current) {
      answeredRef.current = true;
      onAnswer();
    }
  }, [isRevealed, onAnswer]);

  const checkAnswer = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const isCorrect = fillBlank.acceptedAnswers.some(
      (a) => a.trim().toLowerCase() === trimmed.toLowerCase()
    );

    if (isCorrect) {
      sound.achievement();
      setPhase("revealed");
      onNarrate?.(fillBlank.explanation || "That's exactly right.");
      return;
    }

    // Wrong answer
    sound.wrong();
    setLastWrong(true);
    setInput("");
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (newAttempts === 1 && fillBlank.hint) {
      // 1st wrong: show nudge hint
      setPhase("hinted");
      onHintPhase?.("hinted");
      onNarrate?.(fillBlank.hint);
    } else if (newAttempts === 2 && fillBlank.detailedHint) {
      // 2nd wrong: show detailed walk-through hint
      setPhase("detailed");
      onHintPhase?.("detailed");
      onNarrate?.(fillBlank.detailedHint);
    } else if (newAttempts >= 3 || (newAttempts >= 2 && !fillBlank.detailedHint)) {
      // 3rd wrong (or 2nd if no detailed hint): reveal
      setPhase("revealed");
    }

    // Re-focus input for retry
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const isCorrect = phase === "revealed" && fillBlank.acceptedAnswers.some(
    (a) => a.trim().toLowerCase() === input.trim().toLowerCase()
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-2"
    >
      <div className="text-base font-semibold text-foreground mb-3">
        <MathContent content={fillBlank.prompt} />
      </div>

      {!isRevealed && (
        <motion.div
          animate={lastWrong ? { x: [-4, 4, -4, 4, 0] } : {}}
          transition={{ duration: 0.3 }}
          className="flex gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") checkAnswer(); }}
            placeholder="Type your answer…"
            className="flex-1 bg-muted/60 rounded-xl text-sm outline-none placeholder:text-muted-foreground py-3 px-4 border border-transparent focus:border-athena-amber/50 transition-colors"
          />
          <Button size="default" onClick={checkAnswer} disabled={!input.trim()} className="shrink-0">
            Check
          </Button>
        </motion.div>
      )}

      {/* Tier 1: nudge hint */}
      {(phase === "hinted" || phase === "detailed") && fillBlank.hint && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-athena-amber/40 bg-athena-amber/[0.08] px-4 py-3"
        >
          <p className="text-xs font-bold uppercase tracking-wider text-athena-amber mb-1">
            Think about it:
          </p>
          <p className="text-sm text-foreground/80 leading-relaxed">{fillBlank.hint}</p>
        </motion.div>
      )}

      {/* Tier 2: detailed walk-through hint */}
      {phase === "detailed" && fillBlank.detailedHint && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-blue-500/40 bg-blue-500/[0.08] px-4 py-3"
        >
          <p className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-1">
            Let me walk you through it:
          </p>
          <p className="text-sm text-foreground/80 leading-relaxed">{fillBlank.detailedHint}</p>
        </motion.div>
      )}

      {isRevealed && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 space-y-3"
        >
          {isCorrect ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="flex items-center gap-2 text-green-500"
            >
              <Check className="h-5 w-5" />
              <span className="text-base font-bold">Correct</span>
            </motion.div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Answer: <span className="font-semibold text-foreground">{fillBlank.acceptedAnswers[0]}</span>
            </p>
          )}
          <p className="text-sm text-muted-foreground leading-relaxed">{fillBlank.explanation}</p>
        </motion.div>
      )}
    </motion.div>
  );
}

// ── Main component ────────────────────────────────────────────────────

export function MicroLesson({
  topic,
  subtopic,
  metadata,
  onClose,
  practiceProblems: providedPracticeProblems,
  streamUrl,
  chatStreamUrl,
  existingLesson,
  subtopicApiPath,
  practiceMode,
  tracking,
}: MicroLessonProps) {
  const {
    phase,
    lessonContent,
    whiteboardSteps,
    isWhiteboardStreaming,
    generateLesson,
    updateTracking,
  } = useMicroLesson({ topic, subtopic, metadata, streamUrl, chatStreamUrl, existingLesson, subtopicApiPath, tracking });

  const {
    state: playerState,
    userStepIndex,
    currentStepIndex,
    stepProgress,
    visibleStepIds,
    isLastStep,
    isCheckIn,
    currentCheckIn,
    isInteraction,
    currentPrediction,
    currentFillBlank,
    advance,
    goBack,
  } = useStepPlayer(whiteboardSteps, isWhiteboardStreaming);

  // Ref so the auto-advance effect can read the latest steps without
  // re-firing every time streaming delivers a new step (new array ref).
  const whiteboardStepsRef = useRef(whiteboardSteps);
  whiteboardStepsRef.current = whiteboardSteps;

  // ── "Why?" modal state ──────────────────────────────────────────────
  const [whyModalOpen, setWhyModalOpen] = useState(false);

  // ── Practice phase state ─────────────────────────────────────────────

  type LessonPhase = "lesson" | "practice" | "complete";
  const [lessonPhase, setLessonPhase] = useState<LessonPhase>("lesson");
  const [fetchedPracticeProblems, setFetchedPracticeProblems] = useState<Problem[]>([]);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [practiceCorrectCount, setPracticeCorrectCount] = useState(0);
  const [isPracticeLoading, setIsPracticeLoading] = useState(false);
  const prefetchedRef = useRef(false);

  // ── Orb presence refs ────────────────────────────────────────────────
  const penClientRef = useRef<BoardPoint | null>(null);
  const stepFocusRef = useRef<StepFocus | null>(null);

  const activePracticeProblems = providedPracticeProblems ?? fetchedPracticeProblems;
  const currentPracticeProblem = activePracticeProblems[currentProblemIndex] ?? null;

  const fetchPracticeProblems = useCallback(async () => {
    if (providedPracticeProblems) return;
    setIsPracticeLoading(true);
    try {
      const res = await fetch("/api/agent/practice-problems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          subtopic,
          subject: practiceMode?.subject ?? "math",
        }),
      });
      if (!res.ok) throw new Error("Failed to load practice problems");
      const data = await res.json();
      setFetchedPracticeProblems((data.problems as Problem[]).slice(0, 2));
    } catch {
      toast.error("Could not load practice problems");
      setLessonPhase("complete");
    } finally {
      setIsPracticeLoading(false);
    }
  }, [topic, subtopic, practiceMode?.subject, providedPracticeProblems]);

  // Pre-fetch problems near end of lesson
  useEffect(() => {
    if (
      prefetchedRef.current ||
      providedPracticeProblems ||
      whiteboardSteps.length === 0 ||
      userStepIndex < whiteboardSteps.length - 3
    ) return;
    prefetchedRef.current = true;
    fetchPracticeProblems();
  }, [userStepIndex, whiteboardSteps.length, fetchPracticeProblems, providedPracticeProblems]);

  // ── Playback pause state ─────────────────────────────────────────────

  const [isPaused, setIsPaused] = useState(false);
  const togglePause = useCallback(() => {
    setIsPaused((p) => {
      const next = !p;
      if (next) {
        if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
        if (typeof window !== "undefined") window.speechSynthesis?.cancel();
        setIsNarrating(false);
        setIsTtsLoading(false);
      }
      return next;
    });
  }, []);

  // ── Chat state ───────────────────────────────────────────────────────

  const [isChatting, setIsChatting] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const chatTextareaRef = useRef<HTMLTextAreaElement>(null);

  const chat = useLessonChat({
    topic,
    subtopic,
    lessonContent,
    metadata,
    whiteboardSteps,
    currentStepIndex: userStepIndex,
    chatStreamUrl,
    currentPracticeProblem: lessonPhase === "practice" ? currentPracticeProblem : null,
  });

  // Build visible IDs for chat whiteboard — progressive reveal synced with narration
  const chatVisibleIds = useMemo(() => {
    const ids = new Set<number>();
    const upTo = Math.min(
      Math.max(chat.chatNarrationIndex, 0),
      chat.chatWhiteboardSteps.length - 1,
    );
    for (let i = 0; i <= upTo; i++) {
      const step = chat.chatWhiteboardSteps[i];
      if (step.action.type === "clear") {
        ids.clear();
      } else if (step.action.type === "erase" && step.action.targetStepIndices) {
        for (const idx of step.action.targetStepIndices) {
          const target = chat.chatWhiteboardSteps[idx];
          if (target) ids.delete(target.id);
        }
      }
      ids.add(step.id);
    }
    return ids;
  }, [chat.chatWhiteboardSteps, chat.chatNarrationIndex]);

  // Track which hint tier the student is on (for canvas visual updates)
  const [interactionHintPhase, setInteractionHintPhase] = useState<"none" | "hinted" | "detailed">("none");

  // ── Tracking: push step/checkin counts to session tracking ────────
  const checkinsCorrectRef = useRef(0);
  const checkinsTotalRef = useRef(0);

  useEffect(() => {
    updateTracking({ stepsViewed: Math.max(0, userStepIndex + 1) });
  }, [userStepIndex, updateTracking]);

  // Reset hint phase when advancing to a new step
  const wrappedAdvance = useCallback(() => {
    // If advancing past a check-in, count it
    const step = whiteboardSteps[userStepIndex];
    if (step && step.action.type === "check_in") {
      checkinsTotalRef.current++;
      // Check-in was answered correctly if the player advanced (onAnswer is only called on completion)
      checkinsCorrectRef.current++;
      updateTracking({
        checkinsCorrect: checkinsCorrectRef.current,
        checkinsTotal: checkinsTotalRef.current,
      });
    }
    setInteractionHintPhase("none");
    advance();
  }, [advance, whiteboardSteps, userStepIndex, updateTracking]);

  // Build synthetic step for interaction visual (shown on canvas during check-in/predict/fill_blank)
  // Selects the appropriate visual based on hint phase with fallback chain
  const activeInteractionVisual = useMemo(() => {
    const action = currentCheckIn ?? currentPrediction ?? currentFillBlank ?? null;
    if (!action) return null;

    if (interactionHintPhase === "detailed" && "detailedHintVisual" in action) {
      return action.detailedHintVisual ?? ("hintVisual" in action ? action.hintVisual : null) ?? action.visual ?? null;
    }
    if (interactionHintPhase === "hinted" && "hintVisual" in action) {
      return action.hintVisual ?? action.visual ?? null;
    }
    return action.visual ?? null;
  }, [currentCheckIn, currentPrediction, currentFillBlank, interactionHintPhase]);

  const interactionVisualStep = useMemo(() => {
    if (!isInteraction || !activeInteractionVisual) return null;
    return { id: -1, delayMs: 0, durationMs: 0, action: activeInteractionVisual } as WhiteboardStep;
  }, [isInteraction, activeInteractionVisual]);

  const interactionVisualIds = useMemo(
    () => (interactionVisualStep ? new Set([-1]) : null),
    [interactionVisualStep],
  );

  // ── Narration state ──────────────────────────────────────────────────

  const [isNarrating, setIsNarrating] = useState(false);
  const [isTtsLoading, setIsTtsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const isMutedRef = useRef(false);
  isMutedRef.current = isMuted;
  const isPausedRef = useRef(false);
  isPausedRef.current = isPaused;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const advanceRef = useRef(wrappedAdvance);
  advanceRef.current = wrappedAdvance;
  const isChattingRef = useRef(isChatting);
  isChattingRef.current = isChatting;
  const whyModalOpenRef = useRef(whyModalOpen);
  whyModalOpenRef.current = whyModalOpen;

  // Start lesson generation on mount
  useEffect(() => {
    generateLesson();
  }, [generateLesson]);

  // ── Stop audio when muted ────────────────────────────────────────────

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (next) {
        if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
        if (typeof window !== "undefined") window.speechSynthesis?.cancel();
        setIsNarrating(false);
        setIsTtsLoading(false);
      }
      return next;
    });
  }, []);

  // ── Pause lesson when chat opens ─────────────────────────────────────

  useEffect(() => {
    if (isChatting) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
      setIsNarrating(false);
      setIsTtsLoading(false);
    }
  }, [isChatting]);

  useEffect(() => {
    if (chat.ttsFailed) {
      toast.error("Couldn't play audio for that response.", { duration: 3000 });
    }
  }, [chat.ttsFailed]);

  const closeChat = useCallback(() => {
    setIsChatting(false);
    chat.clearChat();
  }, [chat]);

  // ── TTS narration ──────────────────────────────────────────────────
  // Teaching steps: narrate on arrival (while visual animates)
  // Predict/fill_blank: narrate AFTER student answers (called via playNarration)
  // Check-in: narrate question on arrival

  const playNarration = useCallback((text: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    if (isChattingRef.current || !text) return;
    if (isMutedRef.current) return;
    if (isPausedRef.current) return;

    setIsTtsLoading(true);
    let cancelled = false;

    const useSpeechFallback = () => {
      if (cancelled || isMutedRef.current || typeof window === "undefined" || !window.speechSynthesis) {
        setIsTtsLoading(false);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.92;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      // Prefer a natural English voice
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v => v.lang.startsWith("en") && /google|samantha|karen|moira|daniel/i.test(v.name))
        || voices.find(v => v.lang.startsWith("en-US"))
        || voices.find(v => v.lang.startsWith("en"));
      if (preferred) utterance.voice = preferred;

      utterance.onstart = () => {
        if (!cancelled && !isMutedRef.current) { setIsTtsLoading(false); setIsNarrating(true); }
      };
      utterance.onend = () => { if (!cancelled) setIsNarrating(false); };
      utterance.onerror = () => { if (!cancelled) { setIsTtsLoading(false); setIsNarrating(false); } };

      window.speechSynthesis.speak(utterance);
    };

    const run = async () => {
      try {
        const res = await fetch("/api/agent/text-to-speech", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });
        if (cancelled) return;
        if (!res.ok) {
          // ElevenLabs not configured — fall back to browser TTS
          useSpeechFallback();
          return;
        }
        const blob = await res.blob();
        if (cancelled) return;

        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioRef.current = audio;

        audio.onended = () => {
          URL.revokeObjectURL(url);
          audioRef.current = null;
          if (!cancelled) setIsNarrating(false);
        };
        audio.onerror = () => {
          URL.revokeObjectURL(url);
          audioRef.current = null;
          if (!cancelled) setIsNarrating(false);
        };

        if (cancelled || isChattingRef.current || isMutedRef.current) return;

        audio.play().then(() => {
          if (!cancelled && !isChattingRef.current && !isMutedRef.current) {
            setIsTtsLoading(false);
            setIsNarrating(true);
          }
        }).catch(() => {
          URL.revokeObjectURL(url);
          audioRef.current = null;
          if (!cancelled) { setIsTtsLoading(false); setIsNarrating(false); }
        });
      } catch {
        if (!cancelled) useSpeechFallback();
      }
    };

    run();
    return () => {
      cancelled = true;
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    };
  }, []);

  // Auto-narrate all steps on arrival:
  // teaching: narrates the displayText/narration (what's being shown)
  // predict/fill_blank/check_in: narrates the QUESTION text so the tutor reads it aloud
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (isChattingRef.current) return;
    if (whyModalOpenRef.current) return;
    if (isPaused) return;

    const step = whiteboardSteps[userStepIndex];
    if (!step) return;

    let narration: string | undefined;
    if (step.action.type === "check_in") {
      narration = (step.action as CheckInAction).question.trim();
    } else if (step.action.type === "predict") {
      narration = (step.action as PredictAction).question.trim();
    } else if (step.action.type === "fill_blank") {
      narration = (step.action as FillBlankAction).prompt.trim();
    } else {
      narration = step.narration?.trim();
    }
    if (!narration) return;

    const cancel = playNarration(narration);

    return () => {
      cancel?.();
      setIsTtsLoading(false);
      setIsNarrating(false);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userStepIndex, isPaused, playNarration]);

  // ── Auto-advance teaching steps when narration + animation done ─────

  useEffect(() => {
    // Use ref so this effect doesn't re-fire every time streaming delivers
    // a new step (each new step is a new array reference).
    const step = whiteboardStepsRef.current[userStepIndex];
    if (!step) return;
    // Only auto-advance teaching steps (not interactions)
    const t = step.action.type;
    if (t === "check_in" || t === "predict" || t === "fill_blank") return;
    if (isLastStep) return;
    if (isChatting) return;
    if (whyModalOpen) return;

    if (playerState === "waiting" && !isNarrating && !isTtsLoading && !isPaused) {
      advanceRef.current();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerState, isNarrating, isTtsLoading, isLastStep, isChatting, whyModalOpen, userStepIndex, isPaused]);

  // Callback for predict/fill_blank: play narration after student answers, then advance after delay
  const handleInteractionAnswer = useCallback(() => {
    // Brief delay so the student can read the explanation before advancing
    setTimeout(() => advanceRef.current(), 1200);
  }, []);

  // Transition to practice phase when lesson completes
  useEffect(() => {
    if (isLastStep && lessonPhase === "lesson") {
      setLessonPhase("practice");
      // If problems weren't pre-fetched, fetch now
      if (!providedPracticeProblems && fetchedPracticeProblems.length === 0 && !prefetchedRef.current) {
        fetchPracticeProblems();
      }
    }
  }, [isLastStep, lessonPhase, providedPracticeProblems, fetchedPracticeProblems.length, fetchPracticeProblems]);

  // Mark complete when all practice problems are done
  useEffect(() => {
    if (lessonPhase === "practice" && activePracticeProblems.length > 0 && currentProblemIndex >= activePracticeProblems.length) {
      setLessonPhase("complete");
    }
  }, [lessonPhase, activePracticeProblems.length, currentProblemIndex]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    };
  }, []);

  // ── Chat input handlers ──────────────────────────────────────────────

  // Auto-resize textarea
  useEffect(() => {
    const ta = chatTextareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 56) + "px";
  }, [chatInput]);

  // Scroll chat history on new messages
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chat.chatMessages]);


  const handleChatSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!chatInput.trim() || chat.isProcessing) return;
      setIsChatting(true);
      chat.sendChat(chatInput.trim());
      setChatInput("");
      if (chatTextareaRef.current) chatTextareaRef.current.style.height = "auto";
    },
    [chatInput, chat],
  );

  // Auto-enter chat mode when voice recording triggers processing
  useEffect(() => {
    if (chat.isProcessing && !isChatting) {
      setIsChatting(true);
    }
  }, [chat.isProcessing, isChatting]);

  const handleChatKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleChatSubmit(e);
      }
    },
    [handleChatSubmit],
  );

  // ── Derived state ────────────────────────────────────────────────────

  const currentDisplayText = whiteboardSteps[userStepIndex]?.displayText
    ?? whiteboardSteps[userStepIndex]?.narration ?? "";
  const hasChatSteps = chat.chatWhiteboardSteps.length > 0;
  const emptyVisibleIds = useMemo(() => new Set<number>(), []);
  const isPracticeCanvas = (lessonPhase === "practice" || lessonPhase === "complete") && !isChatting;

  // ── Generating state ──────────────────────────────────────────────
  const isGenerating = phase === "generating" && whiteboardSteps.length === 0;


  // ── Orb derived state ─────────────────────────────────────────────────
  const currentLessonStep = whiteboardSteps[currentStepIndex];
  const orbMode = (
    !isChatting &&
    lessonPhase === "lesson" &&
    isDiagramStep(currentLessonStep) &&
    stepProgress < 1
  ) ? "draw" : "rest";
  const orbState: "idle" | "thinking" | "speaking" | "listening" = isNarrating
    ? "speaking"
    : isTtsLoading
      ? "thinking"
      : "idle";
  // Caption shows narration while the lesson is active
  const orbCaption = (!isChatting && lessonPhase === "lesson") ? (currentDisplayText || null) : null;
  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden" style={{ background: "#050911" }}>

      {/* ── Error ───────────────────────────────────────────────────── */}
      {phase === "error" ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-3">
          <p className="text-sm text-destructive">Failed to generate lesson. Please try again.</p>
          <Button variant="outline" size="sm" onClick={onClose}>Go Back</Button>
        </div>
      ) : (
        <>
          {/* ── Main area: full canvas, no header ────────────────────── */}
          <div className="flex-1 relative min-h-0">

            {/* Floating Back button — top-left */}
            <button
              onClick={onClose}
              className="absolute top-3 left-3 z-30 flex items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-xs font-medium text-white/60 backdrop-blur-sm transition-colors hover:bg-black/60 hover:text-white/90"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Back
            </button>

            {/* Top-right cluster: progress pill + Lore button */}
            <div className="absolute top-3 right-3 z-30 flex flex-col items-end gap-2">
              {/* Progress pill */}
              <AnimatePresence>
                {lessonPhase === "lesson" && whiteboardSteps.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className="flex items-center gap-2.5 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 backdrop-blur-sm"
                  >
                    <span className="tabular-nums text-xs font-medium text-white/50">
                      {userStepIndex + 1} / {whiteboardSteps.length}
                    </span>
                    <div className="h-1.5 w-20 overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        className="h-full rounded-full bg-athena-amber"
                        animate={{ width: `${Math.round(((userStepIndex + 1) / Math.max(whiteboardSteps.length, 1)) * 100)}%` }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Lore button */}
              <motion.button
                onClick={() => setWhyModalOpen(true)}
                className="relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-amber-300 cursor-pointer overflow-hidden"
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              >
                <motion.div className="absolute inset-0 rounded-full opacity-70" style={{ background: "linear-gradient(135deg, rgba(251,191,36,0.2), rgba(244,114,182,0.15), rgba(129,140,248,0.15), rgba(251,191,36,0.2))", backgroundSize: "300% 300%" }} animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
                <motion.div className="absolute inset-0 rounded-full" style={{ boxShadow: "inset 0 0 0 1px rgba(251,191,36,0.25)" }} animate={{ boxShadow: ["inset 0 0 0 1px rgba(251,191,36,0.25)", "inset 0 0 0 1px rgba(244,114,182,0.25)", "inset 0 0 0 1px rgba(129,140,248,0.25)", "inset 0 0 0 1px rgba(251,191,36,0.25)"] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
                <motion.div className="relative flex items-center gap-1.5" animate={{ color: ["#fbbf24", "#f472b6", "#818cf8", "#fbbf24"] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
                  <BookOpen className="h-3.5 w-3.5" /><span>Lore</span>
                </motion.div>
              </motion.button>
            </div>

            {/* Canvas — fills full area */}
            <div className="absolute inset-0" style={{ background: "#050911" }}>
              <AnimatePresence mode="wait">
                {isGenerating ? (
                  <motion.div key="skeleton" className="absolute top-0 bottom-0 right-0 left-0" exit={{ opacity: 0, scale: 1.02, filter: "blur(4px)" }} transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}>
                    <WhiteboardSkeleton className="h-full" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <GenerationProgress />
                    </div>
                  </motion.div>
                ) : (lessonPhase === "practice" || lessonPhase === "complete") && !isChatting ? (
                  <motion.div key="practice" className="absolute top-0 bottom-0 right-0 left-0 flex flex-col items-center justify-center p-6 overflow-y-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {isPracticeLoading && activePracticeProblems.length === 0 ? (
                      <div className="flex flex-col items-center gap-3">
                        <motion.div animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.15, 1] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
                          <Brain className="h-8 w-8 text-athena-amber" />
                        </motion.div>
                        <p className="text-sm text-muted-foreground">Preparing practice…</p>
                      </div>
                    ) : lessonPhase === "complete" ? (
                      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-5 relative">
                        <CheckInConfetti />
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}>
                          <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                        </motion.div>
                        <div>
                          <p className="text-2xl font-bold">{practiceCorrectCount}/{activePracticeProblems.length} correct</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {practiceCorrectCount === activePracticeProblems.length ? "Perfect! Great work on this lesson." : "Keep it up, you're making progress!"}
                          </p>
                        </div>
                        <Button size="sm" className="gap-1" onClick={onClose}>Done <ChevronRight className="h-3.5 w-3.5" /></Button>
                      </motion.div>
                    ) : currentPracticeProblem ? (
                      <div className="w-full max-w-2xl space-y-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-muted-foreground">Practice {currentProblemIndex + 1} of {activePracticeProblems.length}</span>
                          <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                            <motion.div className="h-full bg-athena-amber rounded-full" animate={{ width: `${(currentProblemIndex / activePracticeProblems.length) * 100}%` }} transition={{ duration: 0.3 }} />
                          </div>
                        </div>
                        <AnimatePresence mode="wait">
                          <motion.div key={currentPracticeProblem.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                            <PracticeGradientCard problem={currentPracticeProblem} questionNumber={currentProblemIndex + 1} onCorrect={() => { setPracticeCorrectCount((c) => c + 1); setCurrentProblemIndex((i) => i + 1); }} onExhausted={() => setCurrentProblemIndex((i) => i + 1)} />
                          </motion.div>
                        </AnimatePresence>
                      </div>
                    ) : null}
                  </motion.div>
                ) : (
                  <motion.div key={isChatting && hasChatSteps ? "chat-canvas" : "lesson-canvas"} className="absolute top-0 bottom-0 right-0 left-0" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 300, damping: 25 }}>
                    <WhiteboardCanvas
                      steps={isChatting && hasChatSteps ? chat.chatWhiteboardSteps : whiteboardSteps}
                      visibleStepIds={isPracticeCanvas ? emptyVisibleIds : isChatting && hasChatSteps ? chatVisibleIds : visibleStepIds}
                      currentStepIndex={isChatting && hasChatSteps ? Math.min(Math.max(chat.chatNarrationIndex, 0), chat.chatWhiteboardSteps.length - 1) : currentStepIndex}
                      stepProgress={isChatting && hasChatSteps ? 1 : stepProgress}
                      equalScaleCoords
                      onPenTip={(pt) => { penClientRef.current = pt; }}
                      onStepFocus={(focus) => { stepFocusRef.current = focus; }}
                    />
                    {/* Roaming AI orb — overlays the canvas, tracks the pen tip while drawing */}
                    {!isChatting && lessonPhase === "lesson" && (
                      <PresenceLayer
                        orbState={orbState}
                        amplitude={isNarrating ? 0.5 : 0}
                        size={120}
                        captionText={orbCaption}
                        mode={orbMode}
                        restAnchor={{ x: 80, y: 100 }}
                        penClientRef={penClientRef}
                        stepFocusRef={stepFocusRef}
                        suppressCaption={orbMode === "draw"}
                      />
                    )}
                    {/* Interaction card overlaid on the canvas — canvas stays visible behind */}
                    <AnimatePresence>
                      {isInteraction && lessonPhase === "lesson" && !isChatting && (
                        <motion.div
                          key={`interaction-${userStepIndex}`}
                          className="absolute inset-0 flex flex-col justify-end items-center px-8 pb-8"
                          style={{ background: "linear-gradient(to top, rgba(5,9,17,0.92) 0%, rgba(5,9,17,0.4) 55%, transparent 100%)" }}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.22 }}
                        >
                          <div className="w-full max-w-6xl bg-card/90 backdrop-blur-md rounded-2xl p-5 border border-border/50 shadow-xl">
                            {isCheckIn && currentCheckIn && (
                              <CheckInCard key={`check-in-${userStepIndex}`} checkIn={currentCheckIn} onAnswer={wrappedAdvance} onNarrate={playNarration} onHintPhase={setInteractionHintPhase} />
                            )}
                            {currentPrediction && (
                              <PredictCard predict={currentPrediction} onAnswer={handleInteractionAnswer} onNarrate={playNarration} onHintPhase={setInteractionHintPhase} />
                            )}
                            {currentFillBlank && (
                              <FillBlankCard fillBlank={currentFillBlank} onAnswer={handleInteractionAnswer} onNarrate={playNarration} onHintPhase={setInteractionHintPhase} />
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Chat overlay — floats over canvas */}
              <AnimatePresence>
                {isChatting && (
                  <motion.div key="chat-overlay" ref={chatScrollRef} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} transition={{ type: "spring", stiffness: 380, damping: 32 }} className="absolute bottom-3 left-3 right-3 z-20 bg-card/96 backdrop-blur-md border border-border/50 rounded-2xl p-4 shadow-xl max-h-[48%] overflow-y-auto">
                    <button onClick={closeChat} className="text-xs text-muted-foreground hover:text-foreground transition-colors mb-3 flex items-center gap-1">
                      <ChevronLeft className="h-3 w-3" />
                      {lessonPhase === "practice" ? "Back to practice" : "Resume lesson"}
                    </button>
                    {(() => {
                      const lastUserMsg = chat.chatMessages.findLast((msg) => msg.role === "user");
                      return lastUserMsg ? <MessageBubble key="user-last" role="user" content={lastUserMsg.content} /> : null;
                    })()}
                    {chat.chatWhiteboardSteps.length > 0 && chat.chatNarrationIndex >= 0 && (
                      <AnimatePresence mode="wait">
                        <motion.div key={`cs-${Math.min(chat.chatNarrationIndex, chat.chatWhiteboardSteps.length - 1)}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="mt-2 text-sm text-foreground leading-relaxed">
                          <MathContent content={chat.chatWhiteboardSteps[Math.min(chat.chatNarrationIndex, chat.chatWhiteboardSteps.length - 1)]?.displayText || ""} />
                        </motion.div>
                      </AnimatePresence>
                    )}
                    <AnimatePresence>
                      {chat.isProcessing && chat.chatWhiteboardSteps.length === 0 && <ThinkingIndicator variant="prominent" />}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ── Bottom bar: centered pill ────────────────────────────── */}
          <div className="shrink-0 flex justify-center px-4 py-3">
            <div className="flex items-center gap-2 bg-card/95 backdrop-blur-sm border border-border/60 rounded-2xl px-4 py-2.5 shadow-lg w-full max-w-4xl">
              {/* Playback controls */}
              <CircleBtn
                icon={<SkipBack className="h-[18px] w-[18px]" />}
                onClick={goBack}
                title="Previous step"
              />
              <CircleBtn
                icon={isPaused ? <Play className="h-[18px] w-[18px]" /> : <Pause className="h-[18px] w-[18px]" />}
                active={!isPaused}
                onClick={togglePause}
                title={isPaused ? "Resume lesson" : "Pause lesson"}
              />
              <CircleBtn
                icon={<SkipForward className="h-[18px] w-[18px]" />}
                onClick={wrappedAdvance}
                title="Skip to next step"
                disabled={isLastStep || !!isInteraction}
              />

              <div className="w-px h-6 bg-border/50 mx-1 shrink-0" />

              {/* Chat input */}
              <div className="flex-1 min-w-0">
                {chat.isRecording ? (
                  /* Recording state — pulsing indicator */
                  <div className="flex items-center gap-2 bg-muted/60 rounded-xl px-3.5 py-2.5 min-h-[38px]">
                    <motion.div
                      className="w-2 h-2 shrink-0 rounded-full bg-red-500"
                      animate={{ opacity: [1, 0.2, 1], scale: [1, 1.3, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                    />
                    <span className="text-sm text-muted-foreground flex-1">Listening…</span>
                    <button
                      type="button"
                      onClick={chat.stopRecording}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
                    >
                      Stop
                    </button>
                  </div>
                ) : chat.isProcessing ? (
                  /* Transcribing / processing state */
                  <div className="flex items-center gap-2 bg-muted/60 rounded-xl px-3.5 py-2.5 min-h-[38px]">
                    <motion.div
                      className="flex gap-[3px] items-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-1 rounded-full bg-athena-amber/70"
                          animate={{ height: [3, 12, 3] }}
                          transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.12, ease: "easeInOut" }}
                        />
                      ))}
                    </motion.div>
                    <span className="text-sm text-muted-foreground">Processing…</span>
                  </div>
                ) : (
                  /* Normal text input */
                  <form onSubmit={handleChatSubmit} className="flex items-center gap-2">
                    <textarea
                      ref={chatTextareaRef}
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={handleChatKeyDown}
                      placeholder={lessonPhase === "practice" ? "Ask about this problem…" : "Type or speak…"}
                      className="flex-1 bg-muted/60 rounded-xl text-sm outline-none placeholder:text-muted-foreground resize-none min-h-[38px] max-h-[56px] py-2.5 px-3.5 border border-transparent focus:border-athena-amber/40 transition-colors overflow-hidden"
                      rows={1}
                      disabled={isGenerating}
                    />
                    <CircleBtn
                      icon={isMuted ? <VolumeX className="h-[18px] w-[18px]" /> : <Volume2 className="h-[18px] w-[18px]" />}
                      active={!isMuted}
                      onClick={toggleMute}
                      title={isMuted ? "Unmute narration" : "Mute narration"}
                    />
                    <CircleBtn
                      icon={<Mic className="h-[18px] w-[18px]" />}
                      active={chat.isRecording}
                      onClick={chat.startRecording}
                      title="Start voice input"
                      disabled={isGenerating}
                    />
                    <button
                      type="submit"
                      disabled={!chatInput.trim()}
                      title="Send"
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all",
                        chatInput.trim()
                          ? "border-athena-amber bg-athena-amber/20 text-athena-amber"
                          : "border-border/60 bg-background text-muted-foreground opacity-40 cursor-not-allowed",
                      )}
                    >
                      <Send className="h-[18px] w-[18px]" />
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      <WhyThisMattersModal
        open={whyModalOpen}
        onOpenChange={setWhyModalOpen}
        topic={topic}
        subtopic={subtopic}
        metadata={metadata}
        loreApiPath={subtopicApiPath?.replace(/\/micro-lesson$/, "/lore")}
      />
    </div>
  );
}
