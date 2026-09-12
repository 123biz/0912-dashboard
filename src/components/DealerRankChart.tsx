import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useSalesByDealer } from '../hooks/useDashboardData'
import { formatFullKRW, formatQty, formatShortKRW } from '../lib/format'
import { GRID, SERIES_PRIMARY, TEXT_MUTED, TEXT_SECONDARY } from '../lib/theme'
import { ChartCard } from './ChartCard'
import { TooltipBox, type RechartsTooltipProps } from './TooltipBox'
import type { DealerSales, Filters } from '../types'

function RankTooltip({ active, payload }: RechartsTooltipProps) {
  if (!active || !payload?.length) return null
  const row = payload[0]?.payload as DealerSales | undefined
  if (!row) return null

  return (
    <TooltipBox
      title={`${row.dealership} · ${row.district}`}
      rows={[
        { label: '매출', value: formatFullKRW(row.revenue), color: SERIES_PRIMARY },
        { label: '수량', value: formatQty(row.qty) },
        { label: '비중', value: `${row.share_pct}%` },
      ]}
    />
  )
}

type Props = {
  filters: Filters
  onSelectDealer: (id: number) => void
}

export function DealerRankChart({ filters, onSelectDealer }: Props) {
  const { data = [], isPending, isFetching, error, refetch } = useSalesByDealer(filters)

  return (
    <ChartCard
      title="대리점별 매출 순위"
      subtitle="막대를 클릭하면 해당 대리점으로 필터링됩니다"
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
          layout="vertical"
          barCategoryGap={6}
          margin={{ top: 4, right: 64, left: 4, bottom: 0 }}
        >
          <CartesianGrid stroke={GRID} horizontal={false} />
          <XAxis
            type="number"
            tickFormatter={formatShortKRW}
            tickLine={false}
            axisLine={false}
            tick={{ fill: TEXT_MUTED, fontSize: 11 }}
          />
          <YAxis
            type="category"
            dataKey="dealership"
            width={92}
            tickLine={false}
            axisLine={false}
            tick={{ fill: TEXT_SECONDARY, fontSize: 12 }}
          />
          <Tooltip
            content={<RankTooltip />}
            cursor={{ fill: 'rgba(11,11,11,0.04)' }}
          />
          <Bar
            dataKey="revenue"
            name="매출"
            fill={SERIES_PRIMARY}
            radius={[0, 4, 4, 0]}
            maxBarSize={22}
            cursor="pointer"
            onClick={(entry: unknown) => {
              const row = entry as { dealership_id?: number }
              if (row?.dealership_id) onSelectDealer(row.dealership_id)
            }}
          >
            {/* 대비 완화(relief): 값은 항상 눈에 보이게 둔다 */}
            <LabelList
              dataKey="revenue"
              position="right"
              formatter={(v: unknown) => formatShortKRW(Number(v))}
              style={{ fill: TEXT_SECONDARY, fontSize: 11 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
