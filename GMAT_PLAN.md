# GMAT Migration Plan — Athena Platform
> Status: **Planning** | Created: 2026-06-10 | Owner: Hikmat

---

## GMAT Focus Edition — Exam Reference

Before any code, understand the target:

| Property | SAT (current) | GMAT Focus Edition (target) |
|---|---|---|
| Sections | Reading & Writing (×2 modules), Math (×2 modules) | Verbal Reasoning, Quantitative Reasoning, Data Insights |
| Total Questions | 98 | 64 |
| Total Time | ~3h 15min | ~2h 15min + optional breaks |
| Section Time | 32min (RW1/2), 35min (Math1/2) | 45min VR, 45min QR, 30min DI |
| Section Questions | 27+27 RW, 22+22 Math | 23 VR, 21 QR, 20 DI |
| Adaptive Model | Module 2 depends on Module 1 score | Fully adaptive within each section |
| Section Order | Fixed | Test-taker chooses order |
| Section Score | 200–800 (per section) | 60–90 (per section, 1-pt increments) |
| Total Score | 400–1600 | 205–805 (10-pt increments) |
| Cooldown | 14 days (our app) | 16 days between attempts (official GMAT rule) |

### GMAT Question Types

**Verbal Reasoning (23 questions, 45 min):**
- Critical Reasoning (CR): ~14 questions — Assumption, Strengthen, Weaken, Flaw, Inference, Bold Face, Method
- Reading Comprehension (RC): ~9 questions — Main Idea, Inference, Detail, Application, Tone

**Quantitative Reasoning (21 questions, 45 min):**
- Problem Solving (PS): All 21 questions — classic 5-option multiple choice
- Topics: Arithmetic, Algebra, Geometry, Word Problems, Statistics/Probability, Number Properties

**Data Insights (20 questions, 30 min):**
- Data Sufficiency (DS): ~5 questions (classic A/B/C/D/E format)
- Multi-Source Reasoning (MSR): ~3 questions
- Table Analysis (TA): ~3 questions
- Graphics Interpretation (GI): ~3 questions
- Two-Part Analysis (2PA): ~6 questions

---

## Current Architecture — SAT-Specific Pain Points

### Database (schema changes required)
| Table / Column | SAT-Specific | GMAT Change |
|---|---|---|
| `topics.sat_relevance` | jsonb SAT relevance score | rename → `gmat_relevance`, update meaning |
| `topics.subject` | `math` / `reading_writing` | add `verbal` / `quantitative` / `data_insights` |
| `subtopics.*` | SAT topic tree | Replace entire topic tree (see Phase 6) |
| `problems.sat_frequency` | SAT appearance rate | rename → `gmat_frequency` |
| `problems.source` | includes `"sat"` literal | add `"gmat"` source type |
| `quiz_sessions.source` | `"sat"` literal | add `"gmat"` |
| `subsection_skills.section_category` | `ReadingWriting` / `Math` enum | add `Verbal` / `Quantitative` / `DataInsights` |
| `full_sat_tests` | entire table | rename → `full_gmat_tests` |
| `full_sat_test_problems` | `section` enum: `reading_writing`/`math`, `module 1/2` | `section` enum: `verbal`/`quantitative`/`data_insights`, drop `module` |
| `full_sat_attempts` | `rw_raw_score`, `math_raw_score`, scaled 200-800 | 3-section raw + section score (60-90) + total (205-805) |
| `full_sat_answers` | `section` enum | same section rename |
| `users.current_composite` | 400-1600 SAT score | 205-805 GMAT score |
| `users.current_reading_writing` | 200-800 | replace with `current_verbal`, `current_quantitative`, `current_data_insights` (60-90 each) |
| `users.current_math` | 200-800 | (folded into `current_quantitative`) |
| `users.target_score` | SAT target (e.g. 1400) | GMAT target (e.g. 655) |
| `users.start_composite` | SAT baseline | GMAT baseline |

### Scoring (complete rewrite required)
- `frontend/src/lib/full-sat/scoring.ts` — entire file is SAT-specific (200-800 scale, 54 RW / 44 Math questions)
- GMAT section scoring: 60-90 per section (IRT-based adaptive, cannot be simply replicated; use approximation)
- GMAT total: 205-805 computed from all 3 section scores (not a simple sum)

### API Routes (logic changes)
| Route | What changes |
|---|---|
| `POST /api/sat-quiz/submit` | rename to `/api/gmat-quiz/submit`, change section category mapping |
| `POST /api/daily-quest/complete` | Change composite score formula (3 sections, 60-90 scale) |
| `POST /api/full-sat/submit` | Rename all routes + logic: 3 sections, new scoring |
| `POST /api/full-sat/start` | 3-section format, no module structure |
| `GET /api/full-sat` | rename to `/api/full-gmat` |
| `GET /api/progress` | Change section grouping (Verbal/Quant/DI instead of RW/Math) |
| `GET /api/agent/mentor-chat/stream` | Pass GMAT section scores not SAT scores |

### Frontend Types
- `frontend/src/types/full-sat.ts` — rename to `full-gmat.ts`, update all enums, time limits, question counts
- Remove `MODULE_TIME_LIMITS`, `MODULE_QUESTION_COUNTS` — GMAT has no module structure

### Agent Prompts
| Agent | Change |
|---|---|
| `agents/app/run_time/sat/micro_lesson_agent.py` | "SAT Math instructor" → context-aware GMAT instruction |
| `agents/app/run_time/sat/quiz_tutor_agent.py` | Add GMAT question type awareness (DS format, CR reasoning) |
| `agents/content_workflow.py` | "SAT Content Generation" → "GMAT Content Generation" |
| `agents/cron/session_reminders.py` | "SAT prep journey" → "GMAT prep journey" |
| `agents/problem_generator.py` | GMAT question format: DS has 5-option A/B/C/D/E, CR/RC verbal formats |

---

## Migration Phases — A to Z

---

### PHASE 1 — Database Schema Migration
> Estimated effort: 2 days | Risk: HIGH (breaking changes)

#### 1.1 — Rename SAT-specific columns (non-breaking, backward-compatible migration)

Create new migration: `supabase/migrations/20260611_gmat_schema.sql`

