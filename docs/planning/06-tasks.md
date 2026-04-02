# TASKS.md — 연결의 숲 (Forest of Connections)

> Generated: 2026-04-03
> Mode: Domain-Guarded (from-screens)
> ICV: 6 screens × 6 resources = 100% coverage

---

## P0: 프로젝트 셋업

### P0-T0.1: Next.js 15 프로젝트 초기화
- **type**: setup
- **description**: Next.js 15 (App Router) + TypeScript + Tailwind CSS + ESLint 프로젝트 생성
- **details**:
  - `npx create-next-app@latest` (App Router, TypeScript, Tailwind, ESLint)
  - Pretendard + JetBrains Mono 폰트 설정
  - 기본 디렉토리 구조: `app/`, `components/`, `lib/`, `types/`
- **status**: pending

### P0-T0.2: Supabase 프로젝트 + DB 스키마
- **type**: setup
- **description**: Supabase 프로젝트 생성, 6개 테이블 마이그레이션
- **details**:
  - `@supabase/supabase-js` 설치
  - 테이블: `folder_tree`, `comment`, `reaction`, `message`, `theme`, `site_config`
  - RLS(Row Level Security) 정책: 읽기 공개, 쓰기 관리자만
  - Supabase Auth 설정 (관리자 이메일/비밀번호)
- **depends_on**: []
- **status**: pending

### P0-T0.3: 환경 설정 + Vercel 연동
- **type**: setup
- **description**: `.env.local` 설정, Vercel 프로젝트 생성 + 환경변수 등록
- **details**:
  - NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
  - Vercel 프로젝트 생성 + Git 연동
- **depends_on**: [P0-T0.1, P0-T0.2]
- **status**: pending

---

## P1: 공통 인프라

### P1-R1-T1: Auth 미들웨어
- **type**: backend-resource
- **resource**: auth
- **description**: Supabase Auth 기반 관리자 인증 미들웨어
- **details**:
  - `lib/supabase/server.ts` — 서버 컴포넌트용 Supabase 클라이언트
  - `lib/supabase/client.ts` — 클라이언트 컴포넌트용 Supabase 클라이언트
  - `middleware.ts` — `/admin/*` 라우트 보호
- **test**:
  - RED: 비로그인 시 `/admin` 접근 → 리다이렉트 확인
  - GREEN: 미들웨어 구현
- **depends_on**: [P0-T0.2]
- **status**: pending

### P1-S0-T1: 공통 레이아웃 + CSS 테마 시스템
- **type**: frontend-screen
- **screen**: 공통
- **description**: RootLayout + CSS Variables 테마 시스템 + 테마 토글 컴포넌트
- **details**:
  - `app/layout.tsx` — `data-theme` 속성, 폰트, 메타 태그
  - `styles/themes/` — dark, light, forest 3개 테마 CSS Variables
  - `components/ThemeToggle.tsx` — 테마 전환 버튼 (localStorage 저장)
  - Tailwind에서 CSS Variables 참조하도록 `tailwind.config.ts` 설정
- **test**:
  - RED: 테마 토글 시 `data-theme` 속성 변경 확인
  - GREEN: 테마 시스템 구현
- **depends_on**: [P0-T0.1]
- **status**: pending

---

## P2: 코어 퍼블리싱 엔진

### P2-R1-T1: folder_tree CRUD API
- **type**: backend-resource
- **resource**: folder_tree
- **description**: 폴더트리 전체 조회 + CRUD API (Route Handlers)
- **details**:
  - `app/api/tree/route.ts` — GET (전체 트리 조회, 재귀 빌드)
  - `app/api/tree/[id]/route.ts` — GET/PUT/DELETE (개별 노드)
  - `app/api/tree/reorder/route.ts` — PATCH (순서 변경)
  - `lib/tree.ts` — flat → nested 변환 유틸리티
  - `types/tree.ts` — FolderTreeNode 타입 정의
- **test**:
  - RED: GET /api/tree → 중첩 트리 구조 반환 확인
  - RED: POST /api/tree → 새 노드 생성 확인
  - GREEN: Route Handler 구현
