import { useKpiSummary } from '../hooks/useDashboardData'
import {
  formatFullKRW,
  formatPct,
  formatQty,
  formatShortKRW,
} from '../lib/format'
import type { Filters } from '../types'

type Props = { filters: Filters }

function Delta({ pct }: { pct: number | null }) {
  if (pct === null) {
    return (
      <span className="text-xs text-neutral-400">직전 기간 데이터 없음</span>
    )
  }

  const up = pct > 0
  const flat = pct === 0

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium ${
        flat ? 'text-neutral-500' : up ? 'text-emerald-700' : 'text-red-700'
      }`}
    >
      {/* 색만으로 방향을 전달하지 않도록 기호를 함께 쓴다 */}
      <span aria-hidden>{flat ? '—' : up ? '▲' : '▼'}</span>
      {formatPct(pct)}
      <span className="font-normal text-neutral-400">직전 기간 대비</span>
    </span>
  )
}

function Card({
  label,
  value,
  title,
  footer,
}: {
  label: string
  value: string
  title?: string
  footer: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5">
      <p className="text-xs font-medium text-neutral-500">{label}</p>
      <p
        title={title}
        className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900 tabular-nums"
      >
        {value}
      </p>
      <div className="mt-2">{footer}</div>
    </div>
  )
}

export function KpiCards({ filters }: Props) {
  const { data, isPending, error } = useKpiSummary(filters)

  if (isPending) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-[116px] animate-pulse rounded-xl bg-neutral-100"
            aria-label="불러오는 중"
          />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
        {error.message}
      </div>
    )
  }

  const revenue = data?.revenue ?? 0

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card
        label="총 매출"
        value={formatShortKRW(revenue)}
        title={formatFullKRW(revenue)}
        footer={<Delta pct={data?.revenue_change_pct ?? null} />}
      />
      <Card
        label="판매 수량"
        value={formatQty(data?.qty ?? 0)}
        footer={
          <span className="text-xs text-neutral-400">선택 기간 합계</span>
        }
      />
      <Card
        label="평균 단가"
        value={formatShortKRW(data?.avg_unit_price ?? 0)}
        title={formatFullKRW(data?.avg_unit_price ?? 0)}
        footer={<span className="text-xs text-neutral-400">대당 평균</span>}
      />
      <Card
        label="매출 1위 대리점"
        value={data?.top_dealer ?? '—'}
        footer={
          <span className="text-xs text-neutral-400">
            {data?.top_dealer_revenue
              ? formatShortKRW(data.top_dealer_revenue)
              : '해당 없음'}
          </span>
        }
      />
    </div>
  )
}