```sql
-- Add GMAT section scores to users table
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS current_verbal INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS current_quantitative INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS current_data_insights INTEGER DEFAULT NULL;
  
-- Rename sat_relevance → gmat_relevance in topics
ALTER TABLE topics RENAME COLUMN sat_relevance TO gmat_relevance;

-- Rename sat_frequency → gmat_frequency in problems  
ALTER TABLE problems RENAME COLUMN sat_frequency TO gmat_frequency;

-- Add GMAT to source enum in problems
ALTER TABLE problems 
  DROP CONSTRAINT IF EXISTS problems_source_check;
ALTER TABLE problems 
  ADD CONSTRAINT problems_source_check 
  CHECK (source IN ('onboarding', 'sat', 'gmat', 'practice', 'custom', 'full_sat', 'full_gmat'));

-- Add GMAT to source enum in quiz_sessions
ALTER TABLE quiz_sessions
  DROP CONSTRAINT IF EXISTS quiz_sessions_source_check;
ALTER TABLE quiz_sessions
  ADD CONSTRAINT quiz_sessions_source_check
  CHECK (source IN ('onboarding', 'sat', 'gmat', 'custom'));

-- Add GMAT section categories to subsection_skills
ALTER TABLE subsection_skills
  DROP CONSTRAINT IF EXISTS subsection_skills_section_category_check;
ALTER TABLE subsection_skills
  ADD CONSTRAINT subsection_skills_section_category_check
  CHECK (section_category IN ('ReadingWriting', 'Math', 'Verbal', 'Quantitative', 'DataInsights'));
```

#### 1.2 — Add Full GMAT Test tables

Append to same migration or new file: `20260611_full_gmat_tables.sql`

```sql
-- GMAT test definitions
CREATE TABLE IF NOT EXISTS full_gmat_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_number INTEGER NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'retired')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- GMAT test problem pool (no module concept — single pass per section)
CREATE TABLE IF NOT EXISTS full_gmat_test_problems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES full_gmat_tests(id) ON DELETE CASCADE,
  problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  section TEXT NOT NULL CHECK (section IN ('verbal', 'quantitative', 'data_insights')),
  order_index INTEGER NOT NULL,
  UNIQUE (test_id, section, order_index)
);

-- GMAT test attempts per user
CREATE TABLE IF NOT EXISTS full_gmat_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  test_id UUID NOT NULL REFERENCES full_gmat_tests(id),
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  
  -- Section raw scores (correct count)
  verbal_raw_score INTEGER DEFAULT 0,
  quantitative_raw_score INTEGER DEFAULT 0,
  data_insights_raw_score INTEGER DEFAULT 0,
  
  -- Section scaled scores (60-90)
  verbal_scaled_score INTEGER DEFAULT NULL,
  quantitative_scaled_score INTEGER DEFAULT NULL,
  data_insights_scaled_score INTEGER DEFAULT NULL,
  
  -- Total score (205-805)
  total_score INTEGER DEFAULT NULL,
  
  -- Timing per section
  verbal_time_seconds INTEGER DEFAULT 0,
  quantitative_time_seconds INTEGER DEFAULT 0,
  data_insights_time_seconds INTEGER DEFAULT 0,
  total_time_seconds INTEGER DEFAULT 0,
  
  -- Navigation (test-taker chooses section order)
  section_order JSONB DEFAULT '["verbal","quantitative","data_insights"]',
  current_section TEXT DEFAULT NULL,
  current_question INTEGER DEFAULT 0,
  
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- GMAT per-answer records
CREATE TABLE IF NOT EXISTS full_gmat_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES full_gmat_attempts(id) ON DELETE CASCADE,
  problem_id UUID NOT NULL REFERENCES problems(id),
  section TEXT NOT NULL CHECK (section IN ('verbal', 'quantitative', 'data_insights')),
  order_index INTEGER NOT NULL,
  selected_option TEXT,
  is_correct BOOLEAN,
  response_time_ms INTEGER,
  answered_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_full_gmat_attempts_user ON full_gmat_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_full_gmat_attempts_test ON full_gmat_attempts(test_id);
CREATE INDEX IF NOT EXISTS idx_full_gmat_answers_attempt ON full_gmat_answers(attempt_id);
```

#### 1.3 — Add GMAT topic tree subjects

The `topics.subject` column needs to support `verbal`, `quantitative`, `data_insights`:

```sql
-- Remove old CHECK if it exists
ALTER TABLE topics DROP CONSTRAINT IF EXISTS topics_subject_check;
ALTER TABLE topics ADD CONSTRAINT topics_subject_check
  CHECK (subject IN ('math', 'reading_writing', 'verbal', 'quantitative', 'data_insights'));
```

**How to test 1.x:**
```
supabase db push --local
supabase db diff
# Verify: supabase studio → Table Editor → check all new columns exist
# SQL: SELECT column_name, data_type FROM information_schema.columns WHERE table_name='full_gmat_attempts';
```

---

### PHASE 2 — GMAT Scoring System
> Estimated effort: 1 day | Risk: MEDIUM

#### 2.1 — Create `frontend/src/lib/full-gmat/scoring.ts`

GMAT section scores are IRT-based (Item Response Theory). We use a research-backed piecewise linear approximation:

```typescript
// Section score 60-90, accuracy → scaled score approximation
// Based on GMAT Focus Edition score correlation data

export function scaleVerbalScore(rawCorrect: number, totalQuestions = 23): number {
  return scaleGmatSection(rawCorrect, totalQuestions);
}

export function scaleQuantitativeScore(rawCorrect: number, totalQuestions = 21): number {
  return scaleGmatSection(rawCorrect, totalQuestions);
}

export function scaleDataInsightsScore(rawCorrect: number, totalQuestions = 20): number {
  return scaleGmatSection(rawCorrect, totalQuestions);
}

// Piecewise linear interpolation: accuracy → section score 60-90
function scaleGmatSection(correct: number, total: number): number {
  const pct = correct / total;
  const breakpoints = [
    [0.00, 60], [0.15, 63], [0.30, 66], [0.45, 69],
    [0.60, 73], [0.70, 76], [0.80, 79], [0.87, 82],
    [0.93, 85], [0.97, 88], [1.00, 90],
  ];
  for (let i = 1; i < breakpoints.length; i++) {
    const [pLow, sLow] = breakpoints[i - 1];
    const [pHigh, sHigh] = breakpoints[i];
    if (pct <= pHigh) {
      const t = (pct - pLow) / (pHigh - pLow);
      return Math.round(sLow + t * (sHigh - sLow));
    }
  }
  return 90;
}

// GMAT total: 205-805 in 10-pt increments
// Approximation: average section score mapped to total
export function computeFullGmatScore(
  verbalRaw: number,
  quantRaw: number,
  diRaw: number,
): { verbalScaled: number; quantScaled: number; diScaled: number; total: number } {
  const verbalScaled = scaleVerbalScore(verbalRaw);
  const quantScaled = scaleQuantitativeScore(quantRaw);
  const diScaled = scaleDataInsightsScore(diRaw);
  
  // GMAT total mapped from average section score (60-90 → 205-805)
  const avgSection = (verbalScaled + quantScaled + diScaled) / 3;
  const normalized = (avgSection - 60) / 30; // 0 to 1
  const raw = 205 + normalized * 600; // 205-805
  const total = Math.round(raw / 10) * 10; // round to nearest 10
  const clamped = Math.max(205, Math.min(805, total));
  
  return { verbalScaled, quantScaled, diScaled, total: clamped };
}
```

