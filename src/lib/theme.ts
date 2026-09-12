/**
 * 차트 색상 토큰.
 * 카테고리 5색은 검증 스크립트를 통과한 순서대로 고정 배정한다.
 * 순서를 바꾸거나 순환시키지 말 것 — 색맹 대비 분리가 이 순서에 의존한다.
 */

export const SURFACE = '#fcfcfb'
export const TEXT_PRIMARY = '#0b0b0b'
export const TEXT_SECONDARY = '#52514e'
export const TEXT_MUTED = '#85837c'
export const GRID = '#e8e7e3'

/** 단일 계열 차트의 기본 색 (categorical slot 1) */
export const SERIES_PRIMARY = '#2a78d6'

/** 카테고리 고정 배정 — 엔티티를 따라가며, 순위에 따라 바뀌지 않는다 */
const CATEGORICAL = [
  '#2a78d6', // 1 blue
  '#eb6834', // 2 orange
  '#1baf7a', // 3 aqua
  '#eda100', // 4 yellow
  '#e87ba4', // 5 magenta
  '#008300', // 6 green
  '#4a3aa7', // 7 violet
  '#e34948', // 8 red
] as const

export const CATEGORY_ORDER = [
  '냉장고',
  '세탁기',
  'TV',
  '에어컨',
  '생활가전',
] as const

const CATEGORY_COLOR = new Map<string, string>(
  CATEGORY_ORDER.map((name, i) => [name, CATEGORICAL[i]]),
)

/** 카테고리명 → 고정 색. 미등록 카테고리는 남은 슬롯을 순서대로 사용 */
export function categoryColor(name: string): string {
  return CATEGORY_COLOR.get(name) ?? CATEGORICAL[CATEGORY_ORDER.length]
}

/** 히트맵용 단일 색상 순차 램프 (blue, 밝음 → 어두움) */
const SEQUENTIAL = [
  '#cde2fb',
  '#b7d3f6',
  '#9ec5f4',
  '#86b6ef',
  '#6da7ec',
  '#5598e7',
  '#3987e5',
  '#2a78d6',
  '#256abf',
  '#1c5cab',
] as const

/** 0~1 사이 비율을 순차 램프의 한 단계로 변환 */
export function sequentialColor(ratio: number): string {
  if (!Number.isFinite(ratio) || ratio <= 0) return '#f2f1ee'
  const idx = Math.min(
    SEQUENTIAL.length - 1,
    Math.floor(ratio * SEQUENTIAL.length),
  )
  return SEQUENTIAL[idx]
}

/** 히트맵 셀 배경이 어두우면 흰 글자로 뒤집는다 */
export function sequentialTextColor(ratio: number): string {
  return ratio > 0.6 ? '#ffffff' : TEXT_PRIMARY
}

export const POSITIVE = '#0a7c42'
export const NEGATIVE = '#c5302f'
