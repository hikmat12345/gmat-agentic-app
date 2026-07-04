-- GMAT migration: extends the unified problems schema to support GMAT Focus Edition.
-- Adds GMAT source values, section categories, 3-section user scores, chart_data column,
-- question_type column, and Full GMAT test tables.

-- ============================================================
-- A. Extend problem_source enum with GMAT values
-- ============================================================

ALTER TYPE problem_source ADD VALUE IF NOT EXISTS 'gmat';
ALTER TYPE problem_source ADD VALUE IF NOT EXISTS 'full_gmat';

-- Extend session_source enum
ALTER TYPE session_source ADD VALUE IF NOT EXISTS 'gmat';

-- Enum values are committed immediately with IF NOT EXISTS — no COMMIT/BEGIN needed.

-- ============================================================
-- B. Update problems table: add GMAT-specific columns
-- ============================================================

-- question_type: distinguishes GMAT question formats
ALTER TABLE problems ADD COLUMN IF NOT EXISTS question_type TEXT DEFAULT NULL;
-- Values: 'problem_solving', 'critical_reasoning', 'reading_comprehension',
--         'data_sufficiency', 'multi_source_reasoning', 'table_analysis',
--         'graphics_interpretation', 'two_part_analysis'

-- chart_data: structured JSON for Graphics Interpretation charts (rendered via Recharts)
ALTER TABLE problems ADD COLUMN IF NOT EXISTS chart_data JSONB DEFAULT NULL;

-- passage_text: for Reading Comprehension multi-question passages
ALTER TABLE problems ADD COLUMN IF NOT EXISTS passage_text TEXT DEFAULT NULL;

-- gmat_frequency: replaces sat_frequency for GMAT content
ALTER TABLE problems ADD COLUMN IF NOT EXISTS gmat_frequency TEXT DEFAULT NULL;

-- Update the source_linking constraint to include GMAT sources
ALTER TABLE problems DROP CONSTRAINT problems_source_linking;
ALTER TABLE problems ADD CONSTRAINT problems_source_linking CHECK (
  CASE source
    WHEN 'sat'        THEN subtopic_id IS NOT NULL
    WHEN 'full_sat'   THEN subtopic_id IS NOT NULL
    WHEN 'gmat'       THEN subtopic_id IS NOT NULL
    WHEN 'full_gmat'  THEN subtopic_id IS NOT NULL
    WHEN 'practice'   THEN subtopic_id IS NOT NULL OR (topic_slug IS NOT NULL AND subtopic_slug IS NOT NULL)
    WHEN 'custom'     THEN custom_topic_id IS NOT NULL
    WHEN 'onboarding' THEN true
  END
);

-- ============================================================
-- C. topics table: add GMAT subjects
-- ============================================================

ALTER TABLE topics DROP CONSTRAINT IF EXISTS topics_subject_check;
ALTER TABLE topics ADD CONSTRAINT topics_subject_check
  CHECK (subject IN ('math', 'reading_writing', 'verbal', 'quantitative', 'data_insights'));

-- Add gmat_relevance column (replaces sat_relevance context for GMAT topics)
ALTER TABLE topics ADD COLUMN IF NOT EXISTS gmat_relevance JSONB DEFAULT NULL;

-- ============================================================
-- D. subsection_skills: add GMAT section categories
-- ============================================================

ALTER TABLE subsection_skills DROP CONSTRAINT IF EXISTS subsection_skills_section_category_check;
ALTER TABLE subsection_skills ADD CONSTRAINT subsection_skills_section_category_check
  CHECK (section_category IN ('ReadingWriting', 'Math', 'Verbal', 'Quantitative', 'DataInsights'));

-- ============================================================
-- E. users table: add GMAT score columns
-- ============================================================

-- GMAT per-section scores (60-90 scale)
ALTER TABLE users ADD COLUMN IF NOT EXISTS current_verbal            INTEGER DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS current_quantitative      INTEGER DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS current_data_insights     INTEGER DEFAULT NULL;

-- GMAT score baseline (205-805 scale; reuses current_composite and start_composite)

-- ============================================================
-- F. full_gmat_tests — reusable GMAT test blueprints
-- ============================================================

CREATE TABLE IF NOT EXISTS full_gmat_tests (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_number INTEGER NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'retired')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- G. full_gmat_test_problems — maps problems into GMAT test sections
-- No module concept in GMAT Focus Edition (single adaptive pass per section)
-- ============================================================

CREATE TABLE IF NOT EXISTS full_gmat_test_problems (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id     UUID NOT NULL REFERENCES full_gmat_tests(id) ON DELETE CASCADE,
  problem_id  UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  section     TEXT NOT NULL CHECK (section IN ('verbal', 'quantitative', 'data_insights')),
  order_index INTEGER NOT NULL,
  CONSTRAINT full_gmat_test_problems_unique UNIQUE (test_id, section, order_index)
);

