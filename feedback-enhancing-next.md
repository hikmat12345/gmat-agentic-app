# Athena GMAT — Feedback Enhancement Plan
> Based on: client feedback (5 issues), full codebase investigation, architecture review, and prior product plan.
> Date: 2026-06-29 | Status: Planning Only

---

## How I Read the App

Before writing this plan I read through every major page, component, API route, agent, and the database schema. Here is what currently exists and what is actually wired up:

| Area | What Exists | Gaps Found |
|---|---|---|
| Dashboard | Quest card, GMAT card, streak, rank, companion card (link only), friends leaderboard | `/api/analytics/stuck-points` exists but is **never called from dashboard**; no weak-area recommendation; companion card is a 2-line passive link |
| Study Plan `/learning` | Quest-list roadmap, score band rail, subject filter tabs | No "start here" signal for new users; no phase structure; no subtopic completion indicators; no "continue where you left off" |
| Quiz flow | Hint → Tutor → Practice phases; Socratic AI tutor; practice loop | GMAT section label not shown on question header; no in-session "ask a question" button; quiz tutor triggers only on 2nd wrong, can't be manually invoked |
| Micro-lesson | Whiteboard with AI steps, follow-up chat | Hardcoded SAT algebra fallback problems in page (lines 15-57); chat only opens AFTER lesson, not during; no "pause + ask" mid-step |
| Mentor `/mentor` | Streaming AI chat with student context, voice, calendar | Fully **reactive** (user must initiate); mentor agent system prompt still says "SAT prep coach"; no proactive suggestions pushed to user |
| Full GMAT `/full-gmat` | Section cards, section-order picker, past attempts | Only 24 questions seeded (needs 64); section score breakdown on dashboard is small/buried |
| Progress `/queue` | Section scores, composite, score history, weakness heatmap, activity calendar | All data display only — no "here's what to do about it" next action |
| Onboarding | 5-step profile → diagnostic quiz → schedule → complete | Diagnostic quiz does NOT write V/Q/DI baseline to `users.current_verbal/quantitative/data_insights`; `section_category` in `subsection_skills` still uses SAT values (`ReadingWriting | Math`) |
| Content/Labels | Most UI is GMAT-branded | `sat_quiz_sessions` / `/api/sat-quiz/submit`; mentor agent references "SAT"; hardcoded SAT problems in micro-lesson; `/full-sat` route still present; `section_category` field uses SAT taxonomy |
| Analytics | `GET /api/analytics/stuck-points`, `GET /api/analytics/engagement-summary` | Both endpoints are built but **called by zero UI components** |

---

## Client Feedback — Mapped to Code + Action

### Feedback 1 — Proactive Guidance

> "The platform displays user data but stops at presentation rather than guidance. It does not actively interpret data to support the learning journey."

**Root cause in the code:**
- `/api/analytics/stuck-points` computes stuck subtopics, strong subtopics, and needs-attention counts — but nothing in the dashboard or anywhere else ever calls it.
- The companion card (`frontend/src/components/dashboard/companion-card.tsx`) is literally a 25-line `<Link href="/mentor">` with the text "Need guidance?"
- The mentor agent has full student context via `ask_mentor_stream()` but only fires when the user types in chat.
- There is no `recommendations` or `next_step` concept anywhere on the dashboard.

**What to build:**

#### 1A. "Your Focus This Week" Dashboard Widget
- **File:** New `frontend/src/components/dashboard/focus-recommendation-card.tsx`
- **Data:** Call `/api/analytics/stuck-points` from the dashboard page (already queryable via React Query)
- **Display:** Show top 2–3 stuck subtopics with accuracy, last-seen date, and a direct CTA button: `Practice CR Assumption (54%) →` that deep-links to `/learning/critical-reasoning/cr-assumption/quiz`
- **Logic:** If `stuckCount > 0`, show "Focus areas detected" card. If all strong, show "All looking good — try a harder challenge" with a stretch suggestion.
- **Position:** Place it between the DailyQuestCard and FullGmatCard in the main left column.

