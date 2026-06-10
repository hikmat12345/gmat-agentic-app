# GMAT Learning Platform — Architecture Reference

## Stack Overview

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, shadcn/ui |
| Database | Supabase (PostgreSQL) — hosted or local |
| Auth | Clerk (`@clerk/nextjs`) |
| Data Fetching | TanStack React Query |
| AI Models | Claude Sonnet 4.6 (primary), GPT-4o-mini (tutoring fallback) |
| Voice | ElevenLabs (TTS + STT) |
| Agents Backend | Python FastAPI + Agno framework (`backend/agents/`, port 8080) |

---

## 1. Frontend Hooks (`frontend/src/hooks/`)

### User & Auth
| Hook | Purpose |
|---|---|
| `use-current-user.ts` | Fetch current user profile + onboarding state; auto-syncs user to Supabase on first load (404 → POST `/api/user/sync` → retry) |

### Daily Quest
| Hook | Purpose |
|---|---|
| `use-daily-quest.ts` | Fetch today's adaptive quest (20 problems); mutations to generate, answer, and complete |

### Full SAT
| Hook | Purpose |
|---|---|
| `use-full-sat.ts` | Fetch available tests, in-progress attempt, cooldown; start/submit mutations |

### Learning & Lessons
| Hook | Purpose |
|---|---|
| `use-micro-lesson.ts` | Generate/stream interactive whiteboard lesson; follow-up chat; session tracking |
| `use-lesson-chat.ts` | Stream lesson follow-up chat with tutor (whiteboard + text) |
| `use-my-learning-topic.ts` | Load/generate custom learning topics and handle their quizzes |
| `use-why-this-matters.ts` | Stream "why this matters" real-world scenario content for a subtopic |

### AI Tutoring
| Hook | Purpose |
|---|---|
| `use-athena-conversation.ts` | Streaming chat for lesson or quiz tutoring (text + voice + whiteboard) |
| `use-mentor-conversation.ts` | Streaming mentor chat with student progress context (text + voice) |

### UI / Utilities
| Hook | Purpose |
|---|---|
| `use-whiteboard-player.ts` | Render whiteboard steps sequentially (visual lesson player) |
| `use-step-player.ts` | Control lesson step playback — pause, rewind, narration |
| `use-audio-analyzer.ts` | Amplitude visualization for voice recording |
| `useSound.ts` | Play audio (TTS output, sound effects) |

---

## 2. Frontend API Routes (`frontend/src/app/api/`)

### User & Auth

| Method | Path | What it does | Calls Agent? |
|---|---|---|---|
| GET | `/api/user/me` | Return current user profile + onboarding state | No |
| POST | `/api/user/sync` | Upsert user from Clerk into DB; send welcome email | No |

### Dashboard & Progress

| Method | Path | What it does | Calls Agent? |
|---|---|---|---|
| GET | `/api/dashboard` | Aggregated dashboard data (streak, XP, progress) | No |
| GET | `/api/progress` | Full progress report (accuracy, section scores, topic mastery) | No |
| GET | `/api/profile` | User profile, rank, weekly streak | No |
| PATCH | `/api/profile` | Update display name | No |
| GET | `/api/profile/schedule` | Get study schedule slots | No |
| PUT | `/api/profile/schedule` | Update schedule + generate 4 weeks of sessions | No |
| GET | `/api/subsection-skills` | Get all adaptive skill levels per subtopic for user | No |

### Analytics

| Method | Path | What it does | Calls Agent? |
|---|---|---|---|
| GET | `/api/analytics/engagement-summary` | Summary of user activity metrics | No |
| GET | `/api/analytics/stuck-points` | Identify weak subtopics and performance bottlenecks | No |

### Onboarding

| Method | Path | What it does | Calls Agent? |
|---|---|---|---|
| POST | `/api/onboarding/plan/complete` | Save name, grade, learner types, interests, struggling topic | No |
| POST | `/api/onboarding/complete` | Mark onboarding as finished | No |
| POST | `/api/schedule` | Set study schedule during onboarding + generate sessions | No |

### Onboarding Quiz

