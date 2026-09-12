# 대리점 매출 대시보드

서울 시내 10개 대리점의 가전 품목 매출을 한 화면에서 보는 읽기 전용 대시보드.
Vite + React + Supabase, Vercel 정적 배포.

> 요구사항 정의는 [docs/PRD.md](docs/PRD.md) 참조.

---

## 1. Supabase 설정

[supabase.com](https://supabase.com) 에서 프로젝트를 만든 뒤,
**SQL Editor** 에서 아래 파일을 **번호 순서대로** 실행한다.

| 순서 | 파일 | 내용 |
|---|---|---|
| 1 | `supabase/01_dealerships.sql` | 대리점 10개 |
| 2 | `supabase/02_products.sql` | 품목 10종 |
| 3 | `supabase/03_sales.sql` | 매출 팩트 + 시드 약 9,000행 |
| 4 | `supabase/04_rpc_functions.sql` | 집계 RPC 함수 8종 |

3번 실행 후 확인 쿼리가 다음과 비슷하게 나오면 정상이다.

```
행수   시작          종료          총매출
9,0xx  2026-01-01   2026-09-12    xx,xxx,xxx,xxx
```

4번 실행 후 동작 확인:

```sql
select * from get_kpi_summary();
select * from get_sales_by_dealer();
```

---

## 2. 환경변수

`.env.example` 을 복사해 `.env.local` 을 만들고 값을 채운다.

```bash
cp .env.example .env.local
```

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

두 값은 Supabase 대시보드 **Settings → API** 에서 확인한다.

> **주의**: `VITE_` 접두사가 붙은 값은 빌드 결과물에 그대로 노출된다.
> `service_role` key 는 절대 넣지 말 것. RLS 가 통째로 무력화된다.
> 이 프로젝트는 `anon` key 만 사용하며, RLS 는 SELECT 만 허용한다.

---

## 3. 로컬 실행

```bash
npm install
npm run dev
```

http://localhost:5173

| 명령 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 |
| `npm run build` | 타입체크 + 프로덕션 빌드 (`dist/`) |
| `npm run preview` | 빌드 결과 미리보기 |
| `npm run typecheck` | 타입체크만 |

---

## 4. Vercel 배포

1. GitHub 리포지토리에 push
2. Vercel → **New Project** → 리포지토리 선택
3. Framework Preset 은 **Vite** 로 자동 인식됨
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. **Environment Variables** 에 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` 등록
5. Deploy

이후 `main` 브랜치에 push 하면 자동 재배포된다.

---

## 5. 구조

```
src/
├── lib/
│   ├── supabase.ts      Supabase 클라이언트 + RPC 래퍼
│   ├── format.ts        통화·수량·날짜 표기
│   └── theme.ts         차트 색상 토큰 (검증된 팔레트)
├── hooks/
│   ├── useFilters.ts        필터 상태 ↔ URL 동기화
│   └── useDashboardData.ts  React Query 기반 데이터 훅
├── components/
│   ├── Header / FilterBar / MultiSelect
│   ├── KpiCards             KPI 카드 4종
│   ├── ChartCard            로딩·에러·빈상태 공통 래퍼
│   ├── TooltipBox           차트 공통 툴팁
│   ├── MonthlyTrendChart    월별 추이
│   ├── DealerRankChart      대리점 순위 (클릭 시 필터링)
│   ├── CategoryDonut        카테고리 구성
│   ├── ProductTopChart      품목 Top 10
│   ├── DowChart             요일별 평균
│   ├── DealerCategoryHeatmap 대리점 × 카테고리
│   └── DetailTable          정렬 가능한 상세 테이블
└── App.tsx
```

### 설계 원칙 두 가지

**집계는 Postgres 에서 한다.** PostgREST 는 `GROUP BY` 를 지원하지 않으므로,
필터를 파라미터로 받는 RPC 함수로 집계 엔드포인트를 구성했다.
브라우저는 원시 행을 받지 않고 집계된 수십 행만 받는다.

**필터 상태는 URL 에 있다.** 기간·대리점·카테고리 선택이 쿼리스트링에 반영되므로,
링크를 복사해 전달하면 상대방이 같은 화면을 본다.

---

## 6. 데이터 모델

```
dealerships (10) ──┐
                   ├──< sales (약 9,000행)
products    (10) ──┘
```

매출은 **일별 입도**로 저장한다. 월별로 집계해 저장하면 요일 패턴과 주간 추이를
영영 볼 수 없고, 거래 건별로 저장하면 가상 데이터 생성 비용 대비 얻는 것이 적다.

`sales.unit_price` 는 기준가가 아니라 **실거래가 스냅샷**이다.
품목 가격이 바뀌어도 과거 매출이 소급 왜곡되지 않는다.
`amount` 는 `qty * unit_price` 생성 컬럼이라 수량·단가와 금액이 어긋날 수 없다.

---

## 7. 확장

| 항목 | 필요 작업 |
|---|---|
| 이익률 분석 | `products.unit_cost` 이미 보유 — 집계 함수만 추가 |
| 자치구 지도 | `dealerships` 에 `lat`/`lng` 컬럼 추가 |
| 직영/가맹 비교 | `dealerships` 에 `channel` 컬럼 추가 |
| 대리점 30개로 확대 | 시드만 교체, 스키마 변경 불필요 |

---

데이터는 전부 시연용 가상 데이터입니다.
