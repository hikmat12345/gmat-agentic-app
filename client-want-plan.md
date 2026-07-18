# Athena GMAT — Client Product Plan

> **Platform identity:** Athena is a **GMAT AI Coach**, not an SAT platform. All references to "SAT" in the original product brief map to GMAT. Every feature described below is GMAT-first. The scoring system is 205–805 (total) and 60–90 per section. The three sections are Verbal, Quantitative, and Data Insights. Auth is handled by Clerk — no custom login/signup needed.

---

## 1. What Is Already Built

The following features are **live and functional** in the current codebase. These are baseline — the roadmap below only adds or fixes gaps.

### Infrastructure & Auth
- ✅ Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS 4 + shadcn/ui
- ✅ Clerk authentication (sign-in, sign-up, webhook user sync)
- ✅ Supabase PostgreSQL (25 tables, RLS on all user tables)
- ✅ React Query for all client-side data fetching
- ✅ Python FastAPI AI agent backend (port 8080) using Anthropic Claude + GPT-4o-mini

### Pages Built
| Route | Status | Notes |
|-------|--------|-------|
| `/dashboard` | ✅ Built | Daily quest, streaks, leaderboard, GMAT score card |
| `/profile` | ✅ Built | Tier, score history, GMAT attempt display |
| `/queue` (Progress) | ✅ Built | Score trends, skill breakdown, study stats |
| `/mentor` | ✅ Built | AI mentor chat interface |
| `/learning` | ✅ Built | 8 GMAT topic cards (CR, RC, PS, DS, MSR, TA, GI, TPA) |
| `/learning/[topic]/[subtopic]` | ✅ Built | Micro-lesson, quiz, practice |
| `/full-gmat` | ✅ Built | Practice test browser (seeded with 24-question test) |
| `/full-gmat/[attemptId]/[qNum]` | ✅ Built | All 8 question type renderers |
| `/full-gmat/[attemptId]/results` | ✅ Built | Section scores + total |
| `/my-learning` | ✅ Built | Custom topic creation |
| `/onboarding/*` | ✅ Built | Diagnostic quiz → plan → schedule → complete |
| `/quest/[problemNumber]` | ✅ Built | Daily quest question flow |

### Core Features Built
- ✅ **Adaptive learning engine** — 10 mastery levels per subtopic, auto-adjusts difficulty
- ✅ **Socratic AI tutor** — triggers on 2nd wrong answer, never reveals the answer
- ✅ **AI whiteboard micro-lessons** — 9 visual templates, 20–25 interactive steps
- ✅ **Daily quest system** — 20 personalized GMAT questions per quest
- ✅ **Gamification** — XP, tier progression, daily streak, friends leaderboard
- ✅ **Full GMAT practice test** — timed (scaled to actual question count), all 8 question types
- ✅ **GMAT scoring** — 60–90 per section, 205–805 total, percentile display
- ✅ **Subsection skill tracking** — per subtopic XP, accuracy, streak, last-seen
- ✅ **Text-to-speech / speech-to-text** — voice input/output for lessons
- ✅ **Post-lesson practice loop** — 2-problem drill after any tutor intervention
- ✅ **Custom topic ("My Learning")** — AI-generates content for any GMAT concept

---

## 2. Product Vision (GMAT-Mapped)

The client brief describes an GMAT COACH GMAT preparation platform with these pillars:

### 2.1 Core Pillars
| Pillar | Description |
|--------|-------------|
| **Diagnostic baseline** | Full or abbreviated GMAT diagnostic → establishes V/Q/DI scores and overall band |
| **Adaptive daily quests** | Personalized 20-question sessions; 60% weakest skills, 30% mid, 10% stretch |
| **AI tutoring** | Socratic tutor for all 8 GMAT question types; hint → guided → full explanation modes |
| **Whiteboard workspace** | Interactive visual lessons for quantitative and verbal concepts |
| **Score progression** | Realistic GMAT scoring (205–805) that updates after each completed quest |
| **Accountability** | Daily schedule, missed-session detection, practice lock + reset flow |
| **Gamification** | XP, tiers, streaks, achievements, badges, level-up celebrations |
| **Analytics** | Score history, skill mastery, accuracy trends, weakness detection |
| **Premium subscription** | Stripe checkout, free trial, monthly/annual plans, billing portal |
| **Notifications** | Daily reminders, streak alerts, XP updates, weekly performance summary |

