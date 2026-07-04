"use client";

import {
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion } from "framer-motion";
import { ObservationOrb } from "@/components/learning/observation/observation-orb";
import { MathContent } from "@/components/quiz/math-content";
import { useOrbPresence, type OrbMode, type OrbPoint } from "@/hooks/use-orb-presence";
import type { StepFocus, OrbSpotlight } from "@/components/whiteboard/pen-tip";

interface PresenceLayerProps {
  orbState: "idle" | "thinking" | "speaking" | "listening";
  amplitude: number;
  size: number;
  /** Caption text (LaTeX-aware). Null/empty hides the pill. */
  captionText: string | null;
  mode: OrbMode;
  /** Resting orb-center position in presence-layer px. */
  restAnchor: OrbPoint;
  /** Pen-tip in client px (draw mode) — published by the whiteboard canvas. */
  penClientRef?: RefObject<OrbPoint | null>;
  /** Current step location (rest mode) — published by the whiteboard canvas. */
  stepFocusRef?: RefObject<StepFocus | null>;
  /** Spotlight on a shape part (rest mode) — published by the whiteboard canvas. */
  spotlightRef?: RefObject<OrbSpotlight | null>;
  dockAnchor?: OrbPoint | null;
  dockTargetRef?: RefObject<HTMLElement | null>;
  reducedMotion?: boolean;
  /** Hide the caption (e.g. during fast draw motion). */
  suppressCaption?: boolean;
}

/**
 * The roaming tutor-orb layer. Sits as an absolute-inset-0 sibling over the
 * whiteboard canvas region and floats the orb (+ its caption) to a
 * spring-smoothed target resolved by useOrbPresence.
 */
export function PresenceLayer({
  orbState,
  amplitude,
  size,
  captionText,
  mode,
  restAnchor,
  penClientRef,
  stepFocusRef,
  spotlightRef,
  dockAnchor,
  dockTargetRef,
  reducedMotion,
  suppressCaption,
}: PresenceLayerProps) {
  const layerRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();
  const dragRef = useRef<OrbPoint | null>(null);
  const { x, y, captionAbove, movement, spotlightX, spotlightY, spotlightOn } = useOrbPresence({
    enabled: true,
    mode,
    restAnchor,
    penClientRef,
    stepFocusRef,
    spotlightRef,
    dockAnchor,
    dockTargetRef,
    dragTargetRef: dragRef,
    layerRef,
    cursorAttract: false,
    reducedMotion: reducedMotion ?? prefersReduced ?? false,
  });

  // Drag-to-reposition
  const dragState = useRef<{ startX: number; startY: number; moved: boolean } | null>(null);
  const justDragged = useRef(false);
  const onOrbPointerDown = (e: ReactPointerEvent) => {
    dragState.current = { startX: e.clientX, startY: e.clientY, moved: false };
  };
  const onOrbPointerMove = (e: ReactPointerEvent) => {
    const ds = dragState.current;
    const layer = layerRef.current;
    if (!ds || !layer) return;
    if (e.buttons === 0) {
      dragState.current = null;
      try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch { /* not captured */ }
      return;
    }
    if (!ds.moved && Math.hypot(e.clientX - ds.startX, e.clientY - ds.startY) > 5) {
      ds.moved = true;
      try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); } catch { /* capture unavailable */ }
    }
    if (ds.moved) {
      const rect = layer.getBoundingClientRect();
      dragRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
  };
  const onOrbPointerUp = (e: ReactPointerEvent) => {
    if (dragState.current?.moved) justDragged.current = true;
    dragState.current = null;
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch { /* pointer already released */ }
  };
  const onOrbClickCapture = (e: ReactMouseEvent) => {
    if (justDragged.current) {
      justDragged.current = false;
      e.stopPropagation();
      e.preventDefault();
    }
  };

  const text = (captionText ?? "").trim();
  const showCaption = !suppressCaption && !!text;

  const [capAbove, setCapAbove] = useState(false);
  useMotionValueEvent(captionAbove, "change", (v) => setCapAbove(!!v));

  const [moveDir, setMoveDir] = useState<"left" | "right" | null>(null);
  useMotionValueEvent(movement, "change", (m) => setMoveDir(m === "none" ? null : m));

  const [spotOn, setSpotOn] = useState(false);
  useMotionValueEvent(spotlightOn, "change", (v) => setSpotOn(!!v));

  return (
    <div
      ref={layerRef}
      data-orb-layer
      data-orb-mode={mode}
      className="pointer-events-none absolute inset-0 z-20 overflow-hidden"
    >
      {/* Spotlight pulse — an expanding ring at the exact shape part the orb is pointing at. */}
      {spotOn && (
        <motion.div
          data-orb-pulse
          className="absolute top-0 left-0"
          style={{ x: spotlightX, y: spotlightY }}
        >
          <motion.span
            className="absolute block rounded-full"
            style={{
              width: 64,
              height: 64,
              marginLeft: -32,
              marginTop: -32,
              border: "2px solid var(--obs-glow-mid)",
            }}
            initial={{ scale: 0.4, opacity: 0.7 }}
            animate={{ scale: 1.6, opacity: 0 }}
            transition={{ repeat: Infinity, duration: 1.4, ease: "easeOut" }}
          />
          <span
            className="absolute block rounded-full"
            style={{
              width: 10,
              height: 10,
              marginLeft: -5,
              marginTop: -5,
              background: "var(--obs-glow-mid)",
              boxShadow: "0 0 8px var(--obs-glow-mid)",
            }}
          />
        </motion.div>
      )}

      <motion.div
        data-orb
        className="absolute top-0 left-0"
        style={{
          x,
          y,
          marginLeft: -size / 2,
          marginTop: -size / 2,
          width: size,
        }}
      >
        {/* Re-enable pointer events on the orb so dragging repositions it. */}
        <div
          className="pointer-events-auto"
          style={{ width: size, height: size, cursor: "grab", touchAction: "none" }}
          onPointerDown={onOrbPointerDown}
          onPointerMove={onOrbPointerMove}
          onPointerUp={onOrbPointerUp}
          onPointerCancel={onOrbPointerUp}
          onClickCapture={onOrbClickCapture}
        >
          <ObservationOrb state={orbState} amplitude={amplitude} size={size} movement={moveDir} />
        </div>

        {/* Caption rides to the SIDE of the orb (vertically centered). */}
        <div
          className={`absolute flex ${capAbove ? "justify-start" : "justify-end"}`}
          style={{
            top: size / 2,
            transform: "translateY(-50%)",
            width: 340,
            ...(capAbove ? { left: size + 8 } : { right: size + 8 }),
          }}
        >
          <AnimatePresence mode="wait">
            {showCaption && (
              <motion.div
                key={text}
                initial={{ opacity: 0, x: capAbove ? -4 : 4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: capAbove ? -4 : 4 }}
                transition={{ duration: 0.25 }}
                className={`max-w-[340px] rounded-xl border border-white/5 px-4 py-2 ${capAbove ? "text-left" : "text-right"} text-sm leading-snug text-[var(--obs-fg)] shadow-lg shadow-black/10 backdrop-blur-md`}
                style={{
                  background: "color-mix(in oklch, var(--obs-surface) 70%, transparent)",
                }}
              >
                <MathContent content={text} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
