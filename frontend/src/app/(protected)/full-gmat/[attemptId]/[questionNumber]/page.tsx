"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { useFullGmatContext } from "@/components/full-gmat/full-gmat-context";
import { Toolbar } from "@/components/quiz/toolbar";
import { SegmentProgressBar } from "@/components/quiz/segment-progress-bar";
import { AnswerPanel } from "@/components/quiz/answer-panel";
import { QuestionPanel } from "@/components/quiz/question-panel";
import { BottomBar } from "@/components/quiz/bottom-bar";
import { Calculator } from "@/components/quiz/calculator";
import { DataSufficiencyQuestion } from "@/components/quiz/DataSufficiencyQuestion";
import { ReadingComprehensionQuestion } from "@/components/quiz/ReadingComprehensionQuestion";
import {
  TwoPartAnalysisQuestion,
  serializeTPAAnswer,
  parseTPAAnswer,
} from "@/components/quiz/TwoPartAnalysisQuestion";
import { GraphicsInterpretationQuestion } from "@/components/quiz/GraphicsInterpretationQuestion";
import { MultiSourceReasoningQuestion } from "@/components/quiz/MultiSourceReasoningQuestion";
import { TableAnalysisQuestion } from "@/components/quiz/TableAnalysisQuestion";
import type { GmatMsrSource, GmatChartData } from "@/types/full-gmat";
import type { TableData } from "@/components/quiz/TableAnalysisQuestion";

function parseMsrSources(passageText: string | null | undefined): GmatMsrSource[] {
  if (!passageText) return [];
  try {
    const parsed = JSON.parse(passageText);
    if (Array.isArray(parsed)) return parsed as GmatMsrSource[];
  } catch {}
  return [{ tabLabel: "Source", content: passageText }];
}

function parseTableData(chartData: GmatChartData | null | undefined): TableData | null {
  if (!chartData) return null;
  // TA stores table as a special extension: { type: "table", headers: [...], rows: [...] }
  const raw = chartData as any;
  if (raw.type === "table" && Array.isArray(raw.headers) && Array.isArray(raw.rows)) {
    return { headers: raw.headers, rows: raw.rows };
  }
  return null;
}

