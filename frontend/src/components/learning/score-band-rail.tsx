"use client";

import { cn } from "@/lib/utils";

export const SCORE_BANDS = [
  { label: "sub-505", min: 205, max: 504, color: "oklch(0.65 0.05 260)" },
  { label: "505–555", min: 505, max: 554, color: "oklch(0.60 0.12 240)" },
  { label: "555–605", min: 555, max: 604, color: "oklch(0.65 0.14 175)" },
  { label: "605–655", min: 605, max: 654, color: "oklch(0.68 0.16 130)" },
  { label: "655–705", min: 655, max: 704, color: "oklch(0.72 0.17 80)" },
  { label: "705–805", min: 705, max: 805, color: "oklch(0.75 0.16 60)" },
] as const;

export type ScoreBand = (typeof SCORE_BANDS)[number]["label"] | null;

interface ScoreBandRailProps {
  currentScore?: number | null;
  activeBand: ScoreBand;
  onBandClick: (band: ScoreBand) => void;
}

function getBandForScore(score: number | null | undefined): ScoreBand {
  if (!score) return null;
  return (
    SCORE_BANDS.find((b) => score >= b.min && score <= b.max)?.label ?? null
  );
}

export function ScoreBandRail({
  currentScore,
  activeBand,
  onBandClick,
}: ScoreBandRailProps) {
  const userBand = getBandForScore(currentScore);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-semibold text-muted-foreground">
          Progress Roadmap
        </span>
        {currentScore && (
          <span className="text-xs text-muted-foreground">
            · Current: {currentScore}
          </span>
        )}
        {activeBand && (
          <button
            onClick={() => onBandClick(null)}
            className="ml-auto text-xs text-muted-foreground underline-offset-2 hover:underline"
          >
            Clear filter
          </button>
        )}
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {SCORE_BANDS.map((band) => {
          const isUserBand = band.label === userBand;
          const isActive = activeBand === band.label;

          return (
            <button
              key={band.label}
              onClick={() =>
                onBandClick(isActive ? null : band.label)
              }
              className={cn(
                "flex shrink-0 flex-col items-center gap-1 rounded-lg border px-3 py-2 text-xs font-medium transition-all",
                isActive
                  ? "border-transparent outline outline-2 outline-offset-0"
                  : "border-border/60 hover:border-border"
              )}
              style={
                isActive
                  ? {
                      backgroundColor: `${band.color}22`,
                      color: band.color,
                      outlineColor: band.color,
                    }
                  : {}
              }
            >
              {/* Color dot */}
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: band.color }}
              />
              <span
                className={cn(
                  "whitespace-nowrap",
                  isActive ? "" : "text-muted-foreground"
                )}
              >
                {band.label}
              </span>
              {isUserBand && (
                <span
                  className="rounded px-1 text-[9px] font-bold uppercase"
                  style={{
                    backgroundColor: `${band.color}22`,
                    color: band.color,
                  }}
                >
                  You
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