| Method | Path | What it does | Calls Agent? |
|---|---|---|---|
| GET | `/api/quiz/questions` | Get onboarding assessment questions | No |
| POST | `/api/quiz/attempt` | Record attempt on onboarding question; enqueue lesson if wrong | No |
| POST | `/api/quiz/complete` | Finalize onboarding quiz, compute initial skill score | No |

### Pre-built Curriculum (Learning)

| Method | Path | What it does | Calls Agent? |
|---|---|---|---|
| GET | `/api/learning` | All topics + subtopics grouped by subject | No |
| GET | `/api/learning/[topicSlug]/[subtopicSlug]` | Subtopic detail + SAT problems | No |
| GET | `/api/learning/[topicSlug]/[subtopicSlug]/practice-problems` | Get 2 random practice problems for subtopic | No |
| GET/POST | `/api/learning/[topicSlug]/[subtopicSlug]/micro-lesson` | Get or create whiteboard lesson | No |
| GET/POST | `/api/learning/[topicSlug]/[subtopicSlug]/lore` | Get or create "why this matters" whiteboard content | No |

### SAT Quiz (Topic Practice)

| Method | Path | What it does | Calls Agent? |
|---|---|---|---|
| POST | `/api/sat-quiz/submit` | Save SAT quiz session + update skills + streak tracking | No |

### Daily Quest

| Method | Path | What it does | Calls Agent? |
|---|---|---|---|
| GET | `/api/daily-quest` | Get today's quest (20 adaptive problems) or auto-generate | No |
| POST | `/api/daily-quest/generate` | Manually trigger quest generation | No |
| POST | `/api/daily-quest/answer` | Record answer + update subsection skills + XP | No |
| POST | `/api/daily-quest/complete` | Finalize quest, recompute scores, pre-generate tomorrow's | No |

### Full SAT Test

| Method | Path | What it does | Calls Agent? |
|---|---|---|---|
| GET | `/api/full-sat` | Check availability, cooldown, in-progress attempt | No |
| POST | `/api/full-sat/start` | Start new test or resume in-progress | No |
| POST | `/api/full-sat/answer` | Record answer to a test question | No |
| POST | `/api/full-sat/submit` | Finalize, compute scaled scores (400–1600), update skills | No |
| GET | `/api/full-sat/history` | Past test attempts | No |

### My Learning (Custom Free-form Topics)

| Method | Path | What it does | Calls Agent? |
|---|---|---|---|
| GET | `/api/my-learning/topics` | Get user's custom topics | No |
| POST | `/api/my-learning/topics` | Generate topic overview + 10 questions from free-form prompt | **Yes** → `/my-learning/generate` |
| GET | `/api/my-learning/topics/[topicId]` | Fetch custom topic with questions | No |
| GET | `/api/my-learning/topics/[topicId]/practice-problems` | Generate 2 practice problems for custom topic | **Yes** → `/practice-problems` |
| POST | `/api/my-learning/lesson/stream` | Stream lesson markdown for custom topic | **Yes** → `/my-learning/lesson/stream` (SSE) |
| POST | `/api/my-learning/lesson/chat/stream` | Q&A for custom topic lesson | **Yes** → `/my-learning/lesson/chat/stream` (SSE) |
| POST | `/api/my-learning/quiz-chat/stream` | Socratic guide for custom topic quiz | **Yes** → `/my-learning/quiz-chat/stream` (SSE) |
| POST | `/api/my-learning/quiz/submit` | Save custom quiz session + update skills | No |

### AI Agent Proxy Routes

These routes proxy directly to the Python agent service (`AGENT_SERVICE_URL`):

