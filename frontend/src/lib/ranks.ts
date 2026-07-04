import { Shield, Sword, Swords, Crown, Flame, Star, Zap, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type Rank = {
  name: string;
  threshold: number;
  weapon: string;
  icon: LucideIcon;
  emoji: string;
};

export const RANKS: Rank[] = [
  { name: "Novice",       threshold: 205, weapon: "Rock of Knowledge",    icon: Sword,    emoji: "🪨" },
  { name: "Apprentice",   threshold: 405, weapon: "Scouting Dagger",      icon: Sword,    emoji: "🗡️" },
  { name: "Practitioner", threshold: 505, weapon: "Blade of Persistence", icon: Swords,   emoji: "⚔️" },
  { name: "Adept",        threshold: 565, weapon: "Shield of Focus",      icon: Shield,   emoji: "🛡️" },
  { name: "Expert",       threshold: 605, weapon: "Bow of Precision",     icon: Flame,    emoji: "🏹" },
  { name: "Master",       threshold: 655, weapon: "Staff of Wisdom",      icon: Star,     emoji: "🔮" },
  { name: "Elite",        threshold: 705, weapon: "Crown of Glory",       icon: Crown,    emoji: "👑" },
];

export function getRank(score: number): Rank {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (score >= RANKS[i].threshold) return RANKS[i];
  }
  return RANKS[0];
}

export function getNextRank(score: number): Rank | null {
  const current = getRank(score);
  const idx = RANKS.indexOf(current);
  return idx < RANKS.length - 1 ? RANKS[idx + 1] : null;
}

export function getRankProgress(score: number) {
  const current = getRank(score);
  const next = getNextRank(score);

  if (!next) {
    return { current, next: null, pct: 100, pointsToNext: 0 };
  }

  const range = next.threshold - current.threshold;
  const progress = score - current.threshold;
  const pct = Math.min(Math.round((progress / range) * 100), 100);

  return {
    current,
    next,
    pct,
    pointsToNext: next.threshold - score,
  };
}
