-- User profiles table
create table public.user_profile (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  display_name text not null,
  bio text,
  created_at timestamptz default now() not null
);

create index idx_user_profile_username on public.user_profile(username);

-- Add owner_id to folder_tree so each user has their own tree
alter table public.folder_tree add column owner_id uuid references auth.users on delete cascade;

-- Update existing data to belong to the admin
-- (will be run manually or via API)

-- RLS for user_profile
alter table public.user_profile enable row level security;
create policy "Public read profiles" on public.user_profile for select using (true);
create policy "Users can update own profile" on public.user_profile for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.user_profile for insert with check (auth.uid() = id);

-- Update folder_tree RLS: users can manage their own tree
create policy "Users manage own tree" on public.folder_tree for all using (auth.uid() = owner_id);