### 2.2 GMAT Sections & Question Types
| Section | Question Types | Questions (Full Test) | Score Range |
|---------|---------------|----------------------|-------------|
| Verbal | Critical Reasoning (CR), Reading Comprehension (RC) | 23 | 60–90 |
| Quantitative | Problem Solving (PS) | 21 | 60–90 |
| Data Insights | Data Sufficiency (DS), Multi-Source Reasoning (MSR), Table Analysis (TA), Graphics Interpretation (GI), Two-Part Analysis (TPA) | 20 | 60–90 |
| **Total** | 8 question types | **64** | **205–805** |

### 2.3 Score & Tier System
| GMAT Band | Label | Percentile |
|-----------|-------|-----------|
| 205–404 | Novice | < 10th |
| 405–504 | Apprentice | 10–30th |
| 505–564 | Practitioner | 30–50th |
| 565–604 | Adept | 50–65th |
| 605–654 | Expert | 65–78th |
| 655–704 | Master | 78–89th |
| 705–805 | Elite | 89–99th |

---

## 3. Architecture Reference

### Stack
| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, shadcn/ui |
| State | React Query (`useQuery` / `useMutation`) — no raw fetch/useState for API data |
| Auth | Clerk (`@clerk/nextjs`) + Svix webhook sync to `users` table |
| Database | Supabase PostgreSQL — `src/lib/supabase/client.ts`, queries in `src/lib/db/queries/` |
| AI Agents | Python FastAPI + Agno framework (port 8080), Anthropic Claude + GPT-4o-mini |
| Animations | Framer Motion |
| Charts | Recharts |
| Math | KaTeX + remark-math + rehype-katex |
| Toasts | Sonner |

### Key Database Tables (29 total)
**Core:** `users`, `sessions`, `schedules`, `user_preferences`, `topics`, `subtopics`, `lessons`, `problems`, `quiz_sessions`, `quiz_answers`, `micro_lessons`, `tutor_lesson_plans`, `custom_topics`, `custom_tutor_lesson_plans`, `learning_queue`, `onboarding_progress`, `friendships`, `subsection_skills`, `daily_quests`

**Full GMAT:** `full_gmat_tests`, `full_gmat_test_problems`, `full_gmat_attempts`, `full_gmat_answers`

### GMAT-Specific Schema Notes
- `problems.question_type` — one of 8 GMAT question types
- `problems.chart_data JSONB` — bar/line/scatter/pie/table chart data
- `problems.passage_text` — RC passage or MSR sources (JSON array) or TPA correct answer JSON
- `problems.hint` — TPA column labels (`"Col1: label|Col2: label"`)
- `quiz_sessions.source = 'gmat'` — GMAT practice sessions (requires `supabase as any` cast)
- `users.current_composite` — real GMAT score (205–805), updated after each quest
- `users.current_verbal/quantitative/data_insights` — per-section scores (60–90)

### Scoring Logic
- `frontend/src/lib/full-gmat/scoring.ts` — `computeFullGmatScore(v, q, di, vT, qT, diT)` → 205–805
- Section scaling: `60 + (correct/total) * 30`, clamped to [60, 90]
- 7 tiers mapped in `frontend/src/lib/ranks.ts`

### Agent Backend (`backend/agents/`)
- FastAPI service, port 8080
- Endpoints: `/agent/chat/stream`, `/agent/quiz-chat/stream`, `/agent/micro-lesson/stream`, `/agent/practice-problems`, `/agent/text-to-speech`, `/agent/speech-to-text`
- CLI: `python -m cli.main [generate-gmat-content | seed-full-gmat-bank | assemble-full-gmat-test]`
- SSE hooks in frontend: `use-athena-conversation.ts`, `use-micro-lesson.ts`, `use-generative-lesson.ts` — do NOT migrate to React Query

---

## 4. Gap Analysis — What Needs Building