#### 2.2 — Update `frontend/src/lib/scoring.ts` (onboarding)

The onboarding quiz `calculateSkillScore()` function is fine as-is (generic weighted accuracy). No change needed.

#### 2.3 — Update daily-quest composite formula

File: `frontend/src/app/api/daily-quest/complete/route.ts`

Replace the two-section (RW + Math) composite with three-section (V + Q + DI) composite using GMAT scale.

**How to test 2.x:**
```typescript
// Unit test (add to __tests__/scoring.test.ts)
import { computeFullGmatScore } from "@/lib/full-gmat/scoring";
console.log(computeFullGmatScore(23, 21, 20)); // perfect → total should be ~805
console.log(computeFullGmatScore(0, 0, 0));     // all wrong → total should be ~205
console.log(computeFullGmatScore(17, 15, 14));  // ~75% → total ~625
```

---

### PHASE 3 — API Routes
> Estimated effort: 3 days | Risk: HIGH

#### 3.1 — Rename + refactor quiz submission

**a) Create `frontend/src/app/api/gmat-quiz/submit/route.ts`**  
(replaces `sat-quiz/submit`)

Changes from SAT version:
- Map subject `verbal` → `Verbal`, `quantitative` → `Quantitative`, `data_insights` → `DataInsights`
- Keep `ReadingWriting` / `Math` for backward compat with SAT topics (old content)
- Score update: use 60-90 section scale for GMAT topics, 200-800 for legacy SAT topics
- Source: `"gmat"` instead of `"sat"`

**b) Keep `/api/sat-quiz/submit` alive** for the legacy SAT content during transition.

#### 3.2 — Full GMAT test routes

Create `frontend/src/app/api/full-gmat/` directory with:

| Route | Method | Description |
|---|---|---|
| `/api/full-gmat` | GET | Check availability (cooldown 16 days), return in-progress attempt |
| `/api/full-gmat/start` | POST | Create new `full_gmat_attempts` record, return section order choice UI |
| `/api/full-gmat/answer` | POST | Record one answer to `full_gmat_answers` |
| `/api/full-gmat/section-complete` | POST | Mark section done, advance to next |
| `/api/full-gmat/submit` | POST | Finalize attempt, compute scores, update user profile |
| `/api/full-gmat/history` | GET | Past attempt list |

**`/api/full-gmat/submit` logic:**
```typescript
const { verbalScaled, quantScaled, diScaled, total } = computeFullGmatScore(
  verbalCorrect, quantCorrect, diCorrect
);
// Save to full_gmat_attempts
// Update users: current_verbal, current_quantitative, current_data_insights, current_composite
// Update subsection_skills for each answered problem
```

#### 3.3 — Update progress route

`frontend/src/app/api/progress/route.ts`

- Return `verbal`, `quantitative`, `data_insights` section accuracies
- Keep returning `math` and `reading_writing` if user has SAT data (backward compat)

#### 3.4 — Update mentor chat context

`frontend/src/app/api/agent/mentor-chat/stream/route.ts`

Replace student context shape:
```typescript
// Before (SAT):
{ reading_writing: 650, math: 720, composite: 1370 }

// After (GMAT):
{ verbal: 78, quantitative: 82, data_insights: 74, composite: 655 }
```

**How to test 3.x:**
```bash
# Local API testing with curl:
curl -X POST http://localhost:3000/api/gmat-quiz/submit \
  -H "Content-Type: application/json" \
  -d '{"subtopicSlug":"critical-reasoning","answers":[{"problemId":"...","selectedOption":"A","isCorrect":true,"difficultyLevel":5,"responseTimeMs":45000}]}'

# Full GMAT test flow:
curl http://localhost:3000/api/full-gmat  # check availability
curl -X POST http://localhost:3000/api/full-gmat/start -d '{"testId":"..."}'
```

---

### PHASE 4 — Types & Constants
> Estimated effort: 0.5 days | Risk: LOW

#### 4.1 — Create `frontend/src/types/full-gmat.ts`

```typescript
export type GmatSection = "verbal" | "quantitative" | "data_insights";
export type GmatSectionCategory = "Verbal" | "Quantitative" | "DataInsights";

export type GmatQuestionType = 
  | "critical_reasoning"
  | "reading_comprehension"
  | "problem_solving"
  | "data_sufficiency"
  | "multi_source_reasoning"
  | "table_analysis"
  | "graphics_interpretation"
  | "two_part_analysis";

export const GMAT_SECTION_CONFIG: Record<GmatSection, {
  label: string;
  questions: number;
  timeLimitMinutes: number;
  questionTypes: GmatQuestionType[];
}> = {
  verbal: {
    label: "Verbal Reasoning",
    questions: 23,
    timeLimitMinutes: 45,
    questionTypes: ["critical_reasoning", "reading_comprehension"],
  },
  quantitative: {
    label: "Quantitative Reasoning",
    questions: 21,
    timeLimitMinutes: 45,
    questionTypes: ["problem_solving"],
  },
  data_insights: {
    label: "Data Insights",
    questions: 20,
    timeLimitMinutes: 30,
    questionTypes: [
      "data_sufficiency", "multi_source_reasoning",
      "table_analysis", "graphics_interpretation", "two_part_analysis"
    ],
  },
};

export const FULL_GMAT_COOLDOWN_MS = 16 * 24 * 60 * 60 * 1000; // 16 days (official rule)

export const GMAT_SCORE_RANGE = { min: 205, max: 805, step: 10 } as const;
export const GMAT_SECTION_SCORE_RANGE = { min: 60, max: 90, step: 1 } as const;
```

#### 4.2 — Add question_type column to problems table