| Method | Path | What it does | Agent Endpoint |
|---|---|---|---|
| POST | `/api/agent/chat/stream` | Lesson follow-up tutoring chat | `AGENT_SERVICE_URL/chat/stream` |
| POST | `/api/agent/mentor-chat/stream` | Motivational mentor chat with student context | `AGENT_SERVICE_URL/mentor-chat/stream` |
| POST | `/api/agent/micro-lesson/stream` | Generate 20–25 step whiteboard lesson | `AGENT_SERVICE_URL/micro-lesson/stream` |
| POST | `/api/agent/micro-lesson/chat/stream` | Q&A during/after micro-lesson | `AGENT_SERVICE_URL/micro-lesson/chat/stream` |
| POST | `/api/agent/quiz-chat/stream` | Socratic quiz guidance (never reveals answer) | `AGENT_SERVICE_URL/quiz-chat/stream` |
| POST | `/api/agent/practice-problems` | Generate 2 random practice problems | `AGENT_SERVICE_URL/practice-problems` |
| POST | `/api/agent/why-this-matters/stream` | Real-world scenario for a math topic | `AGENT_SERVICE_URL/why-this-matters/stream` |
| POST | `/api/agent/speech-to-text` | Audio → text transcription | ElevenLabs API |
| POST | `/api/agent/text-to-speech` | Text → audio | ElevenLabs API |

### Other

| Method | Path | What it does | Calls Agent? |
|---|---|---|---|
| GET | `/api/learning-queue` | Get lessons queued for user | No |
| GET | `/api/lessons/[lessonId]` | Get lesson content | No |
| POST | `/api/lessons/[lessonId]/progress` | Update lesson progress status | No |
| POST | `/api/lesson-summary` | Post-lesson congratulations message | **Yes** → direct Anthropic API call |
| POST | `/api/friends/invite` | Send friend invite by email | No |
| POST | `/api/tracking/micro-lesson-session` | Create/update micro-lesson session tracking | No |
| GET | `/api/health` | DB connectivity check | No |

---

## 3. Database Tables (Supabase PostgreSQL)

### Core

#### `users`
Central user record, one per Clerk identity.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| clerk_id | text UNIQUE | Clerk user ID |
| email | text | |
| display_name | text | |
| avatar_url | text | |
| skill_score | int | Onboarding composite |
| target_score | int | SAT target |
| best_streak | int | All-time best daily streak |
| onboarding_completed | bool | default false |
| start_composite | int | Score at signup |
| current_composite | int | Latest SAT composite estimate |
| current_reading_writing | int | |
| current_math | int | |
| total_xp | int | default 0 |
| timezone | text | |
| created_at / updated_at | timestamptz | |

#### `onboarding_progress`
Tracks which onboarding step the user is on.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK → users | UNIQUE |
| current_step | text | `plan \| quiz \| schedule \| completed` |
| quiz_question_index | int | |
| lesson_preference | text | `view_now \| queue_for_later` |

#### `friendships`

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK → users | |
| friend_user_id | uuid FK → users | |
| status | text | `pending \| accepted \| blocked` |

---

### Curriculum

#### `topics`

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| slug | text UNIQUE | URL-safe identifier |
| name | text | |
| subject | text | `math \| reading_writing` |
| description | text | |
| order_index | int | |

#### `subtopics`

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| topic_id | uuid FK → topics | |
| slug | text | UNIQUE with topic_id |
| name | text | |
| description | text | |
| learning_objectives | jsonb | |
| key_formulas | jsonb | |
| common_mistakes | jsonb | |
| tips | jsonb | |
| order_index | int | |

#### `problems` (unified problem table)
All problems across the app share this table, differentiated by `source`.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| source | text | `sat \| full_sat \| practice \| custom \| onboarding` |
| subtopic_id | uuid FK → subtopics | For sat/full_sat/practice |
| custom_topic_id | uuid FK → custom_topics | For custom |
| topic_slug / subtopic_slug | text | For practice free-form |
| order_index | int | |
| difficulty | text | `easy \| medium \| hard` |
| difficulty_level | int | 1–10 (adaptive) |
| question_text | text | |
| options | jsonb | Array of answer choices |
| correct_option | int | 0-indexed |
| explanation | text | |
| solution_steps | jsonb | |
| hint / detailed_hint | text | |
| concept_tags / common_errors | jsonb | |
| time_recommendation_seconds | int | |
| sat_frequency | text | |

#### `micro_lessons`

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| subtopic_id | uuid FK → subtopics | |
| status | text | `generating \| ready` |
| lesson_content | text | Markdown |
| whiteboard_steps | jsonb | Array of step objects |

