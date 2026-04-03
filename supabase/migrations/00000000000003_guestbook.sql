create table public.guestbook (
  id uuid default gen_random_uuid() primary key,
  author_name text not null,
  message text not null,
  created_at timestamptz default now() not null
);

alter table public.guestbook enable row level security;
create policy "Public read guestbook" on public.guestbook for select using (true);
create policy "Anyone can write guestbook" on public.guestbook for insert with check (true);
create policy "Admin manage guestbook" on public.guestbook for all using (auth.role() = 'authenticated');
