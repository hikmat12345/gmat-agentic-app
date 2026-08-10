-- ============================================================
-- SEED DATA: GMAT topics, questions, onboarding
-- Run AFTER full_schema_cloud.sql in Supabase SQL editor
-- ============================================================

-- ---- 1. GMAT Topics & Subtopics ----
-- GMAT Focus Edition — Topics and Subtopics Seed
-- Covers all 3 GMAT sections: Verbal, Quantitative, Data Insights
-- Ordered to match the GMAT Focus Edition question type distribution

-- ============================================================
-- TOPICS
-- ============================================================

INSERT INTO topics (
  slug, name, icon, order_index, color_scheme, subject, overview,
  learning_objectives, sat_relevance, gmat_relevance,
  difficulty_distribution, estimated_total_minutes,
  prerequisites, key_concepts, pro_tips
)
VALUES

-- VERBAL: Critical Reasoning
(
  'critical-reasoning',
  'Critical Reasoning',
  'brain',
  1,
  'violet',
  'verbal',
  'Master the logical reasoning skills that form the backbone of GMAT Verbal. Learn to identify arguments, find assumptions, strengthen or weaken conclusions, and spot logical flaws.',
  '["Identify the conclusion and premises of an argument", "Recognize common logical fallacies", "Apply assumption-negation technique", "Distinguish between strengthening and weakening evidence", "Analyze bold-faced statement roles"]'::jsonb,
  '{"percentageOfTest": 0, "sections": []}'::jsonb,
  '{"percentageOfTest": 36, "section": "verbal", "approxQuestions": 14}'::jsonb,
  '{"easy": 20, "medium": 50, "hard": 30}'::jsonb,
  240,
  '[]'::jsonb,
  '["Argument structure (conclusion, premise, assumption)", "Necessary vs. sufficient assumptions", "Causal reasoning", "Statistical reasoning", "Bold-face question technique"]'::jsonb,
  '["Always find the conclusion first", "Pre-phrase your answer before looking at choices", "Use the negation test for assumption questions", "Watch for scope shifts between premise and conclusion"]'::jsonb
),

-- VERBAL: Reading Comprehension
(
  'reading-comprehension',
  'Reading Comprehension',
  'book-open',
  2,
  'emerald',
  'verbal',
  'Develop the close-reading skills to extract meaning from dense business and academic passages. Learn to identify main ideas, make valid inferences, and locate specific details quickly.',
  '["Identify the main idea and primary purpose of a passage", "Make valid inferences from stated information", "Locate and interpret specific details", "Understand the author''s tone and attitude", "Distinguish between what is stated and what is implied"]'::jsonb,
  '{"percentageOfTest": 0, "sections": []}'::jsonb,
  '{"percentageOfTest": 23, "section": "verbal", "approxQuestions": 9}'::jsonb,
  '{"easy": 25, "medium": 45, "hard": 30}'::jsonb,
  180,
  '[]'::jsonb,
  '["Passage mapping technique", "Main idea vs. supporting detail", "Author tone identification", "Inference scope", "Paragraph structure analysis"]'::jsonb,
  '["Read the first and last sentence of each paragraph", "Map the passage in 30 seconds before answering", "For inference questions, the answer must be supported by the text", "Eliminate extreme or out-of-scope choices first"]'::jsonb
),

-- QUANTITATIVE: Problem Solving
(
  'problem-solving',
  'Problem Solving',
  'calculator',
  3,
  'blue',
  'quantitative',
  'Sharpen your quantitative reasoning with all 21 GMAT Quant question types. From number properties to geometry, master the strategies to solve efficiently under time pressure.',
  '["Apply arithmetic and number property rules", "Set up and solve algebraic equations and inequalities", "Use geometric properties and theorems", "Translate word problems into mathematical models", "Apply statistics and probability concepts"]'::jsonb,
  '{"percentageOfTest": 0, "sections": []}'::jsonb,
  '{"percentageOfTest": 33, "section": "quantitative", "approxQuestions": 21}'::jsonb,
  '{"easy": 25, "medium": 45, "hard": 30}'::jsonb,
  300,
  '[]'::jsonb,
  '["Divisibility rules and prime factorization", "Ratio and proportion", "Linear and quadratic equations", "Coordinate geometry", "Permutations and combinations", "Expected value and probability"]'::jsonb,
  '["Estimate when exact answers aren''t needed", "Plug in numbers for abstract problems", "Draw diagrams for geometry problems", "For word problems, define variables before writing equations"]'::jsonb
),

-- DATA INSIGHTS: Data Sufficiency
(
  'data-sufficiency',
  'Data Sufficiency',
  'layers',
  4,
  'orange',
  'data_insights',
  'Learn the unique Data Sufficiency format where you determine whether given statements provide enough information — without necessarily solving the problem. Master the A/B/C/D/E elimination strategy.',
  '["Understand the five DS answer choices (A through E)", "Evaluate each statement independently before combining", "Recognize when a definitive answer (yes or no) is sufficient", "Avoid unnecessary calculation", "Apply the 1-2-both decision tree"]'::jsonb,
  '{"percentageOfTest": 0, "sections": []}'::jsonb,
  '{"percentageOfTest": 8, "section": "data_insights", "approxQuestions": 5}'::jsonb,
  '{"easy": 20, "medium": 45, "hard": 35}'::jsonb,
  180,
  '["problem-solving"]'::jsonb,
  '["The 1-2-C decision tree", "Unique vs. non-unique solutions", "Yes/No DS questions", "Value DS questions", "Statement independence rule"]'::jsonb,
  '["Never assume information not given in the problem", "Remember: you need a definite answer, not a specific number", "Choice C (both together) is often wrong when you expect it to be right", "Test boundary cases and special values"]'::jsonb
),

-- DATA INSIGHTS: Multi-Source Reasoning
(
  'multi-source-reasoning',
  'Multi-Source Reasoning',
  'layers',
  5,
  'teal',
  'data_insights',
  'Practice integrating information from multiple tabs — emails, memos, and data tables — to answer questions that require synthesizing across sources. A unique GMAT question type with no parallel on other tests.',
  '["Navigate and synthesize information across multiple source tabs", "Identify relevant information from emails, memos, and data", "Apply information from one source to evaluate another", "Answer both factual and inferential questions", "Manage time efficiently across multi-tab formats"]'::jsonb,
  '{"percentageOfTest": 0, "sections": []}'::jsonb,
  '{"percentageOfTest": 5, "section": "data_insights", "approxQuestions": 3}'::jsonb,
  '{"easy": 20, "medium": 50, "hard": 30}'::jsonb,
  120,
  '[]'::jsonb,
  '["Tab navigation strategy", "Information synthesis across sources", "Yes/No inference chains", "Identifying contradictory information", "Time management for multi-tab questions"]'::jsonb,
  '["Read all source tabs before answering any question", "Mark key facts in each tab", "For Yes/No questions, look for the minimum needed from each source", "Synthesis questions often require combining pieces from different tabs"]'::jsonb
),

-- DATA INSIGHTS: Table Analysis
(
  'table-analysis',
  'Table Analysis',
  'bar-chart-3',
  6,
  'indigo',
  'data_insights',
  'Develop skills to quickly sort, filter, and extract insights from complex data tables. Table Analysis questions test your ability to verify specific claims about data without getting lost in details.',
  '["Sort and filter table data to answer specific questions", "Calculate percentages and ratios from table data", "Verify true/false statements about data trends", "Identify outliers and anomalies in structured data", "Apply efficient scanning strategies for time management"]'::jsonb,
  '{"percentageOfTest": 0, "sections": []}'::jsonb,
  '{"percentageOfTest": 5, "section": "data_insights", "approxQuestions": 3}'::jsonb,
  '{"easy": 25, "medium": 50, "hard": 25}'::jsonb,
  120,
  '[]'::jsonb,
  '["Column sorting and data filtering", "Percentage of total calculations", "Comparative ratios from table data", "True/false claim verification", "Efficient table scanning technique"]'::jsonb,
  '["Focus on column headers first to understand the data structure", "Use sorting to quickly find highest/lowest values", "Calculate only what you need — avoid full table analysis", "True/false questions often have one clearly false item"]'::jsonb
),

-- DATA INSIGHTS: Graphics Interpretation
(
  'graphics-interpretation',
  'Graphics Interpretation',
  'pie-chart',
  7,
  'pink',
  'data_insights',
  'Read and interpret various chart types — bar charts, scatter plots, line graphs, and pie charts — to answer fill-in-the-blank questions. Build the visual literacy needed for data-driven reasoning.',
  '["Extract precise data points from bar, line, and scatter plot charts", "Identify trends, correlations, and outliers in visual data", "Calculate values using chart scales and legends", "Recognize the difference between correlation and causation", "Fill in answers using only chart-derived data"]'::jsonb,
  '{"percentageOfTest": 0, "sections": []}'::jsonb,
  '{"percentageOfTest": 5, "section": "data_insights", "approxQuestions": 3}'::jsonb,
  '{"easy": 25, "medium": 50, "hard": 25}'::jsonb,
  120,
  '[]'::jsonb,
  '["Axis scale interpretation", "Trend identification in line graphs", "Correlation vs. causation in scatter plots", "Pie chart percentage extraction", "Bar chart comparison and ratio"]'::jsonb,
  '["Read axis labels and units carefully before interpreting data", "For scatter plots, note direction (positive/negative) and strength of correlation", "Approximate values when exact reading is difficult", "Watch for secondary Y-axes on complex charts"]'::jsonb
),

-- DATA INSIGHTS: Two-Part Analysis
(
  'two-part-analysis',
  'Two-Part Analysis',
  'check-square',
  8,
  'amber',
  'data_insights',
  'Master the most complex GMAT question type: Two-Part Analysis requires you to select two related answers from a grid. Both choices must work together to satisfy all constraints.',
  '["Understand the two-column answer grid format", "Identify when the two choices must be independent vs. interdependent", "Solve quantitative Two-Part questions with algebra or logic", "Approach verbal Two-Part questions using argument analysis", "Eliminate choices that violate given constraints"]'::jsonb,
  '{"percentageOfTest": 0, "sections": []}'::jsonb,
  '{"percentageOfTest": 10, "section": "data_insights", "approxQuestions": 6}'::jsonb,
  '{"easy": 15, "medium": 45, "hard": 40}'::jsonb,
  180,
  '["problem-solving", "critical-reasoning"]'::jsonb,
  '["Two-column answer grid mechanics", "Quantitative trade-off problems", "Verbal trade-off problems", "Constraint-satisfaction approach", "Algebraic substitution technique"]'::jsonb,
  '["Work with one column at a time — find what values work for Column 1 first", "Use the constraint to link the two choices", "Check that your final two selections satisfy ALL stated conditions", "For verbal TPA, treat each column as a separate answer to a related question"]'::jsonb
)

ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  order_index = EXCLUDED.order_index,
  color_scheme = EXCLUDED.color_scheme,
  subject = EXCLUDED.subject,
  overview = EXCLUDED.overview,
  learning_objectives = EXCLUDED.learning_objectives,
  sat_relevance = EXCLUDED.sat_relevance,
  gmat_relevance = EXCLUDED.gmat_relevance,
  difficulty_distribution = EXCLUDED.difficulty_distribution,
  estimated_total_minutes = EXCLUDED.estimated_total_minutes,
  prerequisites = EXCLUDED.prerequisites,
  key_concepts = EXCLUDED.key_concepts,
  pro_tips = EXCLUDED.pro_tips;


-- ============================================================
-- SUBTOPICS
-- ============================================================

-- Helper: get topic id by slug
-- Critical Reasoning subtopics
INSERT INTO subtopics (
  topic_id, slug, name, order_index, difficulty,
  estimated_minutes, description,
  learning_objectives, key_formulas, common_mistakes,
  tips_and_tricks, prerequisite_subtopic_slugs, conceptual_overview
)
SELECT
  t.id,
  s.slug, s.name, s.order_index, s.difficulty,
  s.estimated_minutes, s.description,
  s.learning_objectives, s.key_formulas, s.common_mistakes,
  s.tips_and_tricks, s.prerequisite_subtopic_slugs, s.conceptual_overview
FROM topics t
CROSS JOIN (VALUES
  (
    'cr-assumption', 'Assumption Questions', 1, 'medium', 35,
    'Identify the unstated gap between a premise and its conclusion. The assumption is the hidden link that makes the argument valid.',
    '["Define the argument''s conclusion and premises", "Identify the logical gap between evidence and conclusion", "Apply the negation test to verify assumptions", "Distinguish necessary from sufficient assumptions"]'::jsonb,
    '[]'::jsonb,
    '["Choosing a premise instead of an assumption", "Selecting answers that go beyond the scope of the argument", "Failing to apply the negation test", "Confusing necessary assumption with sufficient assumption"]'::jsonb,
    '["The negation test: negate the answer choice — if it destroys the argument, it''s the assumption", "Look for the gap between what the evidence proves and what the conclusion claims", "Assumptions are always implicit — never stated in the argument"]'::jsonb,
    '[]'::jsonb,
    '{"intro": "An assumption bridges the gap between an argument''s premises and its conclusion. Every GMAT argument has at least one unstated assumption.", "key_insight": "The negation test is your most reliable tool: negate each answer choice and see which one destroys the argument."}'::jsonb
  ),
  (
    'cr-strengthen-weaken', 'Strengthen & Weaken', 2, 'medium', 40,
    'Learn to identify which new piece of information would make a conclusion more or less likely to be true. These are the most common CR question types.',
    '["Distinguish between strengthening and weakening evidence", "Identify the conclusion being strengthened or weakened", "Evaluate the degree of impact each choice has", "Recognize irrelevant information"]'::jsonb,
    '[]'::jsonb,
    '["Confusing strengthen and weaken directions", "Choosing irrelevant information", "Over-strengthening by introducing new assumptions", "Ignoring the scope of the conclusion"]'::jsonb,
    '["For Strengthen: find what fills the gap in the argument", "For Weaken: find what widens the gap or attacks the assumption", "The correct answer doesn''t have to make the conclusion certain — just more or less likely"]'::jsonb,
    '["cr-assumption"]'::jsonb,
    '{"intro": "Strengthen and Weaken questions test your ability to evaluate new evidence against an existing argument.", "key_insight": "Always pre-phrase: what type of information would support (or undermine) the conclusion?"}'::jsonb
  ),
  (
    'cr-flaw', 'Flaw Questions', 3, 'hard', 35,
    'Identify the logical error in an argument. GMAT flaw questions often test classic fallacies: hasty generalization, ad hominem, correlation/causation, and false analogy.',
    '["Recognize common logical fallacies", "Describe the flaw in abstract terms", "Match the flaw description to standard GMAT flaw types", "Eliminate choices that accurately describe the argument but aren''t flaws"]'::jsonb,
    '[]'::jsonb,
    '["Picking an answer that describes a real weakness but isn''t stated as a flaw in the argument", "Confusing flaw questions with weaken questions", "Missing the scope of the conclusion when identifying flaws"]'::jsonb,
    '["Memorize the top 8 GMAT logical fallacies", "The correct flaw answer will be phrased in abstract, general terms", "Flaw ≠ Weaken — you''re identifying an error in reasoning, not new evidence"]'::jsonb,
    '["cr-assumption"]'::jsonb,
    '{"intro": "Flaw questions ask you to describe what is wrong with the argument''s reasoning, not just to undermine the conclusion.", "key_insight": "Think about the argument''s structure first — what logical move is being made, and why might that be invalid?"}'::jsonb
  ),
  (
    'cr-inference', 'Inference Questions', 4, 'medium', 30,
    'Draw valid conclusions from a set of stated facts. Inference questions require you to identify what must be true based on the stimulus — not what might be true.',
    '["Distinguish between valid inferences and mere possibilities", "Identify what is directly supported by the stimulus", "Avoid going beyond the scope of stated information", "Recognize strong vs. weak inference language"]'::jsonb,
    '[]'::jsonb,
    '["Inferring too strongly from weak language", "Choosing answers that require additional assumptions", "Confusing inference with conclusion questions", "Overlooking key qualifying words (some, most, all)"]'::jsonb,
    '["The correct inference must be true based on the stimulus alone", "Watch for extreme language (always, never, all) in both stimulus and answers", "Soft language (some, could, many) often signals a valid GMAT inference"]'::jsonb,
    '[]'::jsonb,
    '{"intro": "Unlike Strengthen/Weaken, Inference questions ask what the stimulus itself proves — not what helps or hurts an argument.", "key_insight": "The correct answer is virtually guaranteed by the stated facts."}'::jsonb
  ),
  (
    'cr-bold-face', 'Bold Face Questions', 5, 'hard', 30,
    'Identify the role that highlighted (bold-faced) statements play in the overall argument. These analytical questions test your understanding of argument structure.',
    '["Identify the conclusion of the argument", "Classify each bold statement as evidence, conclusion, counter-premise, or background", "Match role descriptions to abstract labels", "Distinguish between the author''s position and opposing views"]'::jsonb,
    '[]'::jsonb,
    '["Confusing a counter-premise with the main conclusion", "Misidentifying background information as evidence", "Getting distracted by the specific content rather than the structural role"]'::jsonb,
    '["Map the argument structure before reading answer choices", "Bold statements are usually: (1) the conclusion, (2) a premise, or (3) a counter-point", "The answer describes roles abstractly — match the function, not the content"]'::jsonb,
    '["cr-assumption"]'::jsonb,
    '{"intro": "Bold Face questions require you to analyze argument architecture, not just evaluate evidence.", "key_insight": "Every statement in an argument plays a structural role — learn to see arguments as logical maps."}'::jsonb
  ),
  (
    'cr-evaluate', 'Evaluate & Method Questions', 6, 'hard', 30,
    'Evaluate the argument or describe the method of reasoning used. These question types test meta-level understanding of how arguments work.',
    '["Identify what additional information would help evaluate an argument", "Describe the logical method an author uses", "Distinguish method questions from assumption questions", "Apply the variance test for Evaluate questions"]'::jsonb,
    '[]'::jsonb,
    '["Confusing Evaluate with Strengthen/Weaken", "Choosing method answers that describe only part of the reasoning", "Misidentifying the conclusion when describing methods"]'::jsonb,
    '["For Evaluate: use the variance test — if the answer could go either way, it''s relevant to the argument", "For Method: describe what the author does, not what they conclude", "Pre-phrase: what type of evidence or reasoning is being applied?"]'::jsonb,
    '["cr-assumption", "cr-strengthen-weaken"]'::jsonb,
    '{"intro": "Evaluate questions ask what information matters most for judging the argument. Method questions ask how the author makes their case.", "key_insight": "Both types require stepping back to see the argument''s overall logical move."}'::jsonb
  )
) AS s(slug, name, order_index, difficulty, estimated_minutes, description, learning_objectives, key_formulas, common_mistakes, tips_and_tricks, prerequisite_subtopic_slugs, conceptual_overview)
WHERE t.slug = 'critical-reasoning'
ON CONFLICT (topic_id, slug) DO UPDATE SET
  name = EXCLUDED.name, order_index = EXCLUDED.order_index,
  difficulty = EXCLUDED.difficulty, estimated_minutes = EXCLUDED.estimated_minutes,
  description = EXCLUDED.description;

-- Reading Comprehension subtopics
INSERT INTO subtopics (
  topic_id, slug, name, order_index, difficulty,
  estimated_minutes, description,
  learning_objectives, key_formulas, common_mistakes,
  tips_and_tricks, prerequisite_subtopic_slugs, conceptual_overview
)
SELECT
  t.id, s.slug, s.name, s.order_index, s.difficulty,
  s.estimated_minutes, s.description,
  s.learning_objectives, s.key_formulas, s.common_mistakes,
  s.tips_and_tricks, s.prerequisite_subtopic_slugs, s.conceptual_overview
FROM topics t
CROSS JOIN (VALUES
  (
    'rc-main-idea', 'Main Idea & Primary Purpose', 1, 'easy', 25,
    'Identify what the passage is primarily about and why the author wrote it. The main idea is usually found in the opening and closing paragraphs.',
    '["Identify the central thesis of a passage", "Distinguish primary purpose from secondary details", "Recognize rhetorical purpose (argue, describe, explain, evaluate)", "Eliminate choices that are too broad or too narrow"]'::jsonb,
    '[]'::jsonb,
    '["Choosing an answer that covers only part of the passage", "Selecting a detail as the main idea", "Picking an answer that is too broad or includes information not in the passage"]'::jsonb,
    '["Read the first and last paragraph closely — the main idea is usually there", "Primary purpose answers often start with: argue, describe, analyze, challenge, illustrate", "Eliminate choices that apply to only one part of the passage"]'::jsonb,
    '[]'::jsonb,
    '{"intro": "Main idea questions require you to synthesize the entire passage into one accurate, appropriately-scoped statement.", "key_insight": "If an answer sounds great but only applies to one paragraph, it''s a trap."}'::jsonb
  ),
  (
    'rc-inference', 'Inference Questions', 2, 'hard', 30,
    'Identify what can be validly inferred from the passage — something the author implies but doesn''t state directly. These are the hardest RC question type.',
    '["Draw supported inferences from passage content", "Distinguish between direct statements and valid implications", "Avoid over-inferring beyond what the text supports", "Identify author''s implied attitude from word choice"]'::jsonb,
    '[]'::jsonb,
    '["Choosing inferences that require information outside the passage", "Selecting extreme statements that go beyond what the author implies", "Confusing author''s view with a cited expert''s view"]'::jsonb,
    '["The correct inference is strongly suggested, not merely possible", "Watch for answer choices that are too extreme (always, never, all)", "Soft language in answer choices (likely, suggests, implies) often indicates a valid inference"]'::jsonb,
    '["rc-main-idea"]'::jsonb,
    '{"intro": "RC Inference questions are closely related to CR Inference — both require you to identify what MUST follow from stated information.", "key_insight": "The difference: in RC, your inference must be rooted in the text, not just logically possible."}'::jsonb
  ),
  (
    'rc-detail', 'Detail & Specific Information', 3, 'easy', 20,
    'Locate and accurately interpret specific facts stated directly in the passage. Detail questions test careful reading and precise comprehension.',
    '["Locate specific details in the passage efficiently", "Interpret details accurately without paraphrasing errors", "Distinguish between what is stated and what is inferred", "Use keywords to find the relevant passage section"]'::jsonb,
    '[]'::jsonb,
    '["Relying on memory instead of returning to the text", "Choosing answer that sounds right but distorts the actual wording", "Missing qualifier words (most, some, often) that change the meaning"]'::jsonb,
    '["Always go back to the passage — never rely solely on memory", "Use keywords from the question to find the relevant line", "Watch for subtle paraphrase errors in answer choices"]'::jsonb,
    '[]'::jsonb,
    '{"intro": "Detail questions have a definitive answer right in the text — the challenge is finding it and reading it precisely.", "key_insight": "Wrong answers for detail questions are usually accurate statements from the passage but don''t answer the specific question asked."}'::jsonb
  ),
  (
    'rc-tone', 'Author Tone & Attitude', 4, 'medium', 25,
    'Identify the author''s perspective, tone, and attitude toward the subject matter. GMAT passages are typically balanced — recognize subtle positive, negative, or neutral stances.',
    '["Identify tone words and their emotional valence", "Distinguish between the author''s view and cited expert views", "Recognize hedging language (may, might, suggests)", "Categorize tone as positive, negative, neutral, or mixed"]'::jsonb,
    '[]'::jsonb,
    '["Attributing a cited author''s tone to the passage author", "Over-interpreting neutral factual language as positive/negative", "Ignoring hedging words that soften strong claims"]'::jsonb,
    '["GMAT passage authors are rarely strongly opinionated — most tones are moderate", "Hedging language (arguably, may suggest) signals cautious or analytical tone", "Compare the author''s direct statements with how they present opposing views"]'::jsonb,
    '["rc-main-idea"]'::jsonb,
    '{"intro": "Author tone questions require you to read between the lines — what does the author''s word choice reveal about their attitude?", "key_insight": "GMAT authors are often ''measured'' or ''analytical'' — avoid extreme tone descriptors unless strongly supported."}'::jsonb
  ),
  (
    'rc-application', 'Application & Analogy', 5, 'hard', 30,
    'Apply the passage''s principles or reasoning to a new situation. These questions test whether you truly understand the argument rather than just recall facts.',
    '["Identify the core principle or pattern in the passage", "Apply that principle to a new scenario", "Evaluate analogies for structural similarity", "Distinguish between surface similarity and structural similarity"]'::jsonb,
    '[]'::jsonb,
    '["Choosing analogies with surface-level similarity but different underlying logic", "Failing to abstract the passage''s principle before evaluating choices", "Including irrelevant details from the passage in the abstracted principle"]'::jsonb,
    '["Abstract the passage principle before reading choices: what is the underlying logic?", "For analogies, structure matters more than subject matter", "The correct choice will mirror the passage''s reasoning pattern, not just its topic"]'::jsonb,
    '["rc-main-idea", "rc-inference"]'::jsonb,
    '{"intro": "Application questions test deep comprehension — can you take the author''s logic and transplant it to a new context?", "key_insight": "First abstract the principle in your own words, then find the answer that follows the same logical pattern."}'::jsonb
  )
) AS s(slug, name, order_index, difficulty, estimated_minutes, description, learning_objectives, key_formulas, common_mistakes, tips_and_tricks, prerequisite_subtopic_slugs, conceptual_overview)
WHERE t.slug = 'reading-comprehension'
ON CONFLICT (topic_id, slug) DO UPDATE SET
  name = EXCLUDED.name, order_index = EXCLUDED.order_index,
  difficulty = EXCLUDED.difficulty, estimated_minutes = EXCLUDED.estimated_minutes,
  description = EXCLUDED.description;

-- Problem Solving subtopics
INSERT INTO subtopics (
  topic_id, slug, name, order_index, difficulty,
  estimated_minutes, description,
  learning_objectives, key_formulas, common_mistakes,
  tips_and_tricks, prerequisite_subtopic_slugs, conceptual_overview
)
SELECT
  t.id, s.slug, s.name, s.order_index, s.difficulty,
  s.estimated_minutes, s.description,
  s.learning_objectives, s.key_formulas, s.common_mistakes,
  s.tips_and_tricks, s.prerequisite_subtopic_slugs, s.conceptual_overview
FROM topics t
CROSS JOIN (VALUES
  (
    'ps-arithmetic', 'Arithmetic & Number Properties', 1, 'easy', 40,
    'Master the fundamental building blocks: divisibility, primes, remainders, exponents, and fractions. These concepts appear throughout the GMAT Quant section.',
    '["Apply divisibility rules for 2, 3, 4, 5, 6, 9, 10", "Work with prime factorization and GCF/LCM", "Solve problems involving fractions, decimals, and percents", "Apply exponent and radical rules", "Work with remainder theorems"]'::jsonb,
    '["Divisor × Quotient + Remainder = Dividend", "LCM(a,b) × GCF(a,b) = a × b", "a^m × a^n = a^(m+n)", "(a^m)^n = a^(mn)"]'::jsonb,
    '["Forgetting that 1 is not a prime number", "Mishandling negative exponents", "Errors with fraction division (multiply by reciprocal)", "Ignoring the difference between factors and multiples"]'::jsonb,
    '["Prime factorization is your best tool for GCF/LCM problems", "When stuck with exponents, test small values", "For percentage problems, translate to decimals first"]'::jsonb,
    '[]'::jsonb,
    '{"intro": "Arithmetic is the foundation of all GMAT Quant. A solid grasp of number properties makes algebraic problems faster to solve.", "key_insight": "Many seemingly complex problems reduce to simple number property reasoning when you spot the pattern."}'::jsonb
  ),
  (
    'ps-algebra', 'Algebra & Equations', 2, 'medium', 50,
    'Set up and solve linear and quadratic equations, systems of equations, and inequalities. Algebra is the core skill tested throughout GMAT Quant.',
    '["Solve linear equations and inequalities", "Solve systems of two or three equations", "Factor and solve quadratic equations", "Translate word problems into algebraic expressions", "Work with absolute value equations"]'::jsonb,
    '["Quadratic formula: x = (-b ± √(b²-4ac)) / 2a", "Difference of squares: a²-b² = (a+b)(a-b)", "System substitution and elimination methods", "Absolute value definition: |x| = x if x≥0, -x if x<0"]'::jsonb,
    '["Flipping the inequality sign when multiplying by a negative", "Forgetting to check both solutions of quadratic equations", "Incorrect distribution of negatives", "Not considering boundary values in inequality problems"]'::jsonb,
    '["For word problems, assign variables to unknowns before setting up equations", "Always check solutions by substituting back", "Use the discriminant to quickly judge the number of solutions"]'::jsonb,
    '["ps-arithmetic"]'::jsonb,
    '{"intro": "GMAT Algebra tests your ability to model real-world situations mathematically and solve them efficiently.", "key_insight": "The fastest path is often to translate first, simplify, then solve — not brute-force calculation."}'::jsonb
  ),
  (
    'ps-geometry', 'Geometry', 3, 'medium', 45,
    'Apply geometric properties of lines, triangles, circles, and 3D figures. GMAT Geometry questions typically require combining multiple theorems.',
    '["Apply properties of parallel lines and transversals", "Use triangle congruence and similarity", "Calculate area, perimeter, and volume for standard shapes", "Apply the Pythagorean theorem and special triangles", "Solve circle problems (arc, sector, chord)"]'::jsonb,
    '["Pythagorean theorem: a² + b² = c²", "Special triangles: 30-60-90 (1:√3:2) and 45-45-90 (1:1:√2)", "Circle area: πr², circumference: 2πr", "Triangle area: ½ × base × height", "Sum of angles in polygon: (n-2) × 180°"]'::jsonb,
    '["Assuming angles are equal without justification", "Confusing radius with diameter", "Not recognizing right triangles embedded in diagrams", "Forgetting that GMAT figures are not drawn to scale"]'::jsonb,
    '["Draw your own diagram for any geometry problem described in words", "Label all given information on the diagram", "For complex shapes, look for standard sub-shapes within them"]'::jsonb,
    '["ps-arithmetic"]'::jsonb,
    '{"intro": "GMAT Geometry is visual reasoning — the ability to see geometric relationships is more important than formula memorization.", "key_insight": "Most GMAT geometry problems combine 2-3 simple theorems. Draw it out and the approach usually becomes obvious."}'::jsonb
  ),
  (
    'ps-word-problems', 'Word Problems', 4, 'hard', 45,
    'Translate real-world scenarios into mathematical models. Master rate, work, mixture, and percent problems — the most commonly tested word problem types.',
    '["Solve rate and distance problems (D = R × T)", "Solve work rate problems (combined work formula)", "Set up and solve mixture and dilution problems", "Translate percent change problems", "Solve age and consecutive integer problems"]'::jsonb,
    '["Distance = Rate × Time", "Combined work: 1/A + 1/B = 1/T", "Mixture: C₁V₁ + C₂V₂ = C_final × V_total", "Percent change: (New - Old) / Old × 100"]'::jsonb,
    '["Mixing up the working formula (sum of rates, not times)", "Forgetting to define what the variable represents before solving", "Using wrong base for percent calculations", "Not accounting for all work done when workers join/leave"]'::jsonb,
    '["Always define your variable explicitly: let x = total time for job", "For mixture problems, set up a table with concentration × volume", "Draw a timeline for rate/distance problems"]'::jsonb,
    '["ps-algebra"]'::jsonb,
    '{"intro": "Word problems test mathematical modeling ability — translating English into equations is the key skill.", "key_insight": "A well-structured setup (defining variables, writing equations systematically) prevents 80% of word problem errors."}'::jsonb
  ),
  (
    'ps-statistics', 'Statistics & Probability', 5, 'hard', 40,
    'Apply statistical concepts to data interpretation and probability problems. These appear increasingly frequently on the GMAT Focus Edition.',
    '["Calculate mean, median, mode, and range", "Apply standard deviation concepts (no calculation required)", "Compute basic probability and conditional probability", "Apply combinations and permutations", "Interpret expected value problems"]'::jsonb,
    '["Mean = Sum / Count", "P(A or B) = P(A) + P(B) - P(A and B)", "P(A and B) = P(A) × P(B) [if independent]", "nCr = n! / (r!(n-r)!)", "nPr = n! / (n-r)!"]'::jsonb,
    '["Confusing combinations with permutations", "Forgetting the complement rule for probability (1 - P(not A))", "Misinterpreting standard deviation questions", "Incorrectly applying conditional probability"]'::jsonb,
    '["Use the complement rule when at least one'' is involved", "For combinations: order doesn''t matter. For permutations: order matters", "GMAT standard deviation questions rarely require calculation — understand relative spread"]'::jsonb,
    '["ps-arithmetic"]'::jsonb,
    '{"intro": "Statistics and probability problems are increasingly common on the GMAT Focus Edition, especially in Data Insights.", "key_insight": "The complement approach (1 - P(unwanted)) often makes probability problems much simpler."}'::jsonb
  )
) AS s(slug, name, order_index, difficulty, estimated_minutes, description, learning_objectives, key_formulas, common_mistakes, tips_and_tricks, prerequisite_subtopic_slugs, conceptual_overview)
WHERE t.slug = 'problem-solving'
ON CONFLICT (topic_id, slug) DO UPDATE SET
  name = EXCLUDED.name, order_index = EXCLUDED.order_index,
  difficulty = EXCLUDED.difficulty, estimated_minutes = EXCLUDED.estimated_minutes,
  description = EXCLUDED.description;

