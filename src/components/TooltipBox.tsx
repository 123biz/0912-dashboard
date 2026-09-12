export type TooltipRow = {
  label: string
  value: string
  color?: string
}

/** 모든 차트가 공유하는 툴팁 외형 */
export function TooltipBox({
  title,
  rows,
}: {
  title: string
  rows: TooltipRow[]
}) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2 shadow-md">
      <p className="mb-1.5 text-xs font-semibold text-neutral-900">{title}</p>
      <dl className="space-y-0.5">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center gap-2 text-xs">
            {row.color && (
              <span
                aria-hidden
                className="h-2 w-2 shrink-0 rounded-sm"
                style={{ backgroundColor: row.color }}
              />
            )}
            <dt className="text-neutral-500">{row.label}</dt>
            <dd className="ml-auto font-medium tabular-nums text-neutral-900">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

/** Recharts 가 주입하는 툴팁 props 의 최소 형태 */
export type RechartsTooltipProps = {
  active?: boolean
  label?: string | number
  payload?: Array<{
    value?: number | string
    name?: string
    color?: string
    dataKey?: string | number
    payload?: Record<string, never> | Record<string, unknown>
  }>
}
