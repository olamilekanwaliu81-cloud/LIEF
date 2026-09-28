-- LEIF success metrics (PRD §16). Run any block in the Supabase SQL Editor.
-- Events are recorded by the app; demo/test accounts are included unless filtered out.

-- 1. Onboarding completion: accounts created vs. first dashboard seen
select
  (select count(*) from events where name = 'onboarding_completed' and role = 'parent') as parents_signed_up,
  (select count(distinct user_id) from events where name = 'dashboard_viewed')          as parents_reached_dashboard;

-- 2. Attention identification: parents who opened a concern from the dashboard
select count(distinct user_id) as parents_who_opened_a_concern,
       count(*)                as concern_opens
from events where name = 'concern_opened';

-- 3. Guidance discovery: parents who viewed "How Can I Help?" guidance, by subject
select props->>'subject' as subject, count(distinct user_id) as parents, count(*) as views
from events where name = 'guidance_viewed'
group by 1 order by parents desc;

-- 4. Guidance usefulness: share of "Yes, useful" answers per subject
select props->>'subject' as subject,
       count(*) filter (where (props->>'useful')::boolean)     as useful,
       count(*) filter (where not (props->>'useful')::boolean) as not_useful,
       round(100.0 * count(*) filter (where (props->>'useful')::boolean) / nullif(count(*), 0)) as pct_useful
from events where name = 'guidance_feedback'
group by 1 order by 1;

-- 5. Core flow completion: Dashboard → Concern → Guidance → Action, per parent
with steps as (
  select user_id,
         bool_or(name = 'dashboard_viewed') as dashboard,
         bool_or(name = 'concern_opened')   as concern,
         bool_or(name = 'guidance_viewed')  as guidance,
         bool_or(name = 'action_started')   as action
  from events where user_id is not null group by user_id)
select count(*) filter (where dashboard)                                  as step1_dashboard,
       count(*) filter (where dashboard and concern)                      as step2_concern,
       count(*) filter (where dashboard and concern and guidance)         as step3_guidance,
       count(*) filter (where dashboard and concern and guidance and action) as step4_action
from steps;

-- 6. Monitor improvement: score change since each support action started
select a.subject, a.title, a.baseline_score,
       (select (sc->>'score')::int from jsonb_array_elements(s.scores) sc where sc->>'subject' = a.subject) as current_score,
       a.started_at, a.status
from support_actions a join students s on s.id = a.student_id
order by a.started_at desc;

-- 7. Learner workflow: tasks completed by learners
select date_trunc('day', created_at)::date as day, count(*) as tasks_completed
from events where name = 'learner_task_completed' group by 1 order by 1;