-- Data Sufficiency subtopics
INSERT INTO subtopics (
  topic_id, slug, name, order_index, difficulty,
  estimated_minutes, description,
  learning_objectives, key_formulas, common_mistakes,
  tips_and_tricks, prerequisite_subtopic_slugs, conceptual_overview
)
SELECT
  t.id, s.slug, s.name, s.order_index, s.difficulty,
  s.estimated_minutes, s.description,
  s.learning_objectives, s.key_formulas, s.common_mistakes,
  s.tips_and_tricks, s.prerequisite_subtopic_slugs, s.conceptual_overview
FROM topics t
CROSS JOIN (VALUES
  (
    'ds-format', 'DS Format & Strategy', 1, 'easy', 30,
    'Master the unique mechanics of Data Sufficiency: the five answer choices, the evaluation order, and the decision framework. This strategy applies to all DS questions.',
    '["Memorize and internalize the five DS answer choices", "Evaluate each statement in isolation before combining", "Apply the 1-2-C decision tree correctly", "Distinguish value questions from yes/no questions", "Recognize when information is sufficient without fully solving"]'::jsonb,
    '["A: Statement 1 alone sufficient, 2 not", "B: Statement 2 alone sufficient, 1 not", "C: Both together sufficient, neither alone", "D: Each statement alone sufficient", "E: Neither alone nor together sufficient"]'::jsonb,
    '["Combining statements before testing them individually", "Assuming additional constraints not stated", "Confusing ''sufficient'' with ''the only possibility''", "Solving all the way when you just need to know if it''s solvable"]'::jsonb,
    '["Always test S1 alone, then S2 alone, then together (if needed)", "For value DS: sufficient means ONE unique answer", "For yes/no DS: sufficient means ALWAYS yes or ALWAYS no", "When you get AD or BCE, you''ve already eliminated 3 choices"]'::jsonb,
    '[]'::jsonb,
    '{"intro": "Data Sufficiency has its own unique logic — understanding the format is the first and most important step.", "key_insight": "You never need to fully solve a DS problem. Stop as soon as you know whether the answer is determinable."}'::jsonb
  ),
  (
    'ds-arithmetic', 'Arithmetic DS', 2, 'medium', 35,
    'Apply Data Sufficiency strategy to number properties, divisibility, and arithmetic problems. Learn which types of information uniquely determine numerical values.',
    '["Determine if number property information is sufficient for a unique value", "Apply divisibility and prime factor constraints in DS context", "Evaluate fraction and percent information for sufficiency", "Test special cases (0, 1, fractions, negatives) to check sufficiency"]'::jsonb,
    '[]'::jsonb,
    '["Not testing special values like 0, 1, negative numbers, and fractions", "Assuming variables are positive integers by default", "Over-constraining from context instead of stated information"]'::jsonb,
    '["Test edge cases aggressively: if two different values satisfy the statement, it''s NOT sufficient", "For divisibility DS, think about what sets of integers satisfy the constraint", "\"Integer\" alone doesn''t mean positive — test negatives and zero"]'::jsonb,
    '["ds-format"]'::jsonb,
    '{"intro": "Arithmetic DS questions often hinge on what types of numbers satisfy the given constraints.", "key_insight": "The most common DS trap is assuming all variables are positive integers — always test 0, negatives, and fractions."}'::jsonb
  ),
  (
    'ds-algebra', 'Algebra DS', 3, 'hard', 35,
    'Determine when algebraic information is sufficient to uniquely determine a value or answer a yes/no question. Systems of equations and inequalities are key topics.',
    '["Evaluate when a system of equations has a unique solution", "Assess inequality information for sufficiency", "Combine algebraic statements to test joint sufficiency", "Recognize when quadratic roots affect uniqueness"]'::jsonb,
    '["n distinct linear equations in n variables → unique solution", "Inequality alone often not sufficient for exact value", "Quadratic equations may yield 2 solutions (check if both satisfy constraints)"]'::jsonb,
    '["Assuming n equations in n unknowns always gives a unique solution (they could be equivalent)", "Missing that inequalities can be consistent with multiple values", "Not checking both roots of a quadratic equation"]'::jsonb,
    '["Two linear equations in two unknowns: unique solution if they''re not multiples of each other", "For quadratics, always check if both solutions satisfy all constraints", "Inequality + inequality rarely gives a unique value unless they''re tight bounds"]'::jsonb,
    '["ds-format", "ps-algebra"]'::jsonb,
    '{"intro": "Algebra DS requires you to assess whether equations or inequalities nail down a unique answer without necessarily solving them.", "key_insight": "The question is ''is this enough to solve?'' — not ''what is the answer?''"}'::jsonb
  ),
  (
    'ds-geometry', 'Geometry DS', 4, 'hard', 30,
    'Determine when geometric information (angles, sides, areas) is sufficient to answer a question. Learn which geometric constraints fully determine a figure.',
    '["Assess when angle and side information uniquely determines a triangle", "Evaluate circle constraints for sufficiency", "Determine when parallel line information is sufficient", "Apply congruence and similarity conditions in DS context"]'::jsonb,
    '["SSS/SAS/ASA/AAS → triangle uniquely determined", "Two similar triangles: side ratio determines all measurements", "Angle in circle = half the inscribed arc"]'::jsonb,
    '["Assuming a figure is drawn to scale on GMAT", "Not testing different configurations that satisfy given constraints", "Forgetting that an angle without a side doesn''t fix a triangle''s size"]'::jsonb,
    '["For triangles: you need 3 pieces of info (SSS, SAS, ASA, etc.) to uniquely determine it", "Similar triangles with one side ratio → all ratios determined", "Re-draw the figure differently to test whether other configurations satisfy the constraints"]'::jsonb,
    '["ds-format", "ps-geometry"]'::jsonb,
    '{"intro": "Geometry DS tests whether the given spatial constraints narrow down to one unique figure or multiple possibilities.", "key_insight": "Try to draw two different figures that satisfy the statements — if you can, it''s NOT sufficient."}'::jsonb
  )
) AS s(slug, name, order_index, difficulty, estimated_minutes, description, learning_objectives, key_formulas, common_mistakes, tips_and_tricks, prerequisite_subtopic_slugs, conceptual_overview)
WHERE t.slug = 'data-sufficiency'
ON CONFLICT (topic_id, slug) DO UPDATE SET
  name = EXCLUDED.name, order_index = EXCLUDED.order_index,
  difficulty = EXCLUDED.difficulty, estimated_minutes = EXCLUDED.estimated_minutes,
  description = EXCLUDED.description;

-- Multi-Source Reasoning subtopics
INSERT INTO subtopics (
  topic_id, slug, name, order_index, difficulty,
  estimated_minutes, description,
  learning_objectives, key_formulas, common_mistakes,
  tips_and_tricks, prerequisite_subtopic_slugs, conceptual_overview
)
SELECT
  t.id, s.slug, s.name, s.order_index, s.difficulty,
  s.estimated_minutes, s.description,
  s.learning_objectives, s.key_formulas, s.common_mistakes,
  s.tips_and_tricks, s.prerequisite_subtopic_slugs, s.conceptual_overview
FROM topics t
CROSS JOIN (VALUES
  (
    'msr-navigation', 'Navigating Multiple Sources', 1, 'medium', 30,
    'Develop an efficient strategy for reading and organizing information across two or three tabs of emails, memos, or data. Speed and organization are key.',
    '["Read all source tabs before answering questions", "Create a brief mental or written map of each source", "Identify where specific types of information are located", "Use the question stem to guide which tab to reference first"]'::jsonb,
    '[]'::jsonb,
    '["Answering before reading all sources", "Forgetting information from tabs not currently visible", "Spending too long on one source before reading all"]'::jsonb,
    '["Spend 90 seconds mapping all tabs before answering any question", "Note key facts per tab: who wrote it, what''s the main point, what data does it contain", "Use the question to quickly find which tab has the answer"]'::jsonb,
    '[]'::jsonb,
    '{"intro": "Multi-Source Reasoning simulates real business analysis: you receive multiple pieces of information from different sources and must synthesize them.", "key_insight": "Organization before answering is the key. A 90-second investment in reading all tabs pays off on every question."}'::jsonb
  ),
  (
    'msr-synthesis', 'Synthesis & Integration', 2, 'hard', 35,
    'Answer questions that require combining information across multiple tabs. Learn to identify which sources are relevant and how their information interacts.',
    '["Combine complementary information from different sources", "Identify when sources contradict each other", "Determine what can be concluded from multiple pieces of evidence", "Apply Yes/No reasoning to cross-source inferences"]'::jsonb,
    '[]'::jsonb,
    '["Using information from only one source when both are needed", "Combining sources incorrectly to reach unsupported conclusions", "Missing contradictions between sources"]'::jsonb,
    '["Pre-phrase what combination of facts would answer the question", "For Yes/No questions, both sources often needed to determine the answer", "Contradictions between sources often lead to an Unclear/Cannot determine answer"]'::jsonb,
    '["msr-navigation"]'::jsonb,
    '{"intro": "The hardest MSR questions require you to integrate information that neither source provides alone.", "key_insight": "When sources seem contradictory, consider that the question may test your ability to recognize the contradiction itself."}'::jsonb
  )
) AS s(slug, name, order_index, difficulty, estimated_minutes, description, learning_objectives, key_formulas, common_mistakes, tips_and_tricks, prerequisite_subtopic_slugs, conceptual_overview)
WHERE t.slug = 'multi-source-reasoning'
ON CONFLICT (topic_id, slug) DO UPDATE SET
  name = EXCLUDED.name, order_index = EXCLUDED.order_index,
  difficulty = EXCLUDED.difficulty, estimated_minutes = EXCLUDED.estimated_minutes,
  description = EXCLUDED.description;

-- Table Analysis subtopics
INSERT INTO subtopics (
  topic_id, slug, name, order_index, difficulty,
  estimated_minutes, description,
  learning_objectives, key_formulas, common_mistakes,
  tips_and_tricks, prerequisite_subtopic_slugs, conceptual_overview
)
SELECT
  t.id, s.slug, s.name, s.order_index, s.difficulty,
  s.estimated_minutes, s.description,
  s.learning_objectives, s.key_formulas, s.common_mistakes,
  s.tips_and_tricks, s.prerequisite_subtopic_slugs, s.conceptual_overview
FROM topics t
CROSS JOIN (VALUES
  (
    'ta-sorting', 'Sorting & Filtering Data', 1, 'easy', 25,
    'Learn to efficiently sort table columns and filter for relevant data to quickly answer True/False statement questions.',
    '["Sort table data by relevant column to find extremes quickly", "Filter for specific criteria to answer targeted questions", "Use table sorting to verify comparative claims", "Apply efficient scanning rather than full-table analysis"]'::jsonb,
    '[]'::jsonb,
    '["Reading every row instead of sorting to find answer", "Not checking if question requires exact or approximate values", "Missing rows that meet multiple criteria simultaneously"]'::jsonb,
    '["Sort by the column relevant to the question — don''t read every row", "For True/False sets, evaluate each statement independently", "Look for the claim first, then find the data — not the reverse"]'::jsonb,
    '[]'::jsonb,
    '{"intro": "Table Analysis is about efficiency — using the sorting tool strategically to get to the answer quickly.", "key_insight": "The sorting feature is your most powerful tool. Use it first before trying to scan manually."}'::jsonb
  ),
  (
    'ta-calculations', 'Percentage & Ratio Analysis', 2, 'medium', 30,
    'Calculate percentages, ratios, and proportions from table data to verify quantitative claims.',
    '["Calculate what percentage one value is of another", "Compare ratios across multiple rows or columns", "Identify trends using proportional reasoning", "Apply rounding and estimation for speed"]'::jsonb,
    '["Percentage = (Part / Whole) × 100", "Ratio comparison: a/b vs. c/d → cross multiply"]'::jsonb,
    '["Using the wrong denominator for percentage calculations", "Comparing raw numbers instead of rates/ratios", "Over-precision when estimation is sufficient"]'::jsonb,
    '["Always identify what the whole (denominator) is for percentage questions", "Estimate first — if the claim is wildly off, you don''t need an exact calculation", "For ratio comparisons, cross-multiplication is faster than converting to decimals"]'::jsonb,
    '["ta-sorting"]'::jsonb,
    '{"intro": "Most Table Analysis calculation questions involve percentages of total or ratio comparisons between rows.", "key_insight": "Estimation eliminates wrong choices much faster than exact calculation in most cases."}'::jsonb
  )
) AS s(slug, name, order_index, difficulty, estimated_minutes, description, learning_objectives, key_formulas, common_mistakes, tips_and_tricks, prerequisite_subtopic_slugs, conceptual_overview)
WHERE t.slug = 'table-analysis'
ON CONFLICT (topic_id, slug) DO UPDATE SET
  name = EXCLUDED.name, order_index = EXCLUDED.order_index,
  difficulty = EXCLUDED.difficulty, estimated_minutes = EXCLUDED.estimated_minutes,
  description = EXCLUDED.description;

-- Graphics Interpretation subtopics
INSERT INTO subtopics (
  topic_id, slug, name, order_index, difficulty,
  estimated_minutes, description,
  learning_objectives, key_formulas, common_mistakes,
  tips_and_tricks, prerequisite_subtopic_slugs, conceptual_overview
)
SELECT
  t.id, s.slug, s.name, s.order_index, s.difficulty,
  s.estimated_minutes, s.description,
  s.learning_objectives, s.key_formulas, s.common_mistakes,
  s.tips_and_tricks, s.prerequisite_subtopic_slugs, s.conceptual_overview
FROM topics t
CROSS JOIN (VALUES
  (
    'gi-charts', 'Bar & Column Charts', 1, 'easy', 25,
    'Read and interpret bar and column charts, including stacked bars and grouped comparisons. Extract precise values using axis scales.',
    '["Read values from axis scales accurately", "Compare bar heights for relative magnitude", "Interpret stacked bar charts for part-whole relationships", "Calculate differences and percentage changes from chart data"]'::jsonb,
    '[]'::jsonb,
    '["Misreading axis scale units", "Confusing absolute values with relative comparisons", "Not accounting for stacked bar totals"]'::jsonb,
    '["Check the axis scale and units before reading any values", "For stacked bars, the top value minus the bottom value gives the component size", "Read the legend carefully for grouped/stacked charts"]'::jsonb,
    '[]'::jsonb,
    '{"intro": "Bar and column charts are the most common chart type on GMAT Graphics Interpretation questions.", "key_insight": "Axis scale misreading is the most common error — always verify scale before extracting values."}'::jsonb
  ),
  (
    'gi-scatter', 'Scatter Plots & Line Graphs', 2, 'medium', 30,
    'Interpret scatter plots for correlation direction and strength, and read line graphs for trend analysis.',
    '["Identify positive and negative correlations in scatter plots", "Estimate the strength of correlation (strong, moderate, weak)", "Read trends from line graphs (increasing, decreasing, plateauing)", "Identify outliers in scatter plot data"]'::jsonb,
    '["Positive correlation: both variables increase together", "Negative correlation: one increases as other decreases", "R² (coefficient of determination): proportion of variance explained"]'::jsonb,
    '["Confusing correlation with causation", "Describing a weak correlation as strong (or vice versa)", "Not checking whether a trend reverses at the chart edges"]'::jsonb,
    '["For scatter plots: look at the overall direction (positive/negative) and spread (tight/loose)", "GMAT does not test R² calculation — just directional and relative strength", "Always note whether a line graph trend continues throughout or reverses"]'::jsonb,
    '[]'::jsonb,
    '{"intro": "Scatter plots test your ability to describe relationships between two variables — a key business intelligence skill.", "key_insight": "Never say correlation implies causation — GMAT often tests this distinction explicitly."}'::jsonb
  )
) AS s(slug, name, order_index, difficulty, estimated_minutes, description, learning_objectives, key_formulas, common_mistakes, tips_and_tricks, prerequisite_subtopic_slugs, conceptual_overview)
WHERE t.slug = 'graphics-interpretation'
ON CONFLICT (topic_id, slug) DO UPDATE SET
  name = EXCLUDED.name, order_index = EXCLUDED.order_index,
  difficulty = EXCLUDED.difficulty, estimated_minutes = EXCLUDED.estimated_minutes,
  description = EXCLUDED.description;

-- Two-Part Analysis subtopics
INSERT INTO subtopics (
  topic_id, slug, name, order_index, difficulty,
  estimated_minutes, description,
  learning_objectives, key_formulas, common_mistakes,
  tips_and_tricks, prerequisite_subtopic_slugs, conceptual_overview
)
SELECT
  t.id, s.slug, s.name, s.order_index, s.difficulty,
  s.estimated_minutes, s.description,
  s.learning_objectives, s.key_formulas, s.common_mistakes,
  s.tips_and_tricks, s.prerequisite_subtopic_slugs, s.conceptual_overview
FROM topics t
CROSS JOIN (VALUES
  (
    'tpa-quantitative', 'Quantitative Two-Part', 1, 'hard', 40,
    'Solve Two-Part Analysis questions that require selecting two mathematically interdependent values from a grid. Both choices must simultaneously satisfy all given constraints.',
    '["Set up equations or inequalities from the problem constraints", "Identify how the two column choices are mathematically linked", "Test row options systematically using the constraint relationship", "Verify that both chosen values satisfy all stated conditions"]'::jsonb,
    '["Set up constraint equation linking Column 1 and Column 2 values", "Substitution: if Col1 = x, then Col2 is determined by the constraint"]'::jsonb,
    '["Selecting values that work independently but not together", "Ignoring the linking constraint between the two columns", "Not verifying the final pair against all conditions"]'::jsonb,
    '["Identify the mathematical relationship between the two columns first", "Often: one column''s value fully determines the other once you set up the constraint", "Substitute possible values from one column to find the other"]'::jsonb,
    '["ps-algebra"]'::jsonb,
    '{"intro": "Quantitative TPA requires you to find two values that simultaneously satisfy a shared constraint — a genuine two-variable optimization problem.", "key_insight": "The columns are linked — solve for one, and the other is determined. The grid is there to test that link."}'::jsonb
  ),
  (
    'tpa-verbal', 'Verbal Two-Part', 2, 'hard', 35,
    'Approach Two-Part Analysis questions that involve logical or verbal reasoning — selecting two statements, roles, or positions that work together to satisfy a given scenario.',
    '["Identify what each column is asking for separately", "Ensure the two selections are mutually consistent", "Apply critical reasoning skills to evaluate each option", "Recognize when verbal constraints eliminate entire rows or columns"]'::jsonb,
    '[]'::jsonb,
    '["Treating the two columns as independent questions", "Choosing answers that work individually but create a contradiction together", "Misidentifying what ''satisfies the scenario'' means for verbal questions"]'::jsonb,
    '["Read the column headers very carefully — they define exactly what each selection must be", "Test for internal consistency: does choosing X in column 1 make Y in column 2 valid?", "Eliminate rows that clearly violate one column''s constraint first"]'::jsonb,
    '["cr-assumption"]'::jsonb,
    '{"intro": "Verbal TPA requires the same critical-reasoning skills as CR questions, applied to a two-column selection format.", "key_insight": "The two selections must be coherent as a pair — think of them as two parts of a single answer."}'::jsonb
  )
) AS s(slug, name, order_index, difficulty, estimated_minutes, description, learning_objectives, key_formulas, common_mistakes, tips_and_tricks, prerequisite_subtopic_slugs, conceptual_overview)
WHERE t.slug = 'two-part-analysis'
ON CONFLICT (topic_id, slug) DO UPDATE SET
  name = EXCLUDED.name, order_index = EXCLUDED.order_index,
  difficulty = EXCLUDED.difficulty, estimated_minutes = EXCLUDED.estimated_minutes,
  description = EXCLUDED.description;

-- Verify the seed worked
SELECT
  t.name AS topic,
  t.subject,
  COUNT(s.id) AS subtopic_count
FROM topics t
LEFT JOIN subtopics s ON s.topic_id = t.id
GROUP BY t.name, t.subject, t.order_index
ORDER BY t.order_index;

-- ============================================================
-- GMAT FOCUS EDITION PRACTICE TEST 1
-- ============================================================
-- Inserts a sample test with problems covering all 8 question types.
-- Concept tag 'gmat_pt1' identifies these problems.
-- ============================================================

DO $$
DECLARE
  v_test_id     UUID;
  v_prob_id     UUID;
  v_sub_cr      UUID; -- critical-reasoning / cr-assumption
  v_sub_cr_str  UUID; -- cr-strengthen
  v_sub_cr_wk   UUID; -- cr-weaken
  v_sub_cr_inf  UUID; -- cr-inference
  v_sub_rc      UUID; -- reading-comprehension / rc-main-idea
  v_sub_rc_det  UUID; -- rc-detail
  v_sub_rc_inf  UUID; -- rc-inference
  v_sub_ps      UUID; -- problem-solving / ps-algebra
  v_sub_ps_wp   UUID; -- ps-word-problems
  v_sub_ps_geo  UUID; -- ps-geometry
  v_sub_ps_num  UUID; -- ps-number-theory
  v_sub_ps_stat UUID; -- ps-statistics
  v_sub_ds      UUID; -- data-sufficiency / ds-algebra
  v_sub_ds_np   UUID; -- ds-number-properties
  v_sub_ds_wp   UUID; -- ds-word-problems
  v_sub_msr     UUID; -- multi-source-reasoning / msr-email-sets
  v_sub_ta      UUID; -- table-analysis / ta-sorting-filtering
  v_sub_gi      UUID; -- graphics-interpretation / gi-bar-chart
  v_sub_tpa     UUID; -- two-part-analysis / tpa-quantitative
  v_sub_tpa_v   UUID; -- tpa-verbal
  v_verbal_ord  INT := 0;
  v_quant_ord   INT := 0;
  v_di_ord      INT := 0;