```sql
-- Add to a new migration
ALTER TABLE problems ADD COLUMN IF NOT EXISTS question_type TEXT DEFAULT NULL;
-- e.g. 'critical_reasoning', 'data_sufficiency', 'problem_solving', 'reading_comprehension' etc.
```

This is critical for:
- Rendering the right UI (DS has a unique 5-option format)
- Routing to the right tutor agent variant
- Filtering practice problems by type

**How to test 4.x:**
```typescript
// Import and log the config to verify:
import { GMAT_SECTION_CONFIG } from "@/types/full-gmat";
console.log(GMAT_SECTION_CONFIG.verbal.timeLimitMinutes); // 45
console.log(GMAT_SECTION_CONFIG.data_insights.questions); // 20
```

---

### PHASE 5 — Frontend Components
> Estimated effort: 4 days | Risk: MEDIUM-HIGH

#### 5.1 — Quiz Layout Context (`quiz/layout.tsx`)

The `QuizRouteContext` needs a new prop: `sectionCategory: GmatSectionCategory`

- Map subtopic → section based on GMAT topic tree (see Phase 6)
- Pass to tutor agent for context-appropriate responses

#### 5.2 — Data Sufficiency Question Component

DS is GMAT-unique. Requires a completely new component:
- Fixed prompt: "Statement 1: ... Statement 2: ..."
- Fixed 5 options:
  - A: Statement 1 alone is sufficient
  - B: Statement 2 alone is sufficient
  - C: Both statements together are sufficient
  - D: Either statement alone is sufficient
  - E: Neither statement alone nor together is sufficient
- **Cannot show these 5 options with ABCDE labels in the same way as regular MCQ** — they are always the same text

File: `frontend/src/components/quiz/DataSufficiencyQuestion.tsx`

#### 5.3 — Reading Comprehension Component

RC passages need a split-pane view:
- Left pane: passage text (scrollable)
- Right pane: question + options

File: `frontend/src/components/quiz/ReadingComprehensionQuestion.tsx`

The current single-column question view won't work for RC.

#### 5.4 — Two-Part Analysis Component

TPA has a table-style answer grid:
- 2 columns (Column 1, Column 2)
- 5 rows (answer choices)
- Student selects one item per column

File: `frontend/src/components/quiz/TwoPartAnalysisQuestion.tsx`

#### 5.5 — Score Display Components

Replace SAT score displays throughout the app:

| Location | SAT display | GMAT display |
|---|---|---|
| Dashboard hero | "1370 / 1600 SAT" | "655 / 805 GMAT" |
| Profile | R&W: 650, Math: 720 | V: 78, Q: 82, DI: 74 |
| Full test results | Two bars (RW, Math) | Three bars (V, Q, DI) |
| Onboarding | "What's your target SAT score?" | "What's your target GMAT score?" |
| Progress bars | Two section tracks | Three section tracks |

Files to update:
- `frontend/src/components/dashboard/` — hero stats component
- `frontend/src/components/profile/` — profile stats
- `frontend/src/app/(protected)/full-gmat/[attemptId]/results/page.tsx` (new)
- `frontend/src/app/(protected)/onboarding/gist/page.tsx` — target score question

#### 5.6 — Section Order Selection (GMAT-specific)

At the start of a full GMAT test, user must choose section order (unique GMAT feature):

File: `frontend/src/app/(protected)/full-gmat/start/page.tsx`

UI: drag-and-drop or 3-button picker showing the 3 sections, user arranges preferred order.

#### 5.7 — Full GMAT Test Pages

Create `frontend/src/app/(protected)/full-gmat/` with:
- `page.tsx` — Landing: availability, history, start button
- `start/page.tsx` — Section order selection
- `[attemptId]/[section]/[questionNumber]/page.tsx` — Per-question test view
- `[attemptId]/results/page.tsx` — Results with 3-section breakdown

#### 5.8 — Navigation: Replace "SAT" references

Search and replace in nav components:
- "Full SAT Test" → "Full GMAT Test"
- "SAT Score" → "GMAT Score"
- "Reading & Writing" → "Verbal"
- "Math" → "Quantitative" (in GMAT context) / keep "Math" for topic label if ambiguous

**How to test 5.x:**
```
# Start dev server, then manually:
1. Navigate to /dashboard — verify score display shows GMAT format
2. Navigate to /profile — verify 3-section score breakdown
3. Navigate to /full-gmat — verify test landing page loads
4. Start a test — verify section order picker works
5. Take a DS question — verify the 5-option fixed answer format renders
6. Take an RC question — verify split-pane passage view
7. Complete a section — verify section timer worked
8. Submit full test — verify results page shows 3 scores + total
```

---

### PHASE 6 — GMAT Curriculum Content
> Estimated effort: 3 days | Risk: MEDIUM

This is the most content-heavy phase. We need to seed the GMAT topic tree (replacing or augmenting the SAT topics).

#### 6.1 — GMAT Topic Tree

Replace SAT topics with GMAT topics in a new migration:

```sql
-- supabase/migrations/20260612_gmat_topics.sql
-- Insert GMAT topics into topics table
INSERT INTO topics (slug, subject, name, order_index, gmat_relevance) VALUES
  ('verbal-reasoning', 'verbal', 'Verbal Reasoning', 1, '{"frequency":"high","test_section":"verbal"}'),
  ('quantitative-reasoning', 'quantitative', 'Quantitative Reasoning', 2, '{"frequency":"high","test_section":"quantitative"}'),
  ('data-insights', 'data_insights', 'Data Insights', 3, '{"frequency":"high","test_section":"data_insights"}');
```

#### 6.2 — GMAT Subtopics

**Verbal Reasoning:**
| Subtopic slug | Name | Est. Minutes |
|---|---|---|
| `critical-reasoning` | Critical Reasoning | 40 |
| `cr-assumption` | CR: Assumption Questions | 30 |
| `cr-strengthen-weaken` | CR: Strengthen & Weaken | 35 |
| `cr-flaw` | CR: Flaw Questions | 30 |
| `cr-inference` | CR: Inference Questions | 30 |
| `cr-bold-face` | CR: Bold Face Questions | 25 |
| `cr-method` | CR: Method of Reasoning | 25 |
| `reading-comprehension` | Reading Comprehension | 40 |
| `rc-main-idea` | RC: Main Idea & Primary Purpose | 30 |
| `rc-inference` | RC: Inference Questions | 30 |
| `rc-detail` | RC: Supporting Detail | 25 |
| `rc-tone` | RC: Author's Tone | 25 |

