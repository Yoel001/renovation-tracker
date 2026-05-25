-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create rooms table
create table if not exists rooms (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create renovations table (simplified - only actual cost, no budget)
create table if not exists renovations (
  id uuid default uuid_generate_v4() primary key,
  room_id uuid references rooms(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade,
  renovation_type text not null,
  cost numeric not null default 0,
  status text default 'Gepland',
  start_date date,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create shared_access table
create table if not exists shared_access (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references auth.users(id) on delete cascade,
  shared_with_email text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable Row Level Security
alter table rooms enable row level security;
alter table renovations enable row level security;
alter table shared_access enable row level security;

-- Rooms RLS Policies
create policy "Users can view own rooms"
  on rooms for select
  using (auth.uid() = user_id);

create policy "Users can create own rooms"
  on rooms for insert
  with check (auth.uid() = user_id);

create policy "Users can update own rooms"
  on rooms for update
  using (auth.uid() = user_id);

create policy "Users can delete own rooms"
  on rooms for delete
  using (auth.uid() = user_id);

-- Renovations RLS Policies
create policy "Users can view own renovations"
  on renovations for select
  using (auth.uid() = user_id);

create policy "Users can create own renovations"
  on renovations for insert
  with check (auth.uid() = user_id);

create policy "Users can update own renovations"
  on renovations for update
  using (auth.uid() = user_id);

create policy "Users can delete own renovations"
  on renovations for delete
  using (auth.uid() = user_id);

-- Shared Access RLS Policies
create policy "Users can view own shares"
  on shared_access for select
  using (auth.uid() = owner_id);

create policy "Users can create shares"
  on shared_access for insert
  with check (auth.uid() = owner_id);

-- Updated_at trigger function
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Apply trigger to renovations
create trigger handle_renovations_updated_at
  before update on renovations
  for each row
  execute function handle_updated_at();
