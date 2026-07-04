"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { MathContent } from "./math-content";
import type { GmatMsrSource } from "@/types/full-gmat";

export type MSRFeedbackState = {
  type: "correct" | "wrong";
  correctOption: number;
};

type MultiSourceReasoningQuestionProps = {
  sources: GmatMsrSource[];
  questionText: string;
  options: string[];
  selectedOption: number | undefined;
  onSelect: (optionIndex: number) => void;
  feedbackState?: MSRFeedbackState;
  disabled?: boolean;
  direction?: number;
};

/**
 * Renders a GMAT Multi-Source Reasoning question.
 *
 * Layout:
 * - Top: tab bar switching between sources (passages/tables)
 * - Below: question stem + A/B/C/D/E choices
 */
export function MultiSourceReasoningQuestion({
  sources,
  questionText,
  options,
  selectedOption,
  onSelect,
  feedbackState,
  disabled,
  direction = 1,
}: MultiSourceReasoningQuestionProps) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="flex h-full min-h-[460px] flex-col gap-4 overflow-hidden">
      {/* ── Source tabs ── */}
      <div className="flex flex-col overflow-hidden rounded-lg border">
        {/* Tab bar */}
        <div className="flex border-b bg-muted/30 overflow-x-auto">
          {sources.map((src, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={cn(
                "shrink-0 px-4 py-2 text-sm font-medium transition-colors",
                activeTab === idx
                  ? "border-b-2 border-primary text-primary bg-background"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {src.tabLabel}
            </button>
          ))}
        </div>

        {/* Source content */}
        <div className="h-48 overflow-y-auto p-4 text-sm leading-relaxed">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <MathContent content={sources[activeTab]?.content ?? ""} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── Question + choices ── */}
      <div className="space-y-4 overflow-y-auto">
        <div className="text-sm leading-relaxed">
          <MathContent content={questionText} />
        </div>

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={questionText}
            custom={direction}
            initial={{ opacity: 0, x: direction * 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-2"
          >
            {options.map((optText, i) => {
              const letter = String.fromCharCode(65 + i);
              const isSelected = selectedOption === i;
              const isCorrectFeedback =
                feedbackState?.type === "correct" && i === feedbackState.correctOption;
              const isWrongFeedback =
                feedbackState?.type === "wrong" && isSelected;

              return (
                <motion.button
                  key={i}
                  whileTap={!disabled ? { scale: 0.98 } : undefined}
                  onClick={() => !disabled && onSelect(i)}
                  disabled={disabled}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors",
                    !feedbackState && isSelected
                      ? "border-primary bg-primary/10"
                      : !feedbackState && !disabled
                        ? "hover:border-primary/50 hover:bg-accent/50"
                        : "",
                    isCorrectFeedback && "border-athena-success bg-athena-success/10",
                    isWrongFeedback && "border-destructive bg-destructive/10",
                    feedbackState && !isCorrectFeedback && !isWrongFeedback && "opacity-50",
                    disabled && "cursor-default"
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium",
                      !feedbackState && isSelected && "border-primary bg-primary text-primary-foreground",
                      isCorrectFeedback && "border-athena-success bg-athena-success text-white",
                      isWrongFeedback && "border-destructive bg-destructive text-white"
                    )}
                  >
                    {letter}
                  </span>
                  <span className="pt-0.5">
                    <MathContent content={optText} />
                  </span>
                </motion.button>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
