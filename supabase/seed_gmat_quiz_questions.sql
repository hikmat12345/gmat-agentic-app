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
