"use client";

import { useEffect, useRef, type RefObject } from "react";
import { useMotionValue, useSpring, useAnimationFrame, type MotionValue } from "framer-motion";
import { boardToClient, type StepFocus, type OrbSpotlight } from "@/components/whiteboard/pen-tip";

/**
 * Drives the roaming tutor orb on the whiteboard canvas.
 *
 * All positions are in **pixels relative to the presence layer** (the
 * absolute-inset-0 box that sits over the whiteboard canvas region). The
 * caller resolves anchors from DOM rects (getBoundingClientRect) and the
 * canvas coordinate space; this hook only turns a per-frame *target* into a
 * spring-smoothed position.
 *
 * Modes:
 *  - rest : orb idles beside the current step, switching sides periodically.
 *  - draw : orb tracks the pen-tip of the diagram being drawn.
 *  - dock : orb flies to a dock anchor (e.g. Extra Help panel).
 */
export type OrbMode = "rest" | "draw" | "dock";

export interface OrbPoint {
  x: number;
  y: number;
}

export interface UseOrbPresenceArgs {
  /** Flag gate — when false the hook is inert (no frame loop side effects). */
  enabled: boolean;
  mode: OrbMode;
  /** Resting position (orb center) in presence-layer px. */
  restAnchor: OrbPoint;
  /**
   * Pen-tip in **client (viewport) px**, published by the whiteboard canvas
   * each frame (draw mode). Converted to layer-local px here. Read from a ref
   * so per-frame updates never re-render.
   */
  penClientRef?: RefObject<OrbPoint | null>;
  /**
   * Current step location (rest mode). When present, the orb hovers beside
   * the latest content — to one side, switching sides periodically.
   * Read from a ref; re-measured each frame so it tracks the board as it scrolls.
   */
  stepFocusRef?: RefObject<StepFocus | null>;
  /**
   * Spotlight on a part of a drawn shape (rest mode). When present the orb
   * walks to the standoff just outside the part. Takes priority over the
   * step-side anchor, but an active drag wins.
   */
  spotlightRef?: RefObject<OrbSpotlight | null>;
  /**
   * Manual drag position (rest mode, layer-local px). When the user drags the
   * orb, it parks here until the next natural reposition.
   */
  dragTargetRef?: RefObject<OrbPoint | null>;
  /** Dock target in presence-layer px (dock mode); fallback if no ref. */
  dockAnchor?: OrbPoint | null;
  /**
   * Element to dock to in dock mode. Measured each frame; the orb parks at
   * its top-center. Falls back to `dockAnchor` then `restAnchor` when absent.
   */
  dockTargetRef?: RefObject<HTMLElement | null>;
  /**
   * The presence-layer element. Used to convert the global cursor position
   * into layer-local px for the rest-mode attraction/repulsion force.
   */
  layerRef?: RefObject<HTMLElement | null>;
  /** Enable rest-mode cursor attraction/avoidance. */
  cursorAttract?: boolean;
  /** When true, collapse spring motion (prefers-reduced-motion). */
  reducedMotion?: boolean;
}

export interface OrbPresence {
  x: MotionValue<number>;
  y: MotionValue<number>;
  vx: MotionValue<number>;
  moving: MotionValue<boolean>;
  /** True when the caption should render ABOVE the orb. */
  captionAbove: MotionValue<boolean>;
  /**
   * Walk direction: "left" | "right" while travelling, "none" at rest.
   */
  movement: MotionValue<"left" | "right" | "none">;
  /** Spotlight pulse position (layer px) + on/off. */
  spotlightX: MotionValue<number>;
  spotlightY: MotionValue<number>;
  spotlightOn: MotionValue<boolean>;
}

const REST_SPRING = { stiffness: 240, damping: 20, mass: 0.7 } as const;
const DRAW_SPRING = { stiffness: 260, damping: 28, mass: 0.6 } as const;

const DRAW_OFFSET = { x: 10, y: -12 } as const;

const PEN_LEAD_MS = 95;
const PEN_LEAD_MAX = 48;

const FLOAT_AMP_REST = 9;
const FLOAT_AMP_DRAW = 4;

const READING_BUBBLE = 150;
const ATTRACT_RANGE = 520;
const ATTRACT_GAIN = 0.18;
const REPEL_GAIN = 1.0;
const MOVING_EPS = 0.6;
const DIR_THRESHOLD = 0.8;
const CLAMP_MARGIN = 56;
const SIDE_PERIOD = 11000;
const DOCK_GAP = 64;
const STEP_INSET_MIN = 96;
const STEP_INSET_FRAC = 0.16;
const STEP_V_GAP = 30;
const MAX_STEP_W = 480;
const MAX_STEP_H = 260;

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