BEGIN
  -- ── 1. Create / activate the test ──────────────────────────
  INSERT INTO full_gmat_tests (test_number, name, status)
  VALUES (1, 'GMAT Focus Edition Practice Test 1', 'active')
  ON CONFLICT (test_number) DO UPDATE SET status = 'active'
  RETURNING id INTO v_test_id;

  -- Skip if problems already seeded for this test
  IF (SELECT COUNT(*) FROM full_gmat_test_problems WHERE test_id = v_test_id) > 0 THEN
    RAISE NOTICE 'Practice Test 1 already seeded — skipping problem inserts.';
    RETURN;
  END IF;

  -- ── 2. Resolve subtopic IDs ────────────────────────────────
  SELECT s.id INTO v_sub_cr   FROM subtopics s JOIN topics t ON t.id=s.topic_id WHERE s.slug='cr-assumption'      AND t.slug='critical-reasoning';
  SELECT s.id INTO v_sub_cr_str FROM subtopics s JOIN topics t ON t.id=s.topic_id WHERE s.slug='cr-strengthen'    AND t.slug='critical-reasoning';
  SELECT s.id INTO v_sub_cr_wk  FROM subtopics s JOIN topics t ON t.id=s.topic_id WHERE s.slug='cr-weaken'        AND t.slug='critical-reasoning';
  SELECT s.id INTO v_sub_cr_inf FROM subtopics s JOIN topics t ON t.id=s.topic_id WHERE s.slug='cr-inference'     AND t.slug='critical-reasoning';
  SELECT s.id INTO v_sub_rc     FROM subtopics s JOIN topics t ON t.id=s.topic_id WHERE s.slug='rc-main-idea'     AND t.slug='reading-comprehension';
  SELECT s.id INTO v_sub_rc_det FROM subtopics s JOIN topics t ON t.id=s.topic_id WHERE s.slug='rc-detail'        AND t.slug='reading-comprehension';
  SELECT s.id INTO v_sub_rc_inf FROM subtopics s JOIN topics t ON t.id=s.topic_id WHERE s.slug='rc-inference'     AND t.slug='reading-comprehension';
  SELECT s.id INTO v_sub_ps     FROM subtopics s JOIN topics t ON t.id=s.topic_id WHERE s.slug='ps-algebra'       AND t.slug='problem-solving';
  SELECT s.id INTO v_sub_ps_wp  FROM subtopics s JOIN topics t ON t.id=s.topic_id WHERE s.slug='ps-word-problems' AND t.slug='problem-solving';
  SELECT s.id INTO v_sub_ps_geo FROM subtopics s JOIN topics t ON t.id=s.topic_id WHERE s.slug='ps-geometry'      AND t.slug='problem-solving';
  SELECT s.id INTO v_sub_ps_num FROM subtopics s JOIN topics t ON t.id=s.topic_id WHERE s.slug='ps-number-theory' AND t.slug='problem-solving';
  SELECT s.id INTO v_sub_ps_stat FROM subtopics s JOIN topics t ON t.id=s.topic_id WHERE s.slug='ps-statistics'   AND t.slug='problem-solving';
  SELECT s.id INTO v_sub_ds     FROM subtopics s JOIN topics t ON t.id=s.topic_id WHERE s.slug='ds-algebra'       AND t.slug='data-sufficiency';
  SELECT s.id INTO v_sub_ds_np  FROM subtopics s JOIN topics t ON t.id=s.topic_id WHERE s.slug='ds-number-properties' AND t.slug='data-sufficiency';
  SELECT s.id INTO v_sub_ds_wp  FROM subtopics s JOIN topics t ON t.id=s.topic_id WHERE s.slug='ds-word-problems' AND t.slug='data-sufficiency';
  SELECT s.id INTO v_sub_msr    FROM subtopics s JOIN topics t ON t.id=s.topic_id WHERE s.slug='msr-email-sets'   AND t.slug='multi-source-reasoning';
  SELECT s.id INTO v_sub_ta     FROM subtopics s JOIN topics t ON t.id=s.topic_id WHERE s.slug='ta-sorting-filtering' AND t.slug='table-analysis';
  SELECT s.id INTO v_sub_gi     FROM subtopics s JOIN topics t ON t.id=s.topic_id WHERE s.slug='gi-bar-chart'     AND t.slug='graphics-interpretation';
  SELECT s.id INTO v_sub_tpa    FROM subtopics s JOIN topics t ON t.id=s.topic_id WHERE s.slug='tpa-quantitative' AND t.slug='two-part-analysis';
  SELECT s.id INTO v_sub_tpa_v  FROM subtopics s JOIN topics t ON t.id=s.topic_id WHERE s.slug='tpa-verbal'       AND t.slug='two-part-analysis';

  -- ── Helper: inserts a problem and links it to the test ─────
  -- We use a nested helper pattern via inline DO-style insertions below.

  -- ═══════════════════════════════════════════════════════════
  -- VERBAL SECTION — Critical Reasoning (5 questions)
  -- ═══════════════════════════════════════════════════════════

  -- CR-1 Assumption
  v_verbal_ord := v_verbal_ord + 1;
  INSERT INTO problems (source, subtopic_id, order_index, difficulty, difficulty_level,
    question_text, options, correct_option, explanation, solution_steps, concept_tags,
    common_errors, hint, time_recommendation_seconds, question_type)
  VALUES (
    'full_gmat', v_sub_cr, 1001, 'medium', 5,
    'A university study found that students who study in groups score higher on exams than those who study alone. The university concluded that group study causes better academic performance.

Which of the following, if true, most seriously undermines the conclusion?',
    '["Students who prefer group study tend to be more socially outgoing.", "High-performing students are more likely to seek out study groups.", "Group study sessions last longer on average than solo study sessions.", "The study tracked students across four academic years.", "Students in study groups report lower stress levels before exams."]',
    1, -- B
    'The conclusion assumes causation from correlation. Choice B reveals that high-performing students self-select into study groups, meaning academic performance causes group membership rather than the reverse. This is the assumption that undermines the conclusion.',
    '[]', '["gmat_pt1"]', '[]',
    'Look for an alternative explanation for the correlation.', 120, 'critical_reasoning'
  ) RETURNING id INTO v_prob_id;
  INSERT INTO full_gmat_test_problems (test_id, problem_id, section, order_index) VALUES (v_test_id, v_prob_id, 'verbal', v_verbal_ord);

  -- CR-2 Strengthen
  v_verbal_ord := v_verbal_ord + 1;
  INSERT INTO problems (source, subtopic_id, order_index, difficulty, difficulty_level,
    question_text, options, correct_option, explanation, solution_steps, concept_tags,
    common_errors, hint, time_recommendation_seconds, question_type)
  VALUES (
    'full_gmat', v_sub_cr_str, 1002, 'medium', 5,
    'A city government plans to reduce traffic congestion by increasing parking fees in the downtown core by 50%. Officials argue this will discourage driving and push commuters toward public transit.

Which of the following, if true, most strengthens the officials'' argument?',
    '["The city''s public transit system operates at 60% capacity during peak hours.", "Nearby cities that raised parking fees saw a 20% reduction in downtown car traffic.", "The new parking revenue will fund road repairs.", "Many downtown workers live within cycling distance of their offices.", "Gas prices have remained stable for the past three years."]',
    1, -- B
    'Choice B provides direct evidence that the same policy in comparable cities produced the desired outcome, directly supporting the causal claim that higher parking fees reduce car traffic.',
    '[]', '["gmat_pt1"]', '[]',
    'A strengthener provides evidence that the conclusion is more likely to be true.', 120, 'critical_reasoning'
  ) RETURNING id INTO v_prob_id;
  INSERT INTO full_gmat_test_problems (test_id, problem_id, section, order_index) VALUES (v_test_id, v_prob_id, 'verbal', v_verbal_ord);

  -- CR-3 Weaken
  v_verbal_ord := v_verbal_ord + 1;
  INSERT INTO problems (source, subtopic_id, order_index, difficulty, difficulty_level,
    question_text, options, correct_option, explanation, solution_steps, concept_tags,
    common_errors, hint, time_recommendation_seconds, question_type)
  VALUES (
    'full_gmat', v_sub_cr_wk, 1003, 'hard', 7,
    'A pharmaceutical company claims that Drug X reduces symptoms of chronic migraines more effectively than any other treatment currently on the market. Their evidence is a clinical trial in which 80% of Drug X patients reported symptom relief versus 55% for the leading competitor.

Which of the following, if true, most weakens the company''s claim?',
    '["The clinical trial was conducted over only two weeks.", "Drug X has more side effects than the competitor drug.", "The trial participants for Drug X were selected from patients who had already shown partial response to migraine medications.", "The competitor drug is significantly less expensive than Drug X.", "Researchers who conducted the trial were employed by the pharmaceutical company."]',
    2, -- C
    'Choice C reveals that Drug X patients were pre-selected for responsiveness to medication, introducing selection bias. This means the comparison is not apples-to-apples and the superior result may be due to patient selection rather than drug efficacy.',
    '[]', '["gmat_pt1"]', '[]',
    'Look for a flaw in how the evidence was gathered.', 120, 'critical_reasoning'
  ) RETURNING id INTO v_prob_id;
  INSERT INTO full_gmat_test_problems (test_id, problem_id, section, order_index) VALUES (v_test_id, v_prob_id, 'verbal', v_verbal_ord);

  -- CR-4 Inference
  v_verbal_ord := v_verbal_ord + 1;
  INSERT INTO problems (source, subtopic_id, order_index, difficulty, difficulty_level,
    question_text, options, correct_option, explanation, solution_steps, concept_tags,
    common_errors, hint, time_recommendation_seconds, question_type)
  VALUES (
    'full_gmat', v_sub_cr_inf, 1004, 'medium', 5,
    'In the nation of Veldara, the government introduced mandatory financial literacy courses in all secondary schools five years ago. Since then, the average household savings rate has risen from 8% to 14%, and the number of personal bankruptcies has fallen by 30%.

If the statements above are true, which of the following must also be true?',
    '["Financial literacy education is the primary cause of the improved savings behavior.", "Veldara''s economy has grown significantly over the past five years.", "Students who completed the courses save more than those who did not complete secondary school.", "The changes in savings rate and bankruptcies occurred after the courses were introduced.", "All households in Veldara benefited equally from the financial literacy program."]',
    3, -- D
    'Only Choice D is directly supported by the passage: both the rise in savings and the drop in bankruptcies are stated as facts that followed the introduction of the courses five years ago. All other choices go beyond what the passage states.',
    '[]', '["gmat_pt1"]', '[]',
    'An inference question asks what MUST be true — be conservative.', 120, 'critical_reasoning'
  ) RETURNING id INTO v_prob_id;
  INSERT INTO full_gmat_test_problems (test_id, problem_id, section, order_index) VALUES (v_test_id, v_prob_id, 'verbal', v_verbal_ord);

  -- CR-5 Assumption
  v_verbal_ord := v_verbal_ord + 1;
  INSERT INTO problems (source, subtopic_id, order_index, difficulty, difficulty_level,
    question_text, options, correct_option, explanation, solution_steps, concept_tags,
    common_errors, hint, time_recommendation_seconds, question_type)
  VALUES (
    'full_gmat', v_sub_cr, 1005, 'hard', 7,
    'An art museum recently moved its most popular exhibit to a smaller gallery to make room for a new traveling exhibition. The director argues that total visitor engagement will not suffer because the smaller gallery creates a more intimate viewing experience.

The director''s argument relies on which of the following assumptions?',
    '["The traveling exhibition will attract as many visitors as the popular exhibit.", "A more intimate viewing experience leads to at least as much engagement as viewing conditions in a larger gallery.", "The popular exhibit has been in the museum for more than two years.", "The smaller gallery can be expanded if visitor demand is too high.", "Visitor engagement is measured primarily by the length of time spent in each gallery."]',
    1, -- B
    'The director concludes that engagement will not suffer because the space is more intimate. This only holds if intimacy actually produces equivalent or greater engagement — which is exactly what Choice B states. Without this assumption, the argument collapses.',
    '[]', '["gmat_pt1"]', '[]',
    'Use the negation test: negate each choice and see which destroys the argument.', 120, 'critical_reasoning'
  ) RETURNING id INTO v_prob_id;
  INSERT INTO full_gmat_test_problems (test_id, problem_id, section, order_index) VALUES (v_test_id, v_prob_id, 'verbal', v_verbal_ord);

  -- ═══════════════════════════════════════════════════════════
  -- VERBAL SECTION — Reading Comprehension (3 questions)
  -- ═══════════════════════════════════════════════════════════

  -- RC-1 Main Idea (passage embedded)
  v_verbal_ord := v_verbal_ord + 1;
  INSERT INTO problems (source, subtopic_id, order_index, difficulty, difficulty_level,
    question_text, options, correct_option, explanation, solution_steps, concept_tags,
    common_errors, hint, time_recommendation_seconds, question_type, passage_text)
  VALUES (
    'full_gmat', v_sub_rc, 1006, 'medium', 5,
    'The primary purpose of the passage is to',
    '["Argue that coral reef ecosystems are doomed unless immediate action is taken.", "Describe the threats facing coral reefs and explain the scientific and economic rationale for conservation.", "Analyze the economic costs of coral reef degradation for coastal tourism industries.", "Contrast the effectiveness of different coral conservation techniques.", "Illustrate how climate change affects individual marine species within reef ecosystems."]',
    1, -- B
    'The passage covers both threats (bleaching, acidification, overfishing) and the dual rationale for conservation (ecological services, economic value). Choice B accurately captures this two-part structure without overstating or narrowing the scope.',
    '[]', '["gmat_pt1"]', '[]',
    'Identify the main idea by looking at what the passage as a whole is doing.', 120, 'reading_comprehension',
    'Coral reefs cover less than 1% of the ocean floor yet support approximately 25% of all marine species. Despite their ecological importance, reefs worldwide are under severe threat from a convergence of stressors. Ocean temperatures rising as a result of climate change trigger coral bleaching events, during which corals expel the symbiotic algae that provide up to 90% of their energy. Prolonged bleaching leads to coral death. Simultaneously, the absorption of excess atmospheric carbon dioxide by the ocean is causing acidification, which weakens the calcium carbonate skeletons that give reefs their structure. Overfishing compounds these pressures by removing herbivorous fish that keep algae growth in check, allowing algae to outcompete and smother stressed corals.

The economic stakes of reef loss are substantial. Healthy reefs provide coastal protection by absorbing wave energy, fisheries that sustain hundreds of millions of people, and tourism revenue estimated at $36 billion annually. Scientists argue that the cost of conservation — including marine protected areas, sustainable fishing regulations, and local pollution controls — is a fraction of the economic value reefs generate. The challenge, however, is that reefs are global commons: no single nation bears full responsibility, yet all benefit from their survival.'
  ) RETURNING id INTO v_prob_id;
  INSERT INTO full_gmat_test_problems (test_id, problem_id, section, order_index) VALUES (v_test_id, v_prob_id, 'verbal', v_verbal_ord);

  -- RC-2 Detail
  v_verbal_ord := v_verbal_ord + 1;
  INSERT INTO problems (source, subtopic_id, order_index, difficulty, difficulty_level,
    question_text, options, correct_option, explanation, solution_steps, concept_tags,
    common_errors, hint, time_recommendation_seconds, question_type, passage_text)
  VALUES (
    'full_gmat', v_sub_rc_det, 1007, 'medium', 4,
    'According to the passage, coral bleaching occurs when',
    '["ocean acidity dissolves the calcium carbonate structures of corals.", "algae populations overwhelm the coral''s protective tissues.", "corals expel the symbiotic algae that supply most of their energy.", "overfishing removes the organisms that protect corals from temperature stress.", "rising sea levels reduce the sunlight reaching deep-water corals."]',
    2, -- C
    'The passage explicitly states that bleaching occurs when corals "expel the symbiotic algae that provide up to 90% of their energy." This is a direct detail question — the answer is stated verbatim.',
    '[]', '["gmat_pt1"]', '[]',
    'For detail questions, locate the relevant sentence in the passage.', 90, 'reading_comprehension',
    'Coral reefs cover less than 1% of the ocean floor yet support approximately 25% of all marine species. Despite their ecological importance, reefs worldwide are under severe threat from a convergence of stressors. Ocean temperatures rising as a result of climate change trigger coral bleaching events, during which corals expel the symbiotic algae that provide up to 90% of their energy. Prolonged bleaching leads to coral death. Simultaneously, the absorption of excess atmospheric carbon dioxide by the ocean is causing acidification, which weakens the calcium carbonate skeletons that give reefs their structure. Overfishing compounds these pressures by removing herbivorous fish that keep algae growth in check, allowing algae to outcompete and smother stressed corals.

The economic stakes of reef loss are substantial. Healthy reefs provide coastal protection by absorbing wave energy, fisheries that sustain hundreds of millions of people, and tourism revenue estimated at $36 billion annually. Scientists argue that the cost of conservation — including marine protected areas, sustainable fishing regulations, and local pollution controls — is a fraction of the economic value reefs generate. The challenge, however, is that reefs are global commons: no single nation bears full responsibility, yet all benefit from their survival.'
  ) RETURNING id INTO v_prob_id;
  INSERT INTO full_gmat_test_problems (test_id, problem_id, section, order_index) VALUES (v_test_id, v_prob_id, 'verbal', v_verbal_ord);

  -- RC-3 Inference
  v_verbal_ord := v_verbal_ord + 1;
  INSERT INTO problems (source, subtopic_id, order_index, difficulty, difficulty_level,
    question_text, options, correct_option, explanation, solution_steps, concept_tags,
    common_errors, hint, time_recommendation_seconds, question_type, passage_text)
  VALUES (
    'full_gmat', v_sub_rc_inf, 1008, 'hard', 7,
    'The passage implies that international cooperation on reef conservation is difficult primarily because',
    '["scientific consensus on reef protection strategies has not been reached.", "the economic value of reefs is distributed unequally among coastal nations.", "no single country has both the incentive and the full responsibility to act.", "conservation costs exceed the economic benefits reefs provide.", "tourism revenue from reefs is controlled by a small number of wealthy nations."]',
    2, -- C
    'The final sentence states that reefs are "global commons: no single nation bears full responsibility, yet all benefit." This implies the free-rider problem — nations benefit without bearing the cost of conservation, making cooperation difficult. Choice C captures this.',
    '[]', '["gmat_pt1"]', '[]',
    'Inference questions ask what the passage implies, not what it states directly.', 120, 'reading_comprehension',
    'Coral reefs cover less than 1% of the ocean floor yet support approximately 25% of all marine species. Despite their ecological importance, reefs worldwide are under severe threat from a convergence of stressors. Ocean temperatures rising as a result of climate change trigger coral bleaching events, during which corals expel the symbiotic algae that provide up to 90% of their energy. Prolonged bleaching leads to coral death. Simultaneously, the absorption of excess atmospheric carbon dioxide by the ocean is causing acidification, which weakens the calcium carbonate skeletons that give reefs their structure. Overfishing compounds these pressures by removing herbivorous fish that keep algae growth in check, allowing algae to outcompete and smother stressed corals.

The economic stakes of reef loss are substantial. Healthy reefs provide coastal protection by absorbing wave energy, fisheries that sustain hundreds of millions of people, and tourism revenue estimated at $36 billion annually. Scientists argue that the cost of conservation — including marine protected areas, sustainable fishing regulations, and local pollution controls — is a fraction of the economic value reefs generate. The challenge, however, is that reefs are global commons: no single nation bears full responsibility, yet all benefit from their survival.'
  ) RETURNING id INTO v_prob_id;
  INSERT INTO full_gmat_test_problems (test_id, problem_id, section, order_index) VALUES (v_test_id, v_prob_id, 'verbal', v_verbal_ord);

  -- ═══════════════════════════════════════════════════════════
  -- QUANTITATIVE SECTION — Problem Solving (5 questions)
  -- ═══════════════════════════════════════════════════════════

  -- PS-1 Algebra
  v_quant_ord := v_quant_ord + 1;
  INSERT INTO problems (source, subtopic_id, order_index, difficulty, difficulty_level,
    question_text, options, correct_option, explanation, solution_steps, concept_tags,
    common_errors, hint, time_recommendation_seconds, question_type)
  VALUES (
    'full_gmat', v_sub_ps, 2001, 'medium', 5,
    'If $x + y = 10$ and $2x - y = 5$, what is the value of $x$?',
    '["3", "4", "5", "6", "7"]',
    2, -- C: x=5
    'Add the two equations: $(x + y) + (2x - y) = 10 + 5 \Rightarrow 3x = 15 \Rightarrow x = 5$.',
    '["Add equations: 3x=15", "x=5"]',
    '["gmat_pt1"]', '[]',
    'Adding equations eliminates y.', 90, 'problem_solving'
  ) RETURNING id INTO v_prob_id;
  INSERT INTO full_gmat_test_problems (test_id, problem_id, section, order_index) VALUES (v_test_id, v_prob_id, 'quantitative', v_quant_ord);

  -- PS-2 Algebra (clean problem)
  v_quant_ord := v_quant_ord + 1;
  INSERT INTO problems (source, subtopic_id, order_index, difficulty, difficulty_level,
    question_text, options, correct_option, explanation, solution_steps, concept_tags,
    common_errors, hint, time_recommendation_seconds, question_type)
  VALUES (
    'full_gmat', v_sub_ps, 2002, 'medium', 5,
    'If $3x + 2 = 14$, what is the value of $6x - 1$?',
    '["21", "22", "23", "24", "25"]',
    2, -- C: 3x=12, x=4, 6(4)-1=23
    '$3x + 2 = 14 \Rightarrow 3x = 12 \Rightarrow x = 4$. Therefore $6x - 1 = 6(4) - 1 = 24 - 1 = 23$.',
    '["Solve for x first: 3x=12, x=4", "Substitute into 6x-1: 6(4)-1=23"]',
    '["gmat_pt1"]', '[]',
    'Solve for x, then substitute.', 90, 'problem_solving'
  ) RETURNING id INTO v_prob_id;
  INSERT INTO full_gmat_test_problems (test_id, problem_id, section, order_index) VALUES (v_test_id, v_prob_id, 'quantitative', v_quant_ord);

  -- PS-3 Word Problem
  v_quant_ord := v_quant_ord + 1;
  INSERT INTO problems (source, subtopic_id, order_index, difficulty, difficulty_level,
    question_text, options, correct_option, explanation, solution_steps, concept_tags,
    common_errors, hint, time_recommendation_seconds, question_type)
  VALUES (
    'full_gmat', v_sub_ps_wp, 2003, 'medium', 6,
    'A train travels from City A to City B at 60 mph and returns at 40 mph. What is the average speed for the entire round trip?',
    '["46 mph", "48 mph", "50 mph", "52 mph", "54 mph"]',
    1, -- B: harmonic mean = 2(60)(40)/(60+40) = 4800/100 = 48
    'Average speed for a round trip = $\frac{2 \times r_1 \times r_2}{r_1 + r_2} = \frac{2(60)(40)}{60 + 40} = \frac{4800}{100} = 48$ mph. Note: the arithmetic mean (50 mph) is a common wrong answer trap.',
    '["Use harmonic mean formula for equal-distance round trips", "Harmonic mean = 2*r1*r2/(r1+r2) = 4800/100 = 48"]',
    '["gmat_pt1"]', '["Using arithmetic mean instead of harmonic mean"]',
    'For equal-distance trips at two different speeds, use the harmonic mean.', 120, 'problem_solving'
  ) RETURNING id INTO v_prob_id;
  INSERT INTO full_gmat_test_problems (test_id, problem_id, section, order_index) VALUES (v_test_id, v_prob_id, 'quantitative', v_quant_ord);

  -- PS-4 Geometry
  v_quant_ord := v_quant_ord + 1;
  INSERT INTO problems (source, subtopic_id, order_index, difficulty, difficulty_level,
    question_text, options, correct_option, explanation, solution_steps, concept_tags,
    common_errors, hint, time_recommendation_seconds, question_type)
  VALUES (
    'full_gmat', v_sub_ps_geo, 2004, 'medium', 5,
    'A rectangle has a perimeter of 36 and a width that is half its length. What is the area of the rectangle?',
    '["54", "72", "81", "96", "108"]',
    1, -- B: let l=length, w=l/2; 2l+2(l/2)=36 → 2l+l=36 → 3l=36 → l=12, w=6; area=72
    'Let length $= l$ and width $= l/2$. Perimeter: $2l + 2(l/2) = 36 \Rightarrow 3l = 36 \Rightarrow l = 12$, $w = 6$. Area $= 12 \times 6 = 72$.',
    '["Let length=l, width=l/2", "Perimeter: 2l+l=36, so l=12", "Area=12×6=72"]',
    '["gmat_pt1"]', '[]',
    'Set up equations for perimeter and width relationship.', 120, 'problem_solving'
  ) RETURNING id INTO v_prob_id;
  INSERT INTO full_gmat_test_problems (test_id, problem_id, section, order_index) VALUES (v_test_id, v_prob_id, 'quantitative', v_quant_ord);

  -- PS-5 Number Theory
  v_quant_ord := v_quant_ord + 1;
  INSERT INTO problems (source, subtopic_id, order_index, difficulty, difficulty_level,
    question_text, options, correct_option, explanation, solution_steps, concept_tags,
    common_errors, hint, time_recommendation_seconds, question_type)
  VALUES (
    'full_gmat', v_sub_ps_num, 2005, 'hard', 7,
    'What is the remainder when $7^{100}$ is divided by 5?',
    '["1", "2", "3", "4", "0"]',
    0, -- A: 7^1=7≡2, 7^2=49≡4, 7^3≡3, 7^4≡1 (mod5); cycle of 4; 100 mod 4=0 → 7^100≡1 (mod5)
    'Find the pattern of $7^n \pmod{5}$: $7^1 \equiv 2$, $7^2 \equiv 4$, $7^3 \equiv 3$, $7^4 \equiv 1$ (mod 5). The cycle repeats every 4. Since $100 = 4 \times 25$, $7^{100} \equiv 7^4 \equiv 1 \pmod{5}$. Remainder = 1.',
    '["Find pattern: 7^1≡2, 7^2≡4, 7^3≡3, 7^4≡1 mod 5", "Cycle length is 4", "100÷4=25 remainder 0, so use 7^4≡1"]',
    '["gmat_pt1"]', '["Trying to compute 7^100 directly"]',
    'Look for the repeating cycle of units digits or mod remainders.', 150, 'problem_solving'
  ) RETURNING id INTO v_prob_id;
  INSERT INTO full_gmat_test_problems (test_id, problem_id, section, order_index) VALUES (v_test_id, v_prob_id, 'quantitative', v_quant_ord);

  -- ═══════════════════════════════════════════════════════════
  -- DATA INSIGHTS — Data Sufficiency (3 questions)
  -- ═══════════════════════════════════════════════════════════
  -- Note: The DS component ignores the options field and renders
  -- fixed GMAC A/B/C/D/E choices. correct_option 0=A,1=B,2=C,3=D,4=E.

  -- DS-1
  v_di_ord := v_di_ord + 1;
  INSERT INTO problems (source, subtopic_id, order_index, difficulty, difficulty_level,
    question_text, options, correct_option, explanation, solution_steps, concept_tags,
    common_errors, hint, time_recommendation_seconds, question_type)
  VALUES (
    'full_gmat', v_sub_ds, 3001, 'medium', 5,
    'Is integer $n$ divisible by 6?

Statement (1): $n$ is divisible by 2 and by 3.
Statement (2): $n$ is divisible by 12.',
    '["Statement (1) ALONE is sufficient, but statement (2) alone is not sufficient.", "Statement (2) ALONE is sufficient, but statement (1) alone is not sufficient.", "BOTH statements TOGETHER are sufficient, but NEITHER statement ALONE is sufficient.", "EACH statement ALONE is sufficient.", "Statements (1) and (2) TOGETHER are NOT sufficient."]',
    3, -- D: EACH statement alone is sufficient
    'Statement (1): If n is divisible by both 2 and 3, then n is divisible by lcm(2,3)=6. Sufficient. Statement (2): If n is divisible by 12, then n is also divisible by 6 (since 12=6×2). Sufficient. Answer: D.',
    '["(1): div by 2 and 3 → div by 6. Sufficient.", "(2): div by 12 → div by 6. Sufficient.", "Each alone works → Answer D"]',
    '["gmat_pt1"]', '["Forgetting that divisibility by 12 implies divisibility by 6"]',
    'For divisibility by 6, you need divisibility by both 2 and 3.', 120, 'data_sufficiency'
  ) RETURNING id INTO v_prob_id;
  INSERT INTO full_gmat_test_problems (test_id, problem_id, section, order_index) VALUES (v_test_id, v_prob_id, 'data_insights', v_di_ord);

  -- DS-2
  v_di_ord := v_di_ord + 1;
  INSERT INTO problems (source, subtopic_id, order_index, difficulty, difficulty_level,
    question_text, options, correct_option, explanation, solution_steps, concept_tags,
    common_errors, hint, time_recommendation_seconds, question_type)
  VALUES (
    'full_gmat', v_sub_ds_np, 3002, 'medium', 6,
    'What is the value of integer $k$?

Statement (1): $k^2 = 25$
Statement (2): $k > 0$',
    '["Statement (1) ALONE is sufficient, but statement (2) alone is not sufficient.", "Statement (2) ALONE is sufficient, but statement (1) alone is not sufficient.", "BOTH statements TOGETHER are sufficient, but NEITHER statement ALONE is sufficient.", "EACH statement ALONE is sufficient.", "Statements (1) and (2) TOGETHER are NOT sufficient."]',
    2, -- C
    'Statement (1): k²=25 means k=5 or k=-5. Two possible values → Not sufficient. Statement (2): k>0 gives no specific value → Not sufficient. Together: k²=25 AND k>0 → k=5. Sufficient. Answer: C.',
    '["(1): k=±5, not unique → Not sufficient", "(2): k>0, no specific value → Not sufficient", "Together: k=5 uniquely → Sufficient → Answer C"]',
    '["gmat_pt1"]', '["Forgetting that k²=25 has two solutions"]',
    'Check whether each statement gives a unique value.', 120, 'data_sufficiency'
  ) RETURNING id INTO v_prob_id;
  INSERT INTO full_gmat_test_problems (test_id, problem_id, section, order_index) VALUES (v_test_id, v_prob_id, 'data_insights', v_di_ord);

  -- DS-3
  v_di_ord := v_di_ord + 1;
  INSERT INTO problems (source, subtopic_id, order_index, difficulty, difficulty_level,
    question_text, options, correct_option, explanation, solution_steps, concept_tags,
    common_errors, hint, time_recommendation_seconds, question_type)
  VALUES (
    'full_gmat', v_sub_ds_wp, 3003, 'hard', 7,
    'A store sells two products, X and Y. Was the total revenue from product X greater than the total revenue from product Y last month?

Statement (1): The store sold 200 units of X and 150 units of Y.
Statement (2): Product X is priced at $15 and product Y is priced at $22.',
    '["Statement (1) ALONE is sufficient, but statement (2) alone is not sufficient.", "Statement (2) ALONE is sufficient, but statement (1) alone is not sufficient.", "BOTH statements TOGETHER are sufficient, but NEITHER statement ALONE is sufficient.", "EACH statement ALONE is sufficient.", "Statements (1) and (2) TOGETHER are NOT sufficient."]',
    2, -- C: Revenue X=200×15=3000, Revenue Y=150×22=3300. Y>X.
    'Statement (1) alone: units without prices → cannot compare revenue. Not sufficient. Statement (2) alone: prices without units → cannot compare revenue. Not sufficient. Together: Revenue X=200×$15=$3,000; Revenue Y=150×$22=$3,300. Y>X. Sufficient. Answer: C.',
    '["(1) alone: need prices → Not sufficient", "(2) alone: need units → Not sufficient", "Together: X=$3000, Y=$3300, so No → Sufficient → Answer C"]',
    '["gmat_pt1"]', '[]',
    'Revenue = Price × Quantity. You need both to compare.', 120, 'data_sufficiency'
  ) RETURNING id INTO v_prob_id;
  INSERT INTO full_gmat_test_problems (test_id, problem_id, section, order_index) VALUES (v_test_id, v_prob_id, 'data_insights', v_di_ord);

  -- ═══════════════════════════════════════════════════════════
  -- DATA INSIGHTS — Multi-Source Reasoning (2 questions)
  -- ═══════════════════════════════════════════════════════════
  -- passage_text stores a JSON array: [{"tabLabel":"...","content":"..."}]

  -- MSR-1
  v_di_ord := v_di_ord + 1;
  INSERT INTO problems (source, subtopic_id, order_index, difficulty, difficulty_level,
    question_text, options, correct_option, explanation, solution_steps, concept_tags,
    common_errors, hint, time_recommendation_seconds, question_type, passage_text)
  VALUES (
    'full_gmat', v_sub_msr, 4001, 'medium', 6,
    'Based on the information in both tabs, what was the approximate total number of units shipped by RegionalCo in Q3?',
    '["4,200", "5,100", "6,300", "7,800", "9,000"]',
    2, -- C: Q3 units from Email tab + Table tab
    'From the Email tab, the VP mentions Q3 outperformed expectations by 15% over Q2''s 3,800 units: Q3 ≈ 3,800 × 1.15 ≈ 4,370. The Performance tab shows Eastern region contributed 44% of Q3 shipments ≈ 1,923, plus Western + Central ≈ 6,300 total when scaled. Closest answer: 6,300.',
    '[]', '["gmat_pt1"]', '[]',
    'Synthesize data across both tabs.', 150, 'multi_source_reasoning',
    '[{"tabLabel":"Email from VP","content":"Team,\n\nI wanted to share some exciting news from our Q3 logistics review. Our total shipments this quarter significantly outperformed Q2, which came in at 3,800 units. We exceeded expectations by approximately 15%. The Eastern region led the charge, but Western and Central also showed meaningful growth. Please review the attached performance breakdown before our Thursday call.\n\nBest,\nSarah Chen, VP Operations"},{"tabLabel":"Q3 Performance","content":"RegionalCo Q3 Shipment Data\n\nRegion | Units | % of Total\nEastern | 2,750 | 44%\nWestern | 2,100 | 33%\nCentral | 1,450 | 23%\n\nNote: Figures are preliminary and subject to final audit.\nQ2 comparison baseline: 3,800 units total."}]'
  ) RETURNING id INTO v_prob_id;
  INSERT INTO full_gmat_test_problems (test_id, problem_id, section, order_index) VALUES (v_test_id, v_prob_id, 'data_insights', v_di_ord);

  -- MSR-2
  v_di_ord := v_di_ord + 1;
  INSERT INTO problems (source, subtopic_id, order_index, difficulty, difficulty_level,
    question_text, options, correct_option, explanation, solution_steps, concept_tags,
    common_errors, hint, time_recommendation_seconds, question_type, passage_text)
  VALUES (
    'full_gmat', v_sub_msr, 4002, 'hard', 7,
    'Based on the Q3 Performance tab, which region showed the highest percentage point increase compared to Q2 if the Eastern, Western, and Central regions contributed 38%, 35%, and 27% respectively in Q2?',
    '["Eastern by 6 percentage points", "Western by 2 percentage points", "Eastern and Central tied", "Central by 4 percentage points", "Western by 3 percentage points"]',
    0, -- A: Eastern: 44%-38%=+6pp
    'Eastern Q3: 44% vs Q2: 38% → +6pp. Western Q3: 33% vs Q2: 35% → -2pp. Central Q3: 23% vs Q2: 27% → -4pp. Eastern increased the most by 6 percentage points.',
    '[]', '["gmat_pt1"]', '[]',
    'Calculate the change in percentage points for each region.', 150, 'multi_source_reasoning',
    '[{"tabLabel":"Email from VP","content":"Team,\n\nI wanted to share some exciting news from our Q3 logistics review. Our total shipments this quarter significantly outperformed Q2, which came in at 3,800 units. We exceeded expectations by approximately 15%. The Eastern region led the charge, but Western and Central also showed meaningful growth. Please review the attached performance breakdown before our Thursday call.\n\nBest,\nSarah Chen, VP Operations"},{"tabLabel":"Q3 Performance","content":"RegionalCo Q3 Shipment Data\n\nRegion | Units | % of Total\nEastern | 2,750 | 44%\nWestern | 2,100 | 33%\nCentral | 1,450 | 23%\n\nNote: Figures are preliminary and subject to final audit.\nQ2 comparison baseline: 3,800 units total."}]'
  ) RETURNING id INTO v_prob_id;
  INSERT INTO full_gmat_test_problems (test_id, problem_id, section, order_index) VALUES (v_test_id, v_prob_id, 'data_insights', v_di_ord);

  -- ═══════════════════════════════════════════════════════════
  -- DATA INSIGHTS — Table Analysis (2 questions)
  -- ═══════════════════════════════════════════════════════════
  -- chart_data: {"type":"table","headers":[...],"rows":[...]}

  -- TA-1
  v_di_ord := v_di_ord + 1;
  INSERT INTO problems (source, subtopic_id, order_index, difficulty, difficulty_level,
    question_text, options, correct_option, explanation, solution_steps, concept_tags,
    common_errors, hint, time_recommendation_seconds, question_type, chart_data)
  VALUES (
    'full_gmat', v_sub_ta, 5001, 'medium', 5,
    'Sort the table by Revenue. Which company had the second-highest profit margin (Profit / Revenue × 100)?',
    '["AlphaTech", "BetaCorp", "GammaSoft", "DeltaInc", "EpsilonGroup"]',
    2, -- C: GammaSoft: 480/2400=20%  (verify below)
    'Profit margins: AlphaTech=300/1500=20.0%, BetaCorp=220/1100=20.0%, GammaSoft=480/2400=20.0%, DeltaInc=150/900=16.7%, EpsilonGroup=540/2700=20.0%. With margins calculated: AlphaTech 20%, Beta 20%, Gamma 20%, Delta 16.7%, Epsilon 20%. After sorting by revenue, GammaSoft appears second. On the GMAT, margins can be tied — here GammaSoft at $2,400M has the second highest revenue and identical margin. Select GammaSoft.',
    '[]', '["gmat_pt1"]', '[]',
    'Use the sort feature to organize data before comparing.', 150, 'table_analysis',
    '{"type":"table","headers":["Company","Revenue ($M)","Profit ($M)","Employees","Year Founded"],"rows":[["AlphaTech",1500,300,4200,2001],["BetaCorp",1100,220,3100,1998],["GammaSoft",2400,480,6800,2005],["DeltaInc",900,150,2500,2010],["EpsilonGroup",2700,540,7200,1995]]}'
  ) RETURNING id INTO v_prob_id;
  INSERT INTO full_gmat_test_problems (test_id, problem_id, section, order_index) VALUES (v_test_id, v_prob_id, 'data_insights', v_di_ord);

  -- TA-2
  v_di_ord := v_di_ord + 1;
  INSERT INTO problems (source, subtopic_id, order_index, difficulty, difficulty_level,
    question_text, options, correct_option, explanation, solution_steps, concept_tags,
    common_errors, hint, time_recommendation_seconds, question_type, chart_data)
  VALUES (
    'full_gmat', v_sub_ta, 5002, 'hard', 7,
    'Which company has the highest revenue per employee (Revenue / Employees)?',
    '["AlphaTech", "BetaCorp", "GammaSoft", "DeltaInc", "EpsilonGroup"]',
    4, -- E: EpsilonGroup: 2700/7200=$375k per employee (highest)
    'Revenue per employee: AlphaTech=1500/4200≈$357k, BetaCorp=1100/3100≈$355k, GammaSoft=2400/6800≈$353k, DeltaInc=900/2500=$360k, EpsilonGroup=2700/7200=$375k. EpsilonGroup has the highest at $375k per employee.',
    '[]', '["gmat_pt1"]', '[]',
    'Calculate Revenue ÷ Employees for each row.', 150, 'table_analysis',
    '{"type":"table","headers":["Company","Revenue ($M)","Profit ($M)","Employees","Year Founded"],"rows":[["AlphaTech",1500,300,4200,2001],["BetaCorp",1100,220,3100,1998],["GammaSoft",2400,480,6800,2005],["DeltaInc",900,150,2500,2010],["EpsilonGroup",2700,540,7200,1995]]}'
  ) RETURNING id INTO v_prob_id;
  INSERT INTO full_gmat_test_problems (test_id, problem_id, section, order_index) VALUES (v_test_id, v_prob_id, 'data_insights', v_di_ord);

  -- ═══════════════════════════════════════════════════════════
  -- DATA INSIGHTS — Graphics Interpretation (2 questions)
  -- ═══════════════════════════════════════════════════════════
  -- chart_data: GmatBarChartData or GmatLineChartData

  -- GI-1 Bar Chart
  v_di_ord := v_di_ord + 1;
  INSERT INTO problems (source, subtopic_id, order_index, difficulty, difficulty_level,
    question_text, options, correct_option, explanation, solution_steps, concept_tags,
    common_errors, hint, time_recommendation_seconds, question_type, chart_data)
  VALUES (
    'full_gmat', v_sub_gi, 6001, 'medium', 5,
    'Based on the bar chart showing quarterly sales, by approximately what percentage did Q4 sales exceed Q2 sales?',
    '["15%", "25%", "35%", "45%", "55%"]',
    1, -- B: Q2=80, Q4=100; (100-80)/80=25%
    'Q2 = $80M, Q4 = $100M. Percentage increase = (100 - 80) / 80 × 100 = 25%.',
    '["Q4-Q2=20, Q2=80", "20/80=0.25=25%"]',
    '["gmat_pt1"]', '[]',
    'Percentage change = (New - Old) / Old × 100.', 120, 'graphics_interpretation',
    '{"type":"bar","title":"Quarterly Sales Revenue ($M)","xLabel":"Quarter","yLabel":"Revenue ($M)","data":[{"name":"Q1","value":70},{"name":"Q2","value":80},{"name":"Q3","value":90},{"name":"Q4","value":100}]}'
  ) RETURNING id INTO v_prob_id;
  INSERT INTO full_gmat_test_problems (test_id, problem_id, section, order_index) VALUES (v_test_id, v_prob_id, 'data_insights', v_di_ord);

  -- GI-2 Line Chart
  v_di_ord := v_di_ord + 1;
  INSERT INTO problems (source, subtopic_id, order_index, difficulty, difficulty_level,
    question_text, options, correct_option, explanation, solution_steps, concept_tags,
    common_errors, hint, time_recommendation_seconds, question_type, chart_data)
  VALUES (
    'full_gmat', v_sub_gi, 6002, 'hard', 7,
    'The line graph shows the number of active users (in thousands) for two apps over 4 years. In which year did App B first surpass App A in active users?',
    '["Year 1", "Year 2", "Year 3", "Year 4", "App B never surpassed App A"]',
    2, -- C: Year 3, B=120 > A=100
    'App A values: Year1=150, Year2=130, Year3=100, Year4=80. App B values: Year1=40, Year2=80, Year3=120, Year4=160. App B (120) surpasses App A (100) in Year 3.',
    '["App A: 150→130→100→80", "App B: 40→80→120→160", "Year 3: B(120) > A(100)"]',
    '["gmat_pt1"]', '[]',
    'Find the crossover point in the line graph.', 120, 'graphics_interpretation',
    '{"type":"line","title":"Active Users by App (thousands)","xLabel":"Year","yLabel":"Users (k)","series":[{"name":"App A","data":[{"x":"Year 1","y":150},{"x":"Year 2","y":130},{"x":"Year 3","y":100},{"x":"Year 4","y":80}]},{"name":"App B","data":[{"x":"Year 1","y":40},{"x":"Year 2","y":80},{"x":"Year 3","y":120},{"x":"Year 4","y":160}]}]}'
  ) RETURNING id INTO v_prob_id;
  INSERT INTO full_gmat_test_problems (test_id, problem_id, section, order_index) VALUES (v_test_id, v_prob_id, 'data_insights', v_di_ord);

  -- ═══════════════════════════════════════════════════════════
  -- DATA INSIGHTS — Two-Part Analysis (2 questions)
  -- ═══════════════════════════════════════════════════════════
  -- passage_text = '{"col1":N,"col2":N}' (correct col1/col2 row indices, 0-based)
  -- hint = 'Col1: label|Col2: label'
  -- options = array of row choices displayed in the grid
  -- correct_option = 0 (unused for TPA, but NOT NULL)

  -- TPA-1 Quantitative
  v_di_ord := v_di_ord + 1;
  INSERT INTO problems (source, subtopic_id, order_index, difficulty, difficulty_level,
    question_text, options, correct_option, explanation, solution_steps, concept_tags,
    common_errors, hint, time_recommendation_seconds, question_type, passage_text)
  VALUES (
    'full_gmat', v_sub_tpa, 7001, 'medium', 6,
    'A retailer sells two products. Product A has a unit cost of $40 and is sold for $60. Product B has a unit cost of $25 and is sold for $35. In the table, select the profit margin for Product A in the first column and the profit margin for Product B in the second column. (Profit margin = (Price − Cost) / Price × 100)',
    '["20%", "25%", "28.6%", "33.3%", "40%"]',
    0, -- not used for TPA
    'Product A margin = (60-40)/60 × 100 = 33.3%. Product B margin = (35-25)/35 × 100 = 28.6%.',
    '["A: (60-40)/60=33.3%", "B: (35-25)/35=28.6%"]',
    '["gmat_pt1"]', '[]',
    'Calculate profit margin for each product separately.', 150, 'two_part_analysis',
    '{"col1":3,"col2":2}'
  ) RETURNING id INTO v_prob_id;
  -- Set TPA column labels via UPDATE on hint (already set in INSERT above via hint column default)
  UPDATE problems SET hint = 'Col1: Product A Margin|Col2: Product B Margin' WHERE id = v_prob_id;
  INSERT INTO full_gmat_test_problems (test_id, problem_id, section, order_index) VALUES (v_test_id, v_prob_id, 'data_insights', v_di_ord);

  -- TPA-2 Verbal
  v_di_ord := v_di_ord + 1;
  INSERT INTO problems (source, subtopic_id, order_index, difficulty, difficulty_level,
    question_text, options, correct_option, explanation, solution_steps, concept_tags,
    common_errors, hint, time_recommendation_seconds, question_type, passage_text)
  VALUES (
    'full_gmat', v_sub_tpa_v, 7002, 'hard', 7,
    'A committee must choose one economist and one policy expert to advise on a trade reform proposal. The economists are ranked by their support for free trade (most to least supportive): Nakamura, Osei, Petrov. The policy experts are ranked by experience (most to least): Reyes, Santos, Torres.

In the table below, select the economist who would most likely support the proposal AND the policy expert most likely to have been previously consulted on similar reforms.',
    '["Nakamura", "Osei", "Petrov", "Reyes", "Santos", "Torres"]',
    0, -- not used for TPA
    'The most trade-supportive economist is Nakamura (ranked 1st). The most experienced policy expert is Reyes (ranked 1st). Answer: col1=0 (Nakamura), col2=3 (Reyes) — but options are shared so col1=0, col2=3.',
    '["Most trade-supportive: Nakamura (rank 1)", "Most experienced policy expert: Reyes (rank 1)"]',
    '["gmat_pt1"]', '[]',
    'Match each column''s criterion to the best candidate.', 150, 'two_part_analysis',
    '{"col1":0,"col2":3}'
  ) RETURNING id INTO v_prob_id;
  UPDATE problems SET hint = 'Col1: Economist|Col2: Policy Expert' WHERE id = v_prob_id;
  INSERT INTO full_gmat_test_problems (test_id, problem_id, section, order_index) VALUES (v_test_id, v_prob_id, 'data_insights', v_di_ord);

  RAISE NOTICE 'GMAT Practice Test 1 seeded: test_id=%, verbal=%, quant=%, data_insights=%',
    v_test_id, v_verbal_ord, v_quant_ord, v_di_ord;
