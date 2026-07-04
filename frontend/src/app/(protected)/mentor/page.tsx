"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Send, Mic, Keyboard, GraduationCap, CalendarDays, Bot, Video, CheckCircle, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { FeatureGate } from "@/components/subscription/feature-gate";
import { motion, AnimatePresence } from "framer-motion";
import { useMentorConversation } from "@/hooks/use-mentor-conversation";
import { MessageBubble } from "@/components/lessons/message-bubble";
import { VoiceOrb } from "@/components/lessons/voice-orb";
import { ThinkingIndicator } from "@/components/lessons/thinking-indicator";
import { WhiteboardCanvas } from "@/components/whiteboard/whiteboard-canvas";
import { WhiteboardToolbar } from "@/components/whiteboard/whiteboard-toolbar";
import { WhiteboardTimeline } from "@/components/whiteboard/whiteboard-timeline";
import { useWhiteboardPlayer } from "@/hooks/use-whiteboard-player";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import type { SelectedElement } from "@/types/whiteboard";

const SUGGESTIONS = [
  "How am I doing overall?",
  "What should I focus on this week?",
  "Help me make a study plan",
  "I'm feeling stuck on math",
];

const DAYS_ORDER = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
// Maps JS getDay() (0=Sun) to schedule dayOfWeek name
const JS_DAY_MAP = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const WEEK_HEADERS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Build a 6-row × 7-col calendar grid for a given year/month */
function buildCalendarGrid(year: number, month: number): (number | null)[][] {
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

// ─── Human Guide Tab ──────────────────────────────────────────────────────────

function HumanGuideTab() {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<number | null>(today.getDate());
  const [selectedDayName, setSelectedDayName] = useState<string | null>(null);
  const [booked, setBooked] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["schedule"],
    queryFn: () => fetch("/api/schedule").then((r) => r.json()),
    staleTime: 5 * 60_000,
  });

  const schedules: { dayOfWeek: string; startTime: string }[] =
    (data?.schedules ?? []).sort(
      (a: { dayOfWeek: string }, b: { dayOfWeek: string }) =>
        DAYS_ORDER.indexOf(a.dayOfWeek) - DAYS_ORDER.indexOf(b.dayOfWeek)
    );

  // Set of schedule day names for quick lookup
  const scheduleDaySet = new Set(schedules.map((s) => s.dayOfWeek));

  // The schedule entry for the currently selected date
  const selectedSchedule = selectedDayName
    ? schedules.find((s) => s.dayOfWeek === selectedDayName) ?? null
    : null;

  // When a date cell is clicked
  const handleDayClick = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    const dayName = JS_DAY_MAP[d.getDay()];
    setSelectedDate(day);
    setSelectedDayName(dayName);
  };

  // Init selected day name from today
  useEffect(() => {
    const dayName = JS_DAY_MAP[today.getDay()];
    setSelectedDayName(dayName);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
    setSelectedDate(null);
    setSelectedDayName(null);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
    setSelectedDate(null);
    setSelectedDayName(null);
  };

  const bookMutation = useMutation({
    mutationFn: (payload: { day: string; time: string }) =>
      fetch("/api/mentor/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).then(async (r) => {
        if (!r.ok) throw new Error(await r.text());
      }),
    onSuccess: () => {
      setBooked(true);
      toast.success("Booking request sent! Your mentor will confirm via email.");
    },
    onError: () => {
      toast.error("Couldn't send booking — check your Resend API key in .env.local");
    },
  });

  const handleBook = () => {
    if (!selectedSchedule || !selectedDayName) return;
    bookMutation.mutate({
      day: capitalize(selectedDayName),
      time: formatTime(selectedSchedule.startTime),
    });
  };

  const weeks = buildCalendarGrid(viewYear, viewMonth);
  const isToday = (day: number) =>
    day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground text-sm">
        Loading your schedule…
      </div>
    );
  }

  if (booked && selectedSchedule && selectedDayName) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
          <CheckCircle className="h-8 w-8 text-green-500" />
        </div>
        <div className="space-y-1">
          <p className="font-semibold text-lg">Booking request sent!</p>
          <p className="text-sm text-muted-foreground max-w-xs">
            Your mentor will reply to confirm{" "}
            <span className="font-medium text-foreground">
              {capitalize(selectedDayName)} at {formatTime(selectedSchedule.startTime)}
            </span>.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setBooked(false)}>
          Book another slot
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-8 px-4 space-y-6">

      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-athena-amber/10">
          <Video className="h-5 w-5 text-athena-amber" />
        </div>
        <div>
          <h2 className="font-semibold">Human Guide</h2>
          <p className="text-sm text-muted-foreground">Meet weekly with a real mentor who knows your journey</p>
        </div>
      </div>

      {/* ── Calendar ── */}
      <div className="rounded-xl border bg-card p-4 space-y-3">
        {/* Month nav */}
        <div className="flex items-center justify-between">
          <button onClick={prevMonth} className="p-1 rounded-md hover:bg-muted transition-colors cursor-pointer">
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          </button>
          <p className="text-sm font-semibold">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </p>
          <button onClick={nextMonth} className="p-1 rounded-md hover:bg-muted transition-colors cursor-pointer">
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Week headers */}
        <div className="grid grid-cols-7 text-center">
          {WEEK_HEADERS.map((h) => (
            <div key={h} className="py-1 text-xs font-medium text-muted-foreground">
              {h}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div className="space-y-1">
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 text-center">
              {week.map((day, di) => {
                if (!day) return <div key={di} />;
                const d = new Date(viewYear, viewMonth, day);
                const dayName = JS_DAY_MAP[d.getDay()];
                const hasSession = scheduleDaySet.has(dayName);
                const isSelected = selectedDate === day;
                const isTodayCell = isToday(day);

                return (
                  <button
                    key={di}
                    onClick={() => handleDayClick(day)}
                    className={`
                      relative mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm transition-colors cursor-pointer
                      ${isSelected ? "bg-foreground text-background font-semibold" : ""}
                      ${!isSelected && isTodayCell ? "border border-athena-amber text-athena-amber font-semibold" : ""}
                      ${!isSelected && !isTodayCell ? "hover:bg-muted text-foreground" : ""}
                    `}
                  >
                    {day}
                    {hasSession && !isSelected && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-athena-amber" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Session info for selected date */}
      <div className="rounded-xl border bg-card px-4 py-3 min-h-[52px] flex items-center gap-2">
        {selectedSchedule ? (
          <>
            <Clock className="h-4 w-4 text-athena-amber shrink-0" />
            <span className="text-sm">
              <span className="font-medium">{capitalize(selectedDayName ?? "")}</span>
              {" "}session at{" "}
              <span className="font-medium text-athena-amber">{formatTime(selectedSchedule.startTime)}</span>
            </span>
          </>
        ) : (
          <span className="text-sm text-muted-foreground">
            {selectedDate ? "No session scheduled this day" : "Select a day to see session info"}
          </span>
        )}
      </div>

      {/* Available slots list */}
      {schedules.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Available Slots
          </p>
          <div className="divide-y rounded-xl border bg-card overflow-hidden">
            {schedules.map((s) => {
              const isActive = selectedDayName === s.dayOfWeek;
              return (
                <button
                  key={s.dayOfWeek}
                  onClick={() => {
                    setSelectedDayName(s.dayOfWeek);
                    setSelectedDate(null);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors cursor-pointer ${
                    isActive ? "bg-muted/60" : "hover:bg-muted/40 text-muted-foreground"
                  }`}
                >
                  <span className={`font-medium ${isActive ? "text-foreground" : ""}`}>
                    {capitalize(s.dayOfWeek)}
                  </span>
                  <span className={`flex items-center gap-1.5 ${isActive ? "text-athena-amber font-medium" : ""}`}>
                    <Clock className="h-3.5 w-3.5" />
                    {formatTime(s.startTime)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Book button */}
      {selectedSchedule ? (
        <div className="space-y-2">
          <Button
            className="w-full bg-athena-amber hover:bg-athena-amber/90 text-white cursor-pointer"
            onClick={handleBook}
            disabled={bookMutation.isPending}
          >
            {bookMutation.isPending
              ? "Sending request…"
              : `Book ${capitalize(selectedDayName ?? "")} at ${formatTime(selectedSchedule.startTime)}`}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Your mentor will receive an email and reply to confirm.
          </p>
        </div>
      ) : schedules.length === 0 ? (
        <div className="rounded-xl border border-dashed p-6 text-center space-y-2">
          <CalendarDays className="h-8 w-8 text-muted-foreground/40 mx-auto" />
          <p className="text-sm text-muted-foreground">No study schedule set up yet. Complete onboarding first.</p>
        </div>
      ) : null}
    </div>
  );
}

// ─── AI Coach Tab ─────────────────────────────────────────────────────────────

function AiCoachTab() {
  const [input, setInput] = useState("");
  const [selections, setSelections] = useState<SelectedElement[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isNearBottomRef = useRef(true);

  const {
    messages, mode, isRecording, isProcessing, isSpeaking, amplitude,
    whiteboardSteps, isWhiteboardStreaming,
    sendMessage, startRecording, stopRecording, toggleMode,
  } = useMentorConversation();

  const {
    currentStepIndex, stepProgress, visibleStepIds, state: playerState,
    speed, play, pause, replay, seekToStep, changeSpeed,
  } = useWhiteboardPlayer(whiteboardSteps, isWhiteboardStreaming);

  const hasWhiteboard = whiteboardSteps.length > 0;

  const checkNearBottom = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    isNearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
  }, []);

  useEffect(() => {
    if (isNearBottomRef.current && scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isProcessing]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
  }, [input]);

  useEffect(() => {
    if (isWhiteboardStreaming) setSelections([]);
  }, [isWhiteboardStreaming]);

  const handleElementSelect = useCallback((el: SelectedElement | null) => {
    if (!el) { setSelections([]); return; }
    setSelections([el]);
    const q = el.type === "write_math"
      ? `Can you explain this step: $${el.content}$?`
      : `Can you explain this further: "${el.content}"?`;
    setInput(q);
    if (mode === "voice") toggleMode();
    requestAnimationFrame(() => textareaRef.current?.focus());
  }, [mode, toggleMode]);

  const handleElementToggle = useCallback((el: SelectedElement) => {
    setSelections((prev) => {
      const key = `${el.stepId}:${el.content}`;
      const exists = prev.some((s) => `${s.stepId}:${s.content}` === key);
      return exists ? prev.filter((s) => `${s.stepId}:${s.content}` !== key) : [...prev, el];
    });
  }, []);

  const handleElementsSelect = useCallback((els: SelectedElement[]) => {
    setSelections(els);
    if (mode === "voice") toggleMode();
    requestAnimationFrame(() => textareaRef.current?.focus());
  }, [mode, toggleMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;
    sendMessage(input.trim());
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(e); }
  };

  const voiceOrbState: "idle" | "listening" | "processing" | "speaking" =
    isRecording ? "listening" : isProcessing ? "processing" : isSpeaking ? "speaking" : "idle";

  return (
    <div className="flex h-full">
      {/* Chat column */}
      <div className={`flex flex-col transition-all duration-300 ${hasWhiteboard ? "w-1/2 border-r" : "mx-auto w-full max-w-2xl"}`}>
        <div ref={scrollRef} onScroll={checkNearBottom} className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <GraduationCap className="h-7 w-7 text-primary" />
              </div>
              <div className="text-center space-y-1">
                <h2 className="text-lg font-semibold">Study Coach</h2>
                <p className="text-sm text-muted-foreground max-w-sm">
                  I know your progress, your strengths, and where you can improve. Ask me anything.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 mt-2 max-w-md">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="rounded-full border bg-card px-4 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: "easeOut" }}>
                <MessageBubble role={msg.role} content={msg.content} isStreaming={msg.isStreaming} />
              </motion.div>
            ))}
          </AnimatePresence>

          <AnimatePresence>
            {isProcessing && !messages.some((m) => m.isStreaming) && <ThinkingIndicator />}
          </AnimatePresence>

          {isSpeaking && !isProcessing && (
            <motion.p className="text-xs text-muted-foreground px-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              Athena is speaking…
            </motion.p>
          )}
        </div>

        {mode === "text" ? (
          <form onSubmit={handleSubmit} className="flex items-end gap-2 border-t p-3">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask your coach anything…"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground resize-none min-h-[36px] max-h-[120px] py-2"
              rows={1}
              disabled={isProcessing}
            />
            <Button type="button" size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={toggleMode} title="Switch to voice">
              <Mic className="h-4 w-4" />
            </Button>
            <motion.div whileTap={{ scale: 0.9, rotate: -12 }} transition={{ type: "spring", stiffness: 400, damping: 15 }}>
              <Button type="submit" size="icon" variant="ghost" className="h-8 w-8 shrink-0" disabled={!input.trim() || isProcessing}>
                <Send className="h-4 w-4" />
              </Button>
            </motion.div>
          </form>
        ) : (
          <div className="flex flex-col items-center gap-4 border-t p-6">
            <VoiceOrb state={voiceOrbState} amplitude={amplitude} onTap={isRecording ? stopRecording : startRecording} disabled={isProcessing && !isRecording} />
            <p className="text-sm text-muted-foreground">
              {isRecording ? "Listening… tap to stop" : isProcessing ? "Processing…" : isSpeaking ? "Speaking…" : "Tap to speak"}
            </p>
            <Button type="button" size="sm" variant="ghost" className="gap-1.5 text-xs" onClick={toggleMode}>
              <Keyboard className="h-3.5 w-3.5" />
              Switch to text
            </Button>
          </div>
        )}
      </div>

      {/* Whiteboard panel */}
      <AnimatePresence>
        {hasWhiteboard && (
          <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "50%" }} exit={{ opacity: 0, width: 0 }} transition={{ duration: 0.3, ease: "easeOut" }} className="flex flex-col overflow-hidden">
            <WhiteboardToolbar state={playerState} speed={speed} currentStep={currentStepIndex} totalSteps={whiteboardSteps.length} isStreaming={isWhiteboardStreaming} onPlay={play} onPause={pause} onReplay={replay} onSpeedChange={changeSpeed} />
            <div className="flex-1 min-h-0">
              <WhiteboardCanvas steps={whiteboardSteps} visibleStepIds={visibleStepIds} currentStepIndex={currentStepIndex} stepProgress={stepProgress} selections={selections} onElementSelect={handleElementSelect} onElementToggle={handleElementToggle} onElementsSelect={handleElementsSelect} />
            </div>
            {whiteboardSteps.length > 1 && (
              <WhiteboardTimeline totalSteps={whiteboardSteps.length} currentStep={currentStepIndex} visibleStepIds={visibleStepIds} stepIds={whiteboardSteps.map((s) => s.id)} onSeek={seekToStep} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Tab = "human" | "ai";

export default function MentorPage() {
  const [tab, setTab] = useState<Tab>("human");

  return (
    <FeatureGate feature="Personal Coach" description="Your personal GMAT coach — analyses your performance and guides your study plan. Available on Athena Premium.">
      <div className="flex flex-col h-[calc(100dvh-64px)]">
        {/* Tab bar */}
        <div className="flex items-center gap-1 border-b px-4 pt-3 pb-0 shrink-0">
          <button
            onClick={() => setTab("human")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer -mb-px ${
              tab === "human"
                ? "border-athena-amber text-athena-amber"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <CalendarDays className="h-4 w-4" />
            Human Guide
          </button>
          <button
            onClick={() => setTab("ai")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer -mb-px ${
              tab === "ai"
                ? "border-athena-amber text-athena-amber"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Bot className="h-4 w-4" />
            Study Coach
          </button>
        </div>

        {/* Tab content */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          {tab === "human" ? <HumanGuideTab /> : <AiCoachTab />}
        </div>
      </div>
    </FeatureGate>
  );
}
