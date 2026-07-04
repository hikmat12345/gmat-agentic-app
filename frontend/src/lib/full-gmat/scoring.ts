/**
 * GMAT Focus Edition scoring: raw correct count → scaled score approximation.
 *
 * The real GMAT uses IRT (Item Response Theory) which requires per-item
 * difficulty parameters. We approximate using piecewise linear interpolation
 * calibrated against published GMAT Focus Edition score distributions.
 *
 * Section scores: 60–90 (integer, 1-point increments)
 * Total score:    205–805 (integer, rounded to nearest 10)
 */

// ── Percentile lookup table for display (approx., GMAT official data) ──

export const GMAT_PERCENTILE_TABLE: { score: number; percentile: number }[] = [
  { score: 805, percentile: 99 },
  { score: 765, percentile: 97 },
  { score: 745, percentile: 95 },
  { score: 725, percentile: 93 },
  { score: 705, percentile: 90 },
  { score: 685, percentile: 87 },
  { score: 665, percentile: 85 },
  { score: 645, percentile: 80 },
  { score: 625, percentile: 76 },
  { score: 605, percentile: 72 },
  { score: 585, percentile: 68 },
  { score: 565, percentile: 62 },
  { score: 545, percentile: 56 },
  { score: 525, percentile: 50 },
  { score: 505, percentile: 44 },
  { score: 485, percentile: 38 },
  { score: 465, percentile: 32 },
  { score: 445, percentile: 26 },
  { score: 425, percentile: 20 },
  { score: 405, percentile: 15 },
  { score: 385, percentile: 10 },
  { score: 355, percentile: 7 },
  { score: 315, percentile: 4 },
  { score: 275, percentile: 2 },
  { score: 205, percentile: 1 },
];

// ── Piecewise linear breakpoints: [accuracy_ratio, section_score] ──
// Calibrated to GMAT Focus Edition section score distributions (60-90 scale).
// A real test-taker's score depends on question difficulty selection (adaptive),
// so this is an approximation for a fixed-difficulty pool.

const SECTION_BREAKPOINTS: [number, number][] = [
  [0.00, 60],
  [0.10, 62],
  [0.20, 64],
  [0.30, 66],
  [0.43, 69],
  [0.55, 72],
  [0.65, 74],
  [0.72, 76],
  [0.78, 78],
  [0.83, 80],
  [0.87, 82],
  [0.91, 84],
  [0.94, 86],
  [0.96, 88],
  [0.98, 89],
  [1.00, 90],
];

function scaleSection(correct: number, total: number): number {
  if (total <= 0) return 60;
  const ratio = Math.max(0, Math.min(1, correct / total));

  for (let i = 1; i < SECTION_BREAKPOINTS.length; i++) {
    const [pLow, sLow] = SECTION_BREAKPOINTS[i - 1];
    const [pHigh, sHigh] = SECTION_BREAKPOINTS[i];
    if (ratio <= pHigh) {
      const t = (pHigh - pLow) > 0 ? (ratio - pLow) / (pHigh - pLow) : 0;
      return Math.round(sLow + t * (sHigh - sLow));
    }
  }
  return 90;
}

/** Scale Verbal Reasoning raw score (0-23) to 60-90. */
export function scaleVerbalScore(rawCorrect: number, totalQuestions = 23): number {
  return scaleSection(rawCorrect, totalQuestions);
}

/** Scale Quantitative Reasoning raw score (0-21) to 60-90. */
export function scaleQuantitativeScore(rawCorrect: number, totalQuestions = 21): number {
  return scaleSection(rawCorrect, totalQuestions);
}

/** Scale Data Insights raw score (0-20) to 60-90. */
export function scaleDataInsightsScore(rawCorrect: number, totalQuestions = 20): number {
  return scaleSection(rawCorrect, totalQuestions);
}

/**
 * Compute the full GMAT Focus Edition composite score.
 *
 * The official algorithm is proprietary; we approximate by mapping the
 * average section score (60-90) onto the 205-805 total scale, then
 * rounding to the nearest 10.
 */
export function computeFullGmatScore(
  verbalRaw: number,
  quantRaw: number,
  diRaw: number,
  verbalTotal = 23,
  quantTotal = 21,
  diTotal = 20,
): {
  verbalScaled: number;
  quantScaled: number;
  diScaled: number;
  total: number;
} {
  const verbalScaled = scaleSection(verbalRaw, verbalTotal);
  const quantScaled = scaleSection(quantRaw, quantTotal);
  const diScaled = scaleSection(diRaw, diTotal);

  // Map average section score (60-90) → total (205-805)
  // avg=60 → 205, avg=90 → 805
  const avgSection = (verbalScaled + quantScaled + diScaled) / 3;
  const normalized = (avgSection - 60) / 30; // 0 to 1
  const rawTotal = 205 + normalized * 600;    // 205 to 805

  // Round to nearest 10, clamp to official range
  const total = Math.max(205, Math.min(805, Math.round(rawTotal / 10) * 10));

  return { verbalScaled, quantScaled, diScaled, total };
}

/** Compute daily-quest GMAT section scores from accuracy ratios (0-1). */
export function computeGmatSectionFromAccuracy(accuracy: number): number {
  return scaleSection(accuracy * 100, 100);
}

/** Look up approx. percentile for a GMAT total score. */
export function getGmatPercentile(totalScore: number): number {
  for (const { score, percentile } of GMAT_PERCENTILE_TABLE) {
    if (totalScore >= score) return percentile;
  }
  return 1;
}
