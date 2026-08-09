# Result Screens Redesign — Items #6, #7, #8

> **Goal:** Make every result screen feel like a personal coaching session.
> Large cards, plain English, animated — no squinting at tiny text.

---

## Problem: Why the current screens fall flat

| ❌ Current state | ✅ Target state |
|---|---|
| `text-xs` labels everywhere | Nothing smaller than `text-sm` in primary content |
| Coaching buried in a tiny inline card | Coaching card is the first thing you see after the score |
| Time info = one line of muted text | Animated bar + large numbers + verdict sentence |
| Next steps = small buttons, no context | Full-width action cards with icon, headline, and subtext |
| No visual hierarchy between sections | Clear section titles, staggered entrance animations |
| Score feels like a table row | Score count-up / spring animation on load |

---

## Design System

### Color tokens (4 semantic states)

| State | Color | Tailwind | Usage |
|---|---|---|---|
| Success / Mastered | `#10b981` | `emerald-500` | ≥80% score, good time pace |
| Info / Keep building | `#3b82f6` | `blue-500` | 65–79% score, mid-range |
| Warn / Needs work | `#f59e0b` | `amber-500` | <65% score, slow time |
| Danger / Priority | `#ef4444` | `red-500` | Lowest GMAT section score |

**Border system:** All coaching cards use `border-2` with color at `/40` opacity + light background fill at `/10` opacity. Every card is color-coded — no plain grey cards.

### Card anatomy (applies to all 3 screens)

```
┌─────────────────────────────────────────────────────┐
│  [emoji text-4xl]  [headline text-lg font-bold]     │
│                    [badge pill]                      │
│                    [body text-sm leading-relaxed]    │
└─────────────────────────────────────────────────────┘
border-2, color /40
background: color /10
padding: p-5
```

### Animation choreography