- **depends_on**: [P0-T0.2]
- **parallel**: [P2-R2-T1, P2-R3-T1]
- **status**: pending

### P2-R2-T1: site_config API
- **type**: backend-resource
- **resource**: site_config
- **description**: 사이트 설정 조회/수정 API
- **details**:
  - `app/api/config/route.ts` — GET/PUT
  - Hero 타이틀, 서브타이틀, 카피, 소유자 이름
- **test**:
  - RED: GET /api/config → hero_title 포함 확인
  - GREEN: Route Handler 구현
- **depends_on**: [P0-T0.2]
- **parallel**: [P2-R1-T1, P2-R3-T1]
- **status**: pending

### P2-R3-T1: theme API
- **type**: backend-resource
- **resource**: theme
- **description**: 테마 목록 조회 + 활성 테마 변경 API
- **details**:
  - `app/api/themes/route.ts` — GET (전체 목록)
  - `app/api/themes/active/route.ts` — PUT (활성 테마 변경)
  - 시드 데이터: dark, light, forest 3개 빌트인 테마
- **test**:
  - RED: GET /api/themes → 3개 테마 반환 확인
  - GREEN: Route Handler 구현
- **depends_on**: [P0-T0.2]
- **parallel**: [P2-R1-T1, P2-R2-T1]
- **status**: pending

### P2-S1-T1: Hero 화면
- **type**: frontend-screen
- **screen**: hero
- **description**: 세계관 전달 Hero 섹션 (타이틀 + 카피 + D3.js 마인드맵 배경)
- **details**:
  - `app/page.tsx` — Hero 섹션 + Explorer 섹션 조합
  - `components/hero/HeroSection.tsx` — 타이틀/서브타이틀/카피
  - `components/hero/MindmapBackground.tsx` — D3.js force graph (폴더트리 1레벨)
  - `components/hero/ScrollCTA.tsx` — 탐색 유도 스크롤 버튼
  - 마인드맵 노드 클릭 → Explorer로 스크롤 + 해당 폴더 선택
- **test**:
  - RED: Hero 렌더링 시 site_config 데이터 표시 확인
  - RED: 마인드맵 노드 클릭 → Explorer 스크롤 확인
  - GREEN: 컴포넌트 구현
- **depends_on**: [P2-R1-T1, P2-R2-T1, P2-R3-T1, P1-S0-T1]
- **status**: pending

### P2-S1-V: Hero 검증
- **type**: verification
- **screen**: hero
- **checks**:
  - site_config → hero_title, hero_subtitle, hero_copy, owner_name 표시 확인
  - folder_tree → 마인드맵 노드 렌더링 확인
  - theme → CSS Variables 적용 확인
  - 테마 토글 → 마인드맵 색상 동기 변경 확인
- **depends_on**: [P2-S1-T1]
- **status**: pending

### P2-S2-T1: Explorer 탐색기 화면
- **type**: frontend-screen
- **screen**: explorer
- **description**: 인라인 아웃라인 트리 + 아코디언 마크다운 뷰
- **details**:
  - `components/explorer/OutlineTree.tsx` — 폴더/파일 아웃라인 (들여쓰기, 접기/펼치기)
  - `components/explorer/InlineMarkdown.tsx` — 파일 제목 아래 아코디언 마크다운 렌더링
  - `components/explorer/ReactionBadge.tsx` — 폴더/파일명 옆 반응 카운트 뱃지
  - `components/explorer/MindmapMini.tsx` — 우상단 플로팅 미니 마인드맵
  - `components/explorer/MessageFAB.tsx` — 우하단 메시지 플로팅 버튼
  - react-markdown + remark-gfm + rehype-highlight로 렌더링
  - 한 번에 여러 파일 펼침 가능 (아코디언 모드)
- **test**:
  - RED: 폴더 클릭 → 하위 항목 접기/펼치기 확인
  - RED: 파일 클릭 → 제목 아래 마크다운 콘텐츠 펼침 확인
  - RED: 파일 재클릭 → 마크다운 접힘 확인
  - GREEN: 컴포넌트 구현