export default function FullGmatQuestionPage() {
  const router = useRouter();
  const params = useParams<{ attemptId: string; questionNumber: string }>();
  const questionNum = Math.max(1, parseInt(params.questionNumber, 10) || 1);
  const ctx = useFullGmatContext();

  const [calcOpen, setCalcOpen] = useState(false);
  const [timerHidden, setTimerHidden] = useState(false);

  // Sync URL <-> currentIndex
  const syncedRef = useRef(false);
  useEffect(() => {
    if (!syncedRef.current) {
      syncedRef.current = true;
      const targetIndex = questionNum - 1;
      if (
        targetIndex !== ctx.currentIndex &&
        targetIndex >= 0 &&
        targetIndex < ctx.totalQuestions
      ) {
        ctx.goTo(targetIndex);
      }
      return;
    }
    router.push(`/full-gmat/${params.attemptId}/${ctx.currentIndex + 1}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx.currentIndex]);

  const currentProblem = ctx.currentProblem;
  if (!currentProblem) return null;

  const isLow = ctx.timeLeft < 300;
  const isQuantSection = ctx.currentSection === "quantitative";
  const questionType = currentProblem.questionType;

  const selectedOptionStr = ctx.answers.get(currentProblem.problemId) ?? null;
  const selectedOptionNum = selectedOptionStr != null ? parseInt(selectedOptionStr, 10) : undefined;

  function handleSelectNumeric(i: number) {
    ctx.handleSelectAnswer(currentProblem!.problemId, String(i));
  }

  const isLastInSection =
    ctx.sectionQuestionIndex === ctx.sectionTotalQuestions - 1;
  const isLastSection =
    ctx.sectionOrder.indexOf(ctx.currentSection) === ctx.sectionOrder.length - 1;

  function handleSubmitOrAdvance() {
    if (isLastInSection) {
      if (isLastSection) {
        ctx.submitTest();
      } else {
        ctx.finishSection();
      }
    } else {
      ctx.goNext();
    }
  }

  // Build a minimal Problem object for standard question types
  const asProblem = {
    id: currentProblem.problemId,
    orderIndex: currentProblem.orderIndex,
    difficulty: currentProblem.difficulty,
    questionText: currentProblem.questionText,
    options: currentProblem.options,
    correctOption: -1,
    explanation: "",
    solutionSteps: [],
    hint: "",
    detailedHint: undefined,
    timeRecommendationSeconds: 135,
  };

  // Determine TPA col labels from hint field (format: "Col1: ...|Col2: ...")
  function parseTPALabels(): { col1: string; col2: string } {
    const hint = currentProblem?.hint ?? "";
    const match = hint.match(/Col1:\s*(.+?)\|Col2:\s*(.+)/i);
    if (match) return { col1: match[1].trim(), col2: match[2].trim() };
    return { col1: "Column 1", col2: "Column 2" };
  }

  function renderQuestionContent() {
    if (!currentProblem) return null;
    switch (questionType) {
      case "data_sufficiency":
        return (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mb-4">
              <span className="text-sm font-medium text-muted-foreground">
                Question {ctx.sectionQuestionIndex + 1}
              </span>
            </div>
            <DataSufficiencyQuestion
              questionText={currentProblem.questionText}
              selectedOption={selectedOptionNum}
              onSelect={handleSelectNumeric}
              disabled={false}
              direction={ctx.direction}
            />
          </div>
        );

      case "reading_comprehension":
        return (
          <div className="flex flex-1 overflow-hidden p-4">
            <ReadingComprehensionQuestion
              passageText={currentProblem.passageText ?? ""}
              questionText={currentProblem.questionText}
              options={currentProblem.options}
              selectedOption={selectedOptionNum}
              onSelect={handleSelectNumeric}
              disabled={false}
              direction={ctx.direction}
            />
          </div>
        );

      case "two_part_analysis": {
        const { col1, col2 } = parseTPALabels();
        const tpaSelection = parseTPAAnswer(selectedOptionStr);
        return (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mb-4">
              <span className="text-sm font-medium text-muted-foreground">
                Question {ctx.sectionQuestionIndex + 1}
              </span>
            </div>
            <TwoPartAnalysisQuestion
              questionText={currentProblem.questionText}
              options={currentProblem.options}
              col1Label={col1}
              col2Label={col2}
              selection={tpaSelection}
              onSelect={(sel) => {
                if (sel.col1 !== null && sel.col2 !== null) {
                  ctx.handleSelectAnswer(
                    currentProblem.problemId,
                    serializeTPAAnswer(sel)
                  );
                }
              }}
              disabled={false}
            />
          </div>
        );
      }

      case "graphics_interpretation":
        if (!currentProblem.chartData) {
          // Fallback if chartData is missing
          return renderStandardLayout();
        }
        return (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mb-4">
              <span className="text-sm font-medium text-muted-foreground">
                Question {ctx.sectionQuestionIndex + 1}
              </span>
            </div>
            <GraphicsInterpretationQuestion
              questionText={currentProblem.questionText}
              options={currentProblem.options}
              chartData={currentProblem.chartData}
              selectedOption={selectedOptionNum}
              onSelect={handleSelectNumeric}
              disabled={false}
              direction={ctx.direction}
            />
          </div>
        );

      case "multi_source_reasoning": {
        const sources = parseMsrSources(currentProblem.passageText);
        return (
          <div className="flex-1 overflow-y-auto p-4">
            <MultiSourceReasoningQuestion
              sources={sources}
              questionText={currentProblem.questionText}
              options={currentProblem.options}
              selectedOption={selectedOptionNum}
              onSelect={handleSelectNumeric}
              disabled={false}
              direction={ctx.direction}
            />
          </div>
        );
      }

      case "table_analysis": {
        const tableData = parseTableData(currentProblem.chartData);
        if (!tableData) return renderStandardLayout();
        return (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mb-4">
              <span className="text-sm font-medium text-muted-foreground">
                Question {ctx.sectionQuestionIndex + 1}
              </span>
            </div>
            <TableAnalysisQuestion
              tableData={tableData}
              questionText={currentProblem.questionText}
              options={currentProblem.options}
              selectedOption={selectedOptionNum}
              onSelect={handleSelectNumeric}
              disabled={false}
              direction={ctx.direction}
            />
          </div>
        );
      }

      default:
        return renderStandardLayout();
    }
  }

  function renderStandardLayout() {
    return (
      <>
        <QuestionPanel
          problem={asProblem}
          questionNumber={ctx.sectionQuestionIndex + 1}
        />
        <AnswerPanel
          problem={asProblem}
          questionNumber={ctx.sectionQuestionIndex + 1}
          selectedOption={selectedOptionNum}
          isMarked={false}
          onSelect={handleSelectNumeric}
          onToggleMark={() => {}}
          direction={ctx.direction}
          disabled={false}
          showMark={false}
        />
      </>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <Toolbar
        displayTime={ctx.displayTime}
        isLow={isLow}
        timerHidden={timerHidden}
        onToggleTimer={() => setTimerHidden((h) => !h)}
        calcOpen={calcOpen}
        onToggleCalc={() => setCalcOpen((o) => !o)}
        onClose={() => router.push("/full-gmat")}
        hasAnswers={ctx.answeredCount > 0}
        subtopicName={ctx.sectionLabel}
        showCalc={isQuantSection || ctx.currentSection === "data_insights"}
        title="GMAT Focus Edition"
      />

      <SegmentProgressBar
        total={ctx.sectionTotalQuestions}
        currentIndex={ctx.sectionQuestionIndex}
        getStatus={(i) => ctx.getQuestionStatus(i + ctx.sectionStartIndex)}
        onNavigate={() => {}}
      />

      {/* Section label */}
      <div className="flex items-center gap-2 border-b border-border/50 px-4 py-1.5">
        <span className="text-xs font-semibold text-muted-foreground">
          {ctx.sectionLabel}
        </span>
        <span className="ml-auto text-xs text-muted-foreground">
          Q{ctx.sectionQuestionIndex + 1} of {ctx.sectionTotalQuestions}
          {questionType && (
            <>
              {" "}
              &middot;{" "}
              <span className="capitalize">
                {questionType.replace(/_/g, " ")}
              </span>
            </>
          )}
        </span>
      </div>

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {questionType === "reading_comprehension" ||
        questionType === "multi_source_reasoning" ? (
          // Full-width for split-pane layouts
          <div className="flex w-full flex-col overflow-hidden">
            {renderQuestionContent()}
          </div>
        ) : (
          // Standard two-column layout for non-split types
          <div className="flex w-full flex-col md:flex-row md:divide-x">
            {renderQuestionContent()}
          </div>
        )}
      </div>

      <BottomBar
        currentIndex={ctx.sectionQuestionIndex}
        total={ctx.sectionTotalQuestions}
        unansweredCount={
          Array.from({ length: ctx.sectionTotalQuestions }, (_, i) =>
            ctx.getQuestionStatus(i + ctx.sectionStartIndex)
          ).filter((s) => s === "unanswered").length
        }
        onBack={() => {
          if (ctx.sectionQuestionIndex > 0) ctx.goBack();
        }}
        onNext={() => {
          if (ctx.sectionQuestionIndex < ctx.sectionTotalQuestions - 1) ctx.goNext();
        }}
        onGoTo={(i) => ctx.goTo(i + ctx.sectionStartIndex)}
        onSubmit={handleSubmitOrAdvance}
        getStatus={(i) => ctx.getQuestionStatus(i + ctx.sectionStartIndex)}
        sequential={false}
        nextDisabled={false}
      />

      <AnimatePresence>
        {calcOpen && (isQuantSection || ctx.currentSection === "data_insights") && (
          <Calculator />
        )}
      </AnimatePresence>
    </div>
  );
}
