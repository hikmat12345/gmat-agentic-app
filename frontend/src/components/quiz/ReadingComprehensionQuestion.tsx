"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { MathContent } from "./math-content";

export type RCFeedbackState = {
  type: "correct" | "wrong";
  correctOption: number;
};

type ReadingComprehensionQuestionProps = {
  passageText: string;
  questionText: string;
  options: string[];
  selectedOption: number | undefined;
  onSelect: (optionIndex: number) => void;
  feedbackState?: RCFeedbackState;
  disabled?: boolean;
  direction?: number;
};

/**
 * Renders a GMAT Reading Comprehension question with a split-pane layout:
 * - Left pane: scrollable passage
 * - Right pane: question + answer choices
 *
 * On small screens the passage stacks above the question.
 */
export function ReadingComprehensionQuestion({
  passageText,
  questionText,
  options,
  selectedOption,
  onSelect,
  feedbackState,
  disabled,
  direction = 1,
}: ReadingComprehensionQuestionProps) {
  return (
    <div className="flex h-full min-h-[420px] gap-4 overflow-hidden max-md:flex-col">
      {/* ── Left: passage pane ── */}
      <div className="flex w-full flex-col overflow-hidden rounded-lg border bg-muted/20 md:w-1/2">
        <div className="border-b px-4 py-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Reading Passage
          </span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 text-sm leading-relaxed">
          <MathContent content={passageText} />
        </div>
      </div>

      {/* ── Right: question + choices pane ── */}
      <div className="flex w-full flex-col gap-4 overflow-y-auto md:w-1/2">
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
            {options.map((optionText, i) => {
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
                    <MathContent content={optionText} />
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
