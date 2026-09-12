import { useDataRange } from '../hooks/useDashboardData'
import { formatDate } from '../lib/format'

export function Header() {
  const { data } = useDataRange()

  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-end justify-between gap-2 px-6 py-5">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-neutral-900">
            대리점 매출 대시보드
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            서울 시내 대리점 품목별 매출 현황
          </p>
        </div>

        {data && (
          <p className="text-xs text-neutral-500">
            데이터 기준{' '}
            <time dateTime={data.min_date}>{formatDate(data.min_date)}</time>
            {' ~ '}
            <time dateTime={data.max_date}>{formatDate(data.max_date)}</time>
          </p>
        )}
      </div>
    </header>
  )
}