#### `subtopic_lore`
"Why this matters" whiteboard content per subtopic.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| subtopic_id | uuid FK → subtopics | |
| status | text | `generating \| ready` |
| whiteboard_steps | jsonb | |

---

### Onboarding Quiz

#### `questions`
Onboarding diagnostic questions.

| Column | Type |
|---|---|
| id | uuid PK |
| order_index | int UNIQUE |
| difficulty | text |
| category | text |
| question_text | text |
| options | jsonb |
| correct_option | int |
| explanation | text |

#### `quiz_attempts`

| Column | Type |
|---|---|
| id | uuid PK |
| user_id | uuid FK → users |
| question_id | uuid FK → questions |
| selected_option | int |
| is_correct | bool |
| time_spent_seconds | int |

#### `lessons`
Pre-built lesson content linked to onboarding questions.

| Column | Type |
|---|---|
| id | uuid PK |
| question_id | uuid FK → questions UNIQUE |
| title | text |
| content | jsonb |
| estimated_duration_minutes | int |

#### `learning_queue`
Lessons queued for the user to review.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK → users | |
| lesson_id | uuid FK → lessons | |
| status | text | `pending \| in_progress \| completed` |
| progress_pct | int | |
| added_during | text | e.g. `onboarding` |

---

### SAT Quiz (Topic Practice)

#### `sat_quiz_sessions`

| Column | Type |
|---|---|
| id | uuid PK |
| user_id | uuid FK → users |
| subtopic_id | uuid FK → subtopics |
| score | int |
| total_questions | int |
| time_elapsed_seconds | int |

#### `sat_quiz_answers`

| Column | Type |
|---|---|
| id | uuid PK |
| session_id | uuid FK → sat_quiz_sessions |
| problem_id | uuid FK → problems |
| selected_option | int |
| is_correct | bool |
| difficulty_level | int |
| response_time_ms | int |

---

### Adaptive System

#### `subsection_skills`
Per-user, per-subtopic adaptive skill tracking.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK → users | |
| subtopic_id | uuid FK → subtopics | |
| section_category | text | `ReadingWriting \| Math` |
| level | int | 1–10 skill level |
| xp | int | |
| total_attempts | int | |
| correct_attempts | int | |
| last_10 | bool[] | Last 10 answers (rolling window) |
| streak_correct | int | |
| streak_wrong | int | |
| last_seen_at | timestamptz | |

#### `daily_quests`

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK → users | |
| quest_date | date | |
| status | text | `pending \| in_progress \| completed` |
| score | int | |
| total_questions | int | default 20 |
| correct_count | int | |
| xp_earned | int | |
| time_elapsed_seconds | int | |

#### `daily_quest_problems`

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| quest_id | uuid FK → daily_quests | |
| problem_id | uuid FK → problems | |
| subtopic_id | uuid FK → subtopics | |
| order_index | int | |
| bucket | text | `weak \| mid \| stretch` |
| difficulty_level | int | |
| selected_option | int | |
| is_correct | bool | |
| response_time_ms | int | |
| answered_at | timestamptz | |

---

### Full SAT Test

#### `full_sat_tests`
Test blueprints (static, reusable).

| Column | Type |
|---|---|
| id | uuid PK |
| test_number | int UNIQUE |
| name | text |
| status | text — `draft \| active \| retired` |

#### `full_sat_test_problems`
Maps problems into a test with order.

| Column | Type |
|---|---|
| id | uuid PK |
| test_id | uuid FK → full_sat_tests |
| problem_id | uuid FK → problems |
| section | text — `reading_writing \| math` |
| module | int — 1 or 2 |
| order_index | int |

#### `full_sat_attempts`
One per user per test sitting.

| Column | Type |
|---|---|
| id | uuid PK |
| user_id | uuid FK → users |
| test_id | uuid FK → full_sat_tests |
| status | text — `in_progress \| completed \| abandoned` |
| rw_raw_score / rw_scaled_score | int |
| math_raw_score / math_scaled_score | int |
| total_score | int — 400–1600 |
| rw_module1_correct / math_module1_correct | int |
| rw_time_seconds / math_time_seconds / total_time_seconds | int |
| completed_at | timestamptz |