function cursorForce(anchor: OrbPoint, cursor: OrbPoint | null | undefined): OrbPoint {
  if (!cursor) return anchor;
  const dx = anchor.x - cursor.x;
  const dy = anchor.y - cursor.y;
  const dist = Math.hypot(dx, dy) || 0.0001;
  const ux = dx / dist;
  const uy = dy / dist;

  if (dist < READING_BUBBLE) {
    const push = (READING_BUBBLE - dist) * REPEL_GAIN;
    return { x: anchor.x + ux * push, y: anchor.y + uy * push };
  }

  if (dist < ATTRACT_RANGE) {
    const targetDist = READING_BUBBLE + 60;
    const pull = (dist - targetDist) * ATTRACT_GAIN;
    return { x: anchor.x - ux * pull, y: anchor.y - uy * pull };
  }

  return anchor;
}

function resolveTarget(
  a: UseOrbPresenceArgs,
  restAnchor: OrbPoint,
  cursor: OrbPoint | null,
  dockPoint: OrbPoint | null,
  penPoint: OrbPoint | null,
): OrbPoint {
  switch (a.mode) {
    case "draw":
      return penPoint ?? restAnchor;
    case "dock":
      return dockPoint ?? a.dockAnchor ?? restAnchor;
    case "rest":
    default:
      return a.cursorAttract ? cursorForce(restAnchor, cursor) : restAnchor;
  }
}

function stepSideAnchor(
  focus: StepFocus,
  layerRect: DOMRect,
  onLeft: boolean,
): OrbPoint | null {
  const tl = boardToClient(
    { x: focus.box.x, y: focus.box.y },
    focus.svg,
    focus.viewBoxWidth,
    focus.viewBoxHeight,
  );
  const br = boardToClient(
    { x: focus.box.x + focus.box.width, y: focus.box.y + focus.box.height },
    focus.svg,
    focus.viewBoxWidth,
    focus.viewBoxHeight,
  );
  const left = tl.x - layerRect.left;
  const top = tl.y - layerRect.top;
  const right = Math.min(br.x - layerRect.left, left + MAX_STEP_W);
  const bottom = Math.min(br.y - layerRect.top, top + MAX_STEP_H);
  const inset = Math.max(STEP_INSET_MIN, (right - left) * STEP_INSET_FRAC);
  return {
    x: onLeft ? left + inset : right - inset,
    y: onLeft ? top - STEP_V_GAP : bottom + STEP_V_GAP,
  };
}

