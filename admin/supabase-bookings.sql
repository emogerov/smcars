create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  vehicle_id text not null,
  start_date date not null,
  end_date date not null,
  status text not null check (status in ('pending', 'paid', 'manual', 'cancelled', 'expired', 'refunded')),
  source text not null check (source in ('website', 'phone', 'email', 'manual_admin')),
  customer_name text,
  customer_email text,
  customer_phone text,
  total_amount numeric(10, 2),
  currency text not null default 'EUR',
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by text,
  updated_by text,
  constraint bookings_date_range_check check (end_date >= start_date)
);

create index if not exists bookings_vehicle_dates_idx
  on public.bookings (vehicle_id, start_date, end_date);

create index if not exists bookings_status_idx
  on public.bookings (status);

drop trigger if exists trg_bookings_touch on public.bookings;
create trigger trg_bookings_touch
before update on public.bookings
for each row execute function public.touch_updated_at();

alter table public.bookings enable row level security;

drop policy if exists "admin users can read bookings" on public.bookings;
create policy "admin users can read bookings"
on public.bookings
for select
to authenticated
using (public.is_admin_user());

drop policy if exists "admin users can insert bookings" on public.bookings;
create policy "admin users can insert bookings"
on public.bookings
for insert
to authenticated
with check (public.is_admin_user());

drop policy if exists "admin users can update bookings" on public.bookings;
create policy "admin users can update bookings"
on public.bookings
for update
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists "admin users can delete bookings" on public.bookings;
create policy "admin users can delete bookings"
on public.bookings
for delete
to authenticated
using (public.is_admin_user());

create or replace function public.get_public_booking_ranges(p_vehicle_id text default null)
returns table (
  vehicle_id text,
  start_date date,
  end_date date,
  status text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    b.vehicle_id,
    b.start_date,
    b.end_date,
    b.status
  from public.bookings b
  where b.status in ('paid', 'manual')
    and (p_vehicle_id is null or b.vehicle_id = p_vehicle_id)
  order by b.start_date asc, b.end_date asc;
$$;

create or replace function public.is_vehicle_booked_today(p_vehicle_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.bookings b
    where b.vehicle_id = p_vehicle_id
      and b.status in ('paid', 'manual')
      and current_date between b.start_date and b.end_date
  );
$$;

grant select, insert, update, delete on public.bookings to authenticated;
grant execute on function public.get_public_booking_ranges(text) to anon, authenticated;
grant execute on function public.is_vehicle_booked_today(text) to anon, authenticated;
