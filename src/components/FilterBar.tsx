import { useDataRange, useDealerships } from '../hooks/useDashboardData'
import { CATEGORY_ORDER } from '../lib/theme'
import { MultiSelect } from './MultiSelect'
import type { Filters } from '../types'

type Props = {
  filters: Filters
  update: (patch: Partial<Filters>) => void
  reset: () => void
  isDefault: boolean
}

/** 데이터 최종일 기준 N일 전 — 프리셋 기간 계산용 */
function daysBefore(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() - days + 1)
  return d.toISOString().slice(0, 10)
}

export function FilterBar({ filters, update, reset, isDefault }: Props) {
  const { data: dealers = [] } = useDealerships()
  const { data: range } = useDataRange()

  const presets = range
    ? [
        { label: '최근 30일', from: daysBefore(range.max_date, 30) },
        { label: '최근 90일', from: daysBefore(range.max_date, 90) },
        { label: '전체', from: null },
      ]
    : []

  const applyPreset = (from: string | null) => {
    update({ from, to: from && range ? range.max_date : null })
  }

  return (
    <div className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-end gap-4 px-6 py-3">
        {/* 기간 프리셋 */}
        <div>
          <span className="mb-1 block text-xs font-medium text-neutral-500">
            기간
          </span>
          <div className="flex h-9 items-center gap-1 rounded-md border border-neutral-300 bg-white p-0.5">
            {presets.map((p) => {
              const isOn = filters.from === p.from
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => applyPreset(p.from)}
                  aria-pressed={isOn}
                  className={`rounded px-2.5 py-1 text-xs font-medium transition ${
                    isOn
                      ? 'bg-blue-600 text-white'
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  {p.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* 직접 지정 */}
        <div>
          <span className="mb-1 block text-xs font-medium text-neutral-500">
            직접 지정
          </span>
          <div className="flex h-9 items-center gap-1.5">
            <input
              type="date"
              value={filters.from ?? ''}
              min={range?.min_date}
              max={range?.max_date}
              onChange={(e) => update({ from: e.target.value || null })}
              className="h-9 rounded-md border border-neutral-300 px-2 text-sm text-neutral-800"
              aria-label="시작일"
            />
            <span className="text-xs text-neutral-400">~</span>
            <input
              type="date"
              value={filters.to ?? ''}
              min={range?.min_date}
              max={range?.max_date}
              onChange={(e) => update({ to: e.target.value || null })}
              className="h-9 rounded-md border border-neutral-300 px-2 text-sm text-neutral-800"
              aria-label="종료일"
            />
          </div>
        </div>

        <MultiSelect
          label="대리점"
          allLabel="전체 대리점"
          selected={filters.dealerIds.map(String)}
          onChange={(next) => update({ dealerIds: next.map(Number) })}
          options={dealers.map((d) => ({
            value: String(d.id),
            label: d.name,
            hint: d.district,
          }))}
        />

        <MultiSelect
          label="카테고리"
          allLabel="전체 카테고리"
          selected={filters.categories}
          onChange={(next) => update({ categories: next })}
          options={CATEGORY_ORDER.map((c) => ({ value: c, label: c }))}
        />

        {!isDefault && (
          <button
            type="button"
            onClick={reset}
            className="h-9 rounded-md px-3 text-xs font-medium text-neutral-600 underline-offset-2 hover:underline"
          >
            필터 초기화
          </button>
        )}
      </div>
    </div>
  )
}