### 4.1 HIGH PRIORITY (Product is incomplete without these)

#### A. Dashboard & Progress Pages — Now Fixed ✅
**Status:** Fixed in current codebase session.
- Dashboard, `/queue`, profile now query `source = 'gmat'` and use `users.current_composite`
- Section scores use `verbal` / `quantitative` / `data_insights` keys (not SAT `english`/`math`)
- Score history from `full_gmat_attempts.total_score`

#### B. Full GMAT Problem Bank (64 Questions)
**Problem:** Current seed has 24 sample questions. Real test needs 64 well-crafted questions.
**Fix needed:**
- Generate 64 high-quality GMAT Focus Edition questions via AI pipeline
- 23 Verbal (14 CR + 9 RC), 21 Quant (PS), 20 DI (6 DS + 3 MSR + 3 TA + 3 GI + 5 TPA)
- Seed into `problems` table with `source = 'full_gmat'` and correct metadata
- Link to `full_gmat_tests` via `full_gmat_test_problems`

#### C. Onboarding Diagnostic → GMAT Score Baseline
**Problem:** Onboarding quiz exists but may not set a proper GMAT score baseline.
**Fix needed:**
- Ensure onboarding quiz maps to GMAT question types
- Compute initial V/Q/DI estimates from onboarding performance
- Set `start_composite`, `current_composite` on user record
- Set `current_verbal`, `current_quantitative`, `current_data_insights`

#### D. Accountability System (Missed Quest / Practice Lock)
**Problem:** No missed-session detection or practice lock exists.
**Fix needed:**
- Detect missed daily quest (window = schedule time + 24h)
- Block further practice when quest is missed
- Show reset flow modal (recommitment confirmation)
- Allow schedule adjustment from reset flow

#### E. Stripe Subscription Integration
**Problem:** No payment layer exists.
**Fix needed:**
- Stripe Checkout (monthly + annual plans + free trial)
- Webhook handling for subscription lifecycle events (`checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`)
- Feature gating (premium vs. free)
- Billing portal for self-service management
- `subscriptions` table in DB

### 4.2 MEDIUM PRIORITY (Significantly improves product quality)

#### F. Notifications System
- Daily reminder email at user's scheduled study time
- Quest available alert
- Streak preservation reminder (2h before window closes)
- XP earned + level-up notification
- Weekly performance summary email (every Sunday)
- Requires: email provider (Resend or SendGrid), scheduled cron job, `notifications` table

#### G. Admin / Content Management Panel
- Question bank viewer and editor
- Difficulty balancing controls
- Subscription plan management
- User support tools
- Route: `/admin/*` (Clerk role-gated)

#### H. Landing Page (Public Marketing Site)
- Premium marketing site at `/`
- Product overview, benefits, testimonials
- Pricing section (Stripe-linked)
- FAQ
- CTA to start free trial
- Mobile-first, conversion-optimized

#### I. UI/UX Overhaul (Navigation + Design)
- Replace dual-nav (topnav + sidebar) with single left sidebar
- Quest-list roadmap view for `/learning` page
- Dashboard redesign (lead with quest + score, remove clutter)
- GMAT question-type tag system (CR/RC/PS/DS/MSR/TA/GI/TPA chips)
- Score band progression rail (shows 7 tier bands)
- Mobile bottom tab bar

#### J. My Learning — GMAT Alignment
- Ensure custom topic generation uses GMAT question type framing
- Tag generated problems with appropriate GMAT question type
- Show GMAT relevance metadata on custom topic pages

### 4.3 LOWER PRIORITY (Polish and scale)

#### K. Achievements & Badge System
- Define achievement catalog (streaks, milestones, mastery, test scores)
- `achievements` table + unlock logic
- Display on profile page
- Celebration animations on unlock

#### L. Full Analytics Dashboard
- Response time tracking per question
- Score improvement projection (current → target)
- Weakness heatmap by question type
- Study consistency calendar (GitHub-style contribution grid)
- Estimated test-readiness date

#### M. Mentor Coaching Calendar
- Calendar view in `/mentor` showing upcoming quests
- Personalized coaching suggestions based on weak areas
- Goal progress coaching ("You need 12 more DS correct answers to hit Q:75")

