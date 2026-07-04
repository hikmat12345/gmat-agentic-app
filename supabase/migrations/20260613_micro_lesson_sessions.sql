-- Micro-lesson session tracking table
CREATE TABLE IF NOT EXISTS micro_lesson_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  micro_lesson_id UUID NOT NULL REFERENCES micro_lessons(id) ON DELETE CASCADE,
  subtopic_id UUID NOT NULL REFERENCES subtopics(id) ON DELETE CASCADE,
  total_steps INTEGER NOT NULL DEFAULT 0,
  steps_viewed INTEGER NOT NULL DEFAULT 0,
  checkins_correct INTEGER NOT NULL DEFAULT 0,
  checkins_total INTEGER NOT NULL DEFAULT 0,
  chat_messages INTEGER NOT NULL DEFAULT 0,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  last_heartbeat_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
