-- The analytics table behind /api/event. Run this once, in the SQL editor of
-- whichever Supabase project holds the site's data.
--
-- It lives in `public` rather than its own schema for one practical reason:
-- PostgREST only exposes the schemas it has been configured to expose, and
-- `public` is the one that already works with no dashboard settings to change.
-- The name is the namespace instead.

create table if not exists public.site_events (
  id          bigint generated always as identity primary key,
  created_at  timestamptz  not null default now(),
  name        text         not null,
  props       jsonb        not null default '{}'::jsonb,
  -- Per-tab, expires with the tab. Not a user id, and not usable as one.
  session_id  text,
  path        text,
  referrer_host text,
  lang        text,
  viewport    text
);

-- The two shapes every question below is asked in: recent-first, and by name.
create index if not exists site_events_created_at_idx on public.site_events (created_at desc);
create index if not exists site_events_name_created_idx on public.site_events (name, created_at desc);
create index if not exists site_events_session_idx on public.site_events (session_id);

-- RLS on with no policies at all. That is the intended end state, not an
-- oversight: the service role key used by /api/event bypasses RLS, and every
-- other key is left with no way in. If the anon key could read this table, the
-- whole visitor log would be one fetch() away from anybody who viewed source.
alter table public.site_events enable row level security;

-- ---------------------------------------------------------------------------
-- The question this was all built to answer: of the visits that reached the
-- booking section, which demo did they run first?
-- ---------------------------------------------------------------------------
-- with booked as (
--   select distinct session_id from public.site_events
--   where name = 'section_view' and props->>'section' = 'book'
-- )
-- select e.props->>'demo' as demo, count(distinct e.session_id) as sessions
-- from public.site_events e
-- join booked b on b.session_id = e.session_id
-- where e.name = 'demo_run'
-- group by 1 order by 2 desc;

-- Run rate per demo, all visits:
-- select props->>'demo' as demo, count(*) as runs, count(distinct session_id) as sessions
-- from public.site_events where name = 'demo_run' group by 1 order by 2 desc;

-- How far down the page people actually get:
-- select width_bucket((props->>'depth')::int, 0, 100, 10) * 10 as depth_pct,
--        count(*) as visits
-- from public.site_events where name = 'page_leave' group by 1 order by 1;
