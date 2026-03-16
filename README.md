# 🚨 Emergency Takeover Room — 긴급 인수인계 상황실

> 사라진 개발자의 메모와 UI 플로우만 남겨진 프로젝트를 되살리다.

**월간 해커톤 : 긴급 인수인계** 출품작으로, 제공된 문서(메모·UI 흐름도·JSON 데이터)를 기반으로 해커톤 플랫폼 웹서비스를 완성하고 **인수인계 상황실** 테마로 확장한 Next.js 앱입니다.

---

## ✨ 핵심 기능

| 카테고리 | 구현 내용 |
|----------|----------|
| **해커톤 탐색** | 상태 필터(진행중·예정·종료), 태그 검색, 그리드/리스트 뷰, 북마크 |
| **해커톤 상세** | 7개 탭(개요·평가·일정·상금·팀·제출·리더보드) 완전 구현 |
| **팀 빌딩** | 팀 목록 조회, 모집 필터, 팀 생성 폼, 합류/탈퇴 기능 |
| **작전실 (Camp)** | 현황판·멤버·제출 탭, 제출 스튜디오, 마감 카운트다운 |
| **랭킹** | 공식 리더보드 + 브라우저 데모 제출 랭킹 동시 표시 |
| **인수인계 자료실** | 원본 메모·UI 흐름도 이미지 뷰어, 라이트박스 확대 |
| **명세 감사 (Insights)** | 구현 체크리스트, 완성 점수, 데이터 스냅샷 |
| **비교·북마크** | 해커톤 최대 3개 비교, 북마크 관리 |
| **알림 시스템** | 알림 벨, 읽음/안읽음 토글, localStorage 영속화 |
| **다크 모드** | 시스템 테마 자동 감지 + 수동 토글 |
| **검색** | Ctrl+K 커맨드 팔레트 |

## 🎨 확장 아이디어 (차별화 포인트)

1. **"인수인계 상황실" 테마** — 대회 컨셉 자체를 앱의 UX 스토리로 녹임
2. **인수인계 자료실** (`/source`) — 사라진 개발자의 흔적(메모·UI 플로우)을 앱 내에서 직접 열람
3. **알림 벨 시스템** — 팀 모집, 마감 임박 등 실시간 알림
4. **팀 생성 폼** — 직접 팀을 만들어 팀원 모집 가능
5. **제출 스튜디오** — 단계별 제출물 작성, 완성도 계산, 데모 랭킹 연동
6. **해커톤 비교** — 최대 3개 해커톤 상세 비교표

## 📍 라우트

| 경로 | 설명 |
|------|------|
| `/` | 긴급 인수인계 상황실 메인 |
| `/hackathons` | 해커톤 탐색 |
| `/hackathons/[slug]` | 해커톤 상세 (7개 탭) |
| `/teams` | 팀 목록 & 생성 |
| `/camp` | 작전실 (Operation Room) |
| `/rankings` | 공식 + 데모 랭킹 |
| `/source` | 인수인계 자료실 |
| `/insights` | 명세 대비 구현 감사 |
| `/bookmarks` | 북마크 관리 |
| `/compare` | 해커톤 비교 |

## 🛠 기술 스택

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4 + CSS Custom Properties
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Data**: 정적 JSON + localStorage (서버/DB 없이 완전 동작)
- **Deploy**: Vercel

## 🚀 실행 방법

```bash
# 의존성 설치
npm install

# 개발 서버
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버
npm start
```

## 📂 프로젝트 구조

```
src/
├── app/              # Next.js App Router 페이지
│   ├── hackathons/   # 해커톤 목록·상세
│   ├── teams/        # 팀 목록·생성
│   ├── camp/         # 작전실
│   ├── rankings/     # 랭킹 (→ leaderboard)
│   ├── source/       # 인수인계 자료실
│   ├── insights/     # 명세 감사
│   ├── bookmarks/    # 북마크
│   └── compare/      # 비교
├── components/       # 재사용 컴포넌트
├── context/          # React Context (User)
├── data/             # 정적 JSON 데이터
├── hooks/            # Custom Hooks
├── lib/              # 유틸리티, 데이터 서비스, 스토리지
└── types/            # TypeScript 타입 정의
```

## 📊 데이터

- 기본 데이터: `src/data/*.json` (해커톤 3개, 팀 7개, 리더보드 3개)
- 제공 자료 이미지: `public/source/` (메모, UI 흐름도)
- 사용자 데이터: `localStorage`에 저장 (북마크, 팀 참여, 제출 초안, 알림 등)