#### 1B. Proactive Mentor Insight Card
- **File:** New `frontend/src/components/dashboard/mentor-insight-card.tsx`
- **Data:** Add a new `GET /api/dashboard/insight` route that reads stuck-points + recent quest performance + streak and generates a one-sentence coaching message server-side (no AI call — deterministic rules).
- **Rules:** 
  - Streak broken: "Your streak broke 3 days ago — today is a good day to restart."
  - Quiz accuracy < 60% in a section: "Your Data Insights accuracy dropped to 48% this week. Try a targeted DS session today."
  - No activity in 3+ days: "You haven't studied in 4 days. One 20-minute quest gets your streak back."
  - All improving: "Solid week — your CR accuracy is up 12%. Keep pushing."
- **Display:** A clean banner card with the Athena logo/icon, the message, and a single CTA button.
- **Replace:** The current CompanionCard (which is just a link) should become this smarter widget.

#### 1C. Progress Page — "What to Do Next" Action Rail
- **File:** `frontend/src/app/(protected)/queue/page.tsx` (add section at bottom)
- **Add:** After all the analytics charts, add a "Recommended Actions" section that calls `/api/analytics/stuck-points` and shows 3 action cards:
  - Highest stuck-score subtopic → "Practice [subtopic]"
  - Lowest accuracy subtopic → "Study [subtopic] Micro-Lesson"
  - Most time since last seen → "Return to [subtopic]"
- Each card is a link card that routes to the appropriate subtopic page.

#### 1D. Mentor Agent — Proactive Opening Message
- **File:** `backend/agents/app/run_time/sat/mentor_agent.py`
- **Change:** When the mentor conversation is first opened (no conversation history), render a proactive opening message that includes a specific reference to the user's weakest area, e.g.: "Hey [Name], I can see you've been struggling with Critical Reasoning Assumption questions — 2 out of your last 5 answers there were wrong. Want me to walk you through the core technique?"
- **Implementation:** The mentor chat hook (`use-mentor-conversation.ts`) should pass `isFirstMessage: true` and send an auto-first message with the student context; the agent sees this and responds proactively.

---

### Feedback 2 — Study Plan Journey

> "It is not obvious where the user should start, what to prioritize next, or how their progress is structured over time."

**Root cause in the code:**
- `/learning` page loads all topics as a flat list. The score-band rail exists but clicking a band just filters — it doesn't guide.
- There is no "Next Step" concept. No subtopic completion state is visible.
- New users and experienced users see the same undifferentiated list.
- The `subsection_skills` table tracks mastery per subtopic but this data is never surfaced on `/learning`.

**What to build:**

#### 2A. "Start Here" Banner for New Users
- **File:** `frontend/src/app/(protected)/learning/page.tsx`
- **Logic:** If `data.overallStats.totalQuestions === 0` (no activity), show a hero banner at the top: "Welcome to your GMAT study roadmap. Start with Critical Reasoning Assumption — it's the most tested skill in Verbal. →"
- **Design:** Full-width card with a pulsing "START" indicator on the first topic row.

#### 2B. Phase Structure — Foundation → Practice → Mastery
- **File:** `frontend/src/app/(protected)/learning/page.tsx`
- **Implementation:** Insert phase dividers between topic groups:
  - **Foundation** (topics 1–3 by `orderIndex`): CR Assumption, RC Main Idea, PS Arithmetic — label "Start here. These appear on every GMAT exam."
  - **Practice** (topics 4–6): CR Strengthen/Weaken, RC Inference, PS Algebra, DS Format — label "Once Foundation is solid."
  - **Mastery** (topics 7–8): MSR, TA, GI, TPA — label "Advanced. Differentiates 700+ scores."
- **Visual:** A horizontal section header row between groups showing the phase name, target score range, and progress through that phase.

#### 2C. Subtopic Completion Indicators
- **File:** `frontend/src/components/learning/` — modify `QuestRow`
- **Data:** Add `subsection_skills` data to the `/api/learning` response. For each topic, include `completedSubtopics: number` (skill level ≥ 5 counts as "attempted").
- **Display:** Progress bar below the topic title in the quest row showing `x / totalSubtopics`. Green checkmark if all subtopics have been attempted.

