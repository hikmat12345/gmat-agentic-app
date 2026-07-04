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
