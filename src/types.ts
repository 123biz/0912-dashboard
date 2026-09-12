export type Dealership = {
  id: number
  name: string
  district: string
  manager: string | null
}

export type KpiSummary = {
  revenue: number
  qty: number
  avg_unit_price: number
  top_dealer: string | null
  top_dealer_revenue: number | null
  prev_revenue: number
  revenue_change_pct: number | null
}

export type MonthlyTrend = {
  month: string
  revenue: number
  qty: number
}

export type DealerSales = {
  dealership_id: number
  dealership: string
  district: string
  revenue: number
  qty: number
  share_pct: number
}

export type CategorySales = {
  category: string
  revenue: number
  qty: number
  share_pct: number
}

export type ProductSales = {
  product_id: number
  product: string
  category: string
  revenue: number
  qty: number
}

export type DowSales = {
  dow: number
  dow_label: string
  revenue: number
  avg_revenue: number
}

export type MatrixCell = {
  dealership: string
  category: string
  revenue: number
}

export type DataRange = {
  min_date: string
  max_date: string
}

/** 모든 차트에 공통 적용되는 필터 상태 */
export type Filters = {
  from: string | null
  to: string | null
  dealerIds: number[]
  categories: string[]
}
