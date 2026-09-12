import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useMonthlyTrend } from '../hooks/useDashboardData'
import {
  formatFullKRW,
  formatMonthFull,
  formatMonthLabel,
  formatQty,
  formatShortKRW,
} from '../lib/format'
import { GRID, SERIES_PRIMARY, TEXT_MUTED } from '../lib/theme'
import { ChartCard } from './ChartCard'
import { TooltipBox, type RechartsTooltipProps } from './TooltipBox'
import type { Filters } from '../types'

function TrendTooltip({ active, payload }: RechartsTooltipProps) {
  if (!active || !payload?.length) return null

  const row = payload[0]?.payload as
    | { month: string; revenue: number; qty: number }
    | undefined
  if (!row) return null

  return (
    <TooltipBox
      title={formatMonthFull(row.month)}
      rows={[
        {
          label: '매출',
          value: formatFullKRW(row.revenue),
          color: SERIES_PRIMARY,
        },
        { label: '수량', value: formatQty(row.qty) },
      ]}
    />
  )
}

export function MonthlyTrendChart({ filters }: { filters: Filters }) {
  const { data = [], isPending, isFetching, error, refetch } = useMonthlyTrend(filters)

  return (
    <ChartCard
      title="월별 매출 추이"
      subtitle="선택 기간의 월 단위 합계"
      isLoading={isPending}
      error={error}
      isEmpty={data.length === 0}
      onRetry={() => void refetch()}
      isFetching={isFetching}
      height={280}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 8, right: 12, left: 4, bottom: 0 }}
        >
          <defs>
            <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={SERIES_PRIMARY} stopOpacity={0.22} />
              <stop offset="100%" stopColor={SERIES_PRIMARY} stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis
            dataKey="month"
            tickFormatter={formatMonthLabel}
            tickLine={false}
            axisLine={{ stroke: GRID }}
            tick={{ fill: TEXT_MUTED, fontSize: 11 }}
          />
          <YAxis
            tickFormatter={formatShortKRW}
            tickLine={false}
            axisLine={false}
            width={56}
            tick={{ fill: TEXT_MUTED, fontSize: 11 }}
          />
          <Tooltip
            content={<TrendTooltip />}
            cursor={{ stroke: TEXT_MUTED, strokeWidth: 1, strokeDasharray: '3 3' }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            name="매출"
            stroke={SERIES_PRIMARY}
            strokeWidth={2}
            fill="url(#trendFill)"
            dot={{ r: 3, fill: SERIES_PRIMARY, strokeWidth: 0 }}
            activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
