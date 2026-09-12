/** 차트 축·레이블용 축약 표기 — 2,700,000,000 → "27.0억" */
export function formatShortKRW(value: number): string {
  const n = Number(value) || 0
  const abs = Math.abs(n)

  if (abs >= 1_0000_0000_0000) return `${(n / 1_0000_0000_0000).toFixed(1)}조`
  if (abs >= 1_0000_0000) return `${(n / 1_0000_0000).toFixed(1)}억`
  if (abs >= 1_0000) return `${Math.round(n / 1_0000).toLocaleString('ko-KR')}만`
  return n.toLocaleString('ko-KR')
}

/** 툴팁·테이블용 전체 표기 — 2,700,000,000 → "2,700,000,000원" */
export function formatFullKRW(value: number): string {
  return `${(Number(value) || 0).toLocaleString('ko-KR')}원`
}

export function formatQty(value: number): string {
  return `${(Number(value) || 0).toLocaleString('ko-KR')}대`
}

export function formatPct(value: number | null): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  return `${value > 0 ? '+' : ''}${Number(value).toFixed(1)}%`
}

/** '2026-03-01' → '3월' */
export function formatMonthLabel(iso: string): string {
  const month = Number(iso.slice(5, 7))
  return `${month}월`
}

/** '2026-03-01' → '2026.03' */
export function formatMonthFull(iso: string): string {
  return `${iso.slice(0, 4)}.${iso.slice(5, 7)}`
}

export function formatDate(iso: string): string {
  return iso.replaceAll('-', '.')
}

/** Postgres numeric 은 문자열로 올 수 있으므로 항상 숫자로 좁힌다 */
export function toNumber(value: unknown): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}
