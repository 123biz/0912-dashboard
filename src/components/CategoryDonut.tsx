import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { useSalesByCategory } from '../hooks/useDashboardData'
import { formatFullKRW, formatQty, formatShortKRW } from '../lib/format'
import { categoryColor } from '../lib/theme'
import { ChartCard } from './ChartCard'
import { TooltipBox, type RechartsTooltipProps } from './TooltipBox'
import type { CategorySales, Filters } from '../types'

function DonutTooltip({ active, payload }: RechartsTooltipProps) {
  if (!active || !payload?.length) return null
  const row = payload[0]?.payload as CategorySales | undefined
  if (!row) return null

  return (
    <TooltipBox
      title={row.category}
      rows={[
        {
          label: '매출',
          value: formatFullKRW(row.revenue),
          color: categoryColor(row.category),
        },
        { label: '수량', value: formatQty(row.qty) },
        { label: '비중', value: `${row.share_pct}%` },
      ]}
    />
  )
}

export function CategoryDonut({ filters }: { filters: Filters }) {
  const { data = [], isPending, isFetching, error, refetch } = useSalesByCategory(filters)

  return (
    <ChartCard
      title="카테고리별 매출 구성"
      isLoading={isPending}
      error={error}
      isEmpty={data.length === 0}
      onRetry={() => void refetch()}
      isFetching={isFetching}
      height={360}
    >
      <div className="flex h-full flex-col gap-3 sm:flex-row sm:items-center">
        <div className="h-[200px] w-full sm:h-full sm:w-1/2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="revenue"
                nameKey="category"
                cx="50%"
                cy="50%"
                innerRadius="55%"
                outerRadius="82%"
                paddingAngle={2}
                stroke="#fcfcfb"
                strokeWidth={2}
              >
                {data.map((row) => (
                  <Cell
                    key={row.category}
                    fill={categoryColor(row.category)}
                  />
                ))}
              </Pie>
              <Tooltip content={<DonutTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 범례 겸 직접 레이블 — 금액과 비중을 색과 별개로 읽을 수 있게 한다 */}
        <ul className="w-full space-y-1.5 sm:w-1/2">
          {data.map((row) => (
            <li
              key={row.category}
              className="flex items-center gap-2 text-xs"
            >
              <span
                aria-hidden
                className="h-2.5 w-2.5 shrink-0 rounded-sm"
                style={{ backgroundColor: categoryColor(row.category) }}
              />
              <span className="text-neutral-700">{row.category}</span>
              <span className="ml-auto font-medium tabular-nums text-neutral-900">
                {formatShortKRW(row.revenue)}
              </span>
              <span className="w-11 text-right tabular-nums text-neutral-400">
                {row.share_pct}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </ChartCard>
  )
}