#### `full_sat_answers`

| Column | Type |
|---|---|
| id | uuid PK |
| attempt_id | uuid FK → full_sat_attempts |
| problem_id | uuid FK → problems |
| section / module / order_index | text / int |
| selected_option | int |
| is_correct | bool |
| response_time_ms | int |

---

### Custom Learning

#### `custom_topics`

| Column | Type |
|---|---|
| id | uuid PK |
| user_id | uuid FK → users |
| title | text |
| description | text |
| learning_objectives | jsonb |
| tips_and_tricks | jsonb |
| common_mistakes | jsonb |

#### `custom_topic_questions`

| Column | Type |
|---|---|
| id | uuid PK |
| custom_topic_id | uuid FK → custom_topics |
| order_index | int |
| difficulty | text |
| question_text | text |
| options | jsonb |
| correct_option | int |
| explanation | text |
| solution_steps | jsonb |
| hint | text |

---

### Scheduling

#### `schedules`

| Column | Type |
|---|---|
| id | uuid PK |
| user_id | uuid FK → users |
| days_of_week | jsonb — array of weekday names |
| time_of_day | text |
| duration_minutes | int |

#### `sessions`
Individual study sessions generated from schedule.

| Column | Type |
|---|---|
| id | uuid PK |
| user_id | uuid FK → users |
| schedule_id | uuid FK → schedules |
| scheduled_date | date |
| status | text — `pending \| completed \| skipped` |

---

### Analytics & Tracking

#### `quiz_question_events`

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| session_id | uuid | SAT quiz session ref |
| user_id | uuid FK → users | |
| problem_id | uuid FK → problems | |
| event_type | text | `hint_used \| tutor_used \| practice_completed` |
| response_time_ms | int | |
| selected_option | int | |
| wrong_count | int | |
| practice_problem_id | uuid | |
| timestamp | timestamptz | |

#### `micro_lesson_sessions`

| Column | Type |
|---|---|
| id | uuid PK |
| user_id | uuid FK → users |
| micro_lesson_id | uuid |
| subtopic_id | uuid FK → subtopics |
| total_steps / steps_viewed | int |
| checkins_correct / checkins_total | int |
| chat_messages | int |
| duration_seconds | int |
| ended / completed | bool |

#### `email_notifications`

| Column | Type |
|---|---|
| id | uuid PK |
| user_id | uuid FK → users |
| type | text — `session_reminder \| quest_reminder \| weekly_digest` |
| status | text — `pending \| sent \| failed` |
| sent_at | timestamptz |

---

## 4. Agent Service (`backend/agents/`)

Base URL: `http://localhost:8080` (local) or `$AGENT_SERVICE_URL` (Docker)

### FastAPI Endpoints

#### Streaming (Server-Sent Events)

| Method | Path | Agent Used | Role |
|---|---|---|---|
| POST | `/chat/stream` | `tutoring_agent` | Lesson follow-up Q&A |
| POST | `/mentor-chat/stream` | `mentor_agent` | Motivational coaching |
| POST | `/quiz-chat/stream` | `quiz_tutor_agent` | Socratic quiz guidance |
| POST | `/micro-lesson/stream` | `micro_lesson_agent` | Full whiteboard lesson generation |
| POST | `/micro-lesson/chat/stream` | `micro_lesson_agent` | Chat during/after lesson |
| POST | `/why-this-matters/stream` | `whiteboard_agent` | Real-world scenario steps |
| POST | `/my-learning/lesson/stream` | `my_learning_lesson_agent` | Custom topic lesson (markdown) |
| POST | `/my-learning/lesson/chat/stream` | `my_learning_lesson_agent` | Custom topic lesson Q&A |
| POST | `/my-learning/quiz-chat/stream` | `my_learning_quiz_tutor_agent` | Custom topic quiz guidance |

#### Non-streaming (JSON)

