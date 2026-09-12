import { useMemo } from 'react'
import { useDealerCategoryMatrix } from '../hooks/useDashboardData'
import { formatFullKRW, formatShortKRW } from '../lib/format'
import {
  CATEGORY_ORDER,
  sequentialColor,
  sequentialTextColor,
} from '../lib/theme'
import { ChartCard } from './ChartCard'
import type { Filters } from '../types'

export function DealerCategoryHeatmap({ filters }: { filters: Filters }) {
  const { data = [], isPending, isFetching, error, refetch } = useDealerCategoryMatrix(filters)

  const { dealers, categories, lookup, max } = useMemo(() => {
    const byDealer = new Map<string, number>()
    const map = new Map<string, number>()
    const catSet = new Set<string>()
    let peak = 0

    for (const cell of data) {
      map.set(`${cell.dealership}|${cell.category}`, cell.revenue)
      byDealer.set(
        cell.dealership,
        (byDealer.get(cell.dealership) ?? 0) + cell.revenue,
      )
      catSet.add(cell.category)
      if (cell.revenue > peak) peak = cell.revenue
    }

    // 매출 많은 대리점이 위로
    const sortedDealers = [...byDealer.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name)

    const sortedCategories = CATEGORY_ORDER.filter((c) => catSet.has(c))

    return {
      dealers: sortedDealers,
      categories: sortedCategories as readonly string[],
      lookup: map,
      max: peak,
    }
  }, [data])

  return (
    <ChartCard
      title="대리점 × 카테고리 매출"
      subtitle="색이 진할수록 매출이 큽니다. 빈 칸은 미취급을 뜻합니다"
      isLoading={isPending}
      error={error}
      isEmpty={data.length === 0}
      onRetry={() => void refetch()}
      isFetching={isFetching}
      height={Math.max(240, dealers.length * 36 + 48)}
    >
      <div className="h-full overflow-x-auto">
        <table className="w-full min-w-[560px] border-separate border-spacing-[2px]">
          <caption className="sr-only">
            대리점별 카테고리 매출 히트맵
          </caption>
          <thead>
            <tr>
              <th className="w-28 text-left text-xs font-medium text-neutral-500">
                대리점
              </th>
              {categories.map((c) => (
                <th
                  key={c}
                  scope="col"
                  className="px-2 pb-1 text-xs font-medium text-neutral-500"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dealers.map((dealer) => (
              <tr key={dealer}>
                <th
                  scope="row"
                  className="pr-2 text-left text-xs font-normal text-neutral-700"
                >
                  {dealer}
                </th>
                {categories.map((category) => {
                  const value = lookup.get(`${dealer}|${category}`)
                  const ratio = value && max > 0 ? value / max : 0

                  return (
                    <td
                      key={category}
                      title={
                        value
                          ? `${dealer} · ${category} — ${formatFullKRW(value)}`
                          : `${dealer} · ${category} — 미취급`
                      }
                      className="h-8 rounded-[3px] text-center text-[11px] tabular-nums"
                      style={{
                        backgroundColor: sequentialColor(ratio),
                        color: sequentialTextColor(ratio),
                      }}
                    >
                      {value ? formatShortKRW(value) : ''}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ChartCard>
  )
}