CREATE INDEX IF NOT EXISTS idx_fgt_problems_test ON full_gmat_test_problems(test_id);
CREATE INDEX IF NOT EXISTS idx_fgt_problems_test_section ON full_gmat_test_problems(test_id, section);

-- ============================================================
-- H. full_gmat_attempts — per-user GMAT test attempts
-- ============================================================

CREATE TABLE IF NOT EXISTS full_gmat_attempts (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  test_id                     UUID NOT NULL REFERENCES full_gmat_tests(id) ON DELETE CASCADE,
  status                      TEXT NOT NULL DEFAULT 'in_progress'
    CHECK (status IN ('in_progress', 'completed', 'abandoned')),

  -- Section raw scores (correct count)
  verbal_raw_score            INTEGER DEFAULT 0,
  quantitative_raw_score      INTEGER DEFAULT 0,
  data_insights_raw_score     INTEGER DEFAULT 0,

  -- Section scaled scores (60-90)
  verbal_scaled_score         INTEGER DEFAULT NULL,
  quantitative_scaled_score   INTEGER DEFAULT NULL,
  data_insights_scaled_score  INTEGER DEFAULT NULL,

  -- Total score (205-805, rounded to nearest 10)
  total_score                 INTEGER DEFAULT NULL,

  -- Timing per section (seconds)
  verbal_time_seconds         INTEGER DEFAULT 0,
  quantitative_time_seconds   INTEGER DEFAULT 0,
  data_insights_time_seconds  INTEGER DEFAULT 0,
  total_time_seconds          INTEGER DEFAULT 0,

  -- Section order chosen by test-taker (GMAT Focus Edition feature)
  section_order               JSONB NOT NULL DEFAULT '["verbal","quantitative","data_insights"]'::jsonb,

  -- Current navigation position (for resuming)
  current_section             TEXT DEFAULT 'verbal',
  current_question            INTEGER DEFAULT 0,

  started_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at                TIMESTAMPTZ DEFAULT NULL,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_full_gmat_attempts_user ON full_gmat_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_full_gmat_attempts_user_status ON full_gmat_attempts(user_id, status);
CREATE INDEX IF NOT EXISTS idx_full_gmat_attempts_user_completed ON full_gmat_attempts(user_id, completed_at DESC);

-- ============================================================
-- I. full_gmat_answers — per-question answers within an attempt
-- ============================================================

CREATE TABLE IF NOT EXISTS full_gmat_answers (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id       UUID NOT NULL REFERENCES full_gmat_attempts(id) ON DELETE CASCADE,
  problem_id       UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  section          TEXT NOT NULL CHECK (section IN ('verbal', 'quantitative', 'data_insights')),
  order_index      INTEGER NOT NULL,
  -- For Two-Part Analysis, the answer is a JSON object with two keys
  selected_option  TEXT DEFAULT NULL,
  is_correct       BOOLEAN DEFAULT NULL,
  response_time_ms INTEGER DEFAULT NULL,
  answered_at      TIMESTAMPTZ DEFAULT NULL,
  CONSTRAINT full_gmat_answers_attempt_order UNIQUE (attempt_id, section, order_index)
);

CREATE INDEX IF NOT EXISTS idx_full_gmat_answers_attempt ON full_gmat_answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_full_gmat_answers_attempt_section ON full_gmat_answers(attempt_id, section);

-- ============================================================
-- J. RLS policies for GMAT tables
-- ============================================================

ALTER TABLE full_gmat_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE full_gmat_test_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE full_gmat_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE full_gmat_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active gmat tests"
  ON full_gmat_tests FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read gmat test problems"
  ON full_gmat_test_problems FOR SELECT
  USING (true);

CREATE POLICY "Users can read own gmat attempts"
  ON full_gmat_attempts FOR SELECT
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own gmat attempts"
  ON full_gmat_attempts FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own gmat attempts"
  ON full_gmat_attempts FOR UPDATE
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can read own gmat answers"
  ON full_gmat_answers FOR SELECT
  USING (attempt_id IN (
    SELECT id FROM full_gmat_attempts WHERE user_id::text = auth.uid()::text
  ));

CREATE POLICY "Users can insert own gmat answers"
  ON full_gmat_answers FOR INSERT
  WITH CHECK (attempt_id IN (
    SELECT id FROM full_gmat_attempts WHERE user_id::text = auth.uid()::text
  ));

CREATE POLICY "Users can update own gmat answers"
  ON full_gmat_answers FOR UPDATE
  USING (attempt_id IN (
    SELECT id FROM full_gmat_attempts WHERE user_id::text = auth.uid()::text
  ));

-- ============================================================
-- K. Indexes for new columns on problems
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_problems_question_type ON problems(question_type) WHERE question_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_problems_gmat_subtopic ON problems(subtopic_id, difficulty_level) WHERE source IN ('gmat', 'full_gmat');

-- ============================================================
-- L. Grants (Supabase v2 no longer auto-grants to anon/authenticated/service_role)
-- ============================================================
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