- **depends_on**: [P2-R1-T1, P1-S0-T1]
- **status**: pending

### P2-S2-V: Explorer 검증
- **type**: verification
- **screen**: explorer
- **checks**:
  - folder_tree 전체 트리 렌더링 확인
  - 아코디언 펼침/접힘 동작 확인
  - 마크다운 GFM 렌더링 (테이블, 코드블록, 체크박스)
  - 테마 적용 확인
  - 미니 마인드맵 토글 확인
- **depends_on**: [P2-S2-T1]
- **status**: pending

---

## P3: 소셜 레이어

### P3-R1-T1: comment API
- **type**: backend-resource
- **resource**: comment
- **description**: 문장 선택 댓글 CRUD API
- **details**:
  - `app/api/comments/route.ts` — GET (file_id 필터), POST
  - `app/api/comments/[id]/route.ts` — DELETE (관리자)
  - offset_start, offset_end로 문장 위치 저장
- **test**:
  - RED: POST /api/comments → 댓글 생성 + selected_text 저장 확인
  - RED: GET /api/comments?file_id=xxx → 해당 파일 댓글만 반환
  - GREEN: Route Handler 구현
- **depends_on**: [P0-T0.2]
- **parallel**: [P3-R2-T1, P3-R3-T1]
- **status**: pending

### P3-R2-T1: reaction API
- **type**: backend-resource
- **resource**: reaction
- **description**: 키워드 반응 API
- **details**:
  - `app/api/reactions/route.ts` — GET (node_id별 카운트), POST
  - visitor_hash로 중복 방지 (같은 방문자 같은 노드 1회)
- **test**:
  - RED: POST /api/reactions → 반응 생성, 중복 시 409 확인
  - GREEN: Route Handler 구현
- **depends_on**: [P0-T0.2]
- **parallel**: [P3-R1-T1, P3-R3-T1]
- **status**: pending

### P3-R3-T1: message API
- **type**: backend-resource
- **resource**: message
- **description**: 주제 기반 메시지 API
- **details**:
  - `app/api/messages/route.ts` — GET (관리자, is_read 필터), POST (방문자)
  - `app/api/messages/[id]/read/route.ts` — PATCH (읽음 처리)
  - keyword_tags 배열 저장
- **test**:
  - RED: POST /api/messages → 메시지 생성 + keyword_tags 저장 확인
  - GREEN: Route Handler 구현
- **depends_on**: [P0-T0.2]
- **parallel**: [P3-R1-T1, P3-R2-T1]
- **status**: pending

### P3-S1-T1: 문장 선택 댓글 시스템
- **type**: frontend-screen
- **screen**: comment-panel + explorer 통합
- **description**: 텍스트 드래그 → 댓글 팝오버 → 슬라이드 패널
- **details**:
  - `components/social/CommentPopover.tsx` — Web Selection API로 텍스트 선택 감지, 팝오버 표시
  - `components/social/CommentPanel.tsx` — 우측 슬라이드 패널 (선택 문장 + 댓글 목록 + 입력 폼)
  - `components/social/CommentHighlight.tsx` — 댓글 달린 문장 하이라이트 렌더링
  - Explorer InlineMarkdown에 하이라이트 레이어 통합
- **test**:
  - RED: 마크다운 텍스트 드래그 → 팝오버 표시 확인
  - RED: 댓글 작성 → 목록 반영 + 하이라이트 표시 확인
  - RED: 하이라이트 클릭 → 패널 열림 + 기존 댓글 표시 확인
  - GREEN: 컴포넌트 구현
- **depends_on**: [P3-R1-T1, P2-S2-T1]
- **status**: pending

### P3-S1-V: 댓글 시스템 검증
- **type**: verification
- **screen**: comment-panel
- **checks**:
  - 텍스트 선택 → 팝오버 → 댓글 작성 전체 플로우
  - 빈 댓글 제출 방지
  - 하이라이트 클릭 → 기존 댓글 조회
  - 패널 닫기 (X 버튼, 외부 클릭)
- **depends_on**: [P3-S1-T1]
- **status**: pending