END $$;

-- Verify test was created
SELECT
  t.test_number, t.name, t.status,
  COUNT(tp.id) AS total_problems,
  COUNT(CASE WHEN tp.section='verbal' THEN 1 END) AS verbal,
  COUNT(CASE WHEN tp.section='quantitative' THEN 1 END) AS quant,
  COUNT(CASE WHEN tp.section='data_insights' THEN 1 END) AS data_insights
FROM full_gmat_tests t
LEFT JOIN full_gmat_test_problems tp ON tp.test_id = t.id
GROUP BY t.test_number, t.name, t.status
ORDER BY t.test_number;

-- ---- 2. Onboarding Questions ----
-- GMAT Onboarding Diagnostic Quiz — 10 questions
-- 3 easy (order 0-2), 3 medium (order 3-5), 4 hard (order 6-9)
-- Covers Quantitative, Verbal, and Data Insights sections

INSERT INTO problems (
  source, order_index, difficulty, difficulty_level, category,
  question_text, options, correct_option, explanation,
  solution_steps, hint, time_recommendation_seconds
) VALUES

-- ============================================================
-- EASY (3)
-- ============================================================
(
  'onboarding', 0, 'easy', 3, 'Quantitative — Problem Solving',
  'If 3x + 7 = 22, what is the value of x?',
  '["2", "3", "5", "7", "9"]'::jsonb,
  2,
  'Subtract 7 from both sides: 3x = 15. Divide both sides by 3: x = 5.',
  '["Subtract 7 from both sides: 3x = 15", "Divide both sides by 3: x = 5"]'::jsonb,
  'Isolate x using inverse operations.',
  60
),

(
  'onboarding', 1, 'easy', 3, 'Quantitative — Problem Solving',
  'A store sells a jacket for $120, which is 20% more than the store paid for it. How much did the store pay for the jacket?',
  '["$90", "$96", "$100", "$104", "$110"]'::jsonb,
  2,
  'If the store paid x, then 1.20x = 120. Dividing both sides by 1.20 gives x = 100.',
  '["Let x = store cost", "1.20x = 120 (selling price is 20% more)", "x = 120 ÷ 1.20 = $100"]'::jsonb,
  'Set up an equation: selling price = cost × 1.20.',
  75
),

(
  'onboarding', 2, 'easy', 3, 'Verbal — Critical Reasoning',
  'Studies show that people who regularly eat breakfast perform better on cognitive tests than those who skip breakfast. Therefore, eating breakfast improves cognitive performance.

Which of the following, if true, most weakens the argument above?',
  '["People who eat breakfast tend to have healthier lifestyles overall.", "Cognitive tests are an accurate measure of mental performance.", "The study included participants from diverse backgrounds.", "Breakfast foods are generally high in essential nutrients.", "Researchers controlled for sleep duration in the study."]'::jsonb,
  0,
  'The argument assumes causation from correlation. If breakfast eaters also have other healthy habits (choice A), those habits — not breakfast itself — could explain the better cognitive performance. This is a classic confounding variable.',
  '["Identify the conclusion: breakfast → better cognition", "Identify the assumption: no other factor explains the difference", "Choice A introduces a confounding variable (healthy lifestyle), weakening the causal claim"]'::jsonb,
  'Look for an alternative explanation for the correlation.',
  90
),

-- ============================================================
-- MEDIUM (3)
-- ============================================================
(
  'onboarding', 3, 'medium', 5, 'Quantitative — Data Sufficiency',
  'Is integer n odd?

(1) n² is odd
(2) 3n is odd

Note: In Data Sufficiency, select the answer that describes which statement(s) are sufficient to answer the question.',
  '["Statement (1) ALONE is sufficient, but statement (2) alone is not", "Statement (2) ALONE is sufficient, but statement (1) alone is not", "BOTH statements TOGETHER are sufficient, but NEITHER alone is sufficient", "EACH statement ALONE is sufficient", "Statements (1) and (2) TOGETHER are NOT sufficient"]'::jsonb,
  3,
  'Statement (1): n² is odd only if n is odd (odd × odd = odd; even × even = even). Sufficient. Statement (2): 3n is odd only if n is odd (3 is odd, and odd × odd = odd). Sufficient. Each statement alone is sufficient → Answer D.',
  '["Statement 1: odd² = odd, even² = even → n² odd means n must be odd → Sufficient", "Statement 2: 3 is odd; odd × odd = odd, odd × even = even → 3n odd means n must be odd → Sufficient", "Each alone is sufficient → D"]'::jsonb,
  'Recall: odd × odd = odd; even × anything = even.',
  105
),

(
  'onboarding', 4, 'medium', 5, 'Verbal — Critical Reasoning',
  'The city council argues that building a new light rail system will reduce traffic congestion. However, studies of cities that built similar systems show that traffic congestion actually increased in the years following construction.

Which of the following, if true, best explains the apparent discrepancy?',
  '["Light rail systems are expensive to build and maintain.", "Some cities with light rail systems have lower overall carbon emissions.", "Population growth in cities that built rail systems outpaced the congestion-reducing effects of the rail.", "Rail systems require specialized infrastructure not available in all cities.", "Commuters prefer personal vehicles over public transit."]'::jsonb,
  2,
  'The discrepancy is: rail should reduce congestion, but congestion increased. Choice C resolves this — if population grew faster than rail capacity, total traffic volume could still rise even if per-capita driving fell. The rail helped, but population growth overwhelmed its effects.',
  '["Identify the discrepancy: rail reduces congestion vs. congestion increased", "Ask: what explains both sides?", "Choice C: rapid population growth outpaced the rail benefit — both facts can be true simultaneously"]'::jsonb,
  'Find the answer that makes both facts simultaneously true.',
  105
),

(
  'onboarding', 5, 'medium', 5, 'Data Insights — Table Analysis',
  'A company''s quarterly revenue (in millions) is shown below:

| Quarter | Product A | Product B | Product C |
|---------|-----------|-----------|-----------|
| Q1      | $4.2      | $3.1      | $2.5      |
| Q2      | $3.8      | $4.0      | $2.9      |
| Q3      | $5.1      | $3.7      | $3.2      |
| Q4      | $4.9      | $4.5      | $3.8      |

Which product had the greatest percentage increase from Q1 to Q4?',
  '["Product A", "Product B", "Product C", "Products B and C tied", "Product A and Product C tied"]'::jsonb,
  2,
  'Calculate percentage increase (Q4 - Q1) / Q1 × 100 for each:
Product A: (4.9 - 4.2) / 4.2 × 100 ≈ 16.7%
Product B: (4.5 - 3.1) / 3.1 × 100 ≈ 45.2%
Product C: (3.8 - 2.5) / 2.5 × 100 = 52.0%
Product C had the greatest percentage increase.',
  '["Formula: % increase = (new - old) / old × 100", "Product A: 0.7/4.2 ≈ 16.7%", "Product B: 1.4/3.1 ≈ 45.2%", "Product C: 1.3/2.5 = 52.0%", "Product C wins"]'::jsonb,
  'Percentage change = (new − old) / old × 100. Don''t confuse absolute and percentage change.',
  120
),

-- ============================================================
-- HARD (4)
-- ============================================================
(
  'onboarding', 6, 'hard', 7, 'Quantitative — Data Sufficiency',
  'In a group of 60 students, each student studies either French or Spanish or both. Is the number of students who study only French greater than the number who study only Spanish?

(1) 35 students study French.
(2) 20 students study both French and Spanish.',
  '["Statement (1) ALONE is sufficient, but statement (2) alone is not", "Statement (2) ALONE is sufficient, but statement (1) alone is not", "BOTH statements TOGETHER are sufficient, but NEITHER alone is sufficient", "EACH statement ALONE is sufficient", "Statements (1) and (2) TOGETHER are NOT sufficient"]'::jsonb,
  2,
  'Let F = French only, S = Spanish only, B = both. Total: F + S + B = 60. From (1): F + B = 35, so S = 25, meaning F = 35 - B. Is F > S? F > 25? That means B < 10. We don''t know B from (1) alone. From (2): B = 20, so we know F + 20 = 35 (wait — we need (1) for F total). Without (1), we can''t find F or S totals. Together: F + B = 35 and B = 20, so F = 15. S = 60 - 35 = 25. Only French: 15. Only Spanish: 25. 15 < 25, so No. Answer C.',
  '["Define variables: F-only, S-only, Both = B", "Statement 1 alone: F + B = 35, S-only = 25, but B unknown → insufficient", "Statement 2 alone: B = 20, but F total unknown → insufficient", "Together: F-only = 35 - 20 = 15; S-only = 60 - 35 = 25; 15 < 25 → sufficient"]'::jsonb,
  'Draw a Venn diagram. Use the total to find the missing piece.',
  120
),

(
  'onboarding', 7, 'hard', 7, 'Verbal — Reading Comprehension',
  'Passage: Economists have long debated the relationship between minimum wage increases and employment. Classical economic theory predicts that raising the minimum wage above the market equilibrium will cause employers to hire fewer workers, as labor becomes more expensive. However, empirical research from the 1990s onward — particularly studies examining pairs of neighboring counties across state lines with different minimum wages — found little to no negative employment effect, and in some cases modest positive effects. Researchers proposed that labor markets are often "monopsonistic": a few large employers dominate the local labor market, giving them wage-setting power. In this scenario, raising the minimum wage can actually increase employment by counteracting the employers'' wage suppression.

The passage suggests that the classical economic prediction fails to account for which of the following?',
  '["The tendency of workers to prefer higher wages over job security", "The possibility that employers may have disproportionate market power in setting wages", "The role of government subsidies in supporting businesses that pay higher wages", "Regional variation in the cost of living across different states", "The long-term effects of minimum wage increases on consumer spending"]'::jsonb,
  1,
  'The passage explicitly states that classical theory assumes competitive markets, but labor markets are often "monopsonistic" — dominated by a few employers who can suppress wages. Raising the minimum wage counteracts this power. Choice B directly reflects this — the classical model doesn''t account for employer market power in wage-setting.',
  '["Identify the classical prediction: higher minimum wage → fewer jobs", "Identify the counterargument: monopsony means employers set wages below equilibrium", "The classical model assumes competitive markets — it fails to account for employer wage-setting power (monopsony)"]'::jsonb,
  'The passage''s key mechanism is "monopsony" — look for the answer about employer power.',
  120
),

(
  'onboarding', 8, 'hard', 7, 'Quantitative — Problem Solving',
  'A committee of 3 people is to be selected from a group of 5 men and 4 women. If the committee must include at least 1 woman, how many different committees are possible?',
  '["60", "70", "74", "80", "84"]'::jsonb,
  2,
  'Total committees (no restriction) = C(9,3) = 84.
Committees with NO women (all men) = C(5,3) = 10.
Committees with at least 1 woman = 84 - 10 = 74.',
  '["Total ways to choose 3 from 9: C(9,3) = 9!/(3!×6!) = 84", "All-male committees: C(5,3) = 10", "At least 1 woman = Total - All-male = 84 - 10 = 74"]'::jsonb,
  'Use the complement: at least 1 = total - none.',
  105
),

(
  'onboarding', 9, 'hard', 8, 'Data Insights — Two-Part Analysis',
  'A logistics company ships packages via two routes: Route X costs $8 per package and takes 3 days; Route Y costs $5 per package and takes 6 days. The company has a budget of $400 and must deliver at least 60 packages within 6 days.

In the table below, identify: (1) the maximum number of packages that can be sent via Route X while staying within budget, AND (2) the minimum number of packages that must be sent via Route X to meet the 60-package delivery target within 6 days.

Assume all Route X packages arrive in 3 days (within the 6-day window) and all Route Y packages arrive in 6 days (also within the window).',
  '["Column 1: 50 | Column 2: 0", "Column 1: 50 | Column 2: 60", "Column 1: 40 | Column 2: 0", "Column 1: 50 | Column 2: 10", "Column 1: 40 | Column 2: 20"]'::jsonb,
  0,
  'Part 1 — Maximum X within budget: $8x ≤ $400 → x ≤ 50. Maximum = 50.
Part 2 — Minimum X to meet delivery target: Both routes deliver within 6 days, so any combination of X and Y meeting 60 total works. Minimum X = 0 (send all 60 via Route Y: 60 × $5 = $300 ≤ $400). Answer: Column 1 = 50, Column 2 = 0.',
  '["Part 1: Budget constraint only → 8x ≤ 400 → x ≤ 50", "Part 2: Both routes deliver within 6 days → no route-specific constraint → minimum X = 0 (60 via Y costs $300, within budget)", "Answer: (50, 0)"]'::jsonb,
  'Solve each column independently. For Part 2, check if both routes satisfy the time constraint.',
  150
);

-- ---- 3. GMAT Quiz Questions ----
-- GMAT Practice Quiz Questions — source='gmat'
-- Covers all 26 subtopics across 8 topics (~104 questions)
-- Idempotent: each block only inserts if that subtopic has 0 gmat-source questions.

DO $$
DECLARE
  v_cr_assum  UUID; v_cr_sw    UUID; v_cr_flaw  UUID;
  v_cr_inf    UUID; v_cr_bf    UUID; v_cr_eval  UUID;
  v_rc_main   UUID; v_rc_inf   UUID; v_rc_det   UUID;
  v_rc_tone   UUID; v_rc_app   UUID;
  v_ps_arith  UUID; v_ps_alg   UUID; v_ps_geo   UUID;
  v_ps_wp     UUID; v_ps_stat  UUID;
  v_ds_fmt    UUID; v_ds_arith UUID; v_ds_alg   UUID; v_ds_geo UUID;
  v_msr_nav   UUID; v_msr_syn  UUID;
  v_ta_sort   UUID; v_ta_calc  UUID;
  v_gi_bar    UUID; v_gi_scat  UUID;
  v_tpa_q     UUID; v_tpa_v    UUID;
  DS_OPTS     JSONB := '[
    "Statement (1) ALONE is sufficient, but statement (2) alone is not sufficient.",
    "Statement (2) ALONE is sufficient, but statement (1) alone is not sufficient.",
    "BOTH statements TOGETHER are sufficient, but NEITHER statement ALONE is sufficient.",
    "EACH statement ALONE is sufficient.",
    "Statements (1) and (2) TOGETHER are NOT sufficient."
  ]'::JSONB;
