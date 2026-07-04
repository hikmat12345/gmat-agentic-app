"use client";

export function WhiteboardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={className}
      style={{
        background: "var(--wb-canvas)",
        width: "100%",
        height: "100%",
      }}
    />
  );
}
