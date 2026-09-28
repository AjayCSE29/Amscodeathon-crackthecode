create table public.users (
  user_id text primary key,
  team_name text not null unique,
  hashed_password text not null,
  created_at timestamptz not null default now(),
  constraint users_user_id_length check (char_length(user_id) between 1 and 64),
  constraint users_team_name_length check (char_length(team_name) between 1 and 120)
);

create table public.round1_answers (
  user_id text not null references public.users (user_id) on delete cascade,
  q_no integer not null,
  option char(1) not null,
  primary key (user_id, q_no),
  constraint round1_answers_q_no_range check (q_no between 1 and 60),
  constraint round1_answers_option_valid check (option in ('A', 'B', 'C', 'D'))
);

create table public.round1_results (
  user_id text primary key references public.users (user_id) on delete cascade,
  q_attended integer not null default 0,
  q_correct integer not null default 0,
  score numeric(6, 2) not null default 0,
  finish_seconds integer not null default 0,
  finished_at timestamptz not null default now(),
  constraint round1_results_attended_range check (q_attended between 0 and 60),
  constraint round1_results_correct_range check (
    q_correct between 0 and 60 and q_correct <= q_attended
  ),
  constraint round1_results_finish_range check (finish_seconds between 0 and 2700)
);

create table public.round2_submissions (
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
      when is_right then (case when is_hint then 3 else 5 end)
      else 0
    end
  ) stored,
  submitted_at timestamptz not null default now(),
  primary key (user_id, q_no),
  constraint round2_submissions_q_no_range check (q_no between 1 and 20),
  constraint round2_submissions_language_valid check (language in ('C++', 'Python', 'Java')),
  constraint round2_submissions_program_length check (char_length(program) <= 65536),
  constraint round2_submissions_output_length check (char_length(output) <= 65536),
  constraint round2_submissions_stderr_length check (char_length(stderr) <= 16384),
  constraint round2_submissions_exit_code_valid check (exit_code is null or exit_code >= -1)
);

create table public.round2_results (
  user_id text primary key references public.users (user_id) on delete cascade,
  q_completed integer not null default 0,
  finish_seconds integer not null default 0,
  finished_at timestamptz not null default now(),
  constraint round2_results_completed_range check (q_completed between 0 and 20),
  constraint round2_results_finish_range check (finish_seconds between 0 and 3600)
);

create view public.round1_summary as
select
  u.user_id,
  u.team_name,
  coalesce(r.q_attended, 0) as q_attended,
  coalesce(r.q_correct, 0) as q_correct,
  coalesce(r.score, 0) as score,
  coalesce(r.finish_seconds, 2700) as finish_seconds,
  r.finished_at,
  coalesce(
    (
      select string_agg(a.q_no::text || a.option, ', ' order by a.q_no)
      from public.round1_answers a
      where a.user_id = u.user_id
    ),
    ''
  ) as answers_text
from public.users u
left join public.round1_results r on r.user_id = u.user_id;

create view public.round2_standings as
select
  u.user_id,
  u.team_name,
  coalesce(r.q_completed, 0) as q_completed,
  coalesce(r.finish_seconds, 3600) as finish_seconds,
  count(s.q_no) as submissions_count,
  count(s.final_score) as graded_count,
  coalesce(sum(s.final_score), 0) as total_score
from public.users u
left join public.round2_results r on r.user_id = u.user_id
left join public.round2_submissions s on s.user_id = u.user_id
group by u.user_id, u.team_name, r.q_completed, r.finish_seconds;
