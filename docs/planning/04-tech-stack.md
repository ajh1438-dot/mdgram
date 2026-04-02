# 기술 스택

## 프론트엔드

| 기술 | 용도 | 선택 이유 |
|------|------|----------|
| Next.js 15 (App Router) | 프레임워크 | SSR/SSG 지원, Vercel 최적화, 참고 사이트들도 대부분 사용 |
| TypeScript | 언어 | 타입 안전성, 폴더트리 데이터 구조 관리에 필수 |
| Tailwind CSS | 스타일링 | 유틸리티 퍼스트, CSS Variables와 조합하여 테마 시스템 구현 |
| CSS Variables | 테마 시스템 | data-theme 속성으로 테마 토글, 마크다운+마인드맵 동시 반영 |
| react-markdown | 마크다운 렌더링 | GFM 지원, rehype 플러그인 생태계 |
| remark-gfm | 마크다운 확장 | 테이블, 체크박스, 취소선 등 |
| rehype-highlight | 코드 하이라이트 | 마크다운 코드 블록 스타일링 |
| D3.js | 마인드맵 | Force graph, 폴더구조 → 자동 노드/엣지 생성 |
| Framer Motion | 애니메이션 | 페이지 전환, 패널 슬라이드, 노드 펼침 |

## 백엔드 / 인프라

| 기술 | 용도 | 선택 이유 |
|------|------|----------|
| Supabase | BaaS | PostgreSQL + Auth + Storage + Realtime, 무료 티어로 MVP 충분 |
| PostgreSQL (via Supabase) | 데이터베이스 | 폴더트리 JSON, 댓글, 반응, 메시지 저장 |
| Supabase Auth | 인증 | 관리자 로그인 (소유자), 나중에 Google/GitHub OAuth 확장 |
| Supabase Storage | 파일 저장 | 마크다운 파일, 이미지 첨부 |
| Vercel | 배포 | Next.js 최적 호스팅, 무료 티어 |

## 주요 라이브러리

| 라이브러리 | 용도 |
|-----------|------|
| @supabase/supabase-js | Supabase 클라이언트 |
| Web Selection API (네이티브) | 문장 선택 감지 |
| @dnd-kit/core | 관리자 페이지 폴더 드래그&드롭 |
| CodeMirror 또는 Monaco | 관리자 마크다운 에디터 |
| Pretendard (폰트) | 본문 |
| JetBrains Mono (폰트) | 코드/마크다운 |

## 데이터 모델 (핵심)

```
folders_tree (jsonb)
├── id, name, type(folder/file), children[], parent_id
├── content (마크다운 텍스트, file인 경우)
└── order (정렬 순서)

comments
├── id, file_path, selected_text, offset_start, offset_end
├── content, author_name, created_at

reactions
├── id, keyword (노드명), count, visitor_id (anonymous hash)

messages
├── id, keyword_tags[], content, sender_name, sender_email
├── created_at, read_at

themes
├── id, name, css_variables (jsonb), is_active
```