#### 2D. "Continue Where You Left Off" Section
- **File:** `frontend/src/app/(protected)/learning/page.tsx`
- **Data:** From `subsection_skills`, find the subtopic the user most recently interacted with (`last_seen_at` most recent).
- **Display:** Pin it as a sticky banner at the top of the topic list: "Last studied: CR Strengthen/Weaken — 72% accuracy. Pick up where you left off →"

#### 2E. Milestone Markers
- **Add milestone cards at key score thresholds:**
  - "Complete all Foundation topics → estimated +40 points"
  - "Complete all Practice topics → ready for 650+ test"
  - "Complete all Mastery topics → ready for 700+ test"
- Show as decorative milestone rows between phases, marked as locked/achieved.

---

### Feedback 3 — GMAT Simulation & Structure

> "The exam structure is not clearly defined, and key sections — Quantitative Reasoning, Verbal Reasoning, Data Insights — are not distinctly represented."

**Root cause in the code:**
- Quiz questions in `/learning/[topic]/[subtopic]/quiz/[problemNumber]` don't visibly display which GMAT section the question belongs to.
- The dashboard right-side column has a `StatsCards` (target score + sessions) but section scores (V/Q/DI at 60–90 each) are only visible on `/queue`.
- The full GMAT landing page (`/full-gmat`) shows three section cards but the page header just says "GMAT Focus Edition Practice Test" without much context about what makes each section distinct.
- The `subsection_skills.section_category` field still uses `ReadingWriting | Math` (SAT taxonomy) rather than `verbal | quantitative | data_insights`.

**What to build:**

#### 3A. GMAT Section Tag on Quiz Header
- **Files:** `frontend/src/components/learning/quiz/quiz-problem-page.tsx`, `frontend/src/components/quiz/toolbar.tsx`
- **Add:** In the quiz toolbar, show the section pill alongside the question number: a colored chip (`Verbal · CR`, `Quant · PS`, `Data Insights · DS`) derived from the subtopic's `topic.subject` field.
- **Color-code:** Verbal = teal, Quantitative = blue/violet, Data Insights = amber/purple (matching the existing `SUBJECT_STYLES` palette already defined in `/learning/page.tsx`).

#### 3B. Section Score Mini-Widget on Dashboard
- **File:** `frontend/src/components/dashboard/rank-card.tsx` (expand it) or new `section-scores-mini.tsx`
- **Add:** Below the current total score, show three horizontal bars: V: 72 | Q: 68 | DI: 65 (with colored backgrounds matching the section palette). This makes section identity visible every day, not just on the Progress page.

#### 3C. Full GMAT Page — Exam Experience Framing
- **File:** `frontend/src/app/(protected)/full-gmat/page.tsx`
- **Add:**
  - A prominent "Format" overview block: "3 sections · 64 questions · ~2hr 15min · Scored 205–805"
  - Show the real GMAT breakdown per section: Verbal 23Q / 45min, Quant 21Q / 45min, DI 20Q / 45min
  - Add a "Exam Rules" reminder card: "No going back to previous questions. Calculator provided for Quant and DI. No calculator for Verbal."
  - Change the section-start buttons to "Begin Verbal →" style CTAs with the section time prominently displayed.

#### 3D. Fix `section_category` Taxonomy in `subsection_skills`
- **File:** `frontend/src/lib/db/queries/` (daily quest generation, skill updates)
- **Problem:** `subsection_skills.section_category` stores `ReadingWriting | Math` — SAT values.
- **Fix:** Migration to update existing rows to `verbal | quantitative | data_insights`, and update all code that writes or reads this column.
- **Files affected:** `/api/daily-quest/answer/route.ts`, `/api/sat-quiz/submit/route.ts`, `/api/full-gmat/submit/route.ts`, and the daily quest adaptive selector.