| Element | Entry | Delay | Easing |
|---|---|---|---|
| Score number | scale 0.6→1, fade | 0ms | spring stiff=200 damp=15 |
| Stat chips | slide up 16px + fade | 150ms | ease-out 280ms |
| Coaching card (#6) | slide up 14px + fade | 280ms | ease-out 320ms |
| Time bar fill (#7) | width 0%→actual% | 400ms | cubic-bezier(.22,1,.36,1) 800ms |
| Difficulty bars | width 0%→pct%, staggered | 450ms + 60ms each | ease-out 600ms |
| Next step cards (#8) | slide up 16px + fade, staggered | 520ms + 80ms each | ease-out 300ms |
| Hover on next-step card | translateY(-2px) + brightness(1.04) | — | 150ms ease |

> All animations respect `prefers-reduced-motion`. When enabled: opacity only, no movement.

---

## Screen 01 — Daily Quest Results

**File:** `src/components/daily-quest/quest-results-screen.tsx`  
**Triggered:** automatically after last quest question

### Component A — Score Hero

```
[🏆 icon h-20 w-20 in amber/15 bg]
"Quest Complete!"  ← text-3xl font-bold
"{sub-line varies by accuracy}"

┌──────────┬──────────┬──────────┐
│  87%     │  7/8     │  +120    │
│ Accuracy │ Correct  │ XP Earned│
└──────────┴──────────┴──────────┘
← text-3xl font-bold each stat
```

### Component B — Coaching Card (#6)

Three variants based on accuracy:

**≥ 85% — Green / Excellent**
```
🏆  [Excellent]  Outstanding — you're in great shape!
    You crushed this quest. Keep pushing into harder material
    to build your scoring edge.
```

**65–84% — Blue / Keep Building**
```
📚  [Keep Building]  Focus on CR Assumption — you missed 3/5
    A short review on CR Assumption will move your score.
    The pattern shows you're selecting too quickly on negation questions.
```

**< 65% — Amber / Needs Work**
```
🎯  [Needs Work]  Start with Data Sufficiency — 4/5 wrong
    A 10-minute micro-lesson will help you understand the concept
    before drilling more questions.
```

> Body text must name the **specific subtopic** + exact wrong count from `findWeakestSubtopics()`.

### Component C — Time Management Card (#7)

```
⏱️  Your Time Per Question

  154s              120s
your average      GMAT target

[████████████████░░░░░░░░]  ← animated fill, target line at 100%
0s                      120s (limit) ↑

⚠️ You're spending too long per question. On the real GMAT,
   practice skipping tough questions and returning later.
```

- Your avg: `text-4xl font-bold` colored (amber=slow, blue=fast, green=good)
- Target: `text-2xl text-muted-foreground`
- Bar: `h-4 rounded-full`, fills with Framer `animate={{ width: "85%" }}`
- Verdict: colored bg box, plain English sentence

Pace thresholds:
- Slow: avg > 120s × 1.25 (>150s)
- Fast: avg < 120s × 0.75 (<90s)
- Good: 90–150s

### Component D — Difficulty Breakdown

```
How You Did By Difficulty

🔴 Your Weak Areas     [████████░░░░░░░░░░░]  3/5 correct
🟡 Medium Level        [████████████░░░░░░░]  4/6 correct
🟢 Stretch (Hardest)   [███████████████████]  2/2 correct
```

### Component E — Next Step Cards (#8)

**"What should you do next?"** — `text-base font-bold`

Card rules:
- `weakBucketAccuracy < 60%` → amber card: 🎓 "Watch a lesson on [subtopic name]" → micro-lesson link
- `accuracy >= 80%` → blue card: 📋 "Take a full GMAT practice test" → /full-gmat
- `65% ≤ accuracy < 80%` → primary card: ✏️ "Practice more on [subtopic]" → quiz link
- Always: solid primary button "Back to Dashboard"

Card anatomy:
```
┌────────────────────────────────────────────────────────┐
│  [icon 52×52px]  [headline text-base font-bold]    [→] │
│                  [subtext text-sm opacity-70]          │
└────────────────────────────────────────────────────────┘
border-2, full-width, hover: translateY(-2px)
```

---

## Screen 02 — Subtopic Quiz Results

**File:** `src/components/quiz/results-screen.tsx`  
**Triggered:** after submitting a subtopic quiz

### Score Hero
- Score as **percentage** `text-7xl font-bold` (not X/Y fraction — that's the subtitle)
- Color: ≥80% emerald, ≥50% amber, below red
- Subtitle: "{X} out of {Y} correct · {time}"
- Spring animation on mount

### Coaching Card (#6)
Same 3-variant system:

| Score | Emoji | Headline |
|---|---|---|
| ≥ 80% | 🏆 | "You've mastered this subtopic!" |
| 60–79% | 📚 | "Good progress — a bit more practice needed" |
| < 60% | 🎯 | "This topic needs more work — watch the lesson first" |

Body gives specific actionable advice (not generic).

### Time Card (#7)
Same layout as Quest. Target = `timeRecommendationSeconds` from problem data (avg across all problems).

Thresholds:
- Slow: actual > target × 1.30
- Fast: actual < target × 0.70

### Next Step Cards (#8)
- `score < 60%` → amber: 🎓 "Watch the Micro-Lesson" → `/learning/[topic]/[subtopic]/micro-lesson`
- `onPractice` prop present → primary: ✏️ "Do 2 More Practice Questions" / "Practice Harder Problems"
- Always: Retry Quiz (outline) + "Next Subtopic →" or "Close" (filled)

---

## Screen 03 — Full GMAT Results

**File:** `src/app/(protected)/full-gmat/[attemptId]/results/page.tsx`  
**Triggered:** after all 3 sections submitted

### Score + Section Cards
```
[🏆 icon]
"GMAT Practice Test Complete"

  605         ← text-7xl font-bold colored
out of 805 · ~58th percentile

[💬 Verbal]  [🔢 Quant]  [📊 Data Insights]
  74/90        66/90          71/90
 text-3xl    text-3xl       text-3xl
 + mini progress bar in section color
```

### Time Management Panel (#7)

Panel border: `border-2 border-amber-500/40` if any section over, `border-emerald-500/30` if all ok.

```
┌─────────────────────────────────────────────────────────┐
│ ⏱️ Time Management                                       │
│    How long you spent on each section (budget: 45 min)  │
├─────────────────────────────────────────────────────────┤
│ 💬 Verbal    [████████████████████░░░░]  38m 20s        │
│ 🔢 Quant     [████████████████████████]  51m 10s ⚠ Over │
│ 📊 DI        [██████████████████████░░]  41m 0s         │
│              0 ————————————————————— 45m limit ↑        │
├─────────────────────────────────────────────────────────┤
│ ⚠️ You went over on Quant. Practice skipping hard       │
│    questions and returning to them.                     │
└─────────────────────────────────────────────────────────┘
```

- Bar fills from 0 on mount, 800ms animation
- Over-budget bar color: amber, under-budget: section gradient
- Ghost line at the 45-min mark (right edge)
- Over-budget badge: rounded pill "⚠ Over budget"

### Per-Section Coaching (#6)

**Section title:** "How did you do? (Section by Section)"

Four badge levels:

| Score | Emoji | Badge | Border color |
|---|---|---|---|
| ≥ 78 | 🏆 | Strong | section color |
| ≥ 70 | 📈 | Above Avg | section color |
| ≥ 65 | 📚 | Needs Work | section color |
| < 65 | 🎯 | Priority Focus | section color |

Card anatomy:
```
┌────────────────────────────────────────────────────────┐
│  [emoji text-4xl]  [headline]  [badge pill]            │
│                    [advice text-sm leading-relaxed]     │
│                    [💬 Score: 74/90  ← text-xs muted]  │
└────────────────────────────────────────────────────────┘
border-2 in section color at /40
background: section color gradient at /08
```

Coaching copy per level:
- **Strong:** "Top tier. Maintain consistency, review unsure questions."
- **Above Avg:** "A few more correct answers moves your score. Drill medium problems."
- **Needs Work:** "Close to above-average. Find the question types you missed."
- **Priority:** "Start with a micro-lesson on core concepts, then targeted practice."

### Next Steps (#8) — Always exactly 3 cards

```
"What should you do next?"

┌─────────────────────────────────────────────────────┐
│  🎯  Focus on [Weakest Section] — your weakest      → │
│      Study [topic suggestion] and build this first   │
└─────────────────────────────────────────────────────┘
border-2 amber

┌─────────────────────────────────────────────────────┐
│  📚  Follow your Study Plan                         → │
│      Foundation → Practice → Mastery in order        │
└─────────────────────────────────────────────────────┘
border-2 primary

┌─────────────────────────────────────────────────────┐
│  📋  Take another practice test                     → │
│      Track how your score improves over time         │
└─────────────────────────────────────────────────────┘
border neutral
```

Card 1 links directly to `weakest.studyPath`. Card 2 → `/learning`. Card 3 → `/full-gmat`.

---

## Implementation Checklist

- [ ] **1.** `quest-results-screen.tsx` — Score hero: trophy h-20, 3-stat grid text-3xl, spring animation
- [ ] **2.** `quest-results-screen.tsx` — Coaching card: emoji text-4xl, border-2, 3 variants, specific subtopic name
- [ ] **3.** `quest-results-screen.tsx` — Time card: numbers text-4xl, animated bar, colored verdict box
- [ ] **4.** `quest-results-screen.tsx` — Difficulty breakdown: 3 rows with progress bars
- [ ] **5.** `quest-results-screen.tsx` — Next step cards: full-width, border-2, icon 52px, stagger 80ms
- [ ] **6.** `results-screen.tsx` — Score as percentage text-7xl (not X/Y as hero)
- [ ] **7.** `results-screen.tsx` — Coaching card (same system, 3 variants)
- [ ] **8.** `results-screen.tsx` — Time card vs `timeRecommendationSeconds`
- [ ] **9.** `results-screen.tsx` — Next step cards (micro-lesson / practice harder)
- [ ] **10.** `full-gmat results` — Time Management panel with animated bars + over-budget badge
- [ ] **11.** `full-gmat results` — Per-section coaching with 4-level badge system
- [ ] **12.** `full-gmat results` — 3 fixed next-step action cards (weakest → study plan → another test)

---

## Live design mockup

See the interactive HTML mockup (light/dark, real card previews):  
`PLAN_result_screens_mockup.html` (artifact published to claude.ai)