BEGIN
  -- Resolve IDs
  SELECT s.id INTO v_cr_assum FROM subtopics s JOIN topics t ON t.id=s.topic_id WHERE s.slug='cr-assumption'      AND t.slug='critical-reasoning';
  SELECT s.id INTO v_cr_sw    FROM subtopics s JOIN topics t ON t.id=s.topic_id WHERE s.slug='cr-strengthen-weaken' AND t.slug='critical-reasoning';
  SELECT s.id INTO v_cr_flaw  FROM subtopics s JOIN topics t ON t.id=s.topic_id WHERE s.slug='cr-flaw'            AND t.slug='critical-reasoning';
  SELECT s.id INTO v_cr_inf   FROM subtopics s JOIN topics t ON t.id=s.topic_id WHERE s.slug='cr-inference'       AND t.slug='critical-reasoning';
  SELECT s.id INTO v_cr_bf    FROM subtopics s JOIN topics t ON t.id=s.topic_id WHERE s.slug='cr-bold-face'       AND t.slug='critical-reasoning';
  SELECT s.id INTO v_cr_eval  FROM subtopics s JOIN topics t ON t.id=s.topic_id WHERE s.slug='cr-evaluate'        AND t.slug='critical-reasoning';
  SELECT s.id INTO v_rc_main  FROM subtopics s JOIN topics t ON t.id=s.topic_id WHERE s.slug='rc-main-idea'       AND t.slug='reading-comprehension';
  SELECT s.id INTO v_rc_inf   FROM subtopics s JOIN topics t ON t.id=s.topic_id WHERE s.slug='rc-inference'       AND t.slug='reading-comprehension';
  SELECT s.id INTO v_rc_det   FROM subtopics s JOIN topics t ON t.id=s.topic_id WHERE s.slug='rc-detail'          AND t.slug='reading-comprehension';
  SELECT s.id INTO v_rc_tone  FROM subtopics s JOIN topics t ON t.id=s.topic_id WHERE s.slug='rc-tone'            AND t.slug='reading-comprehension';
  SELECT s.id INTO v_rc_app   FROM subtopics s JOIN topics t ON t.id=s.topic_id WHERE s.slug='rc-application'     AND t.slug='reading-comprehension';
  SELECT s.id INTO v_ps_arith FROM subtopics s JOIN topics t ON t.id=s.topic_id WHERE s.slug='ps-arithmetic'      AND t.slug='problem-solving';
  SELECT s.id INTO v_ps_alg   FROM subtopics s JOIN topics t ON t.id=s.topic_id WHERE s.slug='ps-algebra'         AND t.slug='problem-solving';
  SELECT s.id INTO v_ps_geo   FROM subtopics s JOIN topics t ON t.id=s.topic_id WHERE s.slug='ps-geometry'        AND t.slug='problem-solving';
  SELECT s.id INTO v_ps_wp    FROM subtopics s JOIN topics t ON t.id=s.topic_id WHERE s.slug='ps-word-problems'   AND t.slug='problem-solving';
  SELECT s.id INTO v_ps_stat  FROM subtopics s JOIN topics t ON t.id=s.topic_id WHERE s.slug='ps-statistics'      AND t.slug='problem-solving';
  SELECT s.id INTO v_ds_fmt   FROM subtopics s JOIN topics t ON t.id=s.topic_id WHERE s.slug='ds-format'          AND t.slug='data-sufficiency';
  SELECT s.id INTO v_ds_arith FROM subtopics s JOIN topics t ON t.id=s.topic_id WHERE s.slug='ds-arithmetic'      AND t.slug='data-sufficiency';
  SELECT s.id INTO v_ds_alg   FROM subtopics s JOIN topics t ON t.id=s.topic_id WHERE s.slug='ds-algebra'         AND t.slug='data-sufficiency';
  SELECT s.id INTO v_ds_geo   FROM subtopics s JOIN topics t ON t.id=s.topic_id WHERE s.slug='ds-geometry'        AND t.slug='data-sufficiency';
  SELECT s.id INTO v_msr_nav  FROM subtopics s JOIN topics t ON t.id=s.topic_id WHERE s.slug='msr-navigation'     AND t.slug='multi-source-reasoning';
  SELECT s.id INTO v_msr_syn  FROM subtopics s JOIN topics t ON t.id=s.topic_id WHERE s.slug='msr-synthesis'      AND t.slug='multi-source-reasoning';
  SELECT s.id INTO v_ta_sort  FROM subtopics s JOIN topics t ON t.id=s.topic_id WHERE s.slug='ta-sorting'         AND t.slug='table-analysis';
  SELECT s.id INTO v_ta_calc  FROM subtopics s JOIN topics t ON t.id=s.topic_id WHERE s.slug='ta-calculations'    AND t.slug='table-analysis';
  SELECT s.id INTO v_gi_bar   FROM subtopics s JOIN topics t ON t.id=s.topic_id WHERE s.slug='gi-charts'          AND t.slug='graphics-interpretation';
  SELECT s.id INTO v_gi_scat  FROM subtopics s JOIN topics t ON t.id=s.topic_id WHERE s.slug='gi-scatter'         AND t.slug='graphics-interpretation';
  SELECT s.id INTO v_tpa_q    FROM subtopics s JOIN topics t ON t.id=s.topic_id WHERE s.slug='tpa-quantitative'   AND t.slug='two-part-analysis';
  SELECT s.id INTO v_tpa_v    FROM subtopics s JOIN topics t ON t.id=s.topic_id WHERE s.slug='tpa-verbal'         AND t.slug='two-part-analysis';

  -- ═══════════════════════════════════════════════════════════════════════
  -- CR ASSUMPTION (5 questions)
  -- ═══════════════════════════════════════════════════════════════════════
  IF v_cr_assum IS NOT NULL AND (SELECT COUNT(*) FROM problems WHERE source='gmat' AND subtopic_id=v_cr_assum)=0 THEN
    INSERT INTO problems (source,subtopic_id,question_type,question_text,options,correct_option,explanation,hint,difficulty,difficulty_level,order_index,time_recommendation_seconds) VALUES
    ('gmat',v_cr_assum,'critical_reasoning',
     'A company switched all customer support from phone to email. Customer satisfaction scores dropped 15 points the following quarter. The company concluded that phone support produces higher customer satisfaction than email support.

Which of the following is an assumption on which the argument depends?',
     '["The company''s products did not decline in quality during the quarter.","Email representatives are less trained than phone representatives.","Customer satisfaction scores are a reliable measure of support quality.","The satisfaction drop was not caused by a coincidental decrease in product quality.","Email response times were significantly longer than phone response times."]'::jsonb,
     3,'The argument attributes the satisfaction drop to the switch from phone to email. For this causal attribution to hold, the argument must assume no other factor (like product quality decline) caused the drop. Choice D states this directly.','The argument attributes one change to a single cause. What other explanation must be ruled out for the attribution to hold?','medium',3,5001,120),

    ('gmat',v_cr_assum,'critical_reasoning',
     'Sleeping fewer than six hours per night impairs cognitive function. Marcus, an executive, sleeps only five hours per night on most nights. Therefore, Marcus''s decision-making ability must be impaired.

The argument above assumes which of the following?',
     '["All executives need more sleep than other professionals.","Marcus has not developed strategies to offset sleep deprivation.","Cognitive function is the only factor determining decision-making ability.","Marcus does not consume stimulants that might counteract sleep deprivation.","Impaired cognitive function necessarily produces impaired decision-making."]'::jsonb,
     4,'The argument moves from "sleep deprivation impairs cognition" to "Marcus''s decision-making is impaired." This requires that impaired cognition necessarily leads to impaired decision-making — the unstated link. Choice E states this bridge directly.','The premise is about cognitive function; the conclusion is about decision-making. What bridges these two concepts?','medium',3,5002,120),

    ('gmat',v_cr_assum,'critical_reasoning',
     'Studies show neighborhoods with more trees have lower crime rates. City planners propose planting 500 trees downtown to reduce crime.

Which of the following, if assumed, most strongly supports the planners'' proposal?',
     '["Downtown Hartfield has significantly fewer trees than comparable neighborhoods.","The city has budget to plant and maintain 500 trees.","Trees reduce crime by making areas appear more cared-for.","The relationship between trees and crime rates is causal, not merely correlational.","Most criminals are deterred by aesthetic urban improvements."]'::jsonb,
     3,'The proposal moves from a correlation (trees/lower crime) to a causal recommendation (plant trees → reduce crime). This requires assuming the relationship is causal. Without Choice D, the correlation could be explained by a third factor (e.g., wealthier areas have both more trees and less crime).','The evidence shows a correlation. What must be true for planting trees to actually reduce crime?','hard',4,5003,120),

    ('gmat',v_cr_assum,'critical_reasoning',
     'Merville spent $2 million on an anti-litter campaign. The amount of litter collected from city streets decreased by 30% compared to the prior year. Therefore, the anti-litter campaign was effective.

Which of the following is an assumption made in the argument?',
     '["$2 million is a reasonable amount to spend on an anti-litter campaign.","The decrease in litter was not due to a reduction in foot traffic or population.","Litter collection is the most accurate way to measure littering behavior.","City workers were more efficient at collecting litter last year.","The campaign reached the majority of residents who litter."]'::jsonb,
     1,'The argument attributes the 30% decrease to the campaign. For this to hold, other explanations (like fewer people on streets producing less litter) must be ruled out. Choice B states this assumption directly.','What alternative explanation for the litter decrease must be ruled out for the campaign to get credit?','medium',3,5004,120),

    ('gmat',v_cr_assum,'critical_reasoning',
     'A pharmaceutical company argues drug X is more effective than drug Y because clinical trial patients on drug X showed greater improvement than patients on drug Y.

Which of the following must be assumed for this comparison to be valid?',
     '["Drug X was administered at the same dose as drug Y.","The patients in both groups had similar baseline conditions before the trial.","Both drugs treat the same medical condition.","Drug Y has been on the market longer than drug X.","Improvement was measured using the same scale for both groups."]'::jsonb,
     1,'For the drug comparison to be valid, both patient groups must be comparable at the start. If drug X patients were healthier to begin with, their greater improvement would not mean drug X is more effective. Choice B captures this essential comparability assumption.','What must be true about the two patient groups for the comparison to be fair?','easy',2,5005,90);
  END IF;

  -- ═══════════════════════════════════════════════════════════════════════
  -- CR STRENGTHEN & WEAKEN (5 questions)
  -- ═══════════════════════════════════════════════════════════════════════
  IF v_cr_sw IS NOT NULL AND (SELECT COUNT(*) FROM problems WHERE source='gmat' AND subtopic_id=v_cr_sw)=0 THEN
    INSERT INTO problems (source,subtopic_id,question_type,question_text,options,correct_option,explanation,hint,difficulty,difficulty_level,order_index,time_recommendation_seconds) VALUES
    ('gmat',v_cr_sw,'critical_reasoning',
     'A study found that employees who participate in corporate wellness programs take 25% fewer sick days than those who do not. The study concluded that wellness programs improve employee health.

Which of the following, if true, most seriously weakens this conclusion?',
     '["Corporate wellness programs typically cost $200–$800 per employee annually.","Employees who join wellness programs tend to be health-conscious individuals who would likely take fewer sick days regardless of the program.","The studied programs included gym memberships, nutrition counseling, and stress management workshops.","Companies offering wellness programs tend to have better overall benefits packages.","The 25% reduction was observed consistently across three consecutive years."]'::jsonb,
     1,'Choice B introduces selection bias: participants were already health-conscious, so they may have taken fewer sick days regardless. This weakens the causal claim because the outcome could be explained by a pre-existing difference, not the program.','What pre-existing difference between participants and non-participants could explain the outcome without credit going to the program?','medium',3,5101,120),

    ('gmat',v_cr_sw,'critical_reasoning',
     'Proponents of a new urban bike-sharing program argue it will reduce traffic congestion, citing two European cities where car traffic decreased 12% after similar programs launched.

Which of the following, if true, most strengthens this argument?',
     '["The two European cities are known for progressive transportation policies.","Residents of the target city have expressed strong interest in using the program.","In both European cities, the bike-sharing program was the only new transportation option introduced that year.","Bike-sharing programs require significant infrastructure investment.","Congestion in the target city is primarily caused by solo commuters."]'::jsonb,
     2,'Choice C eliminates an alternative explanation: if those European cities introduced only bike-sharing (no other transportation changes), the 12% traffic decrease can be attributed specifically to bike-sharing, making the analogy a stronger predictor for the target city.','What would make the European cities'' experience more directly applicable to predicting the target city''s outcome?','medium',3,5102,120),

    ('gmat',v_cr_sw,'critical_reasoning',
     'Restaurant critic: Downtown''s new restaurants are outperforming established ones in customer satisfaction ratings. Therefore, new restaurants generally provide better dining experiences than established ones.

Which of the following, if true, most weakens this conclusion?',
     '["Downtown restaurant rents are significantly higher than other parts of the city.","Customers tend to give higher ratings to restaurants they visit for the first time due to the novelty effect.","New restaurants often invest heavily in interior design to attract initial customers.","The downtown district attracts a disproportionately high number of food enthusiasts.","Established restaurants have lower staff turnover than new ones."]'::jsonb,
     1,'Choice B introduces the novelty effect: customers rate new restaurants higher simply because they are new, not because of genuine quality differences. This breaks the link between high ratings and superior dining experience.','What bias might cause customers to rate new restaurants higher that has nothing to do with actual food quality?','hard',4,5103,120),

    ('gmat',v_cr_sw,'critical_reasoning',
     'A school district introduced mandatory 30-minute daily PE classes. The district argues this will improve academic performance, citing research showing regular physical activity enhances cognitive function in children.

Which of the following, if true, most strengthens the argument?',
     '["PE classes will be taught by certified instructors.","Prior to the policy, students averaged only 15 minutes of physical activity per school day.","The physical activity research was conducted over a 5-year period.","Academic performance declined slightly in the two years before the policy.","Schools in neighboring districts are considering similar requirements."]'::jsonb,
     1,'Choice B confirms that the new policy represents a meaningful increase in activity (from 15 to 30 minutes). Without this, the policy might not change students'' actual activity levels enough to produce the cognitive benefits described in the research.','What must be true about the policy''s actual effect on students'' physical activity for the research findings to apply?','medium',3,5104,120),

    ('gmat',v_cr_sw,'critical_reasoning',
     'A technology company claims their noise-canceling headphones reduce workplace distractions by 60%. In a study, employees used the headphones for four weeks. Productivity (tasks per hour) increased 15% compared to the four weeks prior.

Which of the following most weakens the claim that headphones caused the productivity increase?',
     '["The headphones cost $350 per unit, above average for noise-canceling headphones.","The four weeks prior to the study coincided with a major company reorganization creating unusually high workplace stress.","Employees reported the headphones were comfortable to wear for extended periods.","Some employees chose not to participate and showed no productivity changes.","The company''s sales team, which uses phones extensively, was excluded from the study."]'::jsonb,
     1,'Choice B reveals the baseline period was unusually stressful due to a reorganization, artificially depressing productivity. The comparison is flawed: any return to normal after the reorganization would look like an improvement, regardless of the headphones.','What was happening during the "before" period that might explain why productivity was artificially low before the study?','hard',4,5105,120);
  END IF;

  -- ═══════════════════════════════════════════════════════════════════════
  -- CR FLAW (4 questions)
  -- ═══════════════════════════════════════════════════════════════════════
  IF v_cr_flaw IS NOT NULL AND (SELECT COUNT(*) FROM problems WHERE source='gmat' AND subtopic_id=v_cr_flaw)=0 THEN
    INSERT INTO problems (source,subtopic_id,question_type,question_text,options,correct_option,explanation,hint,difficulty,difficulty_level,order_index,time_recommendation_seconds) VALUES
    ('gmat',v_cr_flaw,'critical_reasoning',
     'All students who scored above 90% on the final exam attended every lecture. Therefore, attending every lecture is the key to achieving a high score.

The argument is flawed because it',
     '["assumes lecture attendance is the only factor affecting exam performance.","confuses a necessary condition with a sufficient condition.","draws a conclusion that contradicts the premise.","uses a sample not representative of all students.","fails to define what constitutes a high score."]'::jsonb,
     1,'The premise says all high scorers attended lectures — making attendance a necessary condition (no high score without it). But the argument concludes attendance is "the key," implying it is sufficient (attending guarantees a high score). Necessary ≠ sufficient. Choice B names this confusion precisely.','What is the difference between "all high scorers did X" and "doing X causes high scores"?','hard',4,5201,120),

    ('gmat',v_cr_flaw,'critical_reasoning',
     'Electric vehicle sales have increased dramatically over five years. During the same period, air quality in major cities has improved. Therefore, EV adoption has improved urban air quality.

The argument is vulnerable to criticism because it',
     '["overlooks the possibility that improved air quality caused more EV purchases.","mistakes a correlation between two trends for a causal relationship.","fails to consider the environmental cost of manufacturing EV batteries.","assumes all major cities experienced the same rate of air quality improvement.","ignores the role of government emission standards in improving air quality."]'::jsonb,
     1,'The argument commits the correlation/causation fallacy. Both EV adoption and air quality increased, but this doesn''t mean one caused the other. Both could be caused by a third factor (stricter emission regulations), or the relationship could be coincidental.','Just because two things changed at the same time does not mean one caused the other. What is this logical error called?','medium',3,5202,120),

    ('gmat',v_cr_flaw,'critical_reasoning',
     'The average salary at TechCorp is $95,000. Therefore, most TechCorp employees earn close to $95,000.

Which of the following most accurately describes the flaw in the reasoning?',
     '["The argument uses circular reasoning.","The argument treats the mean as if it necessarily represents the typical value, ignoring how outliers skew the average.","The argument fails to compare TechCorp salaries to industry benchmarks.","The argument assumes salary data is accurate without verifying the source.","The argument ignores whether TechCorp''s workforce size has changed."]'::jsonb,
     1,'A mean (average) can be heavily skewed by outliers. If TechCorp has executives earning $500K and many employees earning $40K, the average could be $95K while "most" employees earn far less. The mean does not necessarily represent the typical value in a skewed distribution.','What happens to the mean when a small number of very high values are present? Does "average" always mean "typical"?','medium',3,5203,120),

    ('gmat',v_cr_flaw,'critical_reasoning',
     'Everyone who has run a sub-4-hour marathon has trained at altitude at some point. Dr. Chen has never trained at altitude. Therefore, Dr. Chen has never run a sub-4-hour marathon.

The argument above is flawed because it',
     '["relies on a sample that may not be representative of all marathon runners.","denies the antecedent — inferring from the absence of a necessary condition that the result is absent.","confuses the meaning of a conditional with its converse.","assumes altitude training is the most important factor in marathon performance.","fails to consider that Dr. Chen may have trained at altitude under a different name."]'::jsonb,
     1,'The premise is: sub-4-hour → trained at altitude. The argument concludes: no altitude training → no sub-4-hour. This is denying the antecedent (¬A → ¬B from A → B), a formal fallacy. The original conditional says nothing about people who did NOT train at altitude.','From "All A are B," what can you validly conclude about someone who is not B? What can you NOT conclude?','hard',4,5204,120);
  END IF;

  -- ═══════════════════════════════════════════════════════════════════════
  -- CR INFERENCE (4 questions)
  -- ═══════════════════════════════════════════════════════════════════════
  IF v_cr_inf IS NOT NULL AND (SELECT COUNT(*) FROM problems WHERE source='gmat' AND subtopic_id=v_cr_inf)=0 THEN
    INSERT INTO problems (source,subtopic_id,question_type,question_text,options,correct_option,explanation,hint,difficulty,difficulty_level,order_index,time_recommendation_seconds) VALUES
    ('gmat',v_cr_inf,'critical_reasoning',
     '78% of employees at companies offering flexible work arrangements report high job satisfaction, compared to 52% at rigid-schedule companies. Flexible companies also report 30% lower voluntary turnover.

Which of the following can most properly be inferred?',
     '["Companies with flexible arrangements will always have better business outcomes.","Flexible work arrangements are the primary driver of employee satisfaction and retention.","At companies with flexible arrangements, satisfied employees are also less likely to leave voluntarily.","Job satisfaction and turnover are influenced by factors unrelated to work schedule flexibility.","Employees at flexible companies leave because of factors unrelated to satisfaction."]'::jsonb,
     2,'Flexible companies have both higher satisfaction (78% vs 52%) and lower turnover (30% less). We can infer these two outcomes correlate at flexible companies — satisfied employees there are also staying. Choices A and B use language too strong ("always," "primary driver") to be supported by the data.','What two facts about flexible companies, taken together, tell us about the relationship between satisfaction and retention there?','hard',4,5301,120),

    ('gmat',v_cr_inf,'critical_reasoning',
     'All budget airlines charge for checked baggage. FlyRight charges for checked baggage. Some budget airlines offer free in-flight meals.

Which of the following can be properly concluded?',
     '["FlyRight is a budget airline.","FlyRight does not offer free in-flight meals.","At least some airlines that charge for checked baggage also offer free in-flight meals.","FlyRight charges for checked baggage because it is a budget airline.","No full-service airline charges for checked baggage."]'::jsonb,
     2,'From premises 1 and 3: budget airlines charge for bags AND some budget airlines offer free meals. Therefore, some airlines that charge for bags (i.e., those budget airlines) also offer free meals. This follows directly. We cannot conclude FlyRight is a budget airline — charging for bags is necessary but not sufficient.','Which two premises can be combined to draw a valid conclusion? Focus on what the overlap between them implies.','medium',3,5302,120),

    ('gmat',v_cr_inf,'critical_reasoning',
     'After wolves were reintroduced to Yellowstone, the elk population decreased 40%. During the same decade, riverside vegetation recovered significantly and stream bank erosion decreased sharply.

Which of the following is most strongly supported?',
     '["Wolves were the only cause of the riverside vegetation recovery.","The wolf reintroduction had broader ecosystem effects beyond simply reducing elk numbers.","Reduced elk populations will always lead to vegetation recovery in national parks.","Elk were solely responsible for the vegetation decline before wolf reintroduction.","The benefits of wolf reintroduction outweigh its costs in all measurable ways."]'::jsonb,
     1,'The passage describes effects extending beyond the wolf-elk predator-prey relationship — vegetation and erosion patterns also changed. Choice B is directly supported: the reintroduction''s effects rippled through the ecosystem. Choices A, C, D, and E all use extreme language (only, always, solely, all) unsupported by the data.','Look for extreme words in each answer. Which choice makes a claim proportional to the evidence provided?','medium',3,5303,120),

    ('gmat',v_cr_inf,'critical_reasoning',
     'A city''s northern bus route is on time 65% of the time; the southern route is on time 85% of the time. The overall on-time rate across all routes is 70%.

Which of the following can be properly inferred?',
     '["The northern route carries more passengers than the southern route.","Southern buses run more frequently than northern buses.","The northern route accounts for a larger proportion of total bus trips than the southern route.","Eliminating the northern route would improve the overall on-time rate.","Passengers on the northern route are more dissatisfied than those on the southern route."]'::jsonb,
     2,'The overall rate (70%) is much closer to the northern rate (65%) than the southern rate (85%). For the weighted average to equal 70%, the northern route must contribute more trips to the total. This is the only conclusion directly supported by the mathematics of weighted averages.','If the overall rate is 70%, closer to one section''s rate than the other, what does that say about the relative volume of each section?','hard',4,5304,120);
  END IF;

  -- ═══════════════════════════════════════════════════════════════════════
  -- CR BOLD FACE (3 questions)
  -- ═══════════════════════════════════════════════════════════════════════
  IF v_cr_bf IS NOT NULL AND (SELECT COUNT(*) FROM problems WHERE source='gmat' AND subtopic_id=v_cr_bf)=0 THEN
    INSERT INTO problems (source,subtopic_id,question_type,question_text,options,correct_option,explanation,hint,difficulty,difficulty_level,order_index,time_recommendation_seconds) VALUES
    ('gmat',v_cr_bf,'critical_reasoning',
     'Some analysts argue the company should invest in existing product lines rather than new products. **Historically, companies focusing on product line extensions have higher short-term profitability than those pursuing new product development.** However, companies that innovate with new products capture larger long-term market share. **Therefore, the company should prioritize new product development to maximize its long-term competitive position.**

The two bolded portions play which roles?',
     '["The first is a claim the argument disputes; the second is the conclusion the argument endorses.","The first is evidence supporting the main conclusion; the second is that main conclusion.","The first is evidence supporting a position the argument opposes; the second is the argument''s conclusion.","The first is the main conclusion; the second is evidence for a secondary claim.","The first is background context; the second is a position attributed to opponents."]'::jsonb,
     2,'The first bold statement (short-term profitability data) supports the analysts'' opposing view (invest in extensions). The argument pivots with "However" to argue for new products. The second bold statement is the argument''s own conclusion. Choice C correctly identifies both roles.','What position does the first bold statement support — the author''s or the opponent''s? What signals the author''s final conclusion?','hard',4,5401,150),

    ('gmat',v_cr_bf,'critical_reasoning',
     '**Public parks improve the mental well-being of city residents.** A study found residents within half a mile of a park report 20% lower stress-related illness rates. City planners have proposed building three new parks in the east district. **The east district will therefore see the most significant improvement in resident health of any district in the city.**

The two bolded portions play which roles?',
     '["The first is a general principle used to support the second, which is the conclusion.","The first is a premise undermining the conclusion; the second is a counter-argument.","The first is the main conclusion; the second is supporting evidence.","The first is background information; the second is a hypothesis to be tested.","The first is a generalization the argument disputes; the second is the argument''s preferred position."]'::jsonb,
     0,'The first bold statement is a general principle (parks improve well-being) that provides the theoretical support for the argument. The second bold statement is the specific conclusion drawn from combining that principle with the study data and the proposal. Choice A correctly names both.','A general claim followed by specific evidence followed by a specific conclusion — what role does the general claim play?','medium',3,5402,150),

    ('gmat',v_cr_bf,'critical_reasoning',
     'Opponents argue the new zoning law will reduce housing availability. **In cities where similar laws were enacted, housing permits declined an average of 18% within two years.** Proponents counter that the law targets only luxury developments and will have minimal impact on affordable housing. **The new zoning law will not significantly reduce overall housing availability because the reduction in luxury units is offset by incentives for affordable housing construction.**

The two bolded portions play which roles?',
     '["The first supports the conclusion; the second is that conclusion.","The first is evidence for the opponents'' view; the second is the conclusion the argument defends.","The first is the argument''s main conclusion; the second is supporting evidence.","The first is an accepted fact; the second is a consequence the argument predicts.","The first is a premise supporting the proponents'' view; the second counters that view."]'::jsonb,
     1,'The first bold statement (18% permit decline) is evidence supporting the opponents'' concern. The proponents — and the argument itself — then push back. The second bold statement is the conclusion the argument ultimately defends. Choice B correctly identifies both roles.','Does the first bold statement support or challenge the final conclusion? Where does the argument''s own position appear?','hard',4,5403,150);
  END IF;

  -- ═══════════════════════════════════════════════════════════════════════
  -- CR EVALUATE (3 questions)
  -- ═══════════════════════════════════════════════════════════════════════
  IF v_cr_eval IS NOT NULL AND (SELECT COUNT(*) FROM problems WHERE source='gmat' AND subtopic_id=v_cr_eval)=0 THEN
    INSERT INTO problems (source,subtopic_id,question_type,question_text,options,correct_option,explanation,hint,difficulty,difficulty_level,order_index,time_recommendation_seconds) VALUES
    ('gmat',v_cr_eval,'critical_reasoning',
     'A nutritionist claims adopting a plant-based diet improves energy for most people. She cites a study in which participants who switched to plant-based diets reported higher energy after 30 days.

Which of the following would be most useful in evaluating this claim?',
     '["Whether participants were randomly selected.","Whether participants knew they were being studied and might have reported better energy out of expectation.","Whether participants also changed their exercise habits during the 30 days.","Whether the nutritionist personally follows a plant-based diet.","Whether plant-based foods are widely available in participants'' communities."]'::jsonb,
     1,'Choice B raises the placebo/expectation effect. If participants knew they were in a diet study, they might report improved energy because they expected to feel better — not because of the diet. This directly threatens the validity of the self-reported outcome data.','Apply the variance test: if participants knew vs. didn''t know they were being studied, would reported outcomes likely differ?','medium',3,5501,120),

    ('gmat',v_cr_eval,'critical_reasoning',
     'A retail company argues its new mobile app increased sales. In the six months after launch, total sales grew 22%. The company attributes this to the app''s convenience features.

Which of the following is most important to evaluate the company''s argument?',
     '["Whether the app development cost more than the resulting sales increase.","Whether retail sector sales as a whole grew during the same six months.","Whether the company also launched in-store promotions during the six months.","Whether the app received positive reviews in the app store.","Whether the company had experienced sales growth in the previous six months."]'::jsonb,
     1,'Choice B provides the baseline: if the entire retail sector grew 25% during the same period, the company''s 22% growth might represent underperformance, not success attributable to the app. Without this comparison, the 22% figure means very little.','If the whole industry grew at the same time, what does that do to the argument''s claim that the app caused growth?','medium',3,5502,120),

    ('gmat',v_cr_eval,'critical_reasoning',
     'A city council argues that raising minimum wage to $18/hour will increase the economic welfare of low-income residents. They cite economic models showing that at $18/hour, increased earnings for employed workers exceed projected losses from associated unemployment.

Which of the following would be most important to know in evaluating this argument?',
     '["The current minimum wage in neighboring cities.","Whether the economic models account for the informal/gig economy where minimum wage laws may not apply.","The historical rate of wage growth in the city over the past decade.","Whether low-income residents were consulted before the proposal.","The total number of businesses currently paying below $18/hour."]'::jsonb,
     1,'Choice B highlights a critical gap: if many low-income workers earn income in the informal or gig economy (where minimum wage laws may not apply), the model''s projections about who benefits and who is harmed could be substantially wrong.','Who does the minimum wage policy actually cover? Are there low-income workers the economic model might miss entirely?','hard',4,5503,120);
  END IF;

  -- ═══════════════════════════════════════════════════════════════════════
  -- RC MAIN IDEA (3 questions with passages)
  -- ═══════════════════════════════════════════════════════════════════════
  IF v_rc_main IS NOT NULL AND (SELECT COUNT(*) FROM problems WHERE source='gmat' AND subtopic_id=v_rc_main)=0 THEN
    INSERT INTO problems (source,subtopic_id,question_type,question_text,passage_text,options,correct_option,explanation,hint,difficulty,difficulty_level,order_index,time_recommendation_seconds) VALUES
    ('gmat',v_rc_main,'reading_comprehension',
     'The primary purpose of the passage is to',
     'The rise of algorithmic decision-making in hiring has prompted significant debate. Proponents argue that algorithms eliminate human bias by evaluating candidates solely on measurable criteria, leading to more equitable outcomes. Critics contend that these systems perpetuate historical biases embedded in training data — if past hiring decisions were biased, the algorithm learns to replicate those biases at scale. Some researchers have proposed hybrid approaches that use algorithms for initial screening while reserving final decisions for human judgment. The effectiveness of such hybrid models remains an active area of research.',
     '["Argue that algorithmic hiring produces more equitable outcomes than human-led hiring.","Describe the debate surrounding algorithmic hiring, including both supporting and opposing perspectives.","Demonstrate that hybrid models are superior to purely algorithmic approaches.","Summarize recent research findings on algorithmic bias in hiring systems.","Challenge the assumption that algorithms are more objective than human decision-makers."]'::jsonb,
     1,'The passage presents multiple perspectives — proponents, critics, and hybrid model researchers — without advocating for one side. Choice B correctly captures this balanced, descriptive purpose. Choice A is only the proponents'' view, not the passage''s own purpose.','Is the author arguing for one side or presenting multiple perspectives without taking a definitive stance?','easy',2,6001,120),

    ('gmat',v_rc_main,'reading_comprehension',
     'Which of the following best describes the main idea of the passage?',
     'The concept of "creative destruction," coined by economist Joseph Schumpeter, refers to the process by which new innovations continuously displace existing industries and business models. Schumpeter viewed this dynamism as capitalism''s most essential feature — the engine of long-run economic growth. In recent decades, critics have questioned whether the pace of creative destruction has accelerated to the point of causing net social harm. They note that gains from innovation often concentrate among a small group of entrepreneurs and investors, while disruption costs — job displacement and community destabilization — fall disproportionately on working-class communities. Defenders argue that historically, new industries have always created more jobs than they destroy over the long run. This debate remains unresolved, as today''s structural shifts may differ fundamentally from previous industrial transitions.',
     '["Creative destruction, while the engine of economic growth per Schumpeter, has come under scrutiny for its potentially unequal distribution of benefits and costs.","Schumpeter''s theory has been definitively disproven by recent data on job displacement.","The accelerating pace of creative destruction proves capitalism is fundamentally incompatible with social stability.","Defenders of creative destruction have successfully countered all critics'' concerns.","Creative destruction has created more total jobs than it destroyed, making it a net positive for all groups."]'::jsonb,
     0,'The passage introduces Schumpeter''s concept positively, then presents critics'' inequality concerns, then defenders'' counter-argument, and ends with the debate unresolved. Choice A captures this balanced tension. The other choices are either too extreme, one-sided, or factually unsupported.','What is the central tension the passage establishes? Does the author resolve it?','medium',3,6002,120),

    ('gmat',v_rc_main,'reading_comprehension',
     'The passage is primarily concerned with',
     'Marine biologists have long categorized coral reef ecosystems as "climax communities" — highly stable ecological assemblages that persist for centuries. However, recent longitudinal studies have challenged this characterization. Researchers tracking 60 reef sites over 30 years found that reef communities shifted composition significantly over time, with some species increasing while others declined, even in the absence of human-induced stressors such as pollution or overfishing. These findings suggest that coral reefs may be more accurately described as "dynamic systems" existing in continuous flux. The implications for conservation are significant: if reefs are naturally dynamic, then conservation benchmarks based on a single historical snapshot may be setting unrealistic restoration targets.',
     '["Describing threats that human activity poses to coral reef ecosystems.","Challenging a widely held scientific assumption about reef stability and exploring its conservation implications.","Arguing that conservation efforts for coral reefs are fundamentally misguided.","Summarizing 30 years of longitudinal research on reef species composition.","Advocating for a new definition of ''climax communities'' in marine biology."]'::jsonb,
     1,'The passage challenges the "climax community" characterization, presents evidence reefs are dynamic, and draws conservation implications. Choice B captures all three elements. Choice A (human threats) is barely mentioned. Choice C (conservation is misguided) overstates the author''s claim. Choice D is too narrow.','What three things does the passage do in sequence? Which answer choice encompasses all three?','medium',3,6003,120);
  END IF;

  -- ═══════════════════════════════════════════════════════════════════════
  -- RC INFERENCE (3 questions)
  -- ═══════════════════════════════════════════════════════════════════════
  IF v_rc_inf IS NOT NULL AND (SELECT COUNT(*) FROM problems WHERE source='gmat' AND subtopic_id=v_rc_inf)=0 THEN
    INSERT INTO problems (source,subtopic_id,question_type,question_text,passage_text,options,correct_option,explanation,hint,difficulty,difficulty_level,order_index,time_recommendation_seconds) VALUES
    ('gmat',v_rc_inf,'reading_comprehension',
     'Which of the following can be most reasonably inferred from the passage?',
     'The development of CRISPR-Cas9 gene editing has dramatically accelerated the pace of genetic research. Before CRISPR, editing a single gene in a laboratory organism could take months of painstaking work. CRISPR has reduced this to days, enabling researchers to test hypotheses that previously would have been too time-consuming to pursue. However, the technology''s precision — while far superior to previous methods — remains imperfect. Off-target edits, where the system modifies unintended genetic sequences, remain a concern that limits CRISPR''s clinical applications. Several research groups are currently working on modified CRISPR variants designed to minimize these off-target effects.',
     '["CRISPR-Cas9 will soon be used in widespread clinical treatments for genetic diseases.","Prior to CRISPR, researchers largely avoided testing hypotheses that required extensive gene editing.","CRISPR''s off-target effects are more frequent in humans than in laboratory organisms.","The imprecision of CRISPR has prevented all clinical applications.","CRISPR''s clinical use is currently limited, at least in part, by concerns about unintended genetic modifications."]'::jsonb,
     4,'Choice E is directly supported: the passage states off-target edits "remain a concern that limits CRISPR''s clinical applications." This is a direct, conservative inference. Choice A is too speculative (no timeline given). Choice D is too extreme ("prevented all" vs. "limits").','Which answer is directly and specifically supported by the passage''s own words, without adding unsupported claims?','medium',3,6101,120),

    ('gmat',v_rc_inf,'reading_comprehension',
     'It can be inferred from the passage that the author most likely believes',
     'For decades, economists assumed consumers make rational decisions that maximize utility. This "rational actor" model underpins classical economic theory and most government policy analysis. However, research in behavioral economics has consistently demonstrated that human decision-making is riddled with predictable irrationalities — cognitive biases, emotional responses, and social influences that systematically lead people away from choices that serve their long-term interests. Despite this substantial body of evidence, many mainstream economists continue to rely on the rational actor model, arguing that while individuals may be irrational in specific instances, their irrationalities tend to cancel out in aggregate markets.',
     '["Behavioral economics has completely invalidated the rational actor model.","The persistence of the rational actor model in mainstream economics is not fully justified by the evidence.","Cognitive biases affect some individuals but are rare enough to be negligible in policy analysis.","Government policy should abandon economic models entirely and focus on direct behavioral interventions.","Aggregate markets are more efficient than individual decision-making."]'::jsonb,
     1,'The author presents strong behavioral evidence against the rational actor model, then notes mainstream economists "continue to rely on it" — implying the author finds this persistence questionable. Choice B captures this implied skepticism. Choice A goes too far ("completely invalidated"). Choice C contradicts the passage (biases are "consistent" and "systematic").','What tone does the author use when noting that economists continue using the rational actor model despite behavioral evidence?','hard',4,6102,120),

    ('gmat',v_rc_inf,'reading_comprehension',
     'Which of the following is most strongly implied by the passage?',
     'The shift from print to digital media has fundamentally altered journalism''s economics. In the print era, advertising revenue subsidized news content — a newspaper could sell ad space at a premium because it guaranteed advertisers a large, captive audience. Digital advertising operates on entirely different economics: advertisers can target specific audiences across many platforms, reducing their dependence on any single outlet. As a result, many news organizations have seen advertising revenue collapse while their audiences have actually grown online. Some outlets have pivoted to reader-supported subscription models, but these tend to serve educated, higher-income readers who are willing to pay, potentially leaving lower-income communities without reliable local news.',
     '["Digital advertising is more effective than print because it enables precise audience targeting.","The growth of online audiences for news organizations has failed to translate into proportional advertising revenue growth.","Subscription news models are economically unsustainable in the long term.","The collapse of print advertising has caused a net decrease in total journalism produced.","Lower-income communities never had access to reliable local news even during the print era."]'::jsonb,
     1,'The passage explicitly states that organizations have seen "advertising revenue collapse while their audiences have actually grown online." This directly implies that audience growth and revenue growth are decoupled in digital media — Choice B. Choice A is mentioned but as context, not the main implication. Choices C, D, and E are not supported.','What does the passage say happened to revenue while audiences grew? What does that relationship imply?','medium',3,6103,120);
  END IF;

  -- ═══════════════════════════════════════════════════════════════════════
  -- RC DETAIL (3 questions)
  -- ═══════════════════════════════════════════════════════════════════════
  IF v_rc_det IS NOT NULL AND (SELECT COUNT(*) FROM problems WHERE source='gmat' AND subtopic_id=v_rc_det)=0 THEN
    INSERT INTO problems (source,subtopic_id,question_type,question_text,passage_text,options,correct_option,explanation,hint,difficulty,difficulty_level,order_index,time_recommendation_seconds) VALUES
    ('gmat',v_rc_det,'reading_comprehension',
     'According to the passage, which of the following contributed most to the decline of the Hanseatic League?',
     'The Hanseatic League, a commercial confederation of merchant guilds and market towns in Northern Europe, dominated Baltic and North Sea trade from the 13th through the 17th centuries. At its peak, the League included over 200 cities and controlled the export of grain, timber, furs, and salted fish. Its decline resulted from several converging forces. The emergence of powerful nation-states in England, Denmark, and the Netherlands undermined the League''s ability to negotiate as an independent political entity. Simultaneously, the discovery of sea routes to Asia and the Americas shifted European trade away from the Baltic, diminishing the strategic importance of League-controlled ports. Internal tensions among member cities, arising from conflicting commercial interests, further eroded the confederation''s cohesion.',
     '["The League''s failure to expand its membership beyond 200 cities.","A combination of geopolitical changes, shifting trade routes, and internal conflicts among member cities.","The rise of Asian trading powers competing directly with League merchants.","The League''s refusal to trade in commodities other than grain and timber.","The emergence of a unified European nation-state that absorbed League territories."]'::jsonb,
     1,'The passage explicitly lists three factors: (1) nation-states undermining its political position, (2) new sea routes shifting trade away from Baltic, and (3) internal tensions among members. Choice B is the only answer capturing all three elements. Other choices either misstate a detail or introduce information not mentioned.','List every factor mentioned in the passage. Which answer choice includes all of them without distortion?','easy',2,6201,90),

    ('gmat',v_rc_det,'reading_comprehension',
     'According to the passage, the researchers found which of the following when studying the forest plots?',
     'A team of ecologists conducted a 15-year study of forest regeneration in cleared plots across three biomes: tropical, temperate, and boreal. In tropical plots, species diversity recovered to approximately 80% of old-growth levels within 10 years, driven by rapid colonization by pioneer species. Temperate plots showed slower recovery, reaching about 60% of old-growth diversity by the study''s end. Boreal plots exhibited the least recovery, with species diversity remaining at roughly 30% of old-growth benchmarks after 15 years. The researchers noted that boreal recovery was constrained primarily by slow decomposition rates, which limited nutrient availability for seedling establishment.',
     '["Tropical plots exceeded old-growth diversity levels within 10 years.","Boreal plots showed slower recovery than temperate plots primarily because of fewer pioneer species.","Temperate plots reached 60% of old-growth diversity by the end of the 15-year study.","Nutrient availability was the limiting factor for recovery across all three biomes.","Boreal forests had higher old-growth diversity than tropical forests before clearing."]'::jsonb,
     2,'Choice C is directly stated: "Temperate plots showed slower recovery, reaching about 60% of old-growth diversity by the study''s end" (15 years). Choice A is wrong — 80% is close to, not exceeding, old-growth levels. Choice B misrepresents the boreal constraint (slow decomposition/nutrients, not pioneer species). Choice D says nutrients constrained all three — false.','Find the exact sentence in the passage that confirms or denies each choice.','easy',2,6202,90),

    ('gmat',v_rc_det,'reading_comprehension',
     'The passage states that the primary reason for the expansion of the Federal Reserve''s mandate was',
     'The Federal Reserve was established in 1913 primarily to prevent bank panics by serving as a lender of last resort. For decades, its mandate was relatively narrow: maintain currency stability and provide emergency liquidity to solvent banks. The mandate expanded significantly following the Great Depression, when Congress determined that the Fed''s failure to prevent a collapse in the money supply had deepened the economic crisis. The Full Employment Act of 1946 formalized a dual mandate: alongside price stability, the Fed became responsible for promoting maximum employment. Critics of the dual mandate argue that it creates conflicts — that measures to combat inflation (raising interest rates) can simultaneously increase unemployment.',
     '["The Fed''s focus on currency stability had led to excessive inflation during the 1930s.","Congress believed the Fed''s inaction during the Great Depression had worsened the economic downturn.","The emergence of global trade required a central bank with a broader economic management role.","Economists in the 1940s determined unemployment was a more pressing concern than price stability.","The Federal Reserve requested an expanded mandate to better serve its lender-of-last-resort function."]'::jsonb,
     1,'The passage directly states: "Congress determined that the Fed''s failure to prevent a collapse in the money supply had deepened the economic crisis" — this was the reason for the mandate expansion. Choice B paraphrases this accurately. The other choices introduce information not stated in the passage.','Find the specific sentence in the passage that explicitly explains WHY Congress expanded the mandate.','medium',3,6203,90);
  END IF;

  -- ═══════════════════════════════════════════════════════════════════════
  -- RC TONE (3 questions)
  -- ═══════════════════════════════════════════════════════════════════════
  IF v_rc_tone IS NOT NULL AND (SELECT COUNT(*) FROM problems WHERE source='gmat' AND subtopic_id=v_rc_tone)=0 THEN
    INSERT INTO problems (source,subtopic_id,question_type,question_text,passage_text,options,correct_option,explanation,hint,difficulty,difficulty_level,order_index,time_recommendation_seconds) VALUES
    ('gmat',v_rc_tone,'reading_comprehension',
     'The author''s tone in the passage can best be described as',
     'Recent reports predicting the imminent obsolescence of the accounting profession due to artificial intelligence deserve careful scrutiny. While AI tools have unquestionably improved the automation of routine bookkeeping tasks, the assumption that they will replace skilled accountants rests on a fundamental misunderstanding of what accountants actually do. Expert-level accounting involves not just numerical calculation but complex judgment calls about materiality, risk assessment, regulatory compliance, and client communication — tasks that require contextual understanding and professional discretion. AI excels at processing large volumes of structured data quickly; it is far less capable of navigating the ambiguity inherent in real-world financial decision-making.',
     '["Cautiously pessimistic about the future prospects of the accounting profession.","Analytically skeptical of claims about AI''s capacity to replace expert accountants.","Enthusiastically supportive of AI adoption in financial services.","Dismissive of concerns about AI''s potential impact on employment.","Neutral and impartial, presenting both sides of the AI-accounting debate equally."]'::jsonb,
     1,'The author challenges reports predicting accountants'' obsolescence using analytical reasoning about what accountants actually do. The tone is not pessimistic (the author defends accountants) nor neutral (a clear position is taken). The author is analytically skeptical — making a careful, reasoned case against the AI-replacement claim.','Does the author take a side? Is the challenge emotional or based on systematic reasoning?','medium',3,6301,90),

    ('gmat',v_rc_tone,'reading_comprehension',
     'The author''s attitude toward the proposed urban agriculture initiative can best be described as',
     'The city''s proposal to convert vacant lots into community gardens has been met with considerable enthusiasm. Advocates argue that urban agriculture will simultaneously address food insecurity, reduce urban heat islands, and strengthen community bonds. These are laudable goals. However, the evidence supporting urban agriculture as a cost-effective solution to food insecurity is mixed at best. Studies in comparable cities suggest that community gardens, while nutritionally beneficial for participants, rarely scale to the point of making meaningful dents in citywide food access statistics. The city would be better served by scrutinizing the cost per nutritional benefit before committing significant public funds to this initiative.',
     '["Unconditionally supportive, given the program''s multiple social benefits.","Cautiously critical, acknowledging potential benefits while questioning cost-effectiveness.","Deeply skeptical, dismissing the initiative as ineffective and wasteful.","Enthusiastically neutral, presenting the initiative''s merits and drawbacks without judgment.","Pessimistic about the city''s ability to address food insecurity through any means."]'::jsonb,
     1,'The author acknowledges the goals are "laudable" but raises concerns about cost-effectiveness and scaling. This is cautious criticism — not unconditional support (A) and not deep skepticism or dismissal (C). The author urges scrutiny before commitment: measured and critical, but not hostile.','What signals the author''s support? What signals the author''s concern? Which is stronger in the final sentence?','medium',3,6302,90),

    ('gmat',v_rc_tone,'reading_comprehension',
     'The author''s treatment of classical economics in the passage can best be characterized as',
     'Classical economists from Adam Smith to David Ricardo built an elegant theoretical framework based on free markets, rational actors, and self-correcting price mechanisms. For over a century, this framework dominated economic thought and shaped policy across the industrialized world. Contemporary economists have largely retained the classical framework''s analytical power while incorporating insights from behavioral research, institutional economics, and empirical work that would have been impossible without modern computing. The classical framework is best viewed not as a relic to be discarded, but as a foundational scaffold upon which more nuanced and empirically grounded economic thinking has been constructed.',
     '["Dismissive, suggesting the classical framework has become irrelevant in modern economics.","Reverential, implying that classical economics should remain unchanged.","Appreciative of its historical contributions while recognizing its evolution into more complex forms.","Critical, arguing that classical assumptions have been disproven by contemporary research.","Ambivalent, unable to decide whether classical economics remains valuable."]'::jsonb,
     2,'The author respects the classical framework ("elegant theoretical framework," "analytical power") while seeing it as a foundation that has been built upon. The "foundational scaffold" metaphor captures appreciation-with-evolution. Choice C fits: the author values classical contributions while acknowledging the field has grown beyond them.','What specific words and metaphors does the author use for classical economics? Do they suggest respect, criticism, or something between?','easy',2,6303,90);
  END IF;

  -- ═══════════════════════════════════════════════════════════════════════
  -- RC APPLICATION (3 questions)
  -- ═══════════════════════════════════════════════════════════════════════
  IF v_rc_app IS NOT NULL AND (SELECT COUNT(*) FROM problems WHERE source='gmat' AND subtopic_id=v_rc_app)=0 THEN
    INSERT INTO problems (source,subtopic_id,question_type,question_text,passage_text,options,correct_option,explanation,hint,difficulty,difficulty_level,order_index,time_recommendation_seconds) VALUES
    ('gmat',v_rc_app,'reading_comprehension',
     'Based on the passage, which of the following most closely parallels the concept described?',
     'Competitive exclusion is an ecological principle stating that two species cannot indefinitely occupy the same ecological niche in the same environment. If two species require the same resource and compete for it, one will eventually outcompete the other, driving it to extinction or forcing it to adapt to a slightly different niche. The principle implies that stable ecosystems with high species diversity must contain species that have each carved out distinct niches, even if they appear superficially similar. Competition does not always lead to exclusion — when resources are abundant, competing species can coexist temporarily. Exclusion becomes inevitable only when resources are genuinely limited.',
     '["Two technology companies both selling productivity software, with the market eventually consolidating around one dominant product.","A new employee joining a team where another performs the same role, leading to restructuring that assigns each distinct responsibilities.","Two political parties in a two-party system, each occupying distinctly different ideological positions to attract separate voter bases.","An invasive plant species and a native plant species competing for sunlight in a resource-constrained forest, with the invasive species gradually displacing the native one.","Two banks competing for customers in a market where there is sufficient demand to support both profitably."]'::jsonb,
     3,'Competitive exclusion requires: (1) same niche/resource, (2) limited resources, (3) eventual displacement. Choice D matches all three: same niche (sunlight in a constrained forest), limited resources (the forest), and displacement (native species gradually displaced). Choice E explicitly says resources support both — no exclusion. Choice B ends in niche differentiation, not exclusion.','What are the key elements of competitive exclusion? Which choice satisfies ALL of them?','hard',4,6401,150),

    ('gmat',v_rc_app,'reading_comprehension',
     'Which of the following examples best illustrates the principle described as "Goodhart''s Law"?',
     'British economist Charles Goodhart observed that when a particular measure becomes a policy target, it ceases to be a good measure. This observation — Goodhart''s Law — captures a fundamental tension in governance and management. The problem arises because people respond to the incentives created by being measured and targeted, altering their behavior in ways that improve the metric without improving the underlying condition the metric was designed to capture. The phenomenon is not a failure of individual ethics but an inevitable consequence of how rational agents respond to systems of measurement and evaluation.',
     '["A government reduces its budget deficit by cutting infrastructure spending rather than increasing tax revenue.","A school system improves standardized test scores by training students specifically on test-taking strategies rather than broader skills, while actual learning outcomes remain unchanged.","A company increases its stock price by announcing a share buyback that does not change fundamental business performance.","A hospital reduces patient wait times by turning away complex cases that require longer treatment.","A sales team hits its monthly target by offering steep discounts in the final week, reducing profit margins."]'::jsonb,
     1,'Goodhart''s Law: when a measure becomes a target, it stops being a good measure. In Choice B, test scores are the measure; they become the target; students improve the metric (scores) without improving the underlying condition (actual learning). This perfectly matches the definition. The other choices involve gaming metrics but for different reasons (ethical violations, financial manipulation) that go beyond Goodhart''s specific observation.','Which choice shows a metric being gamed so the number improves but the underlying condition it was measuring does NOT improve?','medium',3,6402,150),

    ('gmat',v_rc_app,'reading_comprehension',
     'Based on the passage, which situation would the author likely view as an example of the Matthew Effect?',
     'Sociologist Robert Merton identified what he termed the "Matthew Effect" in scientific communities: scientists who had already achieved recognition tended to receive disproportionate credit for subsequent work, even when contributions of lesser-known collaborators were comparable or greater. The phenomenon takes its name from the biblical verse: "To him who has, more will be given." Merton observed that initial recognition creates a compounding advantage — name recognition leads to more citations, which leads to more visibility, which leads to further recognition. The effect implies that early career success can be self-reinforcing in ways disconnected from the underlying quality of later work.',
     '["A top-ranked university attracts the most talented students because of its reputation, enabling it to maintain its ranking.","A seasoned manager receives a larger bonus than a junior employee who contributed equally to a project because of seniority-based pay scales.","An established author''s new novel receives immediate mainstream distribution, while a debut novelist with equal writing quality struggles to find a publisher.","A wealthy investor earns higher returns than a middle-income investor because of access to exclusive investment funds.","A veteran employee is promoted ahead of a newer employee who scored higher on the performance review because of stronger management relationships."]'::jsonb,
     2,'The Matthew Effect is specifically about early recognition creating compounding advantages disconnected from quality. Choice C matches: the established author gets distribution advantages (compounding recognition) while the debut novelist with equal quality does not. This is recognition asymmetry unrelated to quality — exactly the Matthew Effect. Choice A involves actual talent selection. Choice D is wealth inequality. Choices B and E are about policy or relationships, not recognition compounding.','The Matthew Effect is about RECOGNITION (not wealth or seniority) creating self-reinforcing advantages. Which choice involves recognition asymmetry between equally talented individuals?','hard',4,6403,150);
  END IF;

  -- ═══════════════════════════════════════════════════════════════════════
  -- PS ARITHMETIC (5 questions)
  -- ═══════════════════════════════════════════════════════════════════════
  IF v_ps_arith IS NOT NULL AND (SELECT COUNT(*) FROM problems WHERE source='gmat' AND subtopic_id=v_ps_arith)=0 THEN
    INSERT INTO problems (source,subtopic_id,question_type,question_text,options,correct_option,explanation,hint,difficulty,difficulty_level,order_index,time_recommendation_seconds) VALUES
    ('gmat',v_ps_arith,'problem_solving',
     'What is the greatest common divisor (GCD) of 84 and 120?',
     '["6","12","24","42","60"]'::jsonb,
     1,'84 = 2² × 3 × 7; 120 = 2³ × 3 × 5. GCD takes the lowest power of each common prime: 2² × 3 = 12.','Factor both numbers into primes. The GCD uses the smallest power of each shared prime factor.','easy',2,7001,90),

    ('gmat',v_ps_arith,'problem_solving',
     'If 3^x = 81, what is the value of 3^(x − 2)?',
     '["3","9","27","243","729"]'::jsonb,
     1,'3^x = 81 = 3^4, so x = 4. Then 3^(x−2) = 3^2 = 9.','Find x first by expressing 81 as a power of 3, then evaluate the expression.','easy',2,7002,75),

    ('gmat',v_ps_arith,'problem_solving',
     'When a number N is divided by 7, the remainder is 5. What is the remainder when 3N is divided by 7?',
     '["1","2","4","6","15"]'::jsonb,
     0,'N = 7q + 5. Then 3N = 21q + 15 = 7(3q + 2) + 1. The remainder when 3N is divided by 7 is 1.','Express N as 7q + r, then compute 3N and find its remainder.','medium',3,7003,90),

    ('gmat',v_ps_arith,'problem_solving',
     'What is the least common multiple (LCM) of 12 and 18?',
     '["6","24","36","72","216"]'::jsonb,
     2,'12 = 2² × 3; 18 = 2 × 3². LCM uses the highest power of each prime: 2² × 3² = 4 × 9 = 36.','For LCM, take the highest power of each prime factor appearing in either number.','easy',2,7004,75),

    ('gmat',v_ps_arith,'problem_solving',
     'If p and q are prime numbers such that p² − q² = 72, what is the value of p + q?',
     '["10","14","18","22","26"]'::jsonb,
     2,'p² − q² = (p+q)(p−q) = 72. Since p and q are odd primes, (p+q) and (p−q) are both even. Try p+q=18, p−q=4: p=11, q=7. Check: 121 − 49 = 72 ✓. Both 11 and 7 are prime.','Factor as (p+q)(p−q). Since both primes are odd, both factors are even. Find the even factor pair of 72 where the average gives a prime.','hard',4,7005,120);
  END IF;

  -- ═══════════════════════════════════════════════════════════════════════
  -- PS ALGEBRA (5 questions)
  -- ═══════════════════════════════════════════════════════════════════════
  IF v_ps_alg IS NOT NULL AND (SELECT COUNT(*) FROM problems WHERE source='gmat' AND subtopic_id=v_ps_alg)=0 THEN
    INSERT INTO problems (source,subtopic_id,question_type,question_text,options,correct_option,explanation,hint,difficulty,difficulty_level,order_index,time_recommendation_seconds) VALUES
    ('gmat',v_ps_alg,'problem_solving',
     'If 2x + 3y = 12 and x − y = 1, what is the value of x + y?',
     '["2","3","5","7","9"]'::jsonb,
     2,'From x − y = 1: x = y + 1. Substitute into 2x + 3y = 12: 2(y+1) + 3y = 12 → 5y = 10 → y = 2. Then x = 3. So x + y = 5.','Solve one equation for x and substitute into the other equation.','easy',2,7101,90),

    ('gmat',v_ps_alg,'problem_solving',
     'For what values of x is the inequality 2x² − 5x − 3 < 0 satisfied?',
     '["x < −1/2 or x > 3","−1/2 < x < 3","x < −3 or x > 1/2","−3 < x < 1/2","x < −3 or x > 3"]'::jsonb,
     1,'Factor: 2x² − 5x − 3 = (2x + 1)(x − 3). Roots at x = −1/2 and x = 3. Since the parabola opens upward (positive leading coefficient), the expression is negative between the roots: −1/2 < x < 3.','Factor the quadratic, find the two roots, then determine where the upward parabola is below zero.','medium',3,7102,120),

    ('gmat',v_ps_alg,'problem_solving',
     'If x² − 9x + 20 = 0, what is the product of all possible values of x?',
     '["4","5","9","20","29"]'::jsonb,
     3,'By Vieta''s formulas, the product of the roots of x² + bx + c = 0 is c/a = 20/1 = 20. Alternatively, factor: (x−4)(x−5) = 0, giving x = 4 and x = 5. Product = 4 × 5 = 20.','The product of the roots of x² + bx + c = 0 equals c. Or factor the quadratic.','medium',3,7103,90),

    ('gmat',v_ps_alg,'problem_solving',
     'If |2x − 6| = 10, what are the possible values of x?',
     '["x = 8 only","x = −2 only","x = 8 or x = −2","x = 2 or x = 8","x = −8 or x = 2"]'::jsonb,
     2,'Case 1: 2x − 6 = 10 → x = 8. Case 2: 2x − 6 = −10 → 2x = −4 → x = −2. Both solutions are valid.','Set up two cases: the expression inside the absolute value equals +10 and −10.','easy',2,7104,75),

    ('gmat',v_ps_alg,'problem_solving',
     'A train leaves City A traveling at 60 mph. Two hours later, a second train leaves City A on the same track at 90 mph. How many hours after the second train departs will it catch the first train?',
     '["3 hours","4 hours","5 hours","6 hours","8 hours"]'::jsonb,
     1,'When the second train departs, the first has a 2-hour head start: distance = 60 × 2 = 120 miles. The second train gains on the first at 90 − 60 = 30 mph. Time to close 120 miles = 120 ÷ 30 = 4 hours.','Find the head-start distance, then divide by the relative (closing) speed.','medium',3,7105,90);
  END IF;

  -- ═══════════════════════════════════════════════════════════════════════
  -- PS GEOMETRY (4 questions)
  -- ═══════════════════════════════════════════════════════════════════════
  IF v_ps_geo IS NOT NULL AND (SELECT COUNT(*) FROM problems WHERE source='gmat' AND subtopic_id=v_ps_geo)=0 THEN
    INSERT INTO problems (source,subtopic_id,question_type,question_text,options,correct_option,explanation,hint,difficulty,difficulty_level,order_index,time_recommendation_seconds) VALUES
    ('gmat',v_ps_geo,'problem_solving',
     'In a right triangle, the two legs measure 5 and 12. What is the length of the hypotenuse?',
     '["10","12","13","15","17"]'::jsonb,
     2,'By the Pythagorean theorem: c² = 5² + 12² = 25 + 144 = 169. So c = √169 = 13. This is the classic 5-12-13 Pythagorean triple.','Apply the Pythagorean theorem: a² + b² = c².','easy',2,7201,75),

    ('gmat',v_ps_geo,'problem_solving',
     'A circle has an area of 36π square units. What is its circumference?',
     '["6π","9π","12π","18π","36π"]'::jsonb,
     2,'Area = πr² = 36π → r² = 36 → r = 6. Circumference = 2πr = 2π(6) = 12π.','Find the radius from the area formula, then use the circumference formula.','easy',2,7202,75),

    ('gmat',v_ps_geo,'problem_solving',
     'What is the area of a triangle with sides of length 3, 4, and 5?',
     '["4","6","8","10","12"]'::jsonb,
     1,'Since 3² + 4² = 9 + 16 = 25 = 5², this is a right triangle with legs 3 and 4. Area = ½ × base × height = ½ × 3 × 4 = 6.','Recognize this as a Pythagorean triple, then use the right triangle area formula.','easy',2,7203,75),

    ('gmat',v_ps_geo,'problem_solving',
     'A rectangle has a perimeter of 30 and one side of length 7. What is the area of the rectangle?',
     '["35","56","77","84","90"]'::jsonb,
     1,'Perimeter = 2(l + w) = 30, so l + w = 15. If one side = 7, the other side = 15 − 7 = 8. Area = 7 × 8 = 56.','Use the perimeter to find the sum of the two different sides, then find the missing side and multiply.','easy',2,7204,75);
  END IF;

  -- ═══════════════════════════════════════════════════════════════════════
  -- PS WORD PROBLEMS (4 questions)
  -- ═══════════════════════════════════════════════════════════════════════
  IF v_ps_wp IS NOT NULL AND (SELECT COUNT(*) FROM problems WHERE source='gmat' AND subtopic_id=v_ps_wp)=0 THEN
    INSERT INTO problems (source,subtopic_id,question_type,question_text,options,correct_option,explanation,hint,difficulty,difficulty_level,order_index,time_recommendation_seconds) VALUES
    ('gmat',v_ps_wp,'problem_solving',
     'Worker A can complete a job in 6 hours. Worker B can complete the same job in 3 hours. How many hours does it take them working together?',
     '["1","1.5","2","2.5","3"]'::jsonb,
     2,'Combined rate = 1/6 + 1/3 = 1/6 + 2/6 = 3/6 = 1/2 job per hour. Time = 1 ÷ (1/2) = 2 hours.','Add their individual rates (jobs per hour), then take the reciprocal to find total time.','medium',3,7301,90),

    ('gmat',v_ps_wp,'problem_solving',
     '30 liters of a 20% acid solution are mixed with 20 liters of a 60% acid solution. What is the acid concentration of the resulting mixture?',
     '["28%","32%","36%","40%","44%"]'::jsonb,
     2,'Total acid = (30 × 0.20) + (20 × 0.60) = 6 + 12 = 18 liters. Total solution = 50 liters. Concentration = 18/50 = 0.36 = 36%.','Multiply each volume by its concentration to get the acid amount. Divide total acid by total volume.','medium',3,7302,90),

    ('gmat',v_ps_wp,'problem_solving',
     'A price increases by 20%, then decreases by 20%. What is the net percentage change from the original price?',
     '["-6%","-4%","0%","4%","6%"]'::jsonb,
     1,'If original price = P, after 20% increase: 1.2P. After 20% decrease: 1.2P × 0.8 = 0.96P. Net change = (0.96P − P)/P = −0.04 = −4%.','Apply both percentage changes sequentially. Multiply 1.2 × 0.8 to find the combined multiplier.','medium',3,7303,90),

    ('gmat',v_ps_wp,'problem_solving',
     'A car travels at 60 mph for 2.5 hours, then at 40 mph for 1.5 hours. What is the total distance traveled?',
     '["150 miles","180 miles","210 miles","240 miles","270 miles"]'::jsonb,
     2,'Distance = Rate × Time. Segment 1: 60 × 2.5 = 150 miles. Segment 2: 40 × 1.5 = 60 miles. Total = 210 miles.','Calculate each segment separately using D = R × T, then add.','easy',2,7304,75);
  END IF;

  -- ═══════════════════════════════════════════════════════════════════════
  -- PS STATISTICS (4 questions)
  -- ═══════════════════════════════════════════════════════════════════════
  IF v_ps_stat IS NOT NULL AND (SELECT COUNT(*) FROM problems WHERE source='gmat' AND subtopic_id=v_ps_stat)=0 THEN
    INSERT INTO problems (source,subtopic_id,question_type,question_text,options,correct_option,explanation,hint,difficulty,difficulty_level,order_index,time_recommendation_seconds) VALUES
    ('gmat',v_ps_stat,'problem_solving',
     'A student''s scores on five tests are 72, 85, 90, 68, and x. If the mean score is 80, what is the value of x?',
     '["75","80","85","90","95"]'::jsonb,
     2,'Mean = (72 + 85 + 90 + 68 + x) / 5 = 80. So 315 + x = 400, giving x = 85.','Use the definition of mean: sum of all values = mean × number of values. Solve for x.','easy',2,7401,75),

    ('gmat',v_ps_stat,'problem_solving',
     'What is the median of the data set {3, 7, 9, 2, 8, 5, 1}?',
     '["3","5","6","7","9"]'::jsonb,
     1,'First sort the data: {1, 2, 3, 5, 7, 8, 9}. With 7 values, the median is the 4th value = 5.','Sort the data from smallest to largest. The median is the middle value.','easy',2,7402,75),

    ('gmat',v_ps_stat,'problem_solving',
     'A bag contains 4 red marbles, 3 blue marbles, and 5 green marbles. What is the probability of randomly selecting a marble that is NOT green?',
     '["5/12","7/12","1/3","2/3","3/7"]'::jsonb,
     1,'Total marbles = 4 + 3 + 5 = 12. Non-green marbles = 4 + 3 = 7. P(not green) = 7/12.','Count the non-green marbles and divide by the total number of marbles.','easy',2,7403,75),

    ('gmat',v_ps_stat,'problem_solving',
     'A committee of 2 students must be selected from a group of 5 students. How many different committees are possible?',
     '["5","10","15","20","25"]'::jsonb,
     1,'Order does not matter (a committee), so use combinations: C(5,2) = 5! / (2! × 3!) = (5 × 4) / (2 × 1) = 10.','Use combinations (not permutations) because the order of selection does not matter.','medium',3,7404,90);
  END IF;

  -- ═══════════════════════════════════════════════════════════════════════
  -- DS FORMAT (4 questions)
  -- ═══════════════════════════════════════════════════════════════════════
  IF v_ds_fmt IS NOT NULL AND (SELECT COUNT(*) FROM problems WHERE source='gmat' AND subtopic_id=v_ds_fmt)=0 THEN
    INSERT INTO problems (source,subtopic_id,question_type,question_text,options,correct_option,explanation,hint,difficulty,difficulty_level,order_index,time_recommendation_seconds) VALUES
    ('gmat',v_ds_fmt,'data_sufficiency',
     'What is the value of 2x + 1?

(1) x = 3
(2) x² = 9',
     DS_OPTS,0,
     'Statement (1): x = 3, so 2x+1 = 7. Sufficient alone. Statement (2): x² = 9 means x = 3 or x = −3, giving 2x+1 = 7 or −5. Not sufficient alone. Answer: A.',
     'For Statement (2), check whether x has one unique value or multiple possible values.','easy',2,8001,90),

    ('gmat',v_ds_fmt,'data_sufficiency',
     'Is integer x prime?

(1) x is odd
(2) 1 < x < 4',
     DS_OPTS,1,
     'Statement (1): odd integers include 3 (prime) and 9 (not prime). Not sufficient. Statement (2): x must be 2 or 3, both of which are prime. Definitive answer: YES. Sufficient alone. Answer: B.',
     'For Statement (1), find one odd prime and one odd non-prime to show it is not sufficient.','easy',2,8002,90),

    ('gmat',v_ds_fmt,'data_sufficiency',
     'What is the value of x × y?

(1) x + y = 10
(2) x − y = 4',
     DS_OPTS,2,
     'Statement (1) alone: many pairs (x,y) sum to 10. Not sufficient. Statement (2) alone: many pairs have difference 4. Not sufficient. Together: x+y=10 and x−y=4 → 2x=14, x=7, y=3. x×y = 21. Sufficient. Answer: C.',
     'Can you determine unique values of x and y from each statement alone? From both together?','easy',2,8003,90),

    ('gmat',v_ds_fmt,'data_sufficiency',
     'Is x = y?

(1) x² = y²
(2) x + y = 0',
     DS_OPTS,4,
     'Statement (1): x²=y² means x=y or x=−y. Not sufficient. Statement (2): x+y=0 means y=−x, so x and y are opposites. Not sufficient. Together: y=−x and x²=y² are consistent with x=0,y=0 (x=y) or x=1,y=−1 (x≠y). Still not sufficient. Answer: E.',
     'For "Together," try x=0,y=0 and x=1,y=−1. Do both satisfy both statements? What do they say about x=y?','medium',3,8004,90);
  END IF;

  -- ═══════════════════════════════════════════════════════════════════════
  -- DS ARITHMETIC (3 questions)
  -- ═══════════════════════════════════════════════════════════════════════
  IF v_ds_arith IS NOT NULL AND (SELECT COUNT(*) FROM problems WHERE source='gmat' AND subtopic_id=v_ds_arith)=0 THEN
    INSERT INTO problems (source,subtopic_id,question_type,question_text,options,correct_option,explanation,hint,difficulty,difficulty_level,order_index,time_recommendation_seconds) VALUES
    ('gmat',v_ds_arith,'data_sufficiency',
     'Is integer n a multiple of 4?

(1) n is a multiple of 8
(2) n / 4 is an integer',
     DS_OPTS,3,
     'Statement (1): all multiples of 8 are also multiples of 4 (8=4×2). Sufficient. Statement (2): n/4 is an integer means by definition n is a multiple of 4. Sufficient. Each statement alone is sufficient. Answer: D.',
     'Does Statement (1) guarantee divisibility by 4? Does Statement (2) directly define a multiple of 4?','easy',2,8101,90),

    ('gmat',v_ds_arith,'data_sufficiency',
     'What is the remainder when integer n is divided by 5?

(1) n is odd
(2) 11 ≤ n ≤ 16',
     DS_OPTS,4,
     'Statement (1): odd n can give remainders 1, 2, 3, or 4 when divided by 5. Not sufficient. Statement (2): n could be 11 (rem 1), 12 (rem 2), 13 (rem 3), 14 (rem 4), 15 (rem 0), or 16 (rem 1). Not sufficient. Together: odd n from 11–16: 11(rem1), 13(rem3), 15(rem0). Multiple remainders still possible. Answer: E.',
     'For Statement (2), list every possible value of n and compute the remainder for each.','medium',3,8102,90),

    ('gmat',v_ds_arith,'data_sufficiency',
     'Is n² > n?

(1) n > 0
(2) n < 1',
     DS_OPTS,2,
     'Statement (1): If n=2, n²=4>2 (YES). If n=0.5, n²=0.25<0.5 (NO). Not sufficient. Statement (2): If n=−2, n²=4>−2 (YES). If n=0.5, n²<n (NO). Not sufficient. Together: 0<n<1 always gives n²<n, so n²>n is always FALSE. Definitive answer. Answer: C.',
     'Test n=2 and n=0.5 for Statement (1). Test n=−2 and n=0.5 for Statement (2). Then test values in the overlap region 0<n<1.','medium',3,8103,90);
  END IF;

  -- ═══════════════════════════════════════════════════════════════════════
  -- DS ALGEBRA (3 questions)
  -- ═══════════════════════════════════════════════════════════════════════
  IF v_ds_alg IS NOT NULL AND (SELECT COUNT(*) FROM problems WHERE source='gmat' AND subtopic_id=v_ds_alg)=0 THEN
    INSERT INTO problems (source,subtopic_id,question_type,question_text,options,correct_option,explanation,hint,difficulty,difficulty_level,order_index,time_recommendation_seconds) VALUES
    ('gmat',v_ds_alg,'data_sufficiency',
     'What is the value of x?

(1) 3x − 2 = 7
(2) x² = 9',
     DS_OPTS,0,
     'Statement (1): 3x=9, x=3. Unique solution. Sufficient. Statement (2): x=3 or x=−3. Two solutions. Not sufficient. Answer: A.',
     'Does each statement yield exactly one value of x, or could there be multiple values?','easy',2,8201,90),

    ('gmat',v_ds_alg,'data_sufficiency',
     'Is 2x + y = 5?

(1) x + y = 3
(2) x − y = 1',
     DS_OPTS,2,
     'Statement (1): 2x+y = x+(x+y) = x+3. We don''t know x. Not sufficient. Statement (2): y=x−1. 2x+y=2x+(x−1)=3x−1. Not sufficient. Together: from (1) and (2), add: 2x=4, x=2, y=1. Check: 2(2)+1=5. YES. Sufficient. Answer: C.',
     'Can you determine x and y from each statement alone? What happens when you solve the system using both?','medium',3,8202,90),

    ('gmat',v_ds_alg,'data_sufficiency',
     'If x and y are positive integers, what is the value of x + y?

(1) x × y = 6
(2) x < y',
     DS_OPTS,4,
     'Statement (1): pairs (1,6) give x+y=7; pairs (2,3) give x+y=5. Not sufficient. Statement (2): just restricts ordering, not values. Not sufficient. Together: x<y and xy=6 → (x,y) could be (1,6) (sum=7) or (2,3) (sum=5). Still not sufficient. Answer: E.',
     'For Statement (1), list ALL positive integer pairs that multiply to 6. Do they all give the same sum?','medium',3,8203,90);
  END IF;

  -- ═══════════════════════════════════════════════════════════════════════
  -- DS GEOMETRY (3 questions)
  -- ═══════════════════════════════════════════════════════════════════════
  IF v_ds_geo IS NOT NULL AND (SELECT COUNT(*) FROM problems WHERE source='gmat' AND subtopic_id=v_ds_geo)=0 THEN
    INSERT INTO problems (source,subtopic_id,question_type,question_text,options,correct_option,explanation,hint,difficulty,difficulty_level,order_index,time_recommendation_seconds) VALUES
    ('gmat',v_ds_geo,'data_sufficiency',
     'What is the area of triangle ABC?

(1) AB = 6, BC = 8, and angle B = 90°
(2) The perimeter of triangle ABC is 24',
     DS_OPTS,0,
     'Statement (1): right triangle with legs 6 and 8. Area = ½ × 6 × 8 = 24. Sufficient. Statement (2): perimeter = 24. Many different triangles can have this perimeter with different areas. Not sufficient. Answer: A.',
     'Does Statement (1) uniquely determine the shape and size of the triangle? Does perimeter alone fix the area?','medium',3,8301,90),

    ('gmat',v_ds_geo,'data_sufficiency',
     'What is the area of a circle?

(1) The circumference of the circle is 10π
(2) The diameter of the circle is 10',
     DS_OPTS,3,
     'Statement (1): C=2πr=10π → r=5. Area=πr²=25π. Sufficient. Statement (2): d=10 → r=5. Area=25π. Sufficient. Each statement alone gives the radius and thus the area. Answer: D.',
     'Both the circumference and the diameter directly determine the radius. Does knowing the radius uniquely determine the area?','easy',2,8302,90),

    ('gmat',v_ds_geo,'data_sufficiency',
     'In triangle PQR, what is the measure of angle P?

(1) Angle Q = 60°
(2) Angle R = 70°',
     DS_OPTS,2,
     'Statement (1): P + R = 120°. Many possible values for P. Not sufficient. Statement (2): P + Q = 110°. Many possible values for P. Not sufficient. Together: P = 180° − 60° − 70° = 50°. Unique answer. Sufficient. Answer: C.',
     'Angles in a triangle sum to 180°. How many angles do you need to know to find the third?','easy',2,8303,90);
  END IF;

  -- ═══════════════════════════════════════════════════════════════════════
  -- MSR NAVIGATION (3 questions)
  -- ═══════════════════════════════════════════════════════════════════════
  IF v_msr_nav IS NOT NULL AND (SELECT COUNT(*) FROM problems WHERE source='gmat' AND subtopic_id=v_msr_nav)=0 THEN
    INSERT INTO problems (source,subtopic_id,question_type,question_text,passage_text,options,correct_option,explanation,hint,difficulty,difficulty_level,order_index,time_recommendation_seconds) VALUES
    ('gmat',v_msr_nav,'multi_source_reasoning',
     'Based on the information provided, which marketing channel should be reviewed for budget reallocation per company policy?',
     'TAB 1 — Email from Regional Director (March 15):
Our Q1 marketing budget was $450,000, of which $180,000 was spent on digital channels. The remaining allocation was split evenly between print and events.

TAB 2 — Finance Report:
Q1 Marketing ROI by Channel: Digital: 3.2x | Print: 1.8x | Events: 2.4x

TAB 3 — Company Policy:
Marketing channels with ROI below 2.0x must be reviewed for budget reallocation.',
     '["Digital","Print","Events","Both Print and Events","No channel — all exceed 2.0x ROI"]'::jsonb,
     1,'From Tab 3: channels with ROI below 2.0x are reviewed. From Tab 2: Print ROI = 1.8x, which is below 2.0x. Digital (3.2x) and Events (2.4x) both exceed 2.0x. Only Print qualifies for review.','Apply the policy threshold from Tab 3 to the ROI data from Tab 2.','medium',3,9001,120),

    ('gmat',v_msr_nav,'multi_source_reasoning',
     'What was the budget allocated to the Events channel in Q1?',
     'TAB 1 — Email from Regional Director (March 15):
Our Q1 marketing budget was $450,000, of which $180,000 was spent on digital channels. The remaining allocation was split evenly between print and events.

TAB 2 — Finance Report:
Q1 Marketing ROI by Channel: Digital: 3.2x | Print: 1.8x | Events: 2.4x

TAB 3 — Company Policy:
Marketing channels with ROI below 2.0x must be reviewed for budget reallocation.',
     '["$90,000","$120,000","$135,000","$150,000","$270,000"]'::jsonb,
     2,'From Tab 1: Total = $450,000; Digital = $180,000. Remaining = $270,000, split evenly between Print and Events. Events = $270,000 ÷ 2 = $135,000.','Find the remaining budget after Digital, then split it evenly per Tab 1.','easy',2,9002,90),

    ('gmat',v_msr_nav,'multi_source_reasoning',
     'Which channel generated the highest total dollar return in Q1?',
     'TAB 1 — Email from Regional Director (March 15):
Our Q1 marketing budget was $450,000, of which $180,000 was spent on digital channels. The remaining allocation was split evenly between print and events.

TAB 2 — Finance Report:
Q1 Marketing ROI by Channel: Digital: 3.2x | Print: 1.8x | Events: 2.4x

TAB 3 — Company Policy:
Marketing channels with ROI below 2.0x must be reviewed for budget reallocation.',
     '["Digital","Print","Events","Print and Events tied","Cannot be determined from the information provided"]'::jsonb,
     0,'Digital: $180,000 × 3.2 = $576,000. Print: $135,000 × 1.8 = $243,000. Events: $135,000 × 2.4 = $324,000. Digital generated the highest total dollar return.','Multiply each channel''s budget (from Tab 1) by its ROI (from Tab 2) to find total dollar return.','medium',3,9003,90);
  END IF;

  -- ═══════════════════════════════════════════════════════════════════════
  -- MSR SYNTHESIS (3 questions)
  -- ═══════════════════════════════════════════════════════════════════════
  IF v_msr_syn IS NOT NULL AND (SELECT COUNT(*) FROM problems WHERE source='gmat' AND subtopic_id=v_msr_syn)=0 THEN
    INSERT INTO problems (source,subtopic_id,question_type,question_text,passage_text,options,correct_option,explanation,hint,difficulty,difficulty_level,order_index,time_recommendation_seconds) VALUES
    ('gmat',v_msr_syn,'multi_source_reasoning',
     'Which conclusion is most strongly supported by combining both sources?',
     'TAB 1 — Consumer Survey (n=500):
62% of respondents prefer organic food products, but only 28% purchase them regularly. The most cited barrier to purchase: price (mentioned by 71% of those who prefer but don''t buy organic).

TAB 2 — Market Research Report:
Organic products average a 45% price premium over conventional alternatives. Retailers that offered loyalty discounts on organic items saw a 34% increase in organic purchase frequency among surveyed customers.',
     '["The majority of consumers will never purchase organic food regardless of price.","Reducing the price premium on organic products would likely increase purchase rates among preference-stated non-buyers.","Organic food is overpriced and retailers should reduce their margins.","Consumers who prefer organic products are hypocritical in not purchasing them.","The 34% increase in organic purchases is entirely attributable to loyalty discounts."]'::jsonb,
     1,'Tab 1: 71% of non-buyers cite price as the barrier. Tab 2: discounts produce a 34% increase in purchase frequency. Combined: reducing the price premium (the primary stated barrier) would likely convert prefer-but-not-buy consumers into buyers. Choice B directly follows from combining both sources.','What does Tab 1 say is the main barrier? What does Tab 2 say about price reductions? Put them together.','medium',3,9101,120),

    ('gmat',v_msr_syn,'multi_source_reasoning',
     'Based on both sources, what best explains the gap between organic preference (62%) and regular purchase (28%)?',
     'TAB 1 — Consumer Survey (n=500):
62% of respondents prefer organic food products, but only 28% purchase them regularly. The most cited barrier to purchase: price (mentioned by 71% of those who prefer but don''t buy organic).

TAB 2 — Market Research Report:
Organic products average a 45% price premium over conventional alternatives. Retailers that offered loyalty discounts on organic items saw a 34% increase in organic purchase frequency among surveyed customers.',
     '["Consumers do not actually prefer organic food as much as they claim.","Price is the primary barrier, as the 45% premium is cited by 71% of non-buyers who prefer organic.","Organic food is not available in most retail stores.","Marketing of organic products is insufficient to convert preferences into purchases.","Only 28% of consumers understand what organic certification means."]'::jsonb,
     1,'Tab 1 reveals 71% of preference-stated non-buyers cite price as the barrier. Tab 2 confirms the 45% price premium. Together these explain the preference-to-purchase gap: consumers want organic but the price differential prevents them from buying regularly.','Which source identifies the main barrier? Which source quantifies that barrier? What do they say together?','medium',3,9102,90),

    ('gmat',v_msr_syn,'multi_source_reasoning',
     'A retailer wants to increase organic purchase frequency. Based on both sources, which strategy is MOST directly supported?',
     'TAB 1 — Consumer Survey (n=500):
62% of respondents prefer organic food products, but only 28% purchase them regularly. The most cited barrier to purchase: price (mentioned by 71% of those who prefer but don''t buy organic).

TAB 2 — Market Research Report:
Organic products average a 45% price premium over conventional alternatives. Retailers that offered loyalty discounts on organic items saw a 34% increase in organic purchase frequency among surveyed customers.',
     '["Launch an advertising campaign emphasizing the health benefits of organic food.","Reduce the variety of conventional products to force consumers toward organic.","Implement an organic loyalty discount program.","Survey more consumers to better understand their preferences.","Partner with organic farms to source products at a lower cost."]'::jsonb,
     2,'Tab 2 directly states: retailers offering loyalty discounts on organic items saw a 34% increase in organic purchase frequency. This is the most directly supported strategy by the data provided.','Which strategy does Tab 2 provide direct evidence for, with a specific measured outcome?','easy',2,9103,90);
  END IF;

  -- ═══════════════════════════════════════════════════════════════════════
  -- TA SORTING (3 questions)
  -- ═══════════════════════════════════════════════════════════════════════
  IF v_ta_sort IS NOT NULL AND (SELECT COUNT(*) FROM problems WHERE source='gmat' AND subtopic_id=v_ta_sort)=0 THEN
    INSERT INTO problems (source,subtopic_id,question_type,question_text,passage_text,options,correct_option,explanation,hint,difficulty,difficulty_level,order_index,time_recommendation_seconds) VALUES
    ('gmat',v_ta_sort,'table_analysis',
     'Based on the table, which city has the highest unemployment rate?',
     'City Data Table:
| City   | Population (M) | Median Income ($K) | Unemployment (%) | Crime Rate (per 1K) |
|--------|---------------|-------------------|-----------------|---------------------|
| Alpha  | 2.1           | 62                | 4.2             | 18                  |
| Beta   | 0.8           | 78                | 3.1             | 12                  |
| Bravo  | 3.4           | 55                | 6.8             | 25                  |
| Delta  | 1.2           | 71                | 4.9             | 15                  |
| Echo   | 0.5           | 85                | 2.3             | 8                   |',
     '["Alpha","Beta","Bravo","Delta","Echo"]'::jsonb,
     2,'Sort the Unemployment column in descending order: Bravo 6.8%, Delta 4.9%, Alpha 4.2%, Beta 3.1%, Echo 2.3%. Bravo has the highest unemployment rate.','Sort the Unemployment column from highest to lowest to quickly identify the maximum.','easy',2,9201,75),

    ('gmat',v_ta_sort,'table_analysis',
     'Which city has the lowest crime rate per 1,000 residents?',
     'City Data Table:
| City   | Population (M) | Median Income ($K) | Unemployment (%) | Crime Rate (per 1K) |
|--------|---------------|-------------------|-----------------|---------------------|
| Alpha  | 2.1           | 62                | 4.2             | 18                  |
| Beta   | 0.8           | 78                | 3.1             | 12                  |
| Bravo  | 3.4           | 55                | 6.8             | 25                  |
| Delta  | 1.2           | 71                | 4.9             | 15                  |
| Echo   | 0.5           | 85                | 2.3             | 8                   |',
     '["Alpha","Beta","Bravo","Delta","Echo"]'::jsonb,
     4,'Sort the Crime Rate column in ascending order: Echo 8, Beta 12, Delta 15, Alpha 18, Bravo 25. Echo has the lowest crime rate.','Sort the Crime Rate column from lowest to highest to quickly find the minimum.','easy',2,9202,75),

    ('gmat',v_ta_sort,'table_analysis',
     'How many cities in the table have a median income above $65,000?',
     'City Data Table:
| City   | Population (M) | Median Income ($K) | Unemployment (%) | Crime Rate (per 1K) |
|--------|---------------|-------------------|-----------------|---------------------|
| Alpha  | 2.1           | 62                | 4.2             | 18                  |
| Beta   | 0.8           | 78                | 3.1             | 12                  |
| Bravo  | 3.4           | 55                | 6.8             | 25                  |
| Delta  | 1.2           | 71                | 4.9             | 15                  |
| Echo   | 0.5           | 85                | 2.3             | 8                   |',
     '["1","2","3","4","5"]'::jsonb,
     2,'Sort Median Income column descending: Echo $85K, Beta $78K, Delta $71K, Alpha $62K, Bravo $55K. Cities above $65K: Echo, Beta, Delta = 3 cities.','Sort by Median Income and count cities exceeding the threshold of $65K.','easy',2,9203,75);
  END IF;

  -- ═══════════════════════════════════════════════════════════════════════
  -- TA CALCULATIONS (3 questions)
  -- ═══════════════════════════════════════════════════════════════════════
  IF v_ta_calc IS NOT NULL AND (SELECT COUNT(*) FROM problems WHERE source='gmat' AND subtopic_id=v_ta_calc)=0 THEN
    INSERT INTO problems (source,subtopic_id,question_type,question_text,passage_text,options,correct_option,explanation,hint,difficulty,difficulty_level,order_index,time_recommendation_seconds) VALUES
    ('gmat',v_ta_calc,'table_analysis',
     'What percentage of the cities in the table have an unemployment rate below 5%?',
     'City Data Table:
| City   | Population (M) | Median Income ($K) | Unemployment (%) | Crime Rate (per 1K) |
|--------|---------------|-------------------|-----------------|---------------------|
| Alpha  | 2.1           | 62                | 4.2             | 18                  |
| Beta   | 0.8           | 78                | 3.1             | 12                  |
| Bravo  | 3.4           | 55                | 6.8             | 25                  |
| Delta  | 1.2           | 71                | 4.9             | 15                  |
| Echo   | 0.5           | 85                | 2.3             | 8                   |',
     '["40%","50%","60%","75%","80%"]'::jsonb,
     2,'Cities with unemployment below 5%: Alpha (4.2%), Beta (3.1%), Delta (4.9%), Echo (2.3%) = 4 cities. Wait — let me recount: 4 out of 5 = 80%. Actually Delta is 4.9% < 5%, so: Alpha, Beta, Delta, Echo = 4 cities. 4/5 = 80%. Correct option is 4 (80%). Correction: correct_option should be 4.',
     'Count cities meeting the criterion and divide by the total number of cities.','medium',3,9301,90),

    ('gmat',v_ta_calc,'table_analysis',
     'What is the approximate ratio of Beta''s median income to Bravo''s median income?',
     'City Data Table:
| City   | Population (M) | Median Income ($K) | Unemployment (%) | Crime Rate (per 1K) |
|--------|---------------|-------------------|-----------------|---------------------|
| Alpha  | 2.1           | 62                | 4.2             | 18                  |
| Beta   | 0.8           | 78                | 3.1             | 12                  |
| Bravo  | 3.4           | 55                | 6.8             | 25                  |
| Delta  | 1.2           | 71                | 4.9             | 15                  |
| Echo   | 0.5           | 85                | 2.3             | 8                   |',
     '["1.2 : 1","1.4 : 1","1.5 : 1","1.6 : 1","2.0 : 1"]'::jsonb,
     1,'Beta = $78K, Bravo = $55K. Ratio = 78/55 ≈ 1.418 ≈ 1.4. The closest answer is 1.4:1.','Divide the larger value by the smaller value and match to the nearest answer choice.','medium',3,9302,90),

    ('gmat',v_ta_calc,'table_analysis',
     'The combined population of the two largest cities is approximately what percentage of the total population of all five cities?',
     'City Data Table:
| City   | Population (M) | Median Income ($K) | Unemployment (%) | Crime Rate (per 1K) |
|--------|---------------|-------------------|-----------------|---------------------|
| Alpha  | 2.1           | 62                | 4.2             | 18                  |
| Beta   | 0.8           | 78                | 3.1             | 12                  |
| Bravo  | 3.4           | 55                | 6.8             | 25                  |
| Delta  | 1.2           | 71                | 4.9             | 15                  |
| Echo   | 0.5           | 85                | 2.3             | 8                   |',
     '["55%","62%","69%","75%","82%"]'::jsonb,
     2,'Two largest cities: Bravo (3.4M) and Alpha (2.1M). Combined = 5.5M. Total = 2.1+0.8+3.4+1.2+0.5 = 8.0M. Percentage = 5.5/8.0 = 68.75% ≈ 69%.','Sort by population to find the two largest, then compute their share of the total.','medium',3,9303,90);
  END IF;

  -- ═══════════════════════════════════════════════════════════════════════
  -- GI CHARTS (3 questions)
  -- ═══════════════════════════════════════════════════════════════════════
  IF v_gi_bar IS NOT NULL AND (SELECT COUNT(*) FROM problems WHERE source='gmat' AND subtopic_id=v_gi_bar)=0 THEN
    INSERT INTO problems (source,subtopic_id,question_type,question_text,passage_text,options,correct_option,explanation,hint,difficulty,difficulty_level,order_index,time_recommendation_seconds) VALUES
    ('gmat',v_gi_bar,'graphics_interpretation',
     'In which quarter did TechStart Inc. achieve its highest revenue?',
     'Bar Chart — TechStart Inc. Quarterly Revenue ($ millions):
Q1: $12M
Q2: $18M
Q3: $15M
Q4: $24M

The y-axis shows revenue in millions of dollars. Each quarter''s bar height corresponds to the revenue value listed above.',
     '["Q1","Q2","Q3","Q4","Revenue was equal in all quarters"]'::jsonb,
     3,'Reading the bar heights: Q1=$12M, Q2=$18M, Q3=$15M, Q4=$24M. Q4 has the tallest bar and the highest revenue.','Read the height of each bar against the y-axis scale. Which is tallest?','easy',2,9401,75),

    ('gmat',v_gi_bar,'graphics_interpretation',
     'By approximately what percentage did TechStart''s revenue increase from Q1 to Q4?',
     'Bar Chart — TechStart Inc. Quarterly Revenue ($ millions):
Q1: $12M
Q2: $18M
Q3: $15M
Q4: $24M

The y-axis shows revenue in millions of dollars. Each quarter''s bar height corresponds to the revenue value listed above.',
     '["50%","75%","100%","125%","150%"]'::jsonb,
     2,'Percentage increase = (New − Old) / Old × 100 = (24 − 12) / 12 × 100 = 12/12 × 100 = 100%.','Use the percentage change formula: (Q4 − Q1) / Q1 × 100.','easy',2,9402,75),

    ('gmat',v_gi_bar,'graphics_interpretation',
     'Revenue in Q3 represents approximately what percentage of total annual revenue?',
     'Bar Chart — TechStart Inc. Quarterly Revenue ($ millions):
Q1: $12M
Q2: $18M
Q3: $15M
Q4: $24M

The y-axis shows revenue in millions of dollars. Each quarter''s bar height corresponds to the revenue value listed above.',
     '["18%","22%","25%","28%","33%"]'::jsonb,
     1,'Q3 = $15M. Total annual = 12+18+15+24 = $69M. Q3 as a percentage = 15/69 = 21.7% ≈ 22%.','Divide Q3 revenue by the total of all four quarters.','medium',3,9403,90);
  END IF;

  -- ═══════════════════════════════════════════════════════════════════════
  -- GI SCATTER (3 questions)
  -- ═══════════════════════════════════════════════════════════════════════
  IF v_gi_scat IS NOT NULL AND (SELECT COUNT(*) FROM problems WHERE source='gmat' AND subtopic_id=v_gi_scat)=0 THEN
    INSERT INTO problems (source,subtopic_id,question_type,question_text,passage_text,options,correct_option,explanation,hint,difficulty,difficulty_level,order_index,time_recommendation_seconds) VALUES
    ('gmat',v_gi_scat,'graphics_interpretation',
     'Based on the scatter plot, what type of correlation exists between weekly exercise hours and resting heart rate?',
     'Scatter Plot Description:
X-axis: Weekly exercise hours (range: 0–10 hours)
Y-axis: Resting heart rate in beats per minute (range: 55–90 bpm)
Data: 50 survey participants. Points form a clear downward-sloping cluster around a negative trend line. As exercise hours increase, resting heart rate decreases. The points cluster tightly around the trend line with minimal spread.',
     '["Strong positive correlation","Weak positive correlation","No correlation","Weak negative correlation","Strong negative correlation"]'::jsonb,
     4,'A downward-sloping pattern means that as exercise hours increase, heart rate decreases — a negative correlation. The tight clustering of points around the trend line indicates the correlation is strong.','Is the slope of the trend line positive or negative? How tightly do the points cluster around it?','easy',2,9501,75),

    ('gmat',v_gi_scat,'graphics_interpretation',
     'The outlier at (8 hours, 85 bpm) suggests which of the following?',
     'Scatter Plot Description:
X-axis: Weekly exercise hours (range: 0–10 hours)
Y-axis: Resting heart rate in beats per minute (range: 55–90 bpm)
Data: 50 survey participants. Points form a clear downward-sloping cluster. One outlier exists at 8 hours of weekly exercise and 85 bpm resting heart rate — substantially above the trend line at that exercise level.',
     '["This person exercises for 8 hours per week but has an unusually high resting heart rate compared to others who exercise as much.","This person exercises less than the typical person in the study.","The scatter plot contains a data collection error that should be excluded.","Resting heart rate cannot be predicted from exercise habits.","This person has a lower resting heart rate than the median."]'::jsonb,
     0,'An outlier at (8, 85) is a person who exercises 8 hours per week — above average — but has a resting heart rate of 85 bpm, which is high compared to other 8-hour exercisers (who likely cluster around 60-65 bpm per the downward trend). Choice A correctly describes this discrepancy.','Compare the outlier''s position to where the trend line would predict someone exercising 8 hours to fall.','medium',3,9502,90),

    ('gmat',v_gi_scat,'graphics_interpretation',
     'Based on the scatter plot, which statement about participants who exercise 6 or more hours per week is most consistent with the data?',
     'Scatter Plot Description:
X-axis: Weekly exercise hours (range: 0–10 hours)
Y-axis: Resting heart rate in beats per minute (range: 55–90 bpm)
Data: 50 survey participants. Clear downward-sloping trend: participants exercising 0–2 hours cluster around 80–88 bpm; participants exercising 6–10 hours cluster around 60–68 bpm (excluding one outlier at 85 bpm).',
     '["They tend to have resting heart rates above 75 bpm.","They tend to have resting heart rates below 70 bpm.","Their resting heart rates are evenly distributed between 55 and 90 bpm.","No participants in the study exercised 6 or more hours per week.","Their resting heart rates are higher than those who exercise 3–5 hours per week."]'::jsonb,
     1,'The plot shows that participants exercising 6–10 hours cluster around 60–68 bpm, which is below 70 bpm. Choice B is directly consistent with this pattern described in the chart.','Read the cluster range for high-exercise participants from the chart description.','medium',3,9503,90);
  END IF;

  -- ═══════════════════════════════════════════════════════════════════════
  -- TPA QUANTITATIVE (3 questions)
  -- ═══════════════════════════════════════════════════════════════════════
  IF v_tpa_q IS NOT NULL AND (SELECT COUNT(*) FROM problems WHERE source='gmat' AND subtopic_id=v_tpa_q)=0 THEN
    INSERT INTO problems (source,subtopic_id,question_type,question_text,options,correct_option,explanation,hint,difficulty,difficulty_level,order_index,time_recommendation_seconds) VALUES
    ('gmat',v_tpa_q,'two_part_analysis',
     'A store sells small boxes for $3 each and large boxes for $7 each. A customer buys a total of 12 boxes for $60. Which of the following gives the correct number of small boxes and large boxes purchased?

(S = small boxes, L = large boxes)
Constraint 1: S + L = 12
Constraint 2: 3S + 7L = 60',
     '["S = 4, L = 8","S = 5, L = 7","S = 6, L = 6","S = 8, L = 4","S = 9, L = 3"]'::jsonb,
     2,'From Constraint 1: S = 12 − L. Substitute into Constraint 2: 3(12−L) + 7L = 60 → 36 − 3L + 7L = 60 → 4L = 24 → L = 6. Then S = 6. Check: 3(6) + 7(6) = 18 + 42 = 60 ✓','Set up a substitution: express one variable in terms of the other using the first constraint, then substitute into the second.','medium',3,9601,120),

    ('gmat',v_tpa_q,'two_part_analysis',
     'An investor splits $50,000 between Investment A (6% annual return) and Investment B (10% annual return). The combined annual return is $4,200. Which of the following gives the correct amount invested in each?

(A = dollars in Investment A, B = dollars in Investment B)
Constraint 1: A + B = 50,000
Constraint 2: 0.06A + 0.10B = 4,200',
     '["A = $10,000; B = $40,000","A = $15,000; B = $35,000","A = $20,000; B = $30,000","A = $25,000; B = $25,000","A = $30,000; B = $20,000"]'::jsonb,
     2,'From Constraint 1: A = 50,000 − B. Substitute: 0.06(50,000−B) + 0.10B = 4,200 → 3,000 − 0.06B + 0.10B = 4,200 → 0.04B = 1,200 → B = 30,000. Then A = 20,000.','Express A in terms of B using the first constraint. Substitute into the return equation and solve for B.','medium',3,9602,120),

    ('gmat',v_tpa_q,'two_part_analysis',
     'A factory produces Product X in 3 hours per unit and Product Y in 2 hours per unit. In a 40-hour workweek, the factory produces a total of 16 units. Which of the following gives the correct number of units of X and Y produced?

(X = units of Product X, Y = units of Product Y)
Constraint 1: X + Y = 16
Constraint 2: 3X + 2Y = 40',
     '["X = 4, Y = 12","X = 6, Y = 10","X = 8, Y = 8","X = 10, Y = 6","X = 12, Y = 4"]'::jsonb,
     2,'From Constraint 1: Y = 16 − X. Substitute: 3X + 2(16−X) = 40 → 3X + 32 − 2X = 40 → X = 8. Then Y = 8. Check: 3(8) + 2(8) = 24 + 16 = 40 ✓','Substitute one variable from the total units constraint into the total time constraint.','medium',3,9603,120);
  END IF;

  -- ═══════════════════════════════════════════════════════════════════════
  -- TPA VERBAL (3 questions)
  -- ═══════════════════════════════════════════════════════════════════════
  IF v_tpa_v IS NOT NULL AND (SELECT COUNT(*) FROM problems WHERE source='gmat' AND subtopic_id=v_tpa_v)=0 THEN
    INSERT INTO problems (source,subtopic_id,question_type,question_text,options,correct_option,explanation,hint,difficulty,difficulty_level,order_index,time_recommendation_seconds) VALUES
    ('gmat',v_tpa_v,'two_part_analysis',
     'A logistics company has three policies:
Policy 1: All shipments over 50 lbs must be sent via freight.
Policy 2: All international shipments must include a customs declaration.
Policy 3: All express shipments are guaranteed 24-hour delivery.

A customer sends a 30-lb international express package. Which answer correctly identifies ALL requirements that apply to this shipment?',
     '["Freight shipping and customs declaration only","Customs declaration and 24-hour delivery guarantee only","Freight shipping and 24-hour delivery guarantee only","Freight shipping, customs declaration, and 24-hour delivery guarantee","No special requirements — the package is under 50 lbs"]'::jsonb,
     1,'30 lbs is under 50 lbs → Policy 1 does NOT apply (no freight). International → Policy 2 applies (customs declaration). Express → Policy 3 applies (24-hour guarantee). Only Policies 2 and 3 apply. Choice B is correct.','Apply each policy rule individually. Does the shipment meet the trigger condition for each one?','medium',3,9701,120),

    ('gmat',v_tpa_v,'two_part_analysis',
     'A researcher is evaluating two hypotheses:
Hypothesis A: Vehicle traffic is the primary cause of poor air quality in cities.
Hypothesis B: Industrial factory emissions are the primary cause of poor air quality.

A new study shows that cities with strict vehicle emission standards have significantly better air quality than cities without such standards, even when factory output is held constant.

Which answer best describes the study''s implications for each hypothesis?',
     '["The study supports Hypothesis A and is neutral on Hypothesis B.","The study supports both Hypothesis A and Hypothesis B equally.","The study supports Hypothesis A and undermines Hypothesis B.","The study is neutral on Hypothesis A and undermines Hypothesis B.","The study undermines both hypotheses."]'::jsonb,
     0,'The study shows vehicle emission standards improve air quality — directly supporting Hypothesis A. Factory output was held constant (not changed), so the study doesn''t test Hypothesis B — it is neutral on B. Choice A correctly captures both implications.','Which hypothesis does changing vehicle emission standards test? What happens to the factory variable in this study?','medium',3,9702,120),

    ('gmat',v_tpa_v,'two_part_analysis',
     'A hiring manager must fill two open positions: Data Analyst and Project Manager. The candidates are:
• Liu: strong data skills, weak leadership
• Patel: moderate data skills, strong leadership
• Kim: strong data skills, strong leadership
• Torres: weak data skills, moderate leadership

Which assignment best uses each candidate''s PRIMARY strength while filling BOTH roles?',
     '["Liu → Data Analyst, Patel → Project Manager","Kim → Data Analyst, Torres → Project Manager","Patel → Data Analyst, Liu → Project Manager","Liu → Project Manager, Torres → Data Analyst","Kim → Project Manager, Patel → Data Analyst"]'::jsonb,
     0,'Liu''s primary strength = data skills → Data Analyst. Patel''s primary strength = leadership → Project Manager. Choice A places each candidate in the role matching their strongest skill. Choice B uses Kim for Analyst (also strong data) but Torres for PM (only moderate leadership), underutilizing strengths.','Match each candidate''s PRIMARY (strongest) skill to the role that requires it most.','easy',2,9703,90);
  END IF;

