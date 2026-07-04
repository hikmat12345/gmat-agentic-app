"use client";
import { useId } from "react";
import { motion } from "framer-motion";

type Emotion = "neutral" | "happy" | "thinking" | "excited" | "encouraging";

interface Props {
  emotion: Emotion;
  isTalking: boolean;
  size?: number;
}

export default function PixelCharacter({ emotion, isTalking, size = 64 }: Props) {
  const raw = useId();
  const uid = raw.replace(/[^a-z0-9]/gi, "");

  const isHappy = emotion === "happy" || emotion === "excited" || emotion === "encouraging";
  const isThinking = emotion === "thinking";

  // Mouth shapes
  const mouth = isHappy
    ? "M 38 58 Q 50 66 62 58"
    : isThinking
    ? "M 41 62 Q 50 61 59 63"
    : "M 40 61 Q 50 65 60 61";

  // Eyebrow shapes (more expressive)
  const browL = isThinking ? "M 33 35 Q 39 31 44 35" : "M 33 37 Q 39 34 44 37";
  const browR = isThinking ? "M 56 35 Q 61 31 67 35" : "M 56 37 Q 61 34 67 37";

  return (
    <motion.div className="relative inline-block" style={{ width: size, height: size }}>
      {/* Ambient glow */}
      <motion.div
        className="absolute rounded-full blur-xl pointer-events-none"
        style={{
          inset: "-20%",
          background: "radial-gradient(circle, rgba(59,130,246,0.4) 0%, transparent 70%)",
        }}
        animate={{ opacity: [0.28, 0.58, 0.28] }}
        transition={{ duration: 3.2, repeat: Infinity }}
      />

      <svg width={size} height={size} viewBox="0 0 100 100" className="relative z-10 drop-shadow-md">
        <defs>
          {/* Dark navy background */}
          <radialGradient id={`bg-${uid}`} cx="38%" cy="28%" r="72%">
            <stop offset="0%" stopColor="#1e3a8a" />
            <stop offset="100%" stopColor="#060b18" />
          </radialGradient>
          {/* Skin — warm neutral */}
          <radialGradient id={`skin-${uid}`} cx="50%" cy="22%" r="68%">
            <stop offset="0%" stopColor="#fde8cd" />
            <stop offset="100%" stopColor="#d4956a" />
          </radialGradient>
          {/* Blazer fabric */}
          <linearGradient id={`blazer-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          {/* Shirt */}
          <linearGradient id={`shirt-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
        </defs>

        {/* ── Background circle ── */}
        <circle cx="50" cy="50" r="49" fill={`url(#bg-${uid})`} />

        {/* ── Body / clothing (drawn first, behind head) ── */}

        {/* Shirt visible below blazer */}
        <path
          d="M 36 72 L 39 67 L 50 71 L 61 67 L 64 72 L 64 100 L 36 100 Z"
          fill={`url(#shirt-${uid})`}
        />

        {/* Tie — amber/gold GMAT brand colour */}
        <path d="M 50 69 L 46.5 72 L 50 100 L 53.5 72 Z" fill="#b45309" />
        <path d="M 47.5 69 L 50 71.5 L 52.5 69 L 50 66.5 Z" fill="#d97706" />

        {/* Blazer — left panel */}
        <path
          d="M 0 100 L 0 78 Q 20 62 34 66 L 39 72 L 36 78 L 28 82 L 18 100 Z"
          fill={`url(#blazer-${uid})`}
        />
        {/* Blazer — right panel */}
        <path
          d="M 100 100 L 100 78 Q 80 62 66 66 L 61 72 L 64 78 L 72 82 L 82 100 Z"
          fill={`url(#blazer-${uid})`}
        />
        {/* Blazer left lapel */}
        <path d="M 34 66 L 39 72 L 36 78 L 30 74 L 32 68 Z" fill="#374151" />
        {/* Blazer right lapel */}
        <path d="M 66 66 L 61 72 L 64 78 L 70 74 L 68 68 Z" fill="#374151" />

        {/* Shirt collar — left */}
        <path d="M 38 66 L 50 71 L 44 64 L 40 64 Z" fill={`url(#shirt-${uid})`} />
        {/* Shirt collar — right */}
        <path d="M 62 66 L 50 71 L 56 64 L 60 64 Z" fill={`url(#shirt-${uid})`} />

        {/* Neck */}
        <rect x="44" y="60" width="12" height="10" rx="4" fill={`url(#skin-${uid})`} />

        {/* ── Head ── */}
        <ellipse cx="50" cy="42" rx="20.5" ry="22.5" fill={`url(#skin-${uid})`} />

        {/* ── Hair — short professional cut ── */}
        {/* Hair base / back */}
        <ellipse cx="50" cy="25" rx="20.5" ry="12.5" fill="#1c1917" />
        {/* Top — slightly textured */}
        <path d="M 30 33 Q 36 15 50 14 Q 64 15 70 33 Q 62 20 50 19 Q 38 20 30 33 Z" fill="#1c1917" />
        {/* Side burns / temples */}
        <path d="M 30 38 Q 27 50 29 59 Q 32 55 31 48 Q 30 43 30 38 Z" fill="#1c1917" />
        <path d="M 70 38 Q 73 50 71 59 Q 68 55 69 48 Q 70 43 70 38 Z" fill="#1c1917" />
        {/* Slight salt-and-pepper highlight at temples */}
        <path d="M 31 47 Q 31 53 33 58 Q 34 54 33 50 Z" fill="#6b7280" opacity="0.5" />
        <path d="M 69 47 Q 69 53 67 58 Q 66 54 67 50 Z" fill="#6b7280" opacity="0.5" />

        {/* ── Eyebrows ── */}
        <path d={browL} stroke="#44403c" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        <path d={browR} stroke="#44403c" strokeWidth="2.2" fill="none" strokeLinecap="round" />

        {/* ── Eyes ── */}
        {isHappy ? (
          <>
            {/* Happy squinting eyes */}
            <path d="M 33 43 Q 40 38.5 47 43" stroke="#1c1917" strokeWidth="2.6" fill="none" strokeLinecap="round" />
            <path d="M 53 43 Q 60 38.5 67 43" stroke="#1c1917" strokeWidth="2.6" fill="none" strokeLinecap="round" />
            {/* Cheek blush */}
            <ellipse cx="35" cy="49" rx="5" ry="2.8" fill="#fca5a5" opacity="0.35" />
            <ellipse cx="65" cy="49" rx="5" ry="2.8" fill="#fca5a5" opacity="0.35" />
          </>
        ) : (
          <>
            {/* Open eyes with iris */}
            <ellipse cx="40" cy="43" rx="5.8" ry="5.8" fill="white" />
            <ellipse cx="60" cy="43" rx="5.8" ry="5.8" fill="white" />
            <circle cx="40" cy="43.5" r="3.5" fill="#1d4ed8" />
            <circle cx="60" cy="43.5" r="3.5" fill="#1d4ed8" />
            <circle cx="40" cy="44" r="1.9" fill="#0c0a09" />
            <circle cx="60" cy="44" r="1.9" fill="#0c0a09" />
            {/* Eye shine */}
            <circle cx="41.4" cy="42.2" r="1.1" fill="white" />
            <circle cx="61.4" cy="42.2" r="1.1" fill="white" />
          </>
        )}

        {/* ── Glasses (always shown — key teacher identifier) ── */}
        {/* Left lens frame */}
        <rect x="30.5" y="37.5" width="17" height="12" rx="3.5" fill="none"
          stroke="#374151" strokeWidth="1.8" opacity="0.92" />
        {/* Right lens frame */}
        <rect x="52.5" y="37.5" width="17" height="12" rx="3.5" fill="none"
          stroke="#374151" strokeWidth="1.8" opacity="0.92" />
        {/* Bridge */}
        <path d="M 47.5 43.5 Q 50 42 52.5 43.5" stroke="#374151" strokeWidth="1.5" fill="none" />
        {/* Left earpiece */}
        <path d="M 30.5 43 Q 24 43.5 23 46" stroke="#374151" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        {/* Right earpiece */}
        <path d="M 69.5 43 Q 76 43.5 77 46" stroke="#374151" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        {/* Subtle lens tint */}
        <rect x="30.5" y="37.5" width="17" height="12" rx="3.5" fill="#bfdbfe" opacity="0.08" />
        <rect x="52.5" y="37.5" width="17" height="12" rx="3.5" fill="#bfdbfe" opacity="0.08" />

        {/* ── Nose ── */}
        <path d="M 49 50 Q 47 54.5 50 56 Q 53 54.5 51 50" fill="#c07850" opacity="0.35" />

        {/* ── Mouth ── */}
        {isTalking ? (
          <motion.ellipse
            cx="50" cy="60"
            rx="5" ry="2.8"
            fill="#9d174d"
            animate={{ ry: [2.2, 5.5, 1.8, 5, 2.2] }}
            transition={{ duration: 0.3, repeat: Infinity }}
          />
        ) : (
          <path d={mouth} stroke="#9d174d" strokeWidth="2.3" fill="none" strokeLinecap="round" />
        )}

        {/* Rim highlight */}
        <circle cx="50" cy="50" r="48.5" fill="none" stroke="rgba(147,197,253,0.18)" strokeWidth="1.5" />
      </svg>

      {/* Thinking indicator — floating dots */}
      {emotion === "thinking" && (
        <motion.div
          className="absolute -top-1 -right-1 z-20 flex gap-0.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {[0, 0.2, 0.4].map((delay) => (
            <motion.span
              key={delay}
              className="block w-1.5 h-1.5 rounded-full bg-blue-400"
              animate={{ y: [0, -4, 0], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 0.8, repeat: Infinity, delay }}
            />
          ))}
        </motion.div>
      )}

      {/* Excited star burst */}
      {emotion === "excited" && (
        <motion.div
          className="absolute -top-1 -right-1 z-20 text-amber-400 text-sm leading-none"
          animate={{ scale: [1, 1.35, 1], rotate: [0, 18, 0] }}
          transition={{ duration: 1.4, repeat: Infinity }}
        >
          ✦
        </motion.div>
      )}
    </motion.div>
  );
}
