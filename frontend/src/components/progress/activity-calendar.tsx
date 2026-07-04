"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

type Day = {
  date: string;
  count: number;
};

type Props = {
  data: Day[];
};

function getIntensity(count: number): number {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 10) return 3;
  return 4;
}

const INTENSITY_CLASSES = [
  "bg-muted",
  "bg-primary/20",
  "bg-primary/40",
  "bg-primary/65",
  "bg-primary",
];

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export function ActivityCalendar({ data }: Props) {
  const { weeks, monthLabels } = useMemo(() => {
    const today = new Date();
    // Build 52 weeks of days ending today
    const days: { date: Date; count: number }[] = [];
    const countMap = new Map(data.map((d) => [d.date, d.count]));

    for (let i = 363; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push({ date: d, count: countMap.get(key) ?? 0 });
    }

    // Pad start so week starts on Sunday
    const startDay = days[0].date.getDay();
    const padded: ({ date: Date; count: number } | null)[] = [
      ...Array(startDay).fill(null),
      ...days,
    ];

    const weeks: ({ date: Date; count: number } | null)[][] = [];
    for (let i = 0; i < padded.length; i += 7) {
      weeks.push(padded.slice(i, i + 7));
    }

    // Month labels: find the first week each month appears
    const monthLabels: { label: string; col: number }[] = [];
    let lastMonth = -1;
    weeks.forEach((week, colIdx) => {
      const firstReal = week.find((d) => d !== null);
      if (firstReal) {
        const m = firstReal.date.getMonth();
        if (m !== lastMonth) {
          monthLabels.push({ label: MONTHS[m], col: colIdx });
          lastMonth = m;
        }
      }
    });

    return { weeks, monthLabels };
  }, [data]);

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">Study Activity (last 52 weeks)</p>
      <div className="overflow-x-auto pb-1">
        <div style={{ position: "relative", paddingTop: "18px" }}>
          {/* Month labels */}
          <div className="flex" style={{ marginLeft: "12px" }}>
            {monthLabels.map(({ label, col }) => (
              <div
                key={label + col}
                className="absolute text-[10px] text-muted-foreground"
                style={{ left: `${col * 13 + 12}px`, top: 0 }}
              >
                {label}
              </div>
            ))}
          </div>
          {/* Grid */}
          <div className="flex gap-[2px]">
            {/* Day labels */}
            <div className="flex flex-col gap-[2px] mr-1">
              {["S","M","T","W","T","F","S"].map((d, i) => (
                <div key={i} className="h-[11px] text-[9px] text-muted-foreground/60 leading-[11px]">
                  {i % 2 === 1 ? d : ""}
                </div>
              ))}
            </div>
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[2px]">
                {week.map((day, di) => {
                  if (!day) {
                    return <div key={di} className="h-[11px] w-[11px]" />;
                  }
                  const intensity = getIntensity(day.count);
                  return (
                    <div
                      key={di}
                      title={`${day.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}: ${day.count} quest${day.count !== 1 ? "s" : ""}`}
                      className={cn(
                        "h-[11px] w-[11px] rounded-sm transition-colors",
                        INTENSITY_CLASSES[intensity]
                      )}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Legend */}
      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
        <span>Less</span>
        {INTENSITY_CLASSES.map((cls, i) => (
          <div key={i} className={cn("h-[11px] w-[11px] rounded-sm", cls)} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