#### 3E. Progress Page — Section-First Layout
- **File:** `frontend/src/app/(protected)/queue/page.tsx`
- **Enhance:** Move the 3-section score cards (Verbal/Quant/DI) to the very top of the page with large, prominent displays (not buried below the header). Each section card should link to section-filtered practice.

---

### Feedback 4 — Content Accuracy & Consistency

> "Some content still references 'SAT Math' instead of GMAT. This creates inconsistency."

**Root cause — full audit findings:**

| Location | Issue |
|---|---|
| `frontend/src/app/(protected)/learning/[topicSlug]/[subtopicSlug]/micro-lesson/page.tsx` lines 15–57 | HARDCODED SAT algebra problems (`y = -2x - 1`, slope/y-intercept) used as fallback when no lesson is generated |
| `backend/agents/app/run_time/sat/mentor_agent.py` line 16 | `description = "You are Athena, a motivational GMAT prep mentor and coach."` — but the file itself is in `/sat/` directory, and earlier comments say "SAT prep coach" |
| `frontend/src/app/api/analytics/stuck-points/route.ts` | Fine — no SAT refs |
| `ARCHITECTURE.md` | References `full_sat_*` tables (legacy SAT), `ReadingWriting | Math` as section values |
| `frontend/src/app/(protected)/full-sat/` | Entire `/full-sat` route still exists — this is the old SAT practice test |
| `subsection_skills.section_category` | Values `ReadingWriting | Math` — SAT taxonomy |
| `frontend/src/app/api/sat-quiz/submit/route.ts` | Named "sat-quiz" — legacy |
| `/api/learning/[topicSlug]/[subtopicSlug]/route.ts` | Previously filtered `source='sat'` (now fixed to `'gmat'`) |
| `frontend/src/app/(protected)/learning/[topicSlug]/[subtopicSlug]/quiz/layout.tsx` | May contain "SAT" references — needs audit |
| `backend/agents/app/run_time/sat/` directory | Entire directory named `/sat/` — should be `/gmat/` |

**What to fix:**

#### 4A. Replace Hardcoded SAT Fallback Problems in Micro-Lesson
- **File:** `frontend/src/app/(protected)/learning/[topicSlug]/[subtopicSlug]/micro-lesson/page.tsx`
- **Action:** Remove `HARDCODED_PROBLEMS` array (lines 15–57). Replace with a message: "This lesson is generating — check back in a moment" or pull 2 real `gmat`-source problems from the subtopic's problem bank instead of hardcoding SAT algebra.

#### 4B. Rename `/sat/` Agent Directory
- **Source:** `backend/agents/app/run_time/sat/`
- **Action:** Rename to `backend/agents/app/run_time/gmat/`. Update all imports in `backend/agents/main.py` and `backend/agents/app/` accordingly.

#### 4C. Rename `/api/sat-quiz/submit` → `/api/gmat-quiz/submit`
- **Files:** `frontend/src/app/api/sat-quiz/submit/route.ts` and all callers in quiz components
- **Action:** Create new `/api/gmat-quiz/submit/route.ts`, move the logic, update all call sites.

#### 4D. `/full-sat` Route — Decision
- **Evaluate:** Is `/full-sat` still needed? If not, remove the route and redirect `/full-sat` to `/full-gmat`.
- **If legacy data is needed:** Keep the routes but rename the navigation items. Remove from sidebar/nav.

#### 4E. Fix Mentor Agent Description
- **File:** `backend/agents/app/run_time/sat/mentor_agent.py` (or `gmat/mentor_agent.py` after 4B)
- **Line 16:** Change to `description = "You are Athena, an AI GMAT coach."`
- **Also fix:** System prompt references — remove any remaining "SAT" from mentor agent instructions.

#### 4F. Platform-wide Text Audit Checklist
Run a grep across the entire codebase and fix every occurrence:
```bash
grep -ri "sat" frontend/src --include="*.tsx" --include="*.ts" | grep -v node_modules | grep -v ".git"
```
Focus: UI labels, `<p>` text, hardcoded strings, API response fields. Replace with GMAT equivalents.

---

