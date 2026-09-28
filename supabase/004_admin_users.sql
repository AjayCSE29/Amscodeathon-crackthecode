alter table public.users add column is_active boolean not null default true;

create table public.round1_crosschecks (
  user_id text primary key references public.users (user_id) on delete cascade,
  gemini_score numeric(6, 2),
  gemini_correct integer,
  gemini_attended integer,
  det_score numeric(6, 2) not null default 0,
  det_correct integer not null default 0,
  status text not null default 'pending',
  detail jsonb,
  checked_at timestamptz not null default now(),
  constraint round1_crosschecks_gemini_score_range check (gemini_score is null or gemini_score between 0 and 100),
  constraint round1_crosschecks_gemini_correct_range check (gemini_correct is null or gemini_correct between 0 and 60),
  constraint round1_crosschecks_gemini_attended_range check (gemini_attended is null or gemini_attended between 0 and 60),
  constraint round1_crosschecks_det_score_range check (det_score between 0 and 100),
  constraint round1_crosschecks_det_correct_range check (det_correct between 0 and 60)
);

alter table public.round1_crosschecks enable row level security;

revoke all on table public.round1_crosschecks from anon, authenticated;