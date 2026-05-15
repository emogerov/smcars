alter table public.bookings
  add column if not exists expires_at timestamptz,
  add column if not exists stripe_customer_id text;

create index if not exists bookings_status_expires_idx
  on public.bookings (status, expires_at);

create or replace function public.expire_stale_pending_bookings()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  affected_count integer := 0;
begin
  update public.bookings
  set
    status = 'expired',
    expires_at = null,
    updated_at = now(),
    updated_by = 'stripe_expiry'
  where status = 'pending'
    and expires_at is not null
    and expires_at <= now();

  get diagnostics affected_count = row_count;
  return affected_count;
end;
$$;

create or replace function public.create_pending_booking(
  p_vehicle_id text,
  p_start_date date,
  p_end_date date,
  p_total_amount numeric,
  p_currency text default 'EUR',
  p_timeout_minutes integer default 15
)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  booking_row public.bookings;
begin
  perform public.expire_stale_pending_bookings();

  if p_vehicle_id is null or p_start_date is null or p_end_date is null then
    raise exception 'BOOKING_VALIDATION_FAILED';
  end if;

  if p_end_date < p_start_date then
    raise exception 'BOOKING_VALIDATION_FAILED';
  end if;

  if exists (
    select 1
    from public.bookings b
    where b.vehicle_id = p_vehicle_id
      and b.start_date <= p_end_date
      and b.end_date >= p_start_date
      and (
        b.status in ('paid', 'manual')
        or (b.status = 'pending' and b.expires_at is not null and b.expires_at > now())
      )
  ) then
    raise exception 'BOOKING_CONFLICT';
  end if;

  insert into public.bookings (
    vehicle_id,
    start_date,
    end_date,
    status,
    source,
    total_amount,
    currency,
    expires_at,
    created_by,
    updated_by
  )
  values (
    p_vehicle_id,
    p_start_date,
    p_end_date,
    'pending',
    'website',
    p_total_amount,
    coalesce(nullif(p_currency, ''), 'EUR'),
    now() + greatest(p_timeout_minutes, 1) * interval '1 minute',
    'stripe_checkout',
    'stripe_checkout'
  )
  returning * into booking_row;

  return booking_row;
end;
$$;

create or replace function public.attach_booking_checkout_session(
  p_booking_id uuid,
  p_checkout_session_id text
)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  booking_row public.bookings;
begin
  update public.bookings
  set
    stripe_checkout_session_id = p_checkout_session_id,
    updated_at = now(),
    updated_by = 'stripe_checkout'
  where id = p_booking_id
    and status = 'pending'
  returning * into booking_row;

  if booking_row.id is null then
    raise exception 'BOOKING_NOT_FOUND';
  end if;

  return booking_row;
end;
$$;

create or replace function public.complete_booking_checkout(
  p_booking_id uuid,
  p_checkout_session_id text,
  p_payment_intent_id text,
  p_customer_id text,
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text
)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  booking_row public.bookings;
begin
  update public.bookings
  set
    status = 'paid',
    stripe_checkout_session_id = coalesce(p_checkout_session_id, stripe_checkout_session_id),
    stripe_payment_intent_id = coalesce(p_payment_intent_id, stripe_payment_intent_id),
    stripe_customer_id = coalesce(p_customer_id, stripe_customer_id),
    customer_name = coalesce(nullif(p_customer_name, ''), customer_name),
    customer_email = coalesce(nullif(p_customer_email, ''), customer_email),
    customer_phone = coalesce(nullif(p_customer_phone, ''), customer_phone),
    expires_at = null,
    updated_at = now(),
    updated_by = 'stripe_webhook'
  where id = p_booking_id
    and status in ('pending', 'paid')
  returning * into booking_row;

  if booking_row.id is null then
    raise exception 'BOOKING_NOT_FOUND';
  end if;

  return booking_row;
end;
$$;

grant execute on function public.expire_stale_pending_bookings() to authenticated;
grant execute on function public.create_pending_booking(text, date, date, numeric, text, integer) to authenticated;
grant execute on function public.attach_booking_checkout_session(uuid, text) to authenticated;
grant execute on function public.complete_booking_checkout(uuid, text, text, text, text, text, text) to authenticated;
