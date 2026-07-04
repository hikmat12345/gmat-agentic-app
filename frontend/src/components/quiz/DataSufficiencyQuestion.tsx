"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { MathContent } from "./math-content";
import { DS_OPTIONS, DS_OPTION_LABELS } from "@/types/full-gmat";

export type DSFeedbackState = {
  type: "correct" | "wrong";
  correctOption: number; // 0-4 index
};

type DataSufficiencyQuestionProps = {
  questionText: string;
  selectedOption: number | undefined;
  onSelect: (optionIndex: number) => void;
  feedbackState?: DSFeedbackState;
  disabled?: boolean;
  direction?: number;
};

/**
 * Renders a GMAT Data Sufficiency question.
 *
 * The answer choices are always the fixed GMAC A/B/C/D/E set from DS_OPTIONS.
 * The question's `options` array from the DB is ignored here — only
 * `questionText` matters. The correct answer is stored as an index 0-4.
 */
export function DataSufficiencyQuestion({
  questionText,
  selectedOption,
  onSelect,
  feedbackState,
  disabled,
  direction = 1,
}: DataSufficiencyQuestionProps) {
  return (
    <div className="space-y-6">
      {/* DS framing note */}
      <div className="rounded-md border border-muted bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
        <span className="font-semibold">Data Sufficiency:</span> Evaluate whether the statements
        provide sufficient information to answer the question. You do{" "}
        <span className="italic">not</span> need to solve for an exact value.
      </div>

      {/* Question stem */}
      <div className="text-sm leading-relaxed">
        <MathContent content={questionText} />
      </div>

      {/* Fixed A/B/C/D/E choices */}
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
          {DS_OPTIONS.map((optionText, i) => {
            const label = DS_OPTION_LABELS[i];
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
                  {label}
                </span>
                <span className="pt-0.5 text-sm leading-snug">{optionText}</span>
              </motion.button>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