**Quantitative Reasoning:**
| Subtopic slug | Name | Est. Minutes |
|---|---|---|
| `number-properties` | Number Properties & Theory | 35 |
| `arithmetic` | Arithmetic & Percentages | 30 |
| `algebra` | Algebra & Equations | 35 |
| `inequalities` | Inequalities | 30 |
| `geometry` | Geometry | 35 |
| `coordinate-geometry` | Coordinate Geometry | 30 |
| `word-problems` | Word Problems | 40 |
| `rate-time-distance` | Rate, Time & Distance | 30 |
| `statistics-probability` | Statistics & Probability | 35 |
| `combinatorics` | Combinatorics & Permutations | 30 |
| `sequences` | Sequences & Progressions | 25 |

**Data Insights:**
| Subtopic slug | Name | Est. Minutes |
|---|---|---|
| `data-sufficiency` | Data Sufficiency | 45 |
| `ds-strategy` | DS: Strategy & Process | 30 |
| `multi-source-reasoning` | Multi-Source Reasoning | 35 |
| `table-analysis` | Table Analysis | 30 |
| `graphics-interpretation` | Graphics Interpretation | 30 |
| `two-part-analysis` | Two-Part Analysis | 35 |

#### 6.3 — Update `agents/content_workflow.py`

Change topic generation prompts from SAT to GMAT:
- System prompt: "GMAT Focus Edition content specialist"
- For CR subtopics: include argument structure, premise/conclusion identification
- For DS subtopics: include the DS answer-choice rubric (A/B/C/D/E meanings)
- For RC subtopics: include passage types (business, science, social science)

#### 6.4 — Seed GMAT Problem Bank

Update `agents/problem_generator.py`:

```python
GMAT_PROBLEM_CONFIG = {
    "verbal": {
        "question_types": ["critical_reasoning", "reading_comprehension"],
        "difficulty_range": [1, 10],  # maps to GMAT difficulty 1 (easy) to 10 (700+ level)
        "time_recommendation": {"cr": 120, "rc": 90},  # seconds per question
    },
    "quantitative": {
        "question_types": ["problem_solving"],
        "difficulty_range": [1, 10],
        "time_recommendation": 120,
    },
    "data_insights": {
        "question_types": [
            "data_sufficiency", "multi_source_reasoning",
            "table_analysis", "graphics_interpretation", "two_part_analysis"
        ],
        "difficulty_range": [1, 10],
        "time_recommendation": {"ds": 120, "msr": 150, "ta": 90, "gi": 90, "tpa": 120},
    }
}
```

For Data Sufficiency problems specifically, the generator must produce:
```json
{
  "question_text": "Is x > 0?\n(1) x² = 4\n(2) x + 2 > 0",
  "question_type": "data_sufficiency",
  "options": {
    "A": "Statement (1) ALONE is sufficient, but statement (2) alone is not sufficient.",
    "B": "Statement (2) ALONE is sufficient, but statement (1) alone is not sufficient.",
    "C": "BOTH statements TOGETHER are sufficient, but NEITHER statement ALONE is sufficient.",
    "D": "EACH statement ALONE is sufficient.",
    "E": "Statements (1) and (2) TOGETHER are NOT sufficient."
  },
  "correct_option": "B"
}
```

**How to test 6.x:**
```bash
# In agents/ directory:
cd agents
python seed_gmat_topics.py  # new seed script (see task 6.5)

# Check via Supabase Studio:
# SELECT * FROM topics WHERE subject IN ('verbal', 'quantitative', 'data_insights');
# SELECT count(*) FROM problems WHERE source = 'gmat';
```

#### 6.5 — Write `agents/seed_gmat_topics.py`

Script to:
1. Insert all GMAT topics + subtopics
2. Generate 5-10 practice problems per subtopic via problem_generator
3. Generate micro-lesson content for each subtopic

---

### PHASE 7 — AI Agent Updates
> Estimated effort: 2 days | Risk: MEDIUM

#### 7.1 — GMAT Micro-Lesson Agent

Update `agents/app/run_time/sat/micro_lesson_agent.py` (or create `gmat_micro_lesson_agent.py`):

```python
SYSTEM_PROMPT = """You are Athena, an expert GMAT instructor.
You specialize in teaching {section} concepts: {subtopic_name}.

For GMAT Verbal (CR/RC):
- Focus on argument structure and logical reasoning
- Never rely on outside knowledge; reasoning must be based on what's stated
- For CR: identify premise, assumption, conclusion chains
- For RC: reference passage lines in explanations

For GMAT Quantitative:
- Show step-by-step algebraic approaches
- Highlight test-taking shortcuts (number sense, backsolving, picking numbers)
- Note when a concept typically appears at 600, 650, or 700+ level

For GMAT Data Insights:
- For DS: ALWAYS walk through the A/B/C/D/E elimination process
- For DS: explicitly say "We need to determine if we CAN answer YES/NO definitively"
- Never skip evaluating both statements independently before evaluating together
"""
```

#### 7.2 — GMAT Quiz Tutor Agent

Update `agents/app/run_time/sat/quiz_tutor_agent.py`:

```python
# Add DS-specific Socratic guidance
DS_TUTOR_INSTRUCTIONS = """
For Data Sufficiency problems, guide the student through:
1. What is being asked? (understand the question)
2. Evaluate Statement 1 ALONE (ignore Statement 2)
3. Evaluate Statement 2 ALONE (ignore Statement 1)  
4. If needed, evaluate both TOGETHER
5. Apply the A/B/C/D/E framework
Never give away the answer directly. Ask: "If Statement 1 is true, can we determine ___?"
"""
```

#### 7.3 — CR/RC-Specific Tutor Guidance

```python
CR_TUTOR_INSTRUCTIONS = """
For Critical Reasoning, guide through:
1. Identify the argument's conclusion (what is being argued?)
2. Identify the evidence (what facts support it?)
3. For the specific question type:
   - Assumption: What must be true for the argument to work?
   - Strengthen: What would make the conclusion more likely true?
   - Weaken: What would make the conclusion less likely true?
   - Flaw: What logical error does the argument make?
Never give away whether the answer is correct until after the student commits.
"""
```

#### 7.4 — Mentor Agent Context

Update `agents/app/run_time/sat/mentor_agent.py`:

```python
STUDENT_CONTEXT_TEMPLATE = """
Student GMAT Profile:
- Target score: {target_score}/805
- Current composite: {current_composite}/805
- Verbal: {verbal_score}/90
- Quantitative: {quantitative_score}/90
- Data Insights: {data_insights_score}/90
- Study streak: {streak} days
"""
```

