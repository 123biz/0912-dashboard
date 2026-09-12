import { useMemo, useState } from 'react'
import { useDealerGeoSales } from '../hooks/useDashboardData'
import {
  MAP_HEIGHT,
  MAP_WIDTH,
  SEOUL_DISTRICTS,
  project,
} from '../data/seoulDistricts'
import { formatFullKRW, formatQty, formatShortKRW } from '../lib/format'
import { SERIES_PRIMARY, TEXT_MUTED, TEXT_SECONDARY } from '../lib/theme'
import { ChartCard } from './ChartCard'
import type { DealerGeoSales, Filters } from '../types'

const MAX_RADIUS = 40
const MIN_RADIUS = 9

/**
 * 매출을 버블 '넓이'에 대응시킨다.
 * 반지름에 직접 비례시키면 넓이가 제곱으로 커져 큰 값이 과장된다.
 */
function radiusFor(value: number, max: number): number {
  if (max <= 0) return MIN_RADIUS
  return MIN_RADIUS + Math.sqrt(value / max) * (MAX_RADIUS - MIN_RADIUS)
}

type Placed = DealerGeoSales & { x: number; y: number; r: number }

type Props = {
  filters: Filters
  onSelectDealer: (id: number) => void
}

export function SeoulMap({ filters, onSelectDealer }: Props) {
  const { data = [], isPending, isFetching, error, refetch } =
    useDealerGeoSales(filters)
  const [hovered, setHovered] = useState<Placed | null>(null)

  const { placed, max } = useMemo(() => {
    const peak = data.reduce((m, d) => Math.max(m, d.revenue), 0)
    const rows: Placed[] = data.map((d) => {
      const { x, y } = project(d.lng, d.lat)
      return { ...d, x, y, r: radiusFor(d.revenue, peak) }
    })
    // 큰 버블을 먼저 그려 작은 버블이 위로 오게 한다 (클릭 가능하도록)
    rows.sort((a, b) => b.r - a.r)
    return { placed: rows, max: peak }
  }, [data])

  // 상위 3곳만 직접 레이블 — 모든 점에 숫자를 붙이지 않는다
  const labelled = useMemo(
    () => new Set([...placed].sort((a, b) => b.revenue - a.revenue).slice(0, 3).map((d) => d.dealership_id)),
    [placed],
  )

  return (
    <ChartCard
      title="대리점 위치별 매출"
      subtitle="원의 넓이가 매출 규모입니다. 클릭하면 해당 대리점으로 필터링됩니다"
      isLoading={isPending}
      isFetching={isFetching}
      error={error}
      isEmpty={placed.length === 0}
      onRetry={() => void refetch()}
      height={440}
    >
      <div className="relative h-full w-full">
        <svg
          viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
          className="h-full w-full"
          role="img"
          aria-label="서울 자치구 지도 위에 대리점별 매출을 원 크기로 표시한 지도"
        >
          {/* 자치구 경계 — 배경이므로 눈에 띄지 않게 */}
          <g>
            {SEOUL_DISTRICTS.map((d) => (
              <path
                key={d.name}
                d={d.d}
                fill="#f1f0ed"
                stroke="#ffffff"
                strokeWidth={1.5}
              />
            ))}
          </g>

          {/* 대리점 버블 */}
          <g>
            {placed.map((d) => {
              const isHovered = hovered?.dealership_id === d.dealership_id
              return (
                <g
                  key={d.dealership_id}
                  className="cursor-pointer"
                  onMouseEnter={() => setHovered(d)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => onSelectDealer(d.dealership_id)}
                >
                  <circle
                    cx={d.x}
                    cy={d.y}
                    r={d.r}
                    fill={SERIES_PRIMARY}
                    fillOpacity={isHovered ? 0.62 : 0.42}
                    stroke="#ffffff"
                    strokeWidth={2}
                  />
                  <circle cx={d.x} cy={d.y} r={2.5} fill={SERIES_PRIMARY} />
                  <title>{`${d.dealership} — ${formatShortKRW(d.revenue)}`}</title>
                </g>
              )
            })}
          </g>

          {/* 상위 대리점 직접 레이블 */}
          <g pointerEvents="none">
            {placed
              .filter((d) => labelled.has(d.dealership_id))
              .map((d) => (
                <text
                  key={d.dealership_id}
                  x={d.x}
                  y={d.y + d.r + 15}
                  textAnchor="middle"
                  fontSize={13}
                  fill={TEXT_SECONDARY}
                  fontWeight={600}
                  stroke="#ffffff"
                  strokeWidth={3}
                  paintOrder="stroke"
                >
                  {d.dealership.replace('대리점', '')}{' '}
                  {formatShortKRW(d.revenue)}
                </text>
              ))}
          </g>

          {/* 크기 범례 */}
          <g transform={`translate(24, ${MAP_HEIGHT - 24})`} pointerEvents="none">
            {[1, 0.45].map((ratio, i) => {
              const r = radiusFor(max * ratio, max)
              return (
                <g key={ratio} transform={`translate(${i * 96}, 0)`}>
                  <circle
                    cx={MAX_RADIUS}
                    cy={-r}
                    r={r}
                    fill="none"
                    stroke={TEXT_MUTED}
                    strokeWidth={1}
                  />
                  <text
                    x={MAX_RADIUS}
                    y={12}
                    textAnchor="middle"
                    fontSize={11}
                    fill={TEXT_MUTED}
                  >
                    {formatShortKRW(max * ratio)}
                  </text>
                </g>
              )
            })}
          </g>
        </svg>

        {/* 툴팁 — SVG 밖 HTML 로 그려 글꼴과 여백을 다른 차트와 맞춘다 */}
        {hovered && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full"
            style={{
              left: `${(hovered.x / MAP_WIDTH) * 100}%`,
              top: `${(hovered.y / MAP_HEIGHT) * 100}%`,
            }}
          >
            <div className="mb-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 shadow-md">
              <p className="mb-1.5 whitespace-nowrap text-xs font-semibold text-neutral-900">
                {hovered.dealership}
                <span className="ml-1.5 font-normal text-neutral-400">
                  {hovered.district}
                </span>
              </p>
              <dl className="space-y-0.5">
                <div className="flex items-center gap-3 text-xs">
                  <dt className="text-neutral-500">매출</dt>
                  <dd className="ml-auto font-medium tabular-nums text-neutral-900">
                    {formatFullKRW(hovered.revenue)}
                  </dd>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <dt className="text-neutral-500">수량</dt>
                  <dd className="ml-auto tabular-nums text-neutral-700">
                    {formatQty(hovered.qty)}
                  </dd>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <dt className="text-neutral-500">비중</dt>
                  <dd className="ml-auto tabular-nums text-neutral-700">
                    {hovered.share_pct}%
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}
      </div>
    </ChartCard>
  )
}
