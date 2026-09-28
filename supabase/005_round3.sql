-- Round 3 ("Leetcode Problems") — 4 problems, 60 minutes, final_score 25 (clean) / 20 (hint) / 0 (wrong).

create table public.round3_submissions (
  user_id text not null references public.users (user_id) on delete cascade,
  q_no integer not null,
  language text not null,
  program text not null default '',
  output text not null default '',
  stderr text not null default '',
  exit_code integer,
  is_hint boolean not null default false,
  is_right boolean,
  final_score integer generated always as (
    case
      when is_right is null then null
      when is_right then (case when is_hint then 20 else 25 end)
      else 0
    end
  ) stored,
  submitted_at timestamptz not null default now(),
  primary key (user_id, q_no),
  constraint round3_submissions_q_no_range check (q_no between 1 and 4),
  constraint round3_submissions_language_valid check (language in ('C++', 'Python', 'Java')),
  constraint round3_submissions_program_length check (char_length(program) <= 65536),
  constraint round3_submissions_output_length check (char_length(output) <= 65536),
  constraint round3_submissions_stderr_length check (char_length(stderr) <= 16384),
  constraint round3_submissions_exit_code_valid check (exit_code is null or exit_code >= -1)
);

create table public.round3_results (
  user_id text primary key references public.users (user_id) on delete cascade,
  q_completed integer not null default 0,
  finish_seconds integer not null default 0,
  finished_at timestamptz not null default now(),
  constraint round3_results_completed_range check (q_completed between 0 and 4),
  constraint round3_results_finish_range check (finish_seconds between 0 and 3600)
);

create view public.round3_standings as
select
  u.user_id,
  u.team_name,
  coalesce(r.q_completed, 0) as q_completed,
  coalesce(r.finish_seconds, 3600) as finish_seconds,
  count(s.q_no) as submissions_count,
  count(s.final_score) as graded_count,
  coalesce(sum(s.final_score), 0) as total_score
from public.users u
left join public.round3_results r on r.user_id = u.user_id
left join public.round3_submissions s on s.user_id = u.user_id
group by u.user_id, u.team_name, r.q_completed, r.finish_seconds;