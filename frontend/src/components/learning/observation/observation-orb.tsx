"use client";

import {
  animate,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { useEffect, useRef } from "react";
import PixelCharacter from "@/components/shared/PixelCharacter";

type OrbState = "idle" | "thinking" | "speaking" | "listening";

type Props = {
  state: OrbState;
  amplitude?: number;
  size?: number;
  /** Walk direction while roaming; null = idle gesture. */
  movement?: "left" | "right" | null;
};

const PARALLAX_MAX = 18;
const HIGHLIGHT_MAX = 14;

export function ObservationOrb({ state, amplitude = 0, size = 140, movement = null }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isActive = state === "speaking" || state === "listening";
  const haloScale = isActive ? 1 + amplitude * 0.35 : 1;
  const coreScale = state === "idle"
    ? [1, 1.025, 1]
    : state === "thinking"
      ? [1, 1.05, 1]
      : 1 + amplitude * 0.08;

  // Mouse parallax — subtle drift of halos/core when cursor moves
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 80, damping: 20, mass: 0.6 });
  const sy = useSpring(py, { stiffness: 80, damping: 20, mass: 0.6 });

  // Hue cycle — stays in blue-indigo range matching the pixel character's robe
  const hue = useMotionValue(245);
  useEffect(() => {
    const controls = animate(hue, [232, 245, 260, 245, 232], {
      duration: 18,
      repeat: Infinity,
      ease: "easeInOut",
    });
    return () => controls.stop();
  }, [hue]);

  const haloX = useTransform(sx, (v) => v * PARALLAX_MAX);
  const haloY = useTransform(sy, (v) => v * PARALLAX_MAX);
  const midHaloX = useTransform(sx, (v) => v * PARALLAX_MAX * 0.7);
  const midHaloY = useTransform(sy, (v) => v * PARALLAX_MAX * 0.7);
  const coreX = useTransform(sx, (v) => v * PARALLAX_MAX * 0.5);
  const coreY = useTransform(sy, (v) => v * PARALLAX_MAX * 0.5);
  const highlightX = useTransform(sx, (v) => 32 + v * HIGHLIGHT_MAX);
  const highlightY = useTransform(sy, (v) => 30 + v * HIGHLIGHT_MAX);

  const highlightBg = useTransform<number, string>(
    [highlightX, highlightY, hue],
    ([x, y, h]) =>
      `radial-gradient(circle at ${x}% ${y}%, oklch(0.92 0.06 ${h}) 0%, oklch(0.55 0.22 ${h}) 40%, oklch(0.18 0.12 ${h}) 95%)`,
  );
  const outerHaloBg = useTransform(
    hue,
    (h) => `radial-gradient(circle, oklch(0.38 0.20 ${h}), transparent 65%)`,
  );
  const midHaloBg = useTransform(
    hue,
    (h) => `radial-gradient(circle, oklch(0.58 0.24 ${h}), transparent 60%)`,
  );
  const ringBorder = useTransform(hue, (h) => `oklch(0.72 0.18 ${h})`);
  const coreShadow = useTransform(
    hue,
    (h) =>
      `0 0 ${size * 0.5}px oklch(0.55 0.22 ${h} / 0.55), inset -6px -8px 20px oklch(0.08 0.06 ${h} / 0.7), inset 5px 6px 12px oklch(0.92 0.06 ${h} / 0.28)`,
  );

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      px.set(Math.max(-1, Math.min(1, (e.clientX - cx) / (window.innerWidth * 0.6))));
      py.set(Math.max(-1, Math.min(1, (e.clientY - cy) / (window.innerHeight * 0.6))));
    };
    window.addEventListener("mousemove", handle);
    return () => window.removeEventListener("mousemove", handle);
  }, [px, py]);

  // Map orb state to pixel character emotion
  const emotion: "neutral" | "happy" | "thinking" | "encouraging" =
    state === "speaking" ? "happy" :
    state === "thinking" ? "thinking" :
    state === "listening" ? "encouraging" :
    "neutral";

  // Character size — fits inside the core sphere (size * 0.42) with a little padding
  const charSize = Math.round(size * 0.36);

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* Concentric faint rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        {[1.0, 1.4, 1.85].map((mult, i) => (
          <div
            key={mult}
            className="absolute rounded-full border border-[var(--obs-muted)]"
            style={{
              width: size * 0.52 * mult,
              height: size * 0.52 * mult,
              opacity: 0.13 - i * 0.03,
            }}
          />
        ))}
      </div>

      {/* Thinking orbital ring */}
      {state === "thinking" && (
        <motion.div
          aria-hidden
          className="absolute rounded-full border border-dashed"
          style={{
            width: size * 0.8,
            height: size * 0.8,
            borderColor: ringBorder,
            opacity: 0.28,
            animation: "obs-ring-rotate 8s linear infinite",
          }}
        />
      )}

      {/* Outermost diffuse halo */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size * 0.92,
          height: size * 0.92,
          background: outerHaloBg,
          filter: `blur(${size * 0.14}px)`,
          x: haloX,
          y: haloY,
        }}
        animate={{
          opacity: isActive ? [0.5, 0.80, 0.5] : [0.38, 0.58, 0.38],
          scale: haloScale,
        }}
        transition={{ duration: isActive ? 1.8 : 6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Middle halo */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size * 0.68,
          height: size * 0.68,
          background: midHaloBg,
          filter: `blur(${size * 0.09}px)`,
          x: midHaloX,
          y: midHaloY,
        }}
        animate={{
          opacity: [0.50, 0.78, 0.50],
          scale: state === "thinking" ? [1, 1.06, 1] : 1,
        }}
        transition={{ duration: state === "thinking" ? 2 : 5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Core sphere — pixel character renders inside */}
      <motion.div
        className="relative flex items-center justify-center overflow-hidden rounded-full"
        style={{
          width: size * 0.42,
          height: size * 0.42,
          background: highlightBg,
          boxShadow: coreShadow,
          x: coreX,
          y: coreY,
        }}
        animate={{ scale: coreScale }}
        transition={{ duration: state === "thinking" ? 2 : 6, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Walking lean: flip the character when moving left */}
        <motion.div
          animate={{ scaleX: movement === "left" ? -1 : 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <PixelCharacter
            emotion={emotion}
            isTalking={state === "speaking"}
            size={charSize}
          />
        </motion.div>
      </motion.div>

      {/* Listening ripples */}
      {state === "listening" && (
        <>
          {[0, 0.6].map((delay) => (
            <motion.span
              key={delay}
              aria-hidden
              className="absolute rounded-full border"
              style={{
                width: size * 0.42,
                height: size * 0.42,
                borderColor: ringBorder,
                animation: `obs-ripple 1.8s ease-out ${delay}s infinite`,
              }}
            />
          ))}
        </>
      )}
    </div>
  );
}
