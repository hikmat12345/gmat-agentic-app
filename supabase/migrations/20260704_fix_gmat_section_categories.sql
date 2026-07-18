-- Fix section_category in subsection_skills for GMAT topics.
-- Rows written before the GMAT migration may have 'Math' or 'ReadingWriting' categories
-- for subtopics that belong to GMAT topics (verbal/quantitative/data_insights subjects).
-- This migration maps them to the correct GMAT section categories.

UPDATE subsection_skills ss
SET section_category =
  CASE t.subject
    WHEN 'verbal'         THEN 'Verbal'
    WHEN 'quantitative'   THEN 'Quantitative'
    WHEN 'data_insights'  THEN 'DataInsights'
    ELSE ss.section_category
  END
FROM subtopics st
JOIN topics t ON st.topic_id = t.id
WHERE ss.subtopic_id = st.id
  AND ss.section_category IN ('ReadingWriting', 'Math')
  AND t.subject IN ('verbal', 'quantitative', 'data_insights');
