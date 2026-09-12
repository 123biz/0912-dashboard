import type { ReactNode } from 'react'

type Props = {
  title: string
  subtitle?: string
  isLoading: boolean
  /** 이미 표시 중인 데이터를 갱신하는 중 — 스켈레톤 대신 살짝 흐리게 처리한다 */
  isFetching?: boolean
  error: Error | null
  isEmpty: boolean
  onRetry: () => void
  children: ReactNode
  /** 차트 본문 높이(px) — 스켈레톤과 실제 차트가 같은 높이를 쓰도록 공유 */
  height?: number
  className?: string
}

export function ChartCard({
  title,
  subtitle,
  isLoading,
  isFetching = false,
  error,
  isEmpty,
  onRetry,
  children,
  height = 300,
  className = '',
}: Props) {
  return (
    <section
      className={`flex flex-col rounded-xl border border-neutral-200 bg-white p-5 ${className}`}
    >
      <header className="mb-4">
        <h2 className="text-sm font-semibold text-neutral-900">{title}</h2>
        {subtitle && (
          <p className="mt-0.5 text-xs text-neutral-500">{subtitle}</p>
        )}
      </header>

      <div
        style={{ height }}
        className={`min-w-0 transition-opacity duration-200 ${
          isFetching && !isLoading ? 'opacity-45' : 'opacity-100'
        }`}
      >
        {isLoading ? (
          <div
            className="h-full w-full animate-pulse rounded-lg bg-neutral-100"
            aria-label="불러오는 중"
          />
        ) : error ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <p className="max-w-xs text-sm text-red-700">{error.message}</p>
            <button
              type="button"
              onClick={onRetry}
              className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
            >
              다시 시도
            </button>
          </div>
        ) : isEmpty ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-neutral-400">
              선택한 조건에 해당하는 매출이 없습니다
            </p>
          </div>
        ) : (
          children
        )}
      </div>
    </section>
  )
}
