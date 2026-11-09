#!/usr/bin/env bash
# ============================================================
# Push schema + seed data to the CLOUD Supabase project.
#
# Run from the repo root, in Git Bash:
#   bash scripts/push-schema-to-cloud.sh
#
# Reads DATABASE_URL from .env.production.cloud (fill in <DB_PASSWORD> first).
# Requires: supabase CLI, psql.
# ============================================================
set -euo pipefail

PROJECT_REF="oxgyjwcwxzdkmsupunkq"
ENV_FILE=".env.production.cloud"

cd "$(dirname "$0")/.."

if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: $ENV_FILE not found. Run from the repo root." >&2
  exit 1
fi

DATABASE_URL="$(grep -E '^DATABASE_URL=' "$ENV_FILE" | cut -d= -f2-)"

if [[ "$DATABASE_URL" == *"<DB_PASSWORD>"* ]]; then
  echo "ERROR: replace <DB_PASSWORD> in $ENV_FILE first." >&2
  echo "       Supabase dashboard -> Settings -> Database -> Database password" >&2
  exit 1
fi

echo "==> 1/3  Linking to cloud project $PROJECT_REF"
# supabase/.temp/project-ref currently holds a stale ref; this overwrites it.
supabase link --project-ref "$PROJECT_REF"

echo "==> 2/3  Pushing 25 migrations"
supabase db push

echo "==> 3/3  Seeding content"
# Order matters: topics create the rows that the quiz questions reference.
SEEDS=(
  "supabase/seed_gmat_topics.sql"
  "supabase/seed_gmat_quiz_questions.sql"
  "supabase/seed_onboarding_questions.sql"
  "supabase/seed_detailed_hints_linear_eq.sql"
)

for f in "${SEEDS[@]}"; do
  echo "    -> $f"
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$f"
done

echo ""
echo "==> Verifying"
psql "$DATABASE_URL" -c "select count(*) as tables from information_schema.tables where table_schema='public';"
psql "$DATABASE_URL" -c "select count(*) as topics from topics;" || true
psql "$DATABASE_URL" -c "select count(*) as problems from problems;" || true

echo ""
echo "Done. Check https://gmat-agentic-app.vercel.app/api/health"
echo "Expected: {\"status\":\"ok\",\"database\":\"connected\"}"
