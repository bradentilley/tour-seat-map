-- Tour Seat Map schema
-- Run this in your Supabase SQL editor

create table if not exists tours (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  has_bus2 boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid not null references tours(id) on delete cascade,
  bus_number smallint not null check (bus_number in (1, 2)),
  row_number smallint not null check (row_number between 1 and 3),
  seat_letter text not null check (seat_letter in ('A', 'B', 'C', 'D')),
  guest_name text not null,
  guest_email text not null,
  salesperson text not null,
  status text not null default 'active' check (status in ('active', 'cancelled')),
  created_at timestamptz not null default now()
);

-- Prevent double-booking: only one active booking per seat per bus per tour
create unique index if not exists bookings_unique_active_seat
  on bookings (tour_id, bus_number, row_number, seat_letter)
  where status = 'active';

-- Enable Row Level Security (allow public read/write for shared access)
alter table tours enable row level security;
alter table bookings enable row level security;

create policy "Public read tours" on tours for select using (true);
create policy "Public insert tours" on tours for insert with check (true);
create policy "Public update tours" on tours for update using (true);

create policy "Public read bookings" on bookings for select using (true);
create policy "Public insert bookings" on bookings for insert with check (true);
create policy "Public update bookings" on bookings for update using (true);

-- Enable realtime
alter publication supabase_realtime add table bookings;
