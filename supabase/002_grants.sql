alter table public.users enable row level security;
alter table public.round1_answers enable row level security;
alter table public.round1_results enable row level security;
alter table public.round2_submissions enable row level security;
alter table public.round2_results enable row level security;

revoke all on table public.users from anon, authenticated;
revoke all on table public.round1_answers from anon, authenticated;
revoke all on table public.round1_results from anon, authenticated;
revoke all on table public.round2_submissions from anon, authenticated;
revoke all on table public.round2_results from anon, authenticated;

revoke all on public.round1_summary from anon, authenticated;
revoke all on public.round2_standings from anon, authenticated;

revoke all on schema public from anon, authenticated;
revoke create on schema public from public;