### Feedback 5 — In-Session AI Tutor Interaction

> "Users should be able to ask questions to the AI tutor, and the lesson/video should pause and then continue from where it left off."

**Root cause in the code:**
- The micro-lesson (`MicroLesson` component) already has a `chat` capability via `use-micro-lesson.ts` hook but it's designed as post-lesson Q&A — there's no "ask mid-lesson" trigger.
- The lesson step player (`use-step-player.ts`) manages step state with `state: "idle" | "animating" | "waiting" | "awaiting_input" | "check_in" | "complete"` — it already has a pause concept (`"waiting"` state) that could be used.
- The quiz has no "ask a question" button; the AI tutor only triggers automatically on the 2nd wrong answer.
- Voice input already exists (`/api/agent/speech-to-text`) — so the infrastructure for asking is there.

**What to build:**

#### 5A. "Ask Athena" Floating Button During Micro-Lesson
- **Files:** `frontend/src/components/learning/micro-lesson.tsx` (or wherever the MicroLesson component renders the whiteboard + controls)
- **Implementation:**
  1. Add a floating `Ask Athena` button (bottom-right, amber colored) visible during lesson playback.
  2. When clicked: call `startStep(currentIndex)` to pause at the current step, open a side-chat panel (slide in from the right).
  3. The chat panel uses the existing `use-micro-lesson.ts` chat streaming — same hook, just triggered mid-lesson instead of post-lesson. Pass `currentStepIndex` as context so the agent knows what was just shown.
  4. When user closes the panel: resume from the same step index (`startStep(currentIndex)` with the step already rendered visible).
- **Agent behavior:** The `micro_lesson_agent` already handles chat — the only change needed is passing `{ "paused_at_step": N, "step_content": "..." }` in the request body so the agent can reference what's on the board.

#### 5B. "Ask About This Question" Button in Quiz
- **Files:** `frontend/src/components/learning/quiz/quiz-problem-page.tsx` (or the toolbar)
- **Implementation:**
  1. Add a subtle `Ask a question →` link below the answer choices (not as prominent as the main flow but accessible).
  2. Clicking it opens the existing quiz tutor chat (`/api/agent/quiz-chat/stream`) in a slide-over panel. Timer pauses while the panel is open.
  3. This is distinct from the existing "tutor phase" (which triggers on 2nd wrong) — this is user-initiated at any time.
  4. The panel closes when user clicks "Got it" or "Back to question" and the timer resumes.
- **DB consideration:** Track this as a new event type in `quiz_question_events.event_type`: `tutor_used_proactively`.

#### 5C. Timer Pause/Resume During Tutor Interaction
- **File:** `frontend/src/app/(protected)/learning/[topicSlug]/[subtopicSlug]/quiz/layout.tsx` (QuizRouteContext)
- **Implementation:** The quiz context already manages timer state. Add `pauseTimer()` / `resumeTimer()` to the context and call them when the tutor panel opens/closes.

#### 5D. Voice Trigger for Mid-Lesson Questions
- **Nice-to-have:** The voice input button (mic) in the mentor/lesson pages should work mid-lesson. Currently the voice input only routes to the mentor or post-lesson chat.
- **Implementation:** If the lesson is active and user hits the mic, route the STT result to the mid-lesson chat panel (5A) instead of navigation away.

---

## Prioritized Task List

### Sprint 1 — High Impact, Directly Address Client Feedback (2–3 weeks)

