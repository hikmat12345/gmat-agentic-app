import { cn } from "@/lib/utils";

export type QuestionType =
  | "problem_solving"
  | "data_sufficiency"
  | "critical_reasoning"
  | "reading_comprehension"
  | "multi_source_reasoning"
  | "table_analysis"
  | "graphics_interpretation"
  | "two_part_analysis";

const TAG_CONFIG: Record<
  QuestionType,
  { abbr: string; label: string; cssVar: string }
> = {
  problem_solving:          { abbr: "PS",  label: "Problem Solving",          cssVar: "--qt-ps" },
  data_sufficiency:         { abbr: "DS",  label: "Data Sufficiency",         cssVar: "--qt-ds" },
  critical_reasoning:       { abbr: "CR",  label: "Critical Reasoning",       cssVar: "--qt-cr" },
  reading_comprehension:    { abbr: "RC",  label: "Reading Comprehension",    cssVar: "--qt-rc" },
  multi_source_reasoning:   { abbr: "MSR", label: "Multi-Source Reasoning",   cssVar: "--qt-msr" },
  table_analysis:           { abbr: "TA",  label: "Table Analysis",           cssVar: "--qt-ta" },
  graphics_interpretation:  { abbr: "GI",  label: "Graphics Interpretation",  cssVar: "--qt-gi" },
  two_part_analysis:        { abbr: "TPA", label: "Two-Part Analysis",        cssVar: "--qt-tpa" },
};

interface QuestionTypeTagProps {
  type: QuestionType;
  showLabel?: boolean;
  className?: string;
}

export function QuestionTypeTag({
  type,
  showLabel = false,
  className,
}: QuestionTypeTagProps) {
  const config = TAG_CONFIG[type];
  if (!config) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold leading-none",
        className
      )}
      style={{
        backgroundColor: `hsl(${`var(${config.cssVar})`} / 0.15)`,
        color: `hsl(var(${config.cssVar}))`,
        border: `1px solid hsl(${`var(${config.cssVar})`} / 0.3)`,
      }}
      title={config.label}
    >
      {showLabel ? config.label : config.abbr}
    </span>
  );
}

/** Convert a GMAT section name to its corresponding question types */
export function sectionToQuestionTypes(section: string): QuestionType[] {
  const s = section.toLowerCase();
  if (s.includes("verbal"))
    return ["critical_reasoning", "reading_comprehension"];
  if (s.includes("quant"))
    return ["problem_solving", "data_sufficiency"];
  if (s.includes("data"))
    return ["multi_source_reasoning", "table_analysis", "graphics_interpretation", "two_part_analysis"];
  return [];
}
