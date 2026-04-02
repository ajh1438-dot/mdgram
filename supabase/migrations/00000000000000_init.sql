-- Forest of Connections (연결의 숲) — Initial Schema

-- 1. folder_tree: 폴더트리 구조 (Single Source of Truth)
create table public.folder_tree (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  type text not null check (type in ('folder', 'file')),
  parent_id uuid references public.folder_tree(id) on delete cascade,
  "order" integer not null default 0,
  content text,  -- 마크다운 콘텐츠 (file인 경우)
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index idx_folder_tree_parent on public.folder_tree(parent_id);

-- 2. comment: 문장 선택 댓글
create table public.comment (
  id uuid default gen_random_uuid() primary key,
  file_id uuid references public.folder_tree(id) on delete cascade not null,
  selected_text text not null,
  offset_start integer not null,
  offset_end integer not null,
  content text not null,
  author_name text not null,
  created_at timestamptz default now() not null
);

create index idx_comment_file on public.comment(file_id);

-- 3. reaction: 키워드(노드) 반응
create table public.reaction (
  id uuid default gen_random_uuid() primary key,
  keyword text not null,
  node_id uuid references public.folder_tree(id) on delete cascade not null,
  visitor_hash text not null,
  created_at timestamptz default now() not null,
  unique(node_id, visitor_hash)  -- 같은 방문자 같은 노드 1회
);

create index idx_reaction_node on public.reaction(node_id);

-- 4. message: 주제 기반 메시지
create table public.message (
  id uuid default gen_random_uuid() primary key,
  keyword_tags text[] not null default '{}',
  content text not null,
  sender_name text not null,
  sender_email text,
  is_read boolean not null default false,
  created_at timestamptz default now() not null
);

-- 5. theme: CSS 테마 설정
create table public.theme (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  css_variables jsonb not null default '{}',
  is_active boolean not null default false,
  is_builtin boolean not null default false
);

-- 6. site_config: 사이트 전역 설정
create table public.site_config (
  id uuid default gen_random_uuid() primary key,
  hero_title text not null default '',
  hero_subtitle text not null default '',
  hero_copy text not null default '',
  owner_name text not null default ''
);

-- RLS: 읽기 공개, 쓰기 관리자만
alter table public.folder_tree enable row level security;
alter table public.comment enable row level security;
alter table public.reaction enable row level security;
alter table public.message enable row level security;
alter table public.theme enable row level security;
alter table public.site_config enable row level security;

-- 읽기 정책 (모든 테이블 공개 읽기)
create policy "Public read" on public.folder_tree for select using (true);
create policy "Public read" on public.comment for select using (true);
create policy "Public read" on public.reaction for select using (true);
create policy "Public read" on public.theme for select using (true);
create policy "Public read" on public.site_config for select using (true);

-- 방문자 쓰기 정책 (댓글, 반응, 메시지)
create policy "Anyone can comment" on public.comment for insert with check (true);
create policy "Anyone can react" on public.reaction for insert with check (true);
create policy "Anyone can message" on public.message for insert with check (true);

-- 관리자 쓰기 정책
create policy "Admin full access" on public.folder_tree for all using (auth.role() = 'authenticated');
create policy "Admin full access" on public.comment for all using (auth.role() = 'authenticated');
create policy "Admin full access" on public.reaction for all using (auth.role() = 'authenticated');
create policy "Admin full access" on public.message for all using (auth.role() = 'authenticated');
create policy "Admin full access" on public.theme for all using (auth.role() = 'authenticated');
create policy "Admin full access" on public.site_config for all using (auth.role() = 'authenticated');

-- 시드 데이터: 3개 빌트인 테마
insert into public.theme (name, css_variables, is_active, is_builtin) values
  ('dark', '{"--bg":"#0a0a0a","--bg-secondary":"#1a1a2e","--text":"#e4e4e7","--text-muted":"#a1a1aa","--accent":"#6366f1","--accent-hover":"#818cf8","--border":"#27272a","--card":"#18181b"}', true, true),
  ('light', '{"--bg":"#fafafa","--bg-secondary":"#f4f4f5","--text":"#18181b","--text-muted":"#71717a","--accent":"#4f46e5","--accent-hover":"#6366f1","--border":"#e4e4e7","--card":"#ffffff"}', false, true),
  ('forest', '{"--bg":"#0c1a0c","--bg-secondary":"#1a2e1a","--text":"#d4e7d4","--text-muted":"#8faf8f","--accent":"#22c55e","--accent-hover":"#4ade80","--border":"#1e3a1e","--card":"#142814"}', false, true);

-- 시드 데이터: 사이트 설정
insert into public.site_config (hero_title, hero_subtitle, hero_copy, owner_name) values
  ('연결의 숲', '호기심 천국에 사는 개척정신 회계사', '서로 관계없어 보이는 것들이 연결되는 숲에 들어와보세요', '안지훈');