| Method | Path | Agent Used | Role |
|---|---|---|---|
| POST | `/my-learning/generate` | `my_learning_generator` | Topic overview + 10 quiz questions |
| POST | `/practice-problems` | `problem_generator` | 2 random practice problems |
| POST | `/lesson-summary` | Direct Anthropic call | Post-lesson congratulations message |

#### SSE Response Format
```
data: {"token": "some text..."}   ← text before <<<WHITEBOARD>>> delimiter
data: {"wb_step": {...}}           ← parsed whiteboard step JSON
data: [DONE]                       ← stream end signal
```

---

### Runtime Agents (Real-time)

#### `tutoring_agent` — Lesson Q&A
- **Role:** Answers follow-up questions about a lesson the student just completed
- **Model:** GPT-4o-mini
- **Input:** Lesson content + student question
- **Output:** Streaming text (+ optional whiteboard steps)
- **DB access:** None (stateless)

#### `mentor_agent` — Motivational Coach
- **Role:** SAT prep coach that knows the student's history; provides encouragement, study tips, context-aware motivation
- **Model:** Claude Sonnet 4.6
- **Input:** Student progress data (scores, streak, weak areas) + student message
- **Output:** Streaming conversational text
- **DB access:** Reads `users`, progress data (passed in request body)

#### `micro_lesson_agent` — Whiteboard Lesson Generator
- **Role:** Generates a 20–25 step interactive whiteboard lesson for a subtopic; also handles follow-up chat during the lesson
- **Model:** Claude Sonnet 4.6
- **Input:** Subtopic name, topic, learning objectives, key formulas
- **Output:** Streaming text + whiteboard step JSON objects separated by `<<<WHITEBOARD>>>` delimiter
- **DB access:** Reads subtopic metadata (passed in request body)
- **Whiteboard step schema:** `{ type, content, elements[], duration_ms }`

#### `quiz_tutor_agent` — Socratic Quiz Guide
- **Role:** Helps stuck students understand a SAT problem without revealing the answer; uses Socratic questioning
- **Model:** Claude Sonnet 4.6
- **Input:** Problem text, options, student's wrong answers, conversation history
- **Output:** Streaming guided hints and questions
- **DB access:** None

#### `whiteboard_agent` — "Why This Matters" Generator
- **Role:** Creates a real-world story/scenario showing practical relevance of a math concept; outputs as whiteboard steps
- **Model:** Claude Sonnet 4.6
- **Input:** Topic and subtopic name
- **Output:** Streaming whiteboard step JSON
- **DB access:** None

---

### Runtime Agents (Custom / My Learning)

#### `my_learning_generator` — Topic Generator
- **Role:** Takes a free-form topic prompt from the student and generates a structured learning module with overview, objectives, tips, common mistakes, and 10 quiz questions
- **Model:** Claude Sonnet 4.6
- **Input:** Free-form topic string (e.g. "photosynthesis", "World War 2 causes")
- **Output:** JSON — `{ title, description, learning_objectives, tips_and_tricks, common_mistakes, questions[] }`
- **DB access:** Writes to `custom_topics`, `custom_topic_questions`

#### `my_learning_lesson_agent` — Custom Topic Lesson
- **Role:** Generates a lesson in markdown format for any non-SAT subject
- **Model:** Claude Sonnet 4.6
- **Input:** Topic title, description, learning objectives
- **Output:** Streaming markdown with `##` headings (no whiteboard in lesson mode)
- **DB access:** None

#### `my_learning_quiz_tutor_agent` — Custom Topic Quiz Guide
- **Role:** Socratic guide for custom topic quizzes (same pattern as `quiz_tutor_agent` but subject-agnostic)
- **Model:** Claude Sonnet 4.6
- **Input:** Question, options, student's wrong attempts, conversation history
- **Output:** Streaming hints and guiding questions
- **DB access:** None

---

### Pre-generation Agents (Batch / Offline)

Run via `make generate-content` or `make generate-practice-problems` — not called at runtime.

#### `topic_generator` — Curriculum Topics
- **Role:** Generates SAT topic metadata (overview, difficulty, SAT relevance, display order)
- **Model:** Claude
- **DB writes:** `topics` table