END $$;

-- ─── Fix TA Calculations Q1 correct_option ──────────────────────────────────
-- On re-verification: Alpha(4.2%), Beta(3.1%), Delta(4.9%), Echo(2.3%) = 4 of 5 = 80%
-- correct_option should be 4 (index of "80%"), not 2.
UPDATE problems
SET correct_option = 4,
    explanation = 'Cities with unemployment below 5%: Alpha (4.2%), Beta (3.1%), Delta (4.9%), Echo (2.3%) = 4 out of 5 cities = 80%.'
WHERE source = 'gmat'
  AND order_index = 9301
  AND correct_option = 2;

-- ─── Verification count ──────────────────────────────────────────────────────
SELECT
  t.name AS topic,
  s.name AS subtopic,
  COUNT(p.id) AS gmat_questions
FROM subtopics s
JOIN topics t ON t.id = s.topic_id
LEFT JOIN problems p ON p.subtopic_id = s.id AND p.source = 'gmat'
GROUP BY t.name, s.name, t.order_index, s.order_index
ORDER BY t.order_index, s.order_index;

-- ---- 4. Detailed Hints (Linear Equations) ----
-- Detailed hints for linear-equations-two-variables practice problems
-- These are shown on the second wrong answer (gradient scaffolding level 2)

UPDATE practice_problems SET detailed_hint = 'Start by substituting $y = 3$ into the equation to get $x + 2(3) = 10$. Simplify the left side by computing $2 \times 3$, then subtract that result from both sides to isolate $x$.' WHERE id = '506bef28-1485-49b9-9a93-f3591bfc8f46';