| # | Task | Client Issue | Files to Change | Effort |
|---|---|---|---|---|
| S1.1 | Build "Focus This Week" widget using existing `/api/analytics/stuck-points` | #1 Proactive guidance | New `focus-recommendation-card.tsx`, `dashboard/page.tsx` | Small |
| S1.2 | Replace CompanionCard with proactive mentor insight (deterministic rules, no AI) | #1 Proactive guidance | `companion-card.tsx`, new `/api/dashboard/insight` route | Small |
| S1.3 | Add GMAT section tag (Verbal/Quant/DI) on quiz question header | #3 GMAT structure | `quiz-problem-page.tsx`, `toolbar.tsx` | Small |
| S1.4 | Remove hardcoded SAT fallback problems from micro-lesson page | #4 Content accuracy | `micro-lesson/page.tsx` lines 15–57 | Small |
| S1.5 | Add "Ask Athena" floating button during micro-lesson (pause + chat panel) | #5 In-session tutor | `micro-lesson.tsx`, `use-step-player.ts`, `use-micro-lesson.ts` | Medium |
| S1.6 | Add section mini-scores (V/Q/DI) to dashboard rank card | #3 GMAT structure | `rank-card.tsx` or new component | Small |
| S1.7 | Add phase labels (Foundation/Practice/Mastery) and "Start Here" banner to Study Plan | #2 Study plan journey | `learning/page.tsx` | Small |
| S1.8 | Fix mentor agent `description` and system prompt SAT → GMAT references | #4 Content accuracy | `mentor_agent.py` | Trivial |

### Sprint 2 — Product Completeness (2–3 weeks)

| # | Task | Client Issue | Files to Change | Effort |
|---|---|---|---|---|
| S2.1 | Add "Continue where you left off" section to Study Plan | #2 Journey | `learning/page.tsx`, `/api/learning` | Medium |
| S2.2 | Show subtopic completion state on quest rows (% accuracy per topic) | #2 Journey | `QuestRow`, `/api/learning` response | Medium |
| S2.3 | "Ask About This Question" button in quiz with timer pause | #5 In-session tutor | `quiz-problem-page.tsx`, quiz context | Medium |
| S2.4 | Fix `section_category` taxonomy (SAT → GMAT values) | #3 + #4 | DB migration + 4 route files | Medium |
| S2.5 | Progress page "Recommended Actions" rail using stuck-points | #1 Proactive | `queue/page.tsx` | Small |
| S2.6 | Milestone markers in Study Plan (score targets between phases) | #2 Journey | `learning/page.tsx` | Small |
| S2.7 | Rename `/sat/` agent directory to `/gmat/` + update imports | #4 Content accuracy | `backend/agents/` | Medium |
| S2.8 | GMAT exam framing on `/full-gmat` page (format card, rules, timing) | #3 GMAT structure | `full-gmat/page.tsx` | Small |
| S2.9 | Proactive mentor opening message (auto-fires first message with weak area) | #1 Proactive | `use-mentor-conversation.ts`, mentor agent | Medium |

### Sprint 3 — Depth & Polish (2 weeks)

| # | Task | Client Issue | Effort |
|---|---|---|---|
| S3.1 | Rename `/api/sat-quiz/submit` → `/api/gmat-quiz/submit` | #4 | Medium |
| S3.2 | Onboarding diagnostic writes V/Q/DI baseline to `users` record | #3 + baseline | Medium |
| S3.3 | Platform-wide SAT text audit and fix (grep + replace) | #4 | Small (per file) |
| S3.4 | Full GMAT test bank expansion to 64 questions | #3 | Large (content) |
| S3.5 | Progress page: section-first layout, sections at top | #3 | Small |
| S3.6 | Evaluate and remove/redirect `/full-sat` route | #4 | Small |
| S3.7 | Voice mid-lesson trigger for Ask Athena | #5 | Medium |

---

## Architecture Notes for Each Change

### S1.1 — Focus Recommendation Card

**Data flow:**
```
/api/analytics/stuck-points (already built)
  → stuckPoints[]: { subtopicSlug, topicSlug, metrics.accuracy, stuckScore }
  → Sort by stuckScore DESC
  → Top 2 → render as CTA cards with direct quiz link
```

**Query key:** `["analytics", "stuck-points"]` with `staleTime: 5 * 60_000`

**Link format:** `/learning/${item.topicSlug}/${item.subtopicSlug}/quiz`

### S1.5 — Ask Athena Mid-Lesson

**State machine change** (`use-step-player.ts`):
- Add `"chatting"` to `StepPlayerState`
- When user opens chat panel: save `previousState`, set state to `"chatting"`, cancel animation
- When user closes panel: restore `previousState`, call `startStep(userStepIndex)` from saved position

