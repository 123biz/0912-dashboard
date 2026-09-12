import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useSalesByDow } from '../hooks/useDashboardData'
import { formatFullKRW, formatShortKRW } from '../lib/format'
import { GRID, SERIES_PRIMARY, TEXT_MUTED, TEXT_SECONDARY } from '../lib/theme'
import { ChartCard } from './ChartCard'
import { TooltipBox, type RechartsTooltipProps } from './TooltipBox'
import type { DowSales, Filters } from '../types'

function DowTooltip({ active, payload }: RechartsTooltipProps) {
  if (!active || !payload?.length) return null
  const row = payload[0]?.payload as DowSales | undefined
  if (!row) return null

  return (
    <TooltipBox
      title={`${row.dow_label}요일`}
      rows={[
        {
          label: '일평균 매출',
          value: formatFullKRW(row.avg_revenue),
          color: SERIES_PRIMARY,
        },
        { label: '기간 합계', value: formatFullKRW(row.revenue) },
      ]}
    />
  )
}

export function DowChart({ filters }: { filters: Filters }) {
  const { data = [], isPending, isFetching, error, refetch } = useSalesByDow(filters)

  return (
    <ChartCard
      title="요일별 평균 매출"
      subtitle="요일당 하루 평균"
      isLoading={isPending}
      error={error}
      isEmpty={data.length === 0}
      onRetry={() => void refetch()}
      isFetching={isFetching}
      height={360}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          barCategoryGap={10}
          margin={{ top: 8, right: 12, left: 4, bottom: 0 }}
        >
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis
            dataKey="dow_label"
            tickLine={false}
            axisLine={{ stroke: GRID }}
            tick={{ fill: TEXT_SECONDARY, fontSize: 12 }}
          />
          <YAxis
            tickFormatter={formatShortKRW}
            tickLine={false}
            axisLine={false}
            width={56}
            tick={{ fill: TEXT_MUTED, fontSize: 11 }}
          />
          <Tooltip
            content={<DowTooltip />}
            cursor={{ fill: 'rgba(11,11,11,0.04)' }}
          />
          <Bar
            dataKey="avg_revenue"
            name="일평균 매출"
            fill={SERIES_PRIMARY}
            radius={[4, 4, 0, 0]}
            maxBarSize={48}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
