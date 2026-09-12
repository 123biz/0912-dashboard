import { useMemo, useState } from 'react'
import { useSalesByDealer } from '../hooks/useDashboardData'
import { formatFullKRW, formatQty } from '../lib/format'
import type { DealerSales, Filters } from '../types'

type SortKey = 'dealership' | 'district' | 'revenue' | 'qty' | 'share_pct'
type SortDir = 'asc' | 'desc'

const COLUMNS: Array<{ key: SortKey; label: string; numeric: boolean }> = [
  { key: 'dealership', label: '대리점', numeric: false },
  { key: 'district', label: '자치구', numeric: false },
  { key: 'revenue', label: '매출', numeric: true },
  { key: 'qty', label: '수량', numeric: true },
  { key: 'share_pct', label: '비중', numeric: true },
]

function compare(a: DealerSales, b: DealerSales, key: SortKey): number {
  const x = a[key]
  const y = b[key]
  if (typeof x === 'number' && typeof y === 'number') return x - y
  return String(x).localeCompare(String(y), 'ko')
}

export function DetailTable({ filters }: { filters: Filters }) {
  const { data = [], isPending, error, refetch } = useSalesByDealer(filters)
  const [sortKey, setSortKey] = useState<SortKey>('revenue')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const rows = useMemo(() => {
    const sorted = [...data].sort((a, b) => compare(a, b, sortKey))
    return sortDir === 'desc' ? sorted.reverse() : sorted
  }, [data, sortKey, sortDir])

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const total = rows.reduce((sum, r) => sum + r.revenue, 0)
  const totalQty = rows.reduce((sum, r) => sum + r.qty, 0)

  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-5">
      <h2 className="mb-4 text-sm font-semibold text-neutral-900">
        대리점별 상세
      </h2>

      {isPending ? (
        <div
          className="h-64 animate-pulse rounded-lg bg-neutral-100"
          aria-label="불러오는 중"
        />
      ) : error ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-sm text-red-700">{error.message}</p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
          >
            다시 시도
          </button>
        </div>
      ) : rows.length === 0 ? (
        <p className="py-16 text-center text-sm text-neutral-400">
          선택한 조건에 해당하는 매출이 없습니다
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-neutral-200">
                {COLUMNS.map((col) => {
                  const isActive = sortKey === col.key
                  return (
                    <th
                      key={col.key}
                      scope="col"
                      aria-sort={
                        isActive
                          ? sortDir === 'asc'
                            ? 'ascending'
                            : 'descending'
                          : 'none'
                      }
                      className={`pb-2 ${col.numeric ? 'text-right' : 'text-left'}`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleSort(col.key)}
                        className={`inline-flex items-center gap-1 text-xs font-medium hover:text-neutral-900 ${
                          isActive ? 'text-neutral-900' : 'text-neutral-500'
                        }`}
                      >
                        {col.label}
                        <span aria-hidden className="text-[10px]">
                          {isActive ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}
                        </span>
                      </button>
                    </th>
                  )
                })}
              </tr>
            </thead>

            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.dealership_id}
                  className="border-b border-neutral-100 last:border-0"
                >
                  <td className="py-2 text-neutral-900">{row.dealership}</td>
                  <td className="py-2 text-neutral-500">{row.district}</td>
                  <td className="py-2 text-right tabular-nums text-neutral-900">
                    {formatFullKRW(row.revenue)}
                  </td>
                  <td className="py-2 text-right tabular-nums text-neutral-600">
                    {formatQty(row.qty)}
                  </td>
                  <td className="py-2 text-right tabular-nums text-neutral-600">
                    {row.share_pct}%
                  </td>
                </tr>
              ))}
            </tbody>

            <tfoot>
              <tr className="border-t-2 border-neutral-300">
                <td className="pt-2 text-xs font-semibold text-neutral-900">
                  합계
                </td>
                <td />
                <td className="pt-2 text-right text-xs font-semibold tabular-nums text-neutral-900">
                  {formatFullKRW(total)}
                </td>
                <td className="pt-2 text-right text-xs font-semibold tabular-nums text-neutral-900">
                  {formatQty(totalQty)}
                </td>
                <td className="pt-2 text-right text-xs font-semibold tabular-nums text-neutral-900">
                  100%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </section>
  )
}
