"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { MathContent } from "./math-content";

/**
 * TPA answer is a JSON string: '{"col1": <rowIndex>, "col2": <rowIndex>}'
 * Both columns must be selected before the answer can be submitted.
 */
export type TPASelection = { col1: number | null; col2: number | null };

export type TPAFeedbackState = {
  type: "correct" | "wrong";
  correctAnswer: TPASelection;
};

type TwoPartAnalysisQuestionProps = {
  questionText: string;
  options: string[]; // the rows (choices) shared by both columns
  col1Label: string;
  col2Label: string;
  selection: TPASelection;
  onSelect: (selection: TPASelection) => void;
  feedbackState?: TPAFeedbackState;
  disabled?: boolean;
};

/**
 * Renders a GMAT Two-Part Analysis question.
 *
 * Layout: a table where each row is an answer choice. Column 1 radio | Column 2 radio | Choice text.
 * Exactly one selection per column is required.
 *
 * The serialized answer stored in the DB is a JSON string:
 *   '{"col1": <rowIndex>, "col2": <rowIndex>}'
 */
export function TwoPartAnalysisQuestion({
  questionText,
  options,
  col1Label,
  col2Label,
  selection,
  onSelect,
  feedbackState,
  disabled,
}: TwoPartAnalysisQuestionProps) {
  const isRowCorrectInCol = (col: "col1" | "col2", rowIdx: number) => {
    if (!feedbackState) return false;
    return feedbackState.correctAnswer[col] === rowIdx;
  };

  const isRowWrongInCol = (col: "col1" | "col2", rowIdx: number) => {
    if (!feedbackState || feedbackState.type !== "wrong") return false;
    return selection[col] === rowIdx && feedbackState.correctAnswer[col] !== rowIdx;
  };

  return (
    <div className="space-y-4">
      <div className="text-sm leading-relaxed">
        <MathContent content={questionText} />
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 text-left">
              <th className="w-16 px-4 py-3 text-center text-xs font-semibold text-muted-foreground">
                {col1Label}
              </th>
              <th className="w-16 px-4 py-3 text-center text-xs font-semibold text-muted-foreground">
                {col2Label}
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                Answer Choice
              </th>
            </tr>
          </thead>
          <tbody>
            {options.map((optText, rowIdx) => {
              const col1Selected = selection.col1 === rowIdx;
              const col2Selected = selection.col2 === rowIdx;

              return (
                <tr key={rowIdx} className="border-t transition-colors hover:bg-muted/20">
                  {/* Column 1 radio */}
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => !disabled && onSelect({ ...selection, col1: rowIdx })}
                      disabled={disabled}
                      className={cn(
                        "h-5 w-5 rounded-full border-2 transition-colors",
                        col1Selected && !feedbackState && "border-primary bg-primary",
                        !col1Selected && !feedbackState && "border-muted-foreground hover:border-primary",
                        isRowCorrectInCol("col1", rowIdx) && "border-athena-success bg-athena-success",
                        isRowWrongInCol("col1", rowIdx) && "border-destructive bg-destructive",
                        col1Selected && feedbackState && !isRowCorrectInCol("col1", rowIdx) && !isRowWrongInCol("col1", rowIdx) && "border-muted-foreground",
                        disabled && "cursor-default"
                      )}
                    />
                  </td>

                  {/* Column 2 radio */}
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => !disabled && onSelect({ ...selection, col2: rowIdx })}
                      disabled={disabled}
                      className={cn(
                        "h-5 w-5 rounded-full border-2 transition-colors",
                        col2Selected && !feedbackState && "border-primary bg-primary",
                        !col2Selected && !feedbackState && "border-muted-foreground hover:border-primary",
                        isRowCorrectInCol("col2", rowIdx) && "border-athena-success bg-athena-success",
                        isRowWrongInCol("col2", rowIdx) && "border-destructive bg-destructive",
                        col2Selected && feedbackState && !isRowCorrectInCol("col2", rowIdx) && !isRowWrongInCol("col2", rowIdx) && "border-muted-foreground",
                        disabled && "cursor-default"
                      )}
                    />
                  </td>

                  {/* Answer choice text */}
                  <td className="px-4 py-3 leading-snug">
                    <MathContent content={optText} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Selection status */}
      <div className="flex gap-4 text-xs text-muted-foreground">
        <span>
          {col1Label}:{" "}
          <span className={cn(selection.col1 !== null ? "text-primary font-medium" : "")}>
            {selection.col1 !== null
              ? `Row ${selection.col1 + 1} selected`
              : "Not selected"}
          </span>
        </span>
        <span>
          {col2Label}:{" "}
          <span className={cn(selection.col2 !== null ? "text-primary font-medium" : "")}>
            {selection.col2 !== null
              ? `Row ${selection.col2 + 1} selected`
              : "Not selected"}
          </span>
        </span>
      </div>
    </div>
  );
}

/** Serialize TPA selection to the JSON string stored in selected_option */
export function serializeTPAAnswer(sel: TPASelection): string {
  return JSON.stringify({ col1: sel.col1, col2: sel.col2 });
}

/** Parse a stored JSON string back to TPASelection */
export function parseTPAAnswer(raw: string | null): TPASelection {
  if (!raw) return { col1: null, col2: null };
  try {
    const parsed = JSON.parse(raw);
    return {
      col1: typeof parsed.col1 === "number" ? parsed.col1 : null,
      col2: typeof parsed.col2 === "number" ? parsed.col2 : null,
    };
  } catch {
    return { col1: null, col2: null };
  }
}