#### 7.5 — Session Reminders

Update `agents/cron/session_reminders.py`:
- Replace "SAT prep journey" → "GMAT prep journey"
- Replace "SAT success" → "GMAT success"
- Mention GMAT-specific motivation points (MBA programs, GMAT Focus Edition)

**How to test 7.x:**
```bash
# Start agents server: uvicorn app.main:app --port 8080 --reload
# Test via chat endpoint:
curl -X POST http://localhost:8080/micro-lesson/stream \
  -H "Content-Type: application/json" \
  -d '{"subtopic":"data-sufficiency","section":"data_insights"}' \
  --no-buffer
```

---

### PHASE 8 — Onboarding Updates
> Estimated effort: 1 day | Risk: LOW

#### 8.1 — Target Score Question

`frontend/src/app/(protected)/onboarding/gist/page.tsx`

Replace SAT target score input:
- Label: "What's your target GMAT score?" (instead of SAT score)
- Range hint: "Scores range from 205-805, with the average around 565"
- Common targets to show: 600, 645, 665, 705, 745 (corresponding to ~70th, 80th, 85th, 90th, 95th percentiles)

#### 8.2 — Onboarding Quiz Topics

The onboarding quiz currently uses `source = "onboarding"` problems. We need GMAT onboarding problems that:
- Cover all 3 sections (Verbal, Quantitative, Data Insights)
- Have a representative difficulty spread
- Are seeded separately in a `seed_gmat_onboarding.py` script

Mix suggestion for 15-question onboarding quiz:
- 5 Verbal (2 CR, 3 RC)
- 5 Quantitative (5 PS)
- 5 Data Insights (3 DS, 1 TPA, 1 Table Analysis)

#### 8.3 — Study Schedule Language

`frontend/src/app/(protected)/onboarding/schedule/page.tsx`

- Change "SAT exam date" → "GMAT exam date"
- Change "SAT sections" → "GMAT sections"

**How to test 8.x:**
```
1. Sign in as new user (or reset onboarding in DB)
2. Complete onboarding flow:
   - Verify "GMAT" appears throughout (not SAT)
   - Verify target score input accepts 205-805 range
   - Verify onboarding quiz has mix of GMAT question types
   - Verify DS questions show the 5-option fixed format
   - Complete → verify dashboard shows GMAT scores
```

---

### PHASE 9 — Daily Quest GMAT Adaptation
> Estimated effort: 1 day | Risk: MEDIUM

#### 9.1 — Daily Quest Problem Selection

`frontend/src/app/api/daily-quest/generate/route.ts`

Current: selects 20 problems from `daily_quests` adaptive system (weak/mid/stretch buckets)

For GMAT:
- Keep the 20-problem daily quest structure
- Ensure section balance: ~7 Verbal, ~7 Quantitative, ~6 Data Insights
- Or: let the adaptive engine decide purely based on skill weaknesses (no forced balance)

Recommendation: Add a `target_section_balance` config that defaults to balanced but adjusts based on subsection_skills weakness.

#### 9.2 — Quest Scoring for GMAT

`frontend/src/app/api/daily-quest/complete/route.ts`

Replace:
```typescript
// Old (SAT):
const rwScore = Math.min(800, Math.round(200 + rwAccuracy * 600));
const mathScore = Math.min(800, Math.round(200 + mathAccuracy * 600));
const composite = rwScore + mathScore;
```

With:
```typescript
// New (GMAT):
const verbalScore = Math.round(60 + verbalAccuracy * 30);  // 60-90
const quantScore = Math.round(60 + quantAccuracy * 30);
const diScore = Math.round(60 + diAccuracy * 30);
const composite = computeFullGmatScore(verbalRaw, quantRaw, diRaw).total; // 205-805
```

**How to test 9.x:**
```
1. Navigate to /dashboard
2. Start daily quest
3. Complete all 20 questions (mix of V/Q/DI)
4. Submit quest
5. Verify: score updates show GMAT range (not 400-1600)
6. Verify: profile shows updated section scores in 60-90 range
```

---

### PHASE 10 — Full GMAT Simulation Test
> Estimated effort: 3 days | Risk: HIGH

This is the showpiece feature. Mirrors what `full-sat/` does, adapted for GMAT's 3-section format.

#### 10.1 — Test Seeding

Create `agents/full_gmat_seeder.py`:

- Generate 1 full GMAT practice test:
  - 23 Verbal problems (14 CR + 9 RC)
  - 21 Quantitative problems (21 PS)
  - 20 Data Insights (5 DS + 3 MSR + 3 TA + 3 GI + 6 TPA)
- Insert into `full_gmat_tests` + `full_gmat_test_problems`
- Mark status = 'active'

Target: Ship with 2-3 full practice tests (Test 1, Test 2, Test 3).

#### 10.2 — Test UI — Section Order Picker

The GMAT Focus Edition allows test-takers to choose the order of their 3 sections.

`frontend/src/app/(protected)/full-gmat/start/page.tsx`:

```
┌─────────────────────────────────────────────┐
│  Choose your section order                  │
│  (Just like the real GMAT Focus Edition)    │
│                                             │
│  [Verbal] [Quantitative] [Data Insights]    │
│                                             │
│  Drag to reorder, or select your preferred  │
│  sequence:                                  │
│  1. _____ 2. _____ 3. _____                │
│                                             │
│  Most test-takers start with their         │
│  strongest section.                         │
│                                             │
│  [Begin Test →]                             │
└─────────────────────────────────────────────┘
```

#### 10.3 — Per-Section Timed Experience

- Each section is fully independent with its own timer
- Within a section, user can review and change answers (unlike SAT modules which lock)
- Timer shows: "12:35 remaining — Verbal (Q 8/23)"
- On section timer expiry: auto-submit section, advance to next

#### 10.4 — GMAT Results Page

`frontend/src/app/(protected)/full-gmat/[attemptId]/results/page.tsx`:

