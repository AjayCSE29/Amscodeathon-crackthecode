select table_name, privilege_type, grantee
from information_schema.role_table_grants
where table_schema = 'public'
  and grantee in ('anon', 'authenticated')
order by table_name, grantee;

select relname, relrowsecurity
from pg_class
where relnamespace = 'public'::regnamespace
  and relkind in ('r', 'v')
order by relname;

select
  count(*) filter (where is_right is null) as ungraded,
  count(*) filter (where final_score is null) as final_score_null,
  count(*) filter (where is_right and is_hint and final_score = 3) as hint_correct,
  count(*) filter (where is_right and not is_hint and final_score = 5) as clean_correct,
  count(*) filter (where is_right is false and final_score = 0) as wrong
from public.round2_submissions;

select
  user_id,
  q_attended,
  q_correct,
  score,
  round((q_correct::numeric / 60) * 100, 2) as expected_score
from public.round1_results
where abs(score - round((q_correct::numeric / 60) * 100, 2)) > 0.001;

select team_name, answers_text
from public.round1_summary
where answers_text <> ''
order by user_id
limit 5;

select team_name, q_completed, submissions_count, graded_count, total_score
from public.round2_standings
order by total_score desc, q_completed desc;

select
  count(*) filter (where is_right is null) as ungraded,
  count(*) filter (where final_score is null) as final_score_null,
  count(*) filter (where is_right and is_hint and final_score = 20) as hint_correct,
  count(*) filter (where is_right and not is_hint and final_score = 25) as clean_correct,
  count(*) filter (where is_right is false and final_score = 0) as wrong
from public.round3_submissions;

select team_name, q_completed, submissions_count, graded_count, total_score
from public.round3_standings
order by total_score desc, q_completed desc;