#### N. Additional Full GMAT Tests
- Practice Test 2, Test 3, etc. with fresh question banks
- Adaptive test mode (adjusts difficulty between questions)

#### O. Friends & Social
- Friend leaderboard already built — expand to challenges
- "Challenge a friend" quest feature

---

## 5. Full Roadmap

### Phase 0 — Fix Live Bugs (Week 1) — IN PROGRESS
*These are blocking — users can't see their own progress*

| Task | Status | File area |
|------|--------|-----------|
| Fix dashboard/progress/profile not showing real data | ✅ Done | `src/lib/db/queries/{dashboard,progress,profile}.ts` |
| Fix GMAT ranks (was SAT 800–1600 scale) | ✅ Done | `src/lib/ranks.ts` |
| Fix TypeScript build errors (6 issues) | ✅ Done | Various files |
| Seed full 64-question GMAT problem bank | ⬜ Pending | `backend/agents/` CLI |

### Phase 1 — Core Product Completeness (Weeks 2–4)
*Product must be complete before monetization*

| Task | Priority |
|------|----------|
| Full 64-question GMAT test bank (AI-generated, all 8 types) | High |
| Onboarding: GMAT diagnostic maps to V/Q/DI baseline scores | High |
| Accountability: missed-quest detection + practice lock modal | High |
| Schedule reset flow (recommitment UI) | High |
| Landing page (public, premium marketing) | High |
| Stripe integration (checkout, webhooks, billing portal) | High |
| Feature gating (free vs. premium access control) | High |

### Phase 2 — UI/UX & Design Polish (Weeks 5–7)
*Premium look is a product differentiator*

| Task | Priority |
|------|----------|
| Sidebar navigation restructure (replace dual-nav) | High |
| Learning hub → quest-list roadmap with GMAT type tags | High |
| Dashboard redesign (score-first, quest-first layout) | High |
| Score band progression rail | Medium |
| GMAT question-type chip/tag system (CR/DS/TPA etc.) | Medium |
| Mobile bottom tab bar | Medium |
| Typography and card padding standardization | Low |
| Color refinements (dark mode warmth, question-type variables) | Low |

### Phase 3 — Notifications & Engagement (Weeks 8–9)
*Retention requires daily touchpoints*

| Task | Priority |
|------|----------|
| Email provider setup (Resend or SendGrid) | High |
| Daily quest reminder (schedule-aware, timezone-correct) | High |
| Streak preservation alert | High |
| Weekly performance summary email | Medium |
| XP / level-up push notification | Medium |
| Missed quest / practice lock alert | Medium |
| Cron job infrastructure for scheduled sends | High |

### Phase 4 — Analytics & Coaching (Weeks 10–11)
*Depth keeps advanced students engaged*

| Task | Priority |
|------|----------|
| Response time tracking per question | Medium |
| Score improvement projection (current → target date) | High |
| Weakness heatmap by question type and subtopic | Medium |
| Activity calendar (study consistency grid) | Medium |
| Mentor coaching suggestions (weakness-driven) | Medium |
| Goal progress coaching copy | Low |

### Phase 5 — Achievements & Social (Week 12)
*Gamification depth for retention*

| Task | Priority |
|------|----------|
| Achievement catalog (30+ badges) | Medium |
| Unlock logic + `achievements` table | Medium |
| Profile badge display | Medium |
| Level-up celebrations (animation) | Low |
| Score milestone celebrations | Low |
| Friends challenge feature | Low |

### Phase 6 — Scale & Admin (Week 13+)
*Required before wider launch*

| Task | Priority |
|------|----------|
| Admin panel (`/admin/*`) — question bank, users, subscriptions | High |
| Additional full GMAT practice tests (Test 2, 3) | High |
| Adaptive full test mode | Medium |
| Load testing + performance optimization | High |
| Error monitoring (Sentry or similar) | High |
| Playwright E2E regression suite expansion | Medium |

---

## 6. Subscription Plan Design