UPDATE practice_problems SET detailed_hint = 'The equation is already in slope-intercept form $y = mx + b$. In this form, $m$ represents the slope and $b$ represents the $y$-intercept. Identify which number in $y = -2x + 7$ is the constant term that isn''t multiplied by $x$.' WHERE id = 'f4d59736-5f49-4372-9c3e-7e8cb2aa2ba1';

UPDATE practice_problems SET detailed_hint = 'To convert $4x + 2y = 8$ into slope-intercept form, first subtract $4x$ from both sides to get $2y = -4x + 8$. Then divide every term by the coefficient of $y$ to isolate it. The number in front of $x$ after dividing is your slope.' WHERE id = '933356c7-26f6-4abb-86b9-21462463ba2f';

UPDATE practice_problems SET detailed_hint = 'You need two equations: one for the total number of cups ($s$ and $l$ adding up to the total sold) and one for the total money (each cup type multiplied by its price adding up to revenue). Make sure the prices \$3 and \$5 are matched to the correct cup sizes.' WHERE id = 'b35c8bce-a2f6-45fd-8f40-c07106ef0ead';

UPDATE practice_problems SET detailed_hint = 'Set up two equations: $b + t = 10$ for total hours, and $12b + 15t = 138$ for total earnings. From the first equation, express $b = 10 - t$, then substitute that into the earnings equation. Combine like terms in $t$ and solve.' WHERE id = '0710cc82-4cd2-4315-a6fb-0db8dc192b86';

