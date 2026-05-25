-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create renovations table
create table if not exists renovations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  location text not null,
  renovation_type text not null,
  budget numeric,
  actual numeric,
  status text default 'Gepland',
  start_date date,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create RLS policies
alter table renovations enable row level security;

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

-- Create shared_access table voor 2-persoons access
create table if not exists shared_access (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references auth.users(id) on delete cascade,
  shared_with_email text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table shared_access enable row level security;

create policy "Users can view own shares"
  on shared_access for select
  using (auth.uid() = owner_id or auth.email() = shared_with_email);

-- Create view for shared renovations
create or replace view shared_renovations as
select r.*
from renovations r
join shared_access sa on (r.user_id = sa.owner_id or r.user_id = (
  select user_id from auth.users where email = sa.shared_with_email
))
where sa.shared_with_email = auth.email() or sa.owner_id = auth.uid();

-- Create function to handle updated_at
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create trigger
create trigger handle_renovations_updated_at
  before update on renovations
  for each row
  execute function handle_updated_at();