| Plan | Price | Features |
|------|-------|---------|
| **Free Trial** | 7 days free | Full access, auto-converts to monthly |
| **Monthly** | ~$29/mo | Unlimited quests, full analytics, AI tutor, all practice tests |
| **Annual** | ~$199/yr (~$17/mo) | Everything monthly + priority support + early access |

### Stripe Objects Needed
- 2 Products: Monthly, Annual
- Price IDs for each
- Webhook events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
- New DB table: `subscriptions (id, user_id, stripe_customer_id, stripe_subscription_id, plan, status, trial_ends_at, current_period_end)`

---

## 7. Content Requirements (GMAT Question Bank)

To fully seed all learning paths and full practice tests, the following content is needed:

### Structured Practice Problems (per subtopic)
| Question Type | Subtopics | Easy | Medium | Hard | Approx Total |
|--------------|-----------|------|--------|------|--------------|
| Critical Reasoning | 7 | 3 each | 5 each | 3 each | ~77 |
| Reading Comprehension | 5 | 3 each | 5 each | 3 each | ~55 |
| Problem Solving | 6 | 3 each | 5 each | 3 each | ~66 |
| Data Sufficiency | 5 | 3 each | 5 each | 3 each | ~55 |
| Multi-Source Reasoning | 2 | 2 each | 4 each | 2 each | ~16 |
| Table Analysis | 3 | 2 each | 4 each | 2 each | ~24 |
| Graphics Interpretation | 4 | 2 each | 3 each | 2 each | ~28 |
| Two-Part Analysis | 2 | 2 each | 4 each | 2 each | ~16 |
| **Total** | | | | | **~337** |

### Full Practice Test Banks
| Test | Questions | Types Covered |
|------|-----------|--------------|
| Practice Test 1 (current) | 64 | All 8 types |
| Practice Test 2 | 64 | All 8 types |
| Practice Test 3 | 64 | All 8 types |
| **Total** | **192** | |

### Generation Pipeline (already built)
```bash
# Generate topic/subtopic metadata
python -m cli.main generate-gmat-content

# Generate and seed full test questions
python -m cli.main seed-full-gmat-bank

# Link questions to a test record
python -m cli.main assemble-full-gmat-test
```

---

## 8. Technical Debt / Known Issues

| Issue | Severity | Status |
|-------|----------|--------|
| Dashboard/progress/profile not connected to real data | Critical | ✅ Fixed |
| GMAT ranks used SAT 800–1600 scale | High | ✅ Fixed |
| TypeScript build errors (6 issues) | High | ✅ Fixed |
| Full GMAT test only has 24 sample questions | High | ⬜ Pending |
| No Stripe integration | High | ⬜ Pending |
| No email notifications | Medium | ⬜ Pending |
| No public landing page | Medium | ⬜ Pending |
| Accountability lock not built | Medium | ⬜ Pending |
| Onboarding doesn't set V/Q/DI baseline scores | Medium | ⬜ Pending |
| `subsection_skills` write-path needs audit | High | ⬜ Pending |

---

## 9. Verification Checklist (per Phase)

### Phase 0 Done When:
- [x] Take a GMAT quiz → `/queue` shows updated skill data and section scores
- [x] Dashboard shows real `current_composite` score (not 0)
- [x] Profile tier matches the 7 GMAT bands (Novice → Elite)
- [ ] Submit a full GMAT test → profile shows the score
- [ ] `/full-gmat` loads 64-question test (23V · 21Q · 20DI)

### Phase 1 Done When:
- [ ] New user completes onboarding → V/Q/DI baseline scores set in DB
- [ ] Miss a daily quest → practice is locked, reset modal appears
- [ ] Stripe checkout flow completes → subscription active, features unlocked
- [ ] Landing page live at `/` with pricing section

### Phase 2 Done When:
- [ ] Sidebar navigation works at all breakpoints
- [ ] `/learning` shows quest-list rows with GMAT type tags
- [ ] Dashboard loads with score card prominent
- [ ] All GMAT question type chips render in quiz headers

### Phase 3 Done When:
- [ ] User receives email at scheduled study time
- [ ] Streak reminder fires at 2h before window closes
- [ ] Weekly email sends every Sunday with performance summary
