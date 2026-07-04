import {
  Variable,
  Triangle,
  BarChart3,
  Sigma,
  Calculator,
  Compass,
  PieChart,
  TrendingUp,
  BookOpen,
  Layers,
  PenTool,
  CheckSquare,
  Brain,
  Table2,
  ScatterChart,
  SplitSquareHorizontal,
  type LucideIcon,
} from "lucide-react";

const slugToIcon: Record<string, LucideIcon> = {
  // Math (legacy SAT)
  algebra: Variable,
  geometry: Triangle,
  statistics: BarChart3,
  "advanced-math": Sigma,
  trigonometry: Compass,
  "data-analysis": PieChart,
  "linear-equations": TrendingUp,
  // Reading & Writing (legacy SAT)
  "information-and-ideas": BookOpen,
  "craft-and-structure": Layers,
  "expression-of-ideas": PenTool,
  "standard-english-conventions": CheckSquare,
  // GMAT Verbal
  "critical-reasoning": Brain,
  "reading-comprehension": BookOpen,
  // GMAT Quantitative
  "problem-solving": Calculator,
  // GMAT Data Insights
  "data-sufficiency": Layers,
  "multi-source-reasoning": SplitSquareHorizontal,
  "table-analysis": Table2,
  "graphics-interpretation": ScatterChart,
  "two-part-analysis": CheckSquare,
};

const fallbackIcon = Calculator;

export function getTopicIcon(slug: string): LucideIcon {
  return slugToIcon[slug] ?? fallbackIcon;
}
