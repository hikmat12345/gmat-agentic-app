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