```
┌────────────────────────────────────────────────────────┐
│  GMAT Focus Edition — Practice Test 1 Results          │
│                                                        │
│  TOTAL SCORE         665 / 805                         │
│  ████████████████████░░░░░░░░░░░░░                    │
│                                                        │
│  SECTION SCORES                                        │
│  Verbal       78/90  ██████████████████░░             │
│  Quantitative 82/90  ████████████████████░            │
│  Data Insights 74/90 █████████████████░░░             │
│                                                        │
│  PERCENTILE (approx.)    82nd percentile               │
│                                                        │
│  SECTION BREAKDOWN                                     │
│  Verbal: CR 11/14 correct, RC 7/9 correct              │
│  Quant:  PS 18/21 correct                              │
│  DI:     DS 4/5, MSR 2/3, TA 3/3, GI 2/3, TPA 4/6    │
│                                                        │
│  WEAKEST AREAS                                         │
│  1. Two-Part Analysis (67% correct)                    │
│  2. Bold Face CR (60% correct)                         │
│                                                        │
│  [Practice Weak Areas]  [Download Report]  [Done]      │
└────────────────────────────────────────────────────────┘
```

**How to test 10.x:**
```
1. Navigate to /full-gmat
2. Verify cooldown logic (can't start if took test in last 16 days)
3. Click "Begin Test"
4. Select section order
5. Work through Verbal section (23 questions) — verify timer counts down from 45:00
6. Complete section — verify section-complete screen shows section score
7. Advance to next section
8. Complete all 3 sections
9. Submit test
10. Verify results page shows all 3 section scores + total (205-805 range)
11. Verify "Practice Weak Areas" redirects to relevant subtopic practice
```

---

### PHASE 11 — Testing Strategy
> Estimated effort: 2 days

#### 11.1 — Manual Test Checklist (run in browser)

```markdown
## GMAT Core Flows

### Onboarding
- [ ] New user onboarding shows "GMAT" not "SAT"
- [ ] Target score field accepts 205-805
- [ ] Onboarding quiz has mix of V/Q/DI questions
- [ ] DS questions in onboarding quiz show 5-option A/B/C/D/E format
- [ ] Onboarding completes and redirects to dashboard

### Dashboard  
- [ ] GMAT composite score shown (205-805 range)
- [ ] Three section tiles (Verbal, Quantitative, Data Insights)
- [ ] Daily quest available
- [ ] Streak tracker works

### Topic Learning Flow
- [ ] /learning shows GMAT topics (Verbal, Quant, DI)
- [ ] Topic page loads for "Critical Reasoning"
- [ ] Subtopic page loads for "CR: Assumption Questions"
- [ ] Micro-lesson generates (whiteboard steps appear)
- [ ] Voice narration works during micro-lesson
- [ ] Check-in questions appear at beat points
- [ ] Post-lesson "Got it" advances to next step
- [ ] Practice problems load for each subtopic
- [ ] DS practice problems show correct 5-option format

### Quiz Flow
- [ ] Quiz starts from subtopic page
- [ ] Timer shows per-question recommended time
- [ ] Wrong answer shows hint
- [ ] Two wrong answers opens tutor chat
- [ ] Tutor chat is section-appropriate (CR tutor talks about argument structure)
- [ ] DS tutor walks through A/B/C/D/E elimination
- [ ] RC questions show passage + question split-pane
- [ ] Quiz completes → results show GMAT score in 60-90 section range
- [ ] "Practice weak areas" works from results

### Daily Quest
- [ ] 20 questions generated (balanced across V/Q/DI)
- [ ] Quest completion updates section scores
- [ ] Composite score updated (205-805)
- [ ] XP awarded correctly

### Full GMAT Test
- [ ] /full-gmat page loads, shows test availability
- [ ] Cooldown enforced (16 days between tests)
- [ ] Section order picker works (can reorder)
- [ ] Timer runs per section
- [ ] Can review/change answers within a section
- [ ] Section auto-submits on timer expiry
- [ ] Results page shows 3 section scores + total
- [ ] Results shows subtopic breakdown
- [ ] "Practice weak areas" routes correctly

### Voice Features (matching screenshots)
- [ ] Music toggle (♫) works in micro-lesson
- [ ] Mute/unmute works
- [ ] Previous/next step navigation works
- [ ] Volume control works
- [ ] Image attachment to message works
- [ ] Text input + voice input both work
- [ ] TTS (Athena speaking) works during lesson steps
- [ ] STT (student speaks answer) works
```

#### 11.2 — API Testing (automated with curl/jest)

Create `frontend/__tests__/api/gmat-quiz.test.ts`:

```typescript
describe("GMAT Quiz Submit API", () => {
  it("maps verbal subtopic to Verbal section category", async () => { ... });
  it("maps quantitative subtopic to Quantitative section category", async () => { ... });
  it("maps data_insights subtopic to DataInsights section category", async () => { ... });
  it("saves quiz_session with source=gmat", async () => { ... });
  it("updates subsection_skills for gmat section", async () => { ... });
});
```

#### 11.3 — Scoring Unit Tests

Create `frontend/__tests__/lib/gmat-scoring.test.ts`:

```typescript
import { scaleVerbalScore, computeFullGmatScore } from "@/lib/full-gmat/scoring";

test("perfect verbal score = 90", () => {
  expect(scaleVerbalScore(23, 23)).toBe(90);
});
test("zero verbal score = 60", () => {
  expect(scaleVerbalScore(0, 23)).toBe(60);
});
test("perfect total = 805", () => {
  const result = computeFullGmatScore(23, 21, 20);
  expect(result.total).toBe(805);
});
test("zero total = 205", () => {
  const result = computeFullGmatScore(0, 0, 0);
  expect(result.total).toBe(205);
});
test("total is multiple of 10", () => {
  const result = computeFullGmatScore(15, 14, 12);
  expect(result.total % 10).toBe(5); // GMAT totals end in 5 or 0 (actually 205, 215...)
  // Verify in range
  expect(result.total).toBeGreaterThanOrEqual(205);
  expect(result.total).toBeLessThanOrEqual(805);
});
```

#### 11.4 — DB Migrations Test

```bash
# Reset local DB and apply all migrations fresh:
supabase db reset

# Verify tables:
supabase db diff --local

# Check for SQL errors:
psql $SUPABASE_DB_URL -c "\dt" | grep gmat
```

#### 11.5 — Agent Streaming Test

```bash
cd agents
uvicorn app.main:app --port 8080 --reload &

# Test micro-lesson for DS:
curl -X POST http://localhost:8080/micro-lesson/stream \
  -H "Content-Type: application/json" \
  -d '{
    "subtopicSlug": "data-sufficiency",
    "section": "data_insights",
    "questionType": "data_sufficiency"
  }' --no-buffer | head -50

# Verify response mentions A/B/C/D/E framework, not SAT-specific content
```

---

