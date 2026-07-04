"use client";

type WbHighlightProps = {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  progress: number;
};

export function WbHighlight({ x, y, width, height, color, progress }: WbHighlightProps) {
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={Math.max(height, 40)}
      fill={color}
      fillOpacity={0.18}
      rx="8"
      style={{
        opacity: progress > 0 ? 1 : 0,
        transition: "opacity 0.3s",
      }}
    />
  );
}
