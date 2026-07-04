"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { MathContent } from "./math-content";

/** Table data embedded in question_text or passed as structured prop */
export type TableData = {
  headers: string[];
  rows: (string | number)[][];
};

export type TAFeedbackState = {
  type: "correct" | "wrong";
  correctOption: number;
};

type TableAnalysisQuestionProps = {
  tableData: TableData;
  questionText: string;
  options: string[];
  selectedOption: number | undefined;
  onSelect: (optionIndex: number) => void;
  feedbackState?: TAFeedbackState;
  disabled?: boolean;
  direction?: number;
};

/**
 * Renders a GMAT Table Analysis question.
 *
 * Layout:
 * - Top: interactive sortable table (click column headers to sort)
 * - Below: question + A/B/C/D/E choices
 */
export function TableAnalysisQuestion({
  tableData,
  questionText,
  options,
  selectedOption,
  onSelect,
  feedbackState,
  disabled,
  direction = 1,
}: TableAnalysisQuestionProps) {
  const [sortCol, setSortCol] = useState<number | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const sortedRows = useMemo(() => {
    if (sortCol === null) return tableData.rows;
    return [...tableData.rows].sort((a, b) => {
      const av = a[sortCol];
      const bv = b[sortCol];
      const cmp =
        typeof av === "number" && typeof bv === "number"
          ? av - bv
          : String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [tableData.rows, sortCol, sortDir]);

  function handleSort(colIdx: number) {
    if (sortCol === colIdx) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortCol(colIdx);
      setSortDir("asc");
    }
  }

  return (
    <div className="space-y-5">
      {/* Sortable table */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              {tableData.headers.map((header, colIdx) => (
                <th
                  key={colIdx}
                  onClick={() => handleSort(colIdx)}
                  className="cursor-pointer select-none px-4 py-2 text-left text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span className="flex items-center gap-1">
                    {header}
                    <ArrowUpDown
                      className={cn(
                        "h-3 w-3",
                        sortCol === colIdx ? "text-primary" : "text-muted-foreground/50"
                      )}
                    />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row, rowIdx) => (
              <tr key={rowIdx} className="border-t even:bg-muted/20">
                {row.map((cell, cellIdx) => (
                  <td key={cellIdx} className="px-4 py-2 leading-snug">
                    {String(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Question */}
      <div className="text-sm leading-relaxed">
        <MathContent content={questionText} />
      </div>

      {/* Answer choices */}
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
  );
}