export function useOrbPresence(args: UseOrbPresenceArgs): OrbPresence {
  const argsRef = useRef(args);
  useEffect(() => {
    argsRef.current = args;
  });

  const tx = useMotionValue(args.restAnchor.x);
  const ty = useMotionValue(args.restAnchor.y);

  const restSpring = args.reducedMotion ? { stiffness: 500, damping: 50, mass: 1 } : REST_SPRING;
  const x = useSpring(tx, restSpring);
  const y = useSpring(ty, restSpring);

  const vx = useMotionValue(0);
  const moving = useMotionValue(false);
  const captionAbove = useMotionValue(false);
  const movement = useMotionValue<"left" | "right" | "none">("none");
  const lastDir = useRef<"left" | "right">("right");
  const spotlightX = useMotionValue(0);
  const spotlightY = useMotionValue(0);
  const spotlightOn = useMotionValue(false);
  const dragPhase = useRef<number | null>(null);

  const prev = useRef<OrbPoint>({ x: args.restAnchor.x, y: args.restAnchor.y });
  const penPrev = useRef<{ x: number; y: number; t: number } | null>(null);

  const clientCursor = useRef<{ x: number; y: number } | null>(null);
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      clientCursor.current = { x: e.clientX, y: e.clientY };
    };
    const onLeave = () => {
      clientCursor.current = null;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  useAnimationFrame((t) => {
    const a = argsRef.current;
    if (!a.enabled) return;

    let cursor: OrbPoint | null = null;
    const rect = a.layerRef?.current?.getBoundingClientRect();
    if (a.mode === "rest" && a.cursorAttract && clientCursor.current && rect) {
      cursor = {
        x: clientCursor.current.x - rect.left,
        y: clientCursor.current.y - rect.top,
      };
    }

    let dockPoint: OrbPoint | null = null;
    if (a.mode === "dock" && a.dockTargetRef?.current && rect) {
      const d = a.dockTargetRef.current.getBoundingClientRect();
      dockPoint = {
        x: d.left - rect.left - DOCK_GAP,
        y: d.top - rect.top + 64,
      };
    }

    let penPoint: OrbPoint | null = null;
    if (a.mode === "draw" && a.penClientRef?.current && rect) {
      const pc = a.penClientRef.current;
      let leadX = 0;
      let leadY = 0;
      const p = penPrev.current;
      if (p && t > p.t) {
        const dt = t - p.t;
        leadX = clamp(((pc.x - p.x) / dt) * PEN_LEAD_MS, -PEN_LEAD_MAX, PEN_LEAD_MAX);
        leadY = clamp(((pc.y - p.y) / dt) * PEN_LEAD_MS, -PEN_LEAD_MAX, PEN_LEAD_MAX);
      }
      penPrev.current = { x: pc.x, y: pc.y, t };
      penPoint = {
        x: pc.x - rect.left + DRAW_OFFSET.x + leadX,
        y: pc.y - rect.top + DRAW_OFFSET.y + leadY,
      };
    } else {
      penPrev.current = null;
    }

    const phase = Math.floor(t / SIDE_PERIOD);
    let restAnchor = a.restAnchor;
    let capAbove = false;
    const focus = a.stepFocusRef?.current;
    if (a.mode === "rest" && focus && focus.svg.isConnected && rect) {
      const onLeft = phase % 2 === 0;
      const beside = stepSideAnchor(focus, rect, onLeft);
      if (beside) {
        restAnchor = beside;
        capAbove = onLeft;
      }
    }

    let spotOn = false;
    const sp = a.spotlightRef?.current;
    if (a.mode === "rest" && sp && sp.svg.isConnected && rect) {
      const a2c = boardToClient(sp.anchor, sp.svg, sp.viewBoxWidth, sp.viewBoxHeight);
      const p2c = boardToClient(sp.point, sp.svg, sp.viewBoxWidth, sp.viewBoxHeight);
      restAnchor = { x: a2c.x - rect.left, y: a2c.y - rect.top };
      spotlightX.set(p2c.x - rect.left);
      spotlightY.set(p2c.y - rect.top);
      capAbove = a2c.x >= p2c.x;
      spotOn = true;
    }

    const drag = a.dragTargetRef?.current ?? null;
    if (a.mode === "rest" && drag) {
      if (dragPhase.current === null) dragPhase.current = phase;
      if (phase !== dragPhase.current) {
        if (a.dragTargetRef) a.dragTargetRef.current = null;
        dragPhase.current = null;
      } else {
        restAnchor = drag;
        spotOn = false;
      }
    } else {
      if (a.mode !== "rest" && a.dragTargetRef?.current) a.dragTargetRef.current = null;
      dragPhase.current = null;
    }

    if (captionAbove.get() !== capAbove) captionAbove.set(capAbove);
    if (spotlightOn.get() !== spotOn) spotlightOn.set(spotOn);

    const resolved = resolveTarget(a, restAnchor, cursor, dockPoint, penPoint);
    const target = { x: resolved.x, y: resolved.y };

    if (!a.reducedMotion) {
      const amp = a.mode === "draw" ? FLOAT_AMP_DRAW : FLOAT_AMP_REST;
      target.x += Math.sin(t / 820) * amp;
      target.y += Math.sin(t / 1100 + 1.3) * amp * 0.8;
    }

    if (rect && rect.width > 0) {
      target.x = clamp(target.x, CLAMP_MARGIN, rect.width - CLAMP_MARGIN);
      target.y = clamp(target.y, CLAMP_MARGIN, rect.height - CLAMP_MARGIN);
    }

    tx.set(target.x);
    ty.set(target.y);

    const cx = x.get();
    const cy = y.get();
    const ddx = cx - prev.current.x;
    const ddy = cy - prev.current.y;
    vx.set(ddx);
    const isMoving = Math.hypot(ddx, ddy) > MOVING_EPS;
    moving.set(isMoving);

    if (isMoving) {
      if (ddx > DIR_THRESHOLD) lastDir.current = "right";
      else if (ddx < -DIR_THRESHOLD) lastDir.current = "left";
      if (movement.get() !== lastDir.current) movement.set(lastDir.current);
    } else if (movement.get() !== "none") {
      movement.set("none");
    }
    prev.current = { x: cx, y: cy };
  });

  return { x, y, vx, moving, captionAbove, movement, spotlightX, spotlightY, spotlightOn };
}

export const ORB_PRESENCE_CONSTANTS = {
  READING_BUBBLE,
  ATTRACT_RANGE,
  REST_SPRING,
  DRAW_SPRING,
};
