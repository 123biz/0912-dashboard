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
import { useSalesByProduct } from '../hooks/useDashboardData'
import { formatFullKRW, formatQty, formatShortKRW } from '../lib/format'
import { GRID, SERIES_PRIMARY, TEXT_MUTED, TEXT_SECONDARY } from '../lib/theme'
import { ChartCard } from './ChartCard'
import { TooltipBox, type RechartsTooltipProps } from './TooltipBox'
import type { Filters, ProductSales } from '../types'

function ProductTooltip({ active, payload }: RechartsTooltipProps) {
  if (!active || !payload?.length) return null
  const row = payload[0]?.payload as ProductSales | undefined
  if (!row) return null

  return (
    <TooltipBox
      title={row.product}
      rows={[
        { label: '카테고리', value: row.category },
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

/** 축 레이블이 길어 잘리므로 짧게 줄인다 */
function shorten(name: string): string {
  return name.length > 12 ? `${name.slice(0, 11)}…` : name
}

export function ProductTopChart({ filters }: { filters: Filters }) {
  const { data = [], isPending, isFetching, error, refetch } = useSalesByProduct(filters)

  return (
    <ChartCard
      title="품목 매출 Top 10"
      subtitle="매출 기준 상위 품목"
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
            dataKey="product"
            width={110}
            tickLine={false}
            axisLine={false}
            tickFormatter={shorten}
            tick={{ fill: TEXT_SECONDARY, fontSize: 11 }}
          />
          <Tooltip
            content={<ProductTooltip />}
            cursor={{ fill: 'rgba(11,11,11,0.04)' }}
          />
          <Bar
            dataKey="revenue"
            name="매출"
            fill={SERIES_PRIMARY}
            radius={[0, 4, 4, 0]}
            maxBarSize={20}
          >
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