### P3-S2-T1: 키워드 반응 + 주제 메시지
- **type**: frontend-screen
- **screen**: explorer + topic-message 통합
- **description**: 반응 버튼 + 주제 메시지 모달
- **details**:
  - `components/social/ReactionButton.tsx` — "관심 있어요" 버튼 + 카운트 (visitor_hash 쿠키 기반)
  - `components/social/TopicMessageModal.tsx` — 키워드 태그 자동 추천 + 메시지 폼 + 발신자 정보
  - Explorer의 ReactionBadge + MessageFAB과 연결
- **test**:
  - RED: 반응 버튼 클릭 → 카운트 +1, 중복 클릭 시 변동 없음
  - RED: FAB 클릭 → 모달 열림, 현재 폴더/파일 키워드 자동 태그
  - RED: 메시지 전송 → 성공 토스트, 이름 필수 검증
  - GREEN: 컴포넌트 구현
- **depends_on**: [P3-R2-T1, P3-R3-T1, P2-S2-T1]
- **status**: pending

### P3-S2-V: 반응 + 메시지 검증
- **type**: verification
- **screen**: topic-message
- **checks**:
  - 반응 중복 방지 (같은 브라우저 같은 노드)
  - 키워드 태그 자동 추천 정확성
  - 이름 필수, 이메일 선택 검증
  - 메시지 전송 성공/실패 UI
- **depends_on**: [P3-S2-T1]
- **status**: pending

---

## P4: 관리자

### P4-S1-T1: 관리자 에디터
- **type**: frontend-screen
- **screen**: admin-editor
- **description**: 폴더트리 CRUD + 마크다운 에디터 + 실시간 프리뷰
- **details**:
  - `app/admin/page.tsx` — 관리자 레이아웃 (사이드바 + 메인)
  - `components/admin/AdminTree.tsx` — 드래그&드롭 폴더트리 (@dnd-kit/core)
  - `components/admin/AdminToolbar.tsx` — 새 폴더/파일, 삭제, 저장 버튼
  - `components/admin/MarkdownEditor.tsx` — CodeMirror 마크다운 에디터
  - `components/admin/PreviewPane.tsx` — 실시간 마크다운 프리뷰
  - `components/admin/ThemeSelector.tsx` — 테마 드롭다운
  - 자동 저장 (2초 디바운스)
  - 이미지 드래그&드롭 업로드 (Supabase Storage)
  - 우클릭 컨텍스트 메뉴: 새 폴더, 새 파일, 이름 변경, 삭제
- **test**:
  - RED: 새 폴더 생성 → 트리에 추가 + Supabase 저장
  - RED: 파일 선택 → 에디터 로드 + 프리뷰 동기화
  - RED: 드래그&드롭 → 순서/위치 변경 + Supabase 업데이트
  - RED: 삭제 → 확인 모달 → 트리 반영
  - GREEN: 컴포넌트 구현
- **depends_on**: [P2-R1-T1, P2-R3-T1, P1-R1-T1]
- **status**: pending

### P4-S1-V: 관리자 에디터 검증
- **type**: verification
- **screen**: admin-editor
- **checks**:
  - 비로그인 접근 → 리다이렉트
  - 폴더/파일 CRUD 전체 플로우
  - 드래그&드롭 순서 변경 → 메인 페이지 마인드맵 반영
  - 에디터 → 프리뷰 실시간 동기화
  - 테마 선택 → 프리뷰 반영
  - 자동 저장 동작
- **depends_on**: [P4-S1-T1]
- **status**: pending

### P4-S2-T1: 관리자 대시보드
- **type**: frontend-screen
- **screen**: admin-dashboard
- **description**: 반응 통계 + 댓글 관리 + 메시지 인박스
- **details**:
  - `app/admin/dashboard/page.tsx`
  - `components/admin/ReactionChart.tsx` — 키워드별 반응 수 바 차트
  - `components/admin/CommentList.tsx` — 최근 댓글 (파일명, 선택 문장, 내용, 삭제)
  - `components/admin/MessageInbox.tsx` — 키워드 태그별 그룹 메시지 (읽음/안읽음)