### PHASE 12 — Cleanup & Polish
> Estimated effort: 1 day

#### 12.1 — Grep for remaining SAT references

```bash
grep -r "SAT" frontend/src --include="*.tsx" --include="*.ts" -l
grep -r "sat_" frontend/src --include="*.tsx" --include="*.ts"
grep -r "reading_writing" frontend/src --include="*.tsx" --include="*.ts"
grep -r "1600\|400-1600\|200-800" frontend/src --include="*.tsx" --include="*.ts"
```

Categorize each hit as:
- **Keep** (legacy SAT data path still needed)
- **Replace** (should say GMAT)
- **Delete** (SAT-only feature no longer relevant)

#### 12.2 — CLAUDE.md Update

Update `CLAUDE.md` to reflect:
- New table names (`full_gmat_tests`, `full_gmat_attempts`, `full_gmat_answers`)
- New section categories (`Verbal`, `Quantitative`, `DataInsights`)
- New scoring range (205-805 total, 60-90 per section)
- New query modules (`full-gmat.ts`, `gmat-quiz.ts`)
- New question types (DS, CR, RC, TPA etc.)

#### 12.3 — Memory / Context Updates

Update the `agents/` system prompts to reference GMAT resources:
- Official GMAT Focus Edition prep materials
- GMAT scoring algorithm reference

---

## Implementation Order (Recommended Sprint Sequence)

```
Sprint 1 (Days 1-3): Foundation
  Phase 1 → Phase 2 → Phase 4
  DB schema + scoring system + types
  
Sprint 2 (Days 4-6): API Layer  
  Phase 3 (all routes)
  Test: curl each route, verify DB writes

Sprint 3 (Days 7-9): Curriculum Seed
  Phase 6 (topic tree + problem seeding)
  Test: verify topics/subtopics in Supabase Studio

Sprint 4 (Days 10-12): Core UI
  Phase 5 (components — DS, RC, score displays)
  Phase 8 (onboarding)
  Test: full learning flow in browser

Sprint 5 (Days 13-15): Agents
  Phase 7 (AI prompt updates)
  Test: micro-lesson + tutor chat with GMAT questions

Sprint 6 (Days 16-18): Daily Quest + Full Test
  Phase 9 + Phase 10
  Test: complete quest + complete full GMAT test

Sprint 7 (Days 19-20): QA + Cleanup
  Phase 11 + Phase 12
  Full manual test checklist
```

---

## MCPs & Tools Needed During Development

| Tool / MCP | Used For |
|---|---|
| **Supabase Studio** | Inspect DB tables after each migration, verify data seeding |
| **Supabase CLI** (`supabase db push`, `supabase db reset`) | Apply and test migrations locally |
| **curl** | Test API routes without touching the browser |
| **Browser DevTools Console** | Verify React Query cache keys, check SSE streaming |
| **Postman / Insomnia** (optional) | Easier body composition for complex API requests |
| **ElevenLabs dashboard** | Verify TTS voice is working for new GMAT content |
| **Supabase Log Viewer** | Debug Supabase RLS policy issues |
| **Python REPL / `ipython`** | Test scoring functions in isolation before wiring to agents |
| `supabase db diff` | Catch missing migration columns before pushing to prod |
| TypeScript `tsc --noEmit` | Catch type errors after renaming types |
| `npm run build` | Verify no compilation errors before each phase |

---

## Data Sufficiency — Special Implementation Notes

DS is the most GMAT-unique format and needs careful handling across the entire stack:

### DS Answer Choices (ALWAYS FIXED — never change)
```
A) Statement (1) ALONE is sufficient, but statement (2) alone is not sufficient.
B) Statement (2) ALONE is sufficient, but statement (1) alone is not sufficient.
C) BOTH statements (1) and (2) TOGETHER are sufficient, but NEITHER statement ALONE is sufficient.
D) EACH statement ALONE is sufficient.
E) Statements (1) and (2) TOGETHER are NOT sufficient to answer the question asked, and additional data are needed.
```

The DB `problems.options` JSONB for DS should always contain these exact 5 strings, keyed A-E.

### DS Tutor MUST
- Never conflate "sufficient" with "true" — DS asks if the data is enough to ANSWER, not if the answer is yes/no
- Always evaluate Statement 1 before evaluating Statement 2
- Acknowledge the "yes-or-no loop" trap (a definitive "no" is also sufficient)

### DS in Micro-Lessons
The whiteboard for DS subtopics must include a beat that shows the decision tree:
```
Is Statement 1 alone sufficient?
├── YES → Does Statement 2 also work alone? → YES: D / NO: A
└── NO → Is Statement 2 alone sufficient? → YES: B
             └── NO → Together? → YES: C / NO: E
```

---

## Percentile Reference Table (for results display)

| GMAT Score | Approx. Percentile |
|---|---|
| 805 | 99th |
| 745 | 95th |
| 705 | 90th |
| 665 | 85th |
| 645 | 80th |
| 615 | 75th |
| 575 | 65th |
| 545 | 55th |
| 505 | 45th |
| 465 | 35th |
| 425 | 25th |
| 375 | 15th |
| 315 | 5th |

Store this as a constant array in `frontend/src/lib/full-gmat/scoring.ts` for the results page.

---

## Open Questions — RESOLVED (2026-06-10)

1. **Backward Compatibility** — **GMAT only.** No SAT flow. All users are GMAT students. Remove SAT-specific routes and replace, no dual-mode gating needed.

2. **RC Passage Rendering** — **Dedicated scroll pane.** Split-pane layout: left = scrollable passage text, right = question + options. The current whiteboard canvas is not used for RC passages.

3. **MSR & TPA Rendering** — **Full table rendering (best quality).** Build complete interactive table components with column sorting (TA), multi-column answer grids (TPA), and tabbed source switching (MSR). No shortcuts.

4. **Data Insights with Images** — **Recharts-based chart rendering** for GI questions. Store chart data as structured JSON in `problems.chart_data` JSONB column; render with Recharts (already in the stack). No image uploads — charts are programmatically generated. This is both more flexible and more maintainable.

5. **GMAT Adaptive Algorithm** — **Hybrid approach:**
   - Daily quest: use existing `subsection_skills` bucketing (proven, works well)
   - Full GMAT test: lightweight IRT-inspired adaptive selection — each section starts at medium difficulty (level 5), each correct answer raises target difficulty by 1, each wrong answer lowers it by 1, clamped 1-10. This approximates GMAT's within-section adaptivity without full IRT implementation.

---