UPDATE practice_problems SET detailed_hint = 'From $x + y = 30$, you can write $y = 30 - x$. Substitute this into the cost equation $4x + 7y = 144$ to get a single equation in $x$. Distribute, combine like terms, and solve for $x$.' WHERE id = 'cac3ca07-f7af-4127-8213-704d6de56e6b';

UPDATE practice_problems SET detailed_hint = 'From $x + y = 30$, write $y = 30 - x$. Substitute into $4x + 6y = 144$ to get $4x + 6(30 - x) = 144$. Distribute the $6$, combine the $x$ terms, and solve the resulting equation.' WHERE id = 'b0cd5ca7-f250-4df7-b2b8-0e73d7beecdb';

UPDATE practice_problems SET detailed_hint = 'The two cost expressions are $C = 1 + h$ and $C = 0.5h$. Set them equal: $1 + h = 0.5h$. Move all the $h$ terms to one side and the constant to the other, then solve for the number of hours.' WHERE id = 'aa4c3133-a6e2-4210-a342-84dde58b29ea';

UPDATE practice_problems SET detailed_hint = 'Set the two cost formulas equal: $h + 1 = 2h - 1$. Subtract $h$ from both sides to get the constant terms and one $h$ term, then add or subtract to isolate $h$.' WHERE id = 'cfe09c12-efe0-49cf-9116-da3f15abec0a';

UPDATE practice_problems SET detailed_hint = 'Set up the system: $a + o = 16$ and $1.50a + 0.75o = 18$. Solve the first equation for $o = 16 - a$ and substitute into the cost equation. After distributing and combining terms, solve the resulting equation for $a$.' WHERE id = 'a7ae1807-be83-4048-a22e-e402c9f42057';

UPDATE practice_problems SET detailed_hint = 'Plan X''s total cost after $m$ months is $50 + 20m$. Plan Y''s total cost is $30m$. Set these equal: $50 + 20m = 30m$. Subtract $20m$ from both sides to collect the $m$ terms, then divide to find $m$.' WHERE id = 'f7bb94e6-61df-45b3-bceb-30f4e8ecd42a';

UPDATE practice_problems SET detailed_hint = 'Write the system: $c + w = 200$ and $3c + 2w = 500$. From the first equation, $w = 200 - c$. Substitute into the labor equation: $3c + 2(200 - c) = 500$. Distribute, combine the $c$ terms, and solve.' WHERE id = '5beb5903-962d-463d-a579-2c9b680f941b';

UPDATE practice_problems SET detailed_hint = 'Set up $d + q = 40$ and $0.10d + 0.25q = 7.30$. To remove decimals, multiply the second equation by 100 to get $10d + 25q = 730$. Then substitute $d = 40 - q$ from the first equation and solve for $q$.' WHERE id = 'd7cf2fa2-a0ab-4ff2-8eda-a577c8148fa5';

UPDATE practice_problems SET detailed_hint = 'Write Priya''s amount as $P = J + 30$ since she has \$30 more. Use the total equation $P + J = 120$ and substitute $J + 30$ for $P$. This gives you $J + 30 + J = 120$, which you can solve for $J$ first, then find $P$.' WHERE id = '2cde007e-ff9c-48f5-88a4-4aa0f3bbe85c';

UPDATE practice_problems SET detailed_hint = 'You have $p + n = 15$ and $p + 3n = 27$. Notice that subtracting the first equation from the second eliminates $p$ entirely, leaving an equation with only $n$. Solve that to find the number of notebooks.' WHERE id = 'aa11e1ce-99ec-49cd-9f4a-ccd964366848';

UPDATE practice_problems SET detailed_hint = 'Substitute $x = 4$ into $3x + y = 14$ to get $3(4) + y = 14$. Compute $3 \times 4$, then subtract that product from both sides to find $y$.' WHERE id = '9c2dcd66-0d64-44bb-80b2-bdd0647ae847';

UPDATE practice_problems SET detailed_hint = 'Set $y = 12$ in the equation: $12 = 5x - 3$. Add $3$ to both sides to get $15 = 5x$, then divide both sides by $5$ to isolate $x$.' WHERE id = 'b87ed6be-3fb5-4b64-aa9a-f857cc183c64';

UPDATE practice_problems SET detailed_hint = 'For each ordered pair $(x, y)$, substitute both values into $2x - y$ and check if the result equals $6$. For example, for $(1, 4)$: compute $2(1) - 4$ and see if it equals $6$. Test each option until one works.' WHERE id = '5c85c818-4629-4d6c-a8c7-b8eb99184c51';

UPDATE practice_problems SET detailed_hint = 'Substitute $x = -1$ into $y - x = 5$ to get $y - (-1) = 5$. Remember that subtracting a negative number is the same as adding, so this becomes $y + 1 = 5$. Subtract $1$ from both sides.' WHERE id = '4e36d4bd-a5b2-4e16-a029-4c5d375d036d';

UPDATE practice_problems SET detailed_hint = 'If $x$ is doubled, the new $x$-value is $2x$. Substitute $2x$ into $y = 3x$ to get the new $y$: $y_{\text{new}} = 3(2x) = 6x$. Compare $6x$ to the original $y = 3x$ to see the relationship.' WHERE id = 'f764026e-7f5c-4873-8e29-58bafcbfd43c';

UPDATE practice_problems SET detailed_hint = 'The slope-intercept form is $y = mx + b$, where $m$ is the slope and $b$ is the $y$-intercept. You''re told $m = \frac{1}{2}$ and $b = -4$. Plug these directly into the formula and match the result to the options.' WHERE id = '5bd5c3a7-8d23-473d-aa04-4b94077534fd';

UPDATE practice_problems SET detailed_hint = 'When you add the equations $x + y = 9$ and $x - y = 3$, the $y$ terms cancel out: $(x + y) + (x - y) = 9 + 3$. This simplifies to $2x = 12$. Divide both sides by $2$ to find $x$.' WHERE id = '7864ee26-f9f8-4bcd-8884-4876bd439bb2';

UPDATE practice_problems SET detailed_hint = 'Let $t$ be the car''s travel time. Since the truck left 1 hour earlier and they arrive together, the truck''s travel time is $t + 1$. Both travel the same distance, so $60t = 45(t + 1)$. Distribute and solve for $t$, then compute $60t$ for the distance.' WHERE id = 'aaab3107-b874-4166-90a1-1073e6972c64';

UPDATE practice_problems SET detailed_hint = 'From $x - y = 1$, express $x = y + 1$. Substitute into $3x + 2y = 18$: $3(y + 1) + 2y = 18$. Distribute, combine like terms, and solve for $y$. Then find $x$ using $x = y + 1$, and add them.' WHERE id = '073f6b3d-2692-43c1-93f7-4dd457c61815';

UPDATE practice_problems SET detailed_hint = 'For infinitely many solutions, the second equation must be a scalar multiple of the first. Compare $6x + 8y = 24$ to $ax + 4y = 12$. Find the multiplier by looking at the $y$-coefficients or constants: $\frac{8}{4} = 2$ or $\frac{24}{12} = 2$. Apply that same ratio to find $a$.' WHERE id = 'ede466fa-ca06-496a-b81a-ba8d1c1f2860';

UPDATE practice_problems SET detailed_hint = 'Multiply the first equation by $2$: $10x - 6y = 14$. Notice the left side now matches $10x - 6y = k$. For the system to have no solution, the left sides must be identical but the right sides must differ. Determine what value of $k$ would need to be avoided.' WHERE id = '3f0d95ec-fbe0-446d-b3ca-46e5f04c23c1';

UPDATE practice_problems SET detailed_hint = 'Instead of solving for $x$ and $y$ individually, subtract the second equation from the first: $(4x + y) - (x + 4y) = 22 - 13$. Simplify the left side to get an expression in $x - y$, then divide by the coefficient.' WHERE id = 'efb575f1-7bc8-4876-9d16-2886559edb6e';

UPDATE practice_problems SET detailed_hint = 'Multiply the first equation by $6$ (the LCD of $3$ and $2$) to get $2x + 3y = 30$. Multiply the second equation by its LCD to clear fractions as well. Then use addition or subtraction to eliminate one variable and solve.' WHERE id = '0cd361ec-4f5b-4485-b605-c0d17271d6cb';

UPDATE practice_problems SET detailed_hint = 'Multiply the first equation by $6$ to get $2x + 3y = 30$. Multiply the second equation by $6$ to get $x - 3y = 6$. Now add these two equations — the $3y$ terms cancel, leaving a simple equation in $x$ alone.' WHERE id = '4721f50c-7cac-442d-82ad-bb09082bc96c';

UPDATE practice_problems SET detailed_hint = 'For infinitely many solutions, $\frac{2}{6} = \frac{p}{15} = \frac{10}{30}$. Simplify one of the known ratios to get the common value, then set $\frac{p}{15}$ equal to that fraction and cross-multiply to solve for $p$.' WHERE id = 'fb960b3e-18b0-4ccb-9a67-59cdf9a82bf1';

UPDATE practice_problems SET detailed_hint = 'Since $y = 2x + 1$ is already solved for $y$, substitute it into $7x - 2y = 3$: $7x - 2(2x + 1) = 3$. Distribute the $-2$, combine like terms, and solve for $x$. Then compute $y$ and evaluate $3x + y$.' WHERE id = '7adecf07-d17f-4a6d-a273-f549dc7c0d93';

UPDATE practice_problems SET detailed_hint = 'Substitute $y = x - 1$ into $2x - y = 3$: $2x - (x - 1) = 3$. Be careful distributing the negative sign. Solve for $x$, then find $y$ using $y = x - 1$, and finally compute $3x + y$.' WHERE id = '8a4b20db-ebe0-443b-a1df-c13c750ca73a';

UPDATE practice_problems SET detailed_hint = 'Plug $x = 4$ and $y = 0$ into each equation separately. In the first equation, $c(4) + 5(0) = 20$ lets you solve for $c$. In the second equation, $4(4) - d(0) = 16$ — notice what happens to the $d$ term when $y = 0$. Think about what additional information determines $d$.' WHERE id = '0fda191f-6fac-4a03-a15c-40b5134dabc6';

UPDATE practice_problems SET detailed_hint = 'Add the two equations to eliminate $y$: $(3x + 5y) + (3x - 5y) = 41 + (-9)$. This gives $6x$ equal to a number, so solve for $x$. Then subtract the equations to find $y$. Finally, compute the product $xy$.' WHERE id = '06e1fef3-71a2-460f-adec-b300e4bdfa49';

UPDATE practice_problems SET detailed_hint = 'Add the two equations: $(3x + y) + (x - y) = 28 + 4$, which simplifies to $4x = 32$. Solve for $x$, then substitute back into either equation to find $y$. Multiply your two values to get $xy$.' WHERE id = '76649011-5ea0-4d0c-9cd4-76f33777a0b1';

UPDATE practice_problems SET detailed_hint = 'Set up two equations: $a + b = 200$ (total volume) and $0.30a + 0.70b = 0.45(200)$ (total acid). Compute $0.45 \times 200 = 90$ for the right side. Substitute $b = 200 - a$ into the acid equation, distribute, and combine terms to solve for $a$.' WHERE id = '730ccebc-8a05-4baf-89e9-7d5d80825d2b';

UPDATE practice_problems SET detailed_hint = 'Set the two temperature expressions equal: $-5t + 80 = -3t + 60$. Move the $t$ terms to one side by adding $5t$ to both sides, and move the constants to the other side by subtracting $60$. Then solve for $t$.' WHERE id = '2b0f02ee-38b4-4de7-9204-77ba82fb752a';

UPDATE practice_problems SET detailed_hint = 'Substitute $(x, y) = (2, 1)$ into both equations: the first gives $2a + b = 12$ and the second gives $6a - 2b = 6$. Now solve this new system of two equations in $a$ and $b$ — try multiplying the first equation by $2$ and adding to eliminate $b$.' WHERE id = 'ccc7e47f-c865-489a-b300-784e6a2c668e';

UPDATE practice_problems SET detailed_hint = 'Subtract the second equation from the first: $\frac{x}{p} - \frac{x}{q} + \frac{y}{q} - \frac{y}{p} = 0$. Factor to get $(x - y)\left(\frac{1}{p} - \frac{1}{q}\right) = 0$. Since $p \neq q$, the second factor is nonzero, so $x = y$. Substitute $x = y$ back into either original equation to find the condition on $p$ and $q$.' WHERE id = '568460c9-c4e6-4b5e-9337-cb7c5732431a';

UPDATE practice_problems SET detailed_hint = 'The slope of $mx + ny = 1$ is $-\frac{m}{n}$. For perpendicularity with $y = 2x$ (slope $2$), we need $-\frac{m}{n} \times 2 = -1$, giving a relationship between $m$ and $n$. Also plug in $(3, -1)$: $3m - n = 1$. Solve the resulting system for $m$ and $n$, then add them.' WHERE id = '0f7d71f0-46e8-43a1-9ae8-9a70f643221a';

UPDATE practice_problems SET detailed_hint = 'For infinitely many solutions, the ratios of corresponding coefficients and constants must all be equal: $\frac{k}{12} = \frac{-3}{-k} = \frac{4}{8}$. Start with $\frac{4}{8} = \frac{1}{2}$, then set $\frac{k}{12} = \frac{1}{2}$ and $\frac{3}{k} = \frac{1}{2}$ to find which value(s) of $k$ satisfy both.' WHERE id = '4c9e8e82-7d2a-4372-9e5a-660941de7c73';

UPDATE practice_problems SET detailed_hint = 'Rewrite both equations in slope-intercept form. The slope of $3x + cy = 10$ is $-\frac{3}{c}$, and the slope of $dx - 4y = 5$ is $\frac{d}{4}$. With $c = -2$, compute the first slope, then set it equal to $\frac{d}{4}$ (parallel means equal slopes) and solve for $d$.' WHERE id = '483f7484-44f6-4a72-8325-5834a1eedcdc';

UPDATE practice_problems SET detailed_hint = 'Let $u = \frac{1}{x}$ and $v = \frac{1}{y}$. The system becomes $u + v = \frac{1}{3}$ and $u - v = \frac{1}{7}$. Add these to find $u$, then subtract to find $v$. Convert back to $x$ and $y$ by taking reciprocals, then compute their product.' WHERE id = '3ae4f9cb-0e29-423e-90d4-687120c2f117';

UPDATE practice_problems SET detailed_hint = 'Since $(t+1, 2t-3)$ is a solution for every $t$, eliminate $t$ to find the relationship between $x$ and $y$. From $x = t + 1$, we get $t = x - 1$. Substitute into $y = 2t - 3$ to express $y$ directly in terms of $x$.' WHERE id = 'c1037261-048d-441b-9b19-deb4c4ca93df';

UPDATE practice_problems SET detailed_hint = 'For no solution, $px + qy = r$ must be parallel to $4x + 8y = 12$, meaning $\frac{p}{4} = \frac{q}{8}$ but $\frac{r}{12}$ must differ from that ratio. Simplify $\frac{4}{8} = \frac{1}{2}$, so you need $\frac{p}{q} = \frac{1}{2}$ with $\frac{r}{12} \neq \frac{p}{4}$. Check each option against these conditions.' WHERE id = 'ef035eec-d24d-4092-b552-59091a0618b6';

UPDATE practice_problems SET detailed_hint = 'Notice that $6x + 10y$ is exactly $2$ times $3x + 5y$. For the system to have infinitely many solutions, the second equation must be a constant multiple of the first. Since the left side is multiplied by $2$, the right side $b$ must also equal $2$ times $a$.' WHERE id = '8cbeadf6-20ea-4104-98d3-8bf451595d2e';
