-- Create tables for global taps and per-country taps
create table if not exists public.global_state (
  id int primary key default 1,
  total_taps bigint not null default 0,
  updated_at timestamptz not null default now()
);

insert into public.global_state (id, total_taps)
  values (1, 0)
on conflict (id) do nothing;

create table if not exists public.country_taps (
  country_code text primary key,
  taps bigint not null default 0,
  updated_at timestamptz not null default now()
);

-- Enable Realtime on these tables in the Supabase dashboard (or via SQL)
alter publication supabase_realtime add table public.global_state, public.country_taps;

-- Increment function to batch update counts securely from the client
create or replace function public.increment_taps(in_country_code text, in_amount int)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if in_amount is null or in_amount <= 0 then
    return;
  end if;

  -- Upsert country tap totals
  insert into public.country_taps as ct (country_code, taps, updated_at)
  values (upper(coalesce(in_country_code, 'ZZ')), in_amount, now())
  on conflict (country_code)
  do update set taps = ct.taps + excluded.taps, updated_at = now();

  -- Ensure global row exists, then increment
  insert into public.global_state (id, total_taps, updated_at)
  values (1, in_amount, now())
  on conflict (id)
  do update set total_taps = public.global_state.total_taps + excluded.total_taps,
                updated_at = now();
end;
$$;

-- RLS: Allow anonymous clients to call increment function; tables remain protected by definer
alter function public.increment_taps(text, int) owner to postgres;
grant usage on schema public to anon, authenticated;
grant select on table public.global_state to anon, authenticated;
grant select on table public.country_taps to anon, authenticated;
grant execute on function public.increment_taps(text, int) to anon, authenticated;

-- Optional: RLS policies if you decide to allow direct reads from the client
alter table public.global_state enable row level security;
alter table public.country_taps enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'global_state' and policyname = 'Allow read'
  ) then
    create policy "Allow read" on public.global_state for select using (true);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'country_taps' and policyname = 'Allow read'
  ) then
    create policy "Allow read" on public.country_taps for select using (true);
  end if;
end $$;


