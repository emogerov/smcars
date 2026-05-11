create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  email text primary key,
  full_name text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cms_snapshots (
  stage text primary key check (stage in ('draft', 'published')),
  content jsonb not null default '{}'::jsonb,
  revision integer not null default 1,
  updated_at timestamptz not null default now(),
  updated_by text,
  published_at timestamptz,
  published_by text
);

create table if not exists public.cms_change_log (
  id bigint generated always as identity primary key,
  event_type text not null check (event_type in ('draft_saved', 'published')),
  stage text not null check (stage in ('draft', 'published')),
  actor_email text,
  summary text,
  created_at timestamptz not null default now()
);

create or replace function public.current_user_email()
returns text
language sql
stable
as $$
  select lower(coalesce(auth.jwt() ->> 'email', ''));
$$;

create or replace function public.is_admin_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where lower(email) = public.current_user_email()
      and is_active = true
  );
$$;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_admin_users_touch on public.admin_users;
create trigger trg_admin_users_touch
before update on public.admin_users
for each row execute function public.touch_updated_at();

alter table public.admin_users enable row level security;
alter table public.cms_snapshots enable row level security;
alter table public.cms_change_log enable row level security;

drop policy if exists "admin users can read admin_users" on public.admin_users;
create policy "admin users can read admin_users"
on public.admin_users
for select
to authenticated
using (lower(email) = public.current_user_email());

drop policy if exists "public can read published snapshot" on public.cms_snapshots;
create policy "public can read published snapshot"
on public.cms_snapshots
for select
to anon, authenticated
using (stage = 'published' or public.is_admin_user());

drop policy if exists "admin users can insert snapshots" on public.cms_snapshots;
create policy "admin users can insert snapshots"
on public.cms_snapshots
for insert
to authenticated
with check (public.is_admin_user());

drop policy if exists "admin users can update snapshots" on public.cms_snapshots;
create policy "admin users can update snapshots"
on public.cms_snapshots
for update
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists "admin users can read change log" on public.cms_change_log;
create policy "admin users can read change log"
on public.cms_change_log
for select
to authenticated
using (public.is_admin_user());

drop policy if exists "admin users can insert change log" on public.cms_change_log;
create policy "admin users can insert change log"
on public.cms_change_log
for insert
to authenticated
with check (public.is_admin_user());

create or replace function public.publish_cms_draft()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := public.current_user_email();
  v_draft public.cms_snapshots%rowtype;
begin
  if not public.is_admin_user() then
    raise exception 'not authorized';
  end if;

  select *
  into v_draft
  from public.cms_snapshots
  where stage = 'draft';

  if not found then
    raise exception 'draft snapshot is missing';
  end if;

  insert into public.cms_snapshots (
    stage,
    content,
    revision,
    updated_at,
    updated_by,
    published_at,
    published_by
  )
  values (
    'published',
    v_draft.content,
    v_draft.revision,
    now(),
    v_email,
    now(),
    v_email
  )
  on conflict (stage) do update
  set content = excluded.content,
      revision = excluded.revision,
      updated_at = excluded.updated_at,
      updated_by = excluded.updated_by,
      published_at = excluded.published_at,
      published_by = excluded.published_by;

  insert into public.cms_change_log (event_type, stage, actor_email, summary)
  values ('published', 'published', v_email, 'Publish from draft');
end;
$$;

grant usage on schema public to anon, authenticated;
grant select on public.cms_snapshots to anon, authenticated;
grant select on public.admin_users to authenticated;
grant select, insert, update on public.cms_snapshots to authenticated;
grant select, insert on public.cms_change_log to authenticated;
grant execute on function public.publish_cms_draft() to authenticated;