#### `subtopic_generator` — Curriculum Subtopics
- **Role:** Generates subtopic detail — description, learning objectives, key formulas, common mistakes, tips
- **Model:** Claude
- **DB writes:** `subtopics` table

#### `lesson_generator` — Pre-built Lessons
- **Role:** Generates detailed whiteboard lesson content for curriculum subtopics
- **Model:** Claude
- **DB writes:** `micro_lessons` table

#### `problem_generator` — SAT Problems
- **Role:** Generates SAT math practice problems with full solutions, hints, difficulty 1–10, concept tags, common errors
- **Model:** Claude
- **DB writes:** `problems` (source = `sat`)

#### `practice_problem_seeder` — Practice Problems Bulk
- **Role:** Seeds practice problems for every subtopic in bulk
- **Model:** Claude
- **DB writes:** `problems` (source = `practice`)

#### `full_sat_seeder` — Full SAT Test Assembly
- **Role:** Assembles complete full-SAT test blueprints from the problem pool; assigns problems to sections, modules, order
- **DB reads:** `problems` (source = `full_sat`)
- **DB writes:** `full_sat_tests`, `full_sat_test_problems`

#### `content_workflow` — Pipeline Orchestrator
- **Role:** Chains all pre-generation steps in order: topics → subtopics → problems → practice problems
- **Entry point:** `make generate-content`

---

## 5. Data Flow Diagrams

### User Sign-up / First Load
```
Browser → Clerk sign-up
       → GET /api/user/me → 404
       → POST /api/user/sync → Supabase upsert users (service role key)
       → GET /api/user/me → 200 { user, onboarding }
       → redirect to /onboarding/plan
```

### Quiz (SAT Topic Practice)
```
/learning/[topic]/[subtopic]/quiz/1
  ├── GET /api/quiz/questions (preloaded)
  ├── Correct → auto-advance (1.2s)
  ├── 1 wrong → hint phase
  ├── 2 wrong → tutor phase
  │     └── POST /api/agent/quiz-chat/stream → quiz_tutor_agent (SSE)
  ├── Correct in tutor → practice phase
  │     └── GET /api/learning/.../practice-problems → 2 problems
  └── All done → POST /api/sat-quiz/submit → update subsection_skills
```

### Micro-lesson
```
/learning/[topic]/[subtopic]/micro-lesson
  ├── GET /api/learning/.../micro-lesson
  │     └── If missing → POST /api/agent/micro-lesson/stream (SSE)
  │           └── micro_lesson_agent → whiteboard_steps JSON
  ├── User watches steps (use-whiteboard-player)
  └── Follow-up question → POST /api/agent/micro-lesson/chat/stream (SSE)
```

### Daily Quest (Adaptive)
```
GET /api/daily-quest
  └── auto-generates if none for today
       └── adaptive engine selects 20 problems:
             33% weak subtopics (low skill_level)
             34% mid subtopics
             33% stretch subtopics
  POST /api/daily-quest/answer (per question)
       └── updates subsection_skills.last_10, level, xp
  POST /api/daily-quest/complete
       └── recomputes composite scores
       └── pre-generates tomorrow's quest
```

### Custom Learning (My Learning)
```
POST /api/my-learning/topics (free-form prompt)
  └── agent /my-learning/generate → my_learning_generator
       └── returns { title, questions[] }
       └── saved to custom_topics + custom_topic_questions

GET /api/my-learning/topics/[id]
POST /api/my-learning/lesson/stream → my_learning_lesson_agent (SSE)
POST /api/my-learning/quiz-chat/stream → my_learning_quiz_tutor_agent (SSE)
```

---

## 6. External Services

| Service | Used for | Env var |
|---|---|---|
| **Clerk** | Auth, user identity | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` |
| **Supabase** | PostgreSQL DB | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
| **Anthropic** | Claude Sonnet 4.6 for all agents | `ANTHROPIC_API_KEY` |
| **ElevenLabs** | TTS + STT for voice features | `ELEVENLABS_API_KEY` |
| **Microsoft Clarity** | Session recording / analytics | `NEXT_PUBLIC_CLARITY_ID` |