**Request body change** (`/api/agent/micro-lesson/chat/stream`):
- Add `paused_at_step_index: number` and `current_step_summary: string` to request
- Agent reads these and scopes its response to what's visible on the board

### S1.7 — Phase Labels in Study Plan

**Logic:**
```ts
function getPhase(orderIndex: number): "foundation" | "practice" | "mastery" {
  if (orderIndex <= 2) return "foundation";
  if (orderIndex <= 5) return "practice";
  return "mastery";
}
```

Insert `<PhaseHeader>` divider row when `getPhase(topics[i].orderIndex) !== getPhase(topics[i-1].orderIndex)`.

### S2.4 — `section_category` Migration

**Migration SQL:**
```sql
UPDATE subsection_skills ss
JOIN subtopics s ON s.id = ss.subtopic_id
JOIN topics t ON t.id = s.topic_id
SET ss.section_category = CASE t.subject
  WHEN 'verbal'        THEN 'verbal'
  WHEN 'quantitative'  THEN 'quantitative'
  WHEN 'data_insights' THEN 'data_insights'
  ELSE ss.section_category
END;
```

**Code files to update after migration:**
- `frontend/src/app/api/daily-quest/answer/route.ts` — writes `section_category`
- `frontend/src/app/api/gmat-quiz/submit/route.ts` — skill update
- `frontend/src/app/api/full-gmat/submit/route.ts` — post-test skill update
- `frontend/src/lib/db/queries/progress.ts` — reads section skills
- `backend/agents/app/` — any adaptive selection code

---

## SAT → GMAT Text Audit — Grep Targets

Run these before Sprint 3:

```bash
# Find all SAT references in frontend
grep -rn "SAT\|sat" frontend/src --include="*.tsx" --include="*.ts" \
  | grep -v "node_modules" | grep -v "supabase" | grep -v "full_sat"

# Check hardcoded strings
grep -rn '"SAT\|SAT Math\|SAT score\|sat_quiz\|sat-quiz\|full-sat\|full_sat' \
  frontend/src --include="*.tsx" --include="*.ts"

# Check backend
grep -rn "SAT\|sat" backend/agents --include="*.py" | grep -v "__pycache__"
```

**Known files that need SAT → GMAT edits:**
| File | Issue |
|---|---|
| `micro-lesson/page.tsx` L15–57 | Hardcoded SAT problems |
| `backend/.../sat/mentor_agent.py` | `description`, comments |
| `ARCHITECTURE.md` | Reference doc (low priority) |
| Any `sat_quiz_sessions` query | API naming |
| `section_category` values in skill update routes | Values `ReadingWriting/Math` |

---

## What NOT to Change in This Sprint

- Do not change the quiz state machine phases (hint → tutor → practice) — they work and client didn't flag them
- Do not change the scoring math (`computeFullGmatScore`) — verified correct
- Do not touch Stripe integration yet — separate sprint
- Do not change onboarding quiz question content yet — that's a content sprint
- Do not refactor React Query keys — only add new ones where needed

---

## Open Questions for Client

1. **Phases definition:** Do the phase names "Foundation / Practice / Mastery" resonate, or does the client prefer different terminology (e.g., "Beginner / Intermediate / Advanced" or GMAT score bands like "600 / 650 / 700+")?

2. **Proactive insight cadence:** Should the "Focus This Week" card refresh daily? Only after quest completion? Or be static until manually dismissed?

3. **In-session tutor behavior:** When the user opens the "Ask Athena" panel mid-lesson, should the lesson audio (TTS) stop immediately, or finish the current sentence first?

4. **Full-SAT route:** Is the `/full-sat` page (old SAT practice test) still needed? Or can it be removed/redirected to `/full-gmat`?

5. **Section order in Study Plan phases:** Currently Foundation = CR, RC subtopics (highest exam frequency). Should this be rearranged so Quant comes before Verbal for users who chose "Quantitative" as their weak section during onboarding?