- **test**:
  - RED: 대시보드 로드 → 반응 차트 + 댓글 목록 + 메시지 인박스 표시
  - RED: 댓글 삭제 → 확인 모달 → 목록 반영
  - RED: 메시지 클릭 → 읽음 처리 + 상세 확장
  - GREEN: 컴포넌트 구현
- **depends_on**: [P3-R1-T1, P3-R2-T1, P3-R3-T1, P1-R1-T1]
- **status**: pending

### P4-S2-V: 관리자 대시보드 검증
- **type**: verification
- **screen**: admin-dashboard
- **checks**:
  - 반응 차트 데이터 정확성
  - 댓글 삭제 → Explorer 하이라이트 제거 연동
  - 메시지 읽음/안읽음 상태 전환
  - 키워드 태그 필터 동작
- **depends_on**: [P4-S2-T1]
- **status**: pending

---

## P5: 폴리시 + 배포

### P5-T1: 시드 데이터 (지훈님 폴더트리)
- **type**: task
- **description**: 초기 콘텐츠 시드 — 폴더트리 + site_config + 테마
- **details**:
  - `scripts/seed.ts` 또는 Supabase SQL 시드
  - 폴더 구조: README.md, 나는_이런_사람.md, 지금_나의_질문들.md, 찾는_사람.md, 건강/, 과학/, 영성/, 리더십/, 책이_나를_바꾼_순간들.md, 실패들.md
  - site_config: hero_title="연결의 숲", hero_subtitle, hero_copy, owner_name="안지훈"
  - 3개 빌트인 테마 (dark, light, forest)
- **depends_on**: [P0-T0.2]
- **status**: pending

### P5-T2: 반응형 + 모바일
- **type**: task
- **description**: 모바일 최적화
- **details**:
  - Explorer: 전체 화면, 들여쓰기 축소
  - Inline Markdown: 풀 너비 펼침
  - Mindmap Mini: 모바일에서 숨김
  - Admin: 모바일 기본 대응 (반응형 그리드)
- **depends_on**: [P2-S2-T1, P3-S1-T1, P4-S1-T1]
- **status**: pending

### P5-T3: SEO + 성능 최적화
- **type**: task
- **description**: 메타 태그, OG 이미지, 폰트 최적화, 이미지 lazy load
- **details**:
  - `app/layout.tsx` — 메타 태그, OG 이미지
  - next/font로 Pretendard + JetBrains Mono 최적화
  - D3.js 마인드맵 dynamic import (code splitting)
  - 마크다운 이미지 lazy load
- **depends_on**: [P2-S1-T1, P2-S2-T1]
- **status**: pending

### P5-T4: Vercel 배포 + 도메인
- **type**: task
- **description**: 프로덕션 배포 + 환경변수 설정
- **details**:
  - Vercel 환경변수 등록 (Supabase URL, Key)
  - 빌드 확인 + 배포
  - (선택) 커스텀 도메인 연결
- **depends_on**: [P5-T1, P5-T2, P5-T3]
- **status**: pending

---

## 의존성 그래프 요약

```
P0 (Setup)
 ├── P0-T0.1 ──┐
 ├── P0-T0.2 ──┤──→ P0-T0.3
 │             │
 │    ┌───────┘
 │    ▼
P1 (Common)
 ├── P1-R1-T1 (Auth)
 ├── P1-S0-T1 (Layout + Theme)
 │
 ▼
P2 (Core Publishing) ─── P2-R1/R2/R3 병렬 → P2-S1/S2 순차
 │
 ▼
P3 (Social) ─── P3-R1/R2/R3 병렬 → P3-S1/S2 순차
 │
 ▼
P4 (Admin) ─── P4-S1 → P4-S2 (병렬 가능)
 │
 ▼
P5 (Polish) ─── P5-T1/T2/T3 병렬 → P5-T4
```

## 태스크 통계

| 유형 | 수량 |
|------|------|
| Setup (P0) | 3 |
| Backend Resource (R) | 6 |
| Frontend Screen (S) | 7 |
| Verification (V) | 6 |
| Polish Task (T) | 4 |
| **총 태스크** | **26** |
