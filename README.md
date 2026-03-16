# 🚨 Emergency Takeover Room — 긴급 인수인계 상황실

> 사라진 개발자의 메모와 UI 플로우만 남겨진 프로젝트를 되살리다.

**월간 해커톤 : 긴급 인수인계** 출품작으로, 제공된 문서(메모·UI 흐름도·JSON 데이터)를 기반으로 해커톤 플랫폼 웹서비스를 완성하고 **인수인계 상황실** 테마로 확장한 Next.js 앱입니다.

🌐 **배포 URL**: [https://emergency-takeover-hackathon.vercel.app/](https://emergency-takeover-hackathon.vercel.app/)

> ※ 외부 API/DB 없음. 별도 키 불필요. URL 접속만으로 모든 기능 확인 가능.

---

## ✨ 핵심 기능

| 카테고리 | 구현 내용 |
|----------|----------|
| **해커톤 탐색** | 상태 필터(진행중·예정·종료), 키워드 검색, 그리드/리스트 뷰, 북마크 |
| **해커톤 상세** | 7개 탭(개요·평가·일정·상금·팀·제출·리더보드) 완전 구현 |
| **팀 빌딩** | 팀 목록 조회, 팀 생성 폼, 합류/탈퇴(인원수 즉시 반영), **역할 기반 팀 추천 매칭** |
| **AI 제출 피드백** | 제출 초안 저장 시 **자동 품질 분석** — 의미없는 텍스트 감지, URL 검증, A~D 등급 부여 |
| **파일 업로드** | PDF/문서 **드래그앤드롭** 업로드 (base64, 2MB 제한) + URL 병행 입력 |
| **활동 피드** | 메인 페이지 **실시간 타임라인** (팀 생성·순위 달성·제출 이벤트) |
| **분석 대시보드** | 점수 분포 바 차트, 역할 수요 분석 차트, 구현 체크리스트 |
| **작전실 (Camp)** | 현황판·멤버·제출 탭, 제출 스튜디오, 마감 카운트다운 |
| **랭킹** | 공식 리더보드 + 브라우저 데모 제출 랭킹 동시 표시 |
| **인수인계 자료실** | 원본 메모·UI 흐름도 이미지 뷰어, 라이트박스 확대 |
| **비교·북마크** | 해커톤 비교 Side-by-Side, 북마크 관리 |
| **알림 시스템** | 알림 벨, 읽음/안읽음 토글, localStorage 영속화 |
| **다크 모드** | 시스템 테마 자동 감지 + 수동 토글 |
| **커맨드 팔레트** | Ctrl+K 퍼지 검색 → 전체 페이지 빠른 이동 |

## 🎨 확장 아이디어 (차별화 포인트)

1. **"인수인계 상황실" 테마** — 대회 컨셉 자체를 앱의 UX 스토리로 녹임
2. **AI 제출물 피드백** — 의미없는 텍스트 감지, URL 유효성 검증, 품질 등급(A~D) 자동 부여
3. **역할 기반 팀 추천 매칭** — 한국어↔영어 역할 자동 매핑, 매칭도 순 정렬
4. **데이터 시각화 대시보드** — 점수 분포 차트, 역할 수요 분석
5. **활동 피드 타임라인** — 메인 페이지에 실시간 이벤트 표시
6. **파일 드래그앤드롭** — PDF/문서 직접 업로드 지원
7. **인수인계 자료실** (`/source`) — 사라진 개발자의 흔적(메모·UI 플로우) 앱 내 열람
8. **제출 스튜디오** — 단계별 제출물 작성, 완성도 계산, 데모 랭킹 연동

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

## ♿ 접근성 & 완성도

- **반응형**: 모바일 / 태블릿 / 데스크톱 완전 반응형
- **접근성**: ARIA 레이블, aria-pressed/expanded, 키보드 네비게이션, skip-to-content
- **에러 처리**: 에러 바운더리(error.tsx), 커스텀 404, 빈 상태 UI, 하이드레이션 스켈레톤
- **SEO**: OpenGraph 태그, 메타 설명, robots 설정
- **애니메이션**: Framer Motion 부드러운 전환
