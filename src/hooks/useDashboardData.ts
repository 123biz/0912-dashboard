import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { callRpc, supabase } from '../lib/supabase'
import { toRpcParams } from './useFilters'
import { toNumber } from '../lib/format'
import type {
  CategorySales,
  DataRange,
  DealerGeoSales,
  DealerSales,
  Dealership,
  DowSales,
  Filters,
  KpiSummary,
  MatrixCell,
  ProductSales,
} from '../types'

/** 필터가 바뀌면 모든 차트가 함께 무효화되도록 키를 공유한다 */
function key(name: string, filters: Filters) {
  return [name, filters.from, filters.to, filters.dealerIds, filters.categories]
}

// ---------------------------------------------------------------
// 필터 옵션 — 필터와 무관하므로 한 번만 조회한다
// ---------------------------------------------------------------

export function useDealerships() {
  return useQuery({
    queryKey: ['dealerships'],
    staleTime: Infinity,
    queryFn: async (): Promise<Dealership[]> => {
      const { data, error } = await supabase
        .from('dealerships')
        .select('id, name, district, manager')
        .order('name')

      if (error) throw new Error(`대리점 목록 조회 실패: ${error.message}`)
      return (data ?? []) as Dealership[]
    },
  })
}

export function useDataRange() {
  return useQuery({
    queryKey: ['data-range'],
    staleTime: Infinity,
    queryFn: async (): Promise<DataRange | null> => {
      const rows = await callRpc<DataRange>('get_data_range', {})
      return rows[0] ?? null
    },
  })
}

// ---------------------------------------------------------------
// 집계 — 전부 DB 에서 계산되어 수십 행만 돌아온다
// ---------------------------------------------------------------

export function useKpiSummary(filters: Filters) {
  return useQuery({
    queryKey: key('kpi', filters),
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<KpiSummary | null> => {
      const rows = await callRpc<KpiSummary>(
        'get_kpi_summary',
        toRpcParams(filters),
      )
      const row = rows[0]
      if (!row) return null

      return {
        ...row,
        revenue: toNumber(row.revenue),
        qty: toNumber(row.qty),
        avg_unit_price: toNumber(row.avg_unit_price),
        top_dealer_revenue:
          row.top_dealer_revenue === null
            ? null
            : toNumber(row.top_dealer_revenue),
        prev_revenue: toNumber(row.prev_revenue),
        revenue_change_pct:
          row.revenue_change_pct === null
            ? null
            : toNumber(row.revenue_change_pct),
      }
    },
  })
}

export function useDealerGeoSales(filters: Filters) {
  return useQuery({
    queryKey: key('geo', filters),
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const rows = await callRpc<DealerGeoSales>(
        'get_dealer_geo_sales',
        toRpcParams(filters),
      )
      return rows.map((r) => ({
        ...r,
        lat: toNumber(r.lat),
        lng: toNumber(r.lng),
        revenue: toNumber(r.revenue),
        qty: toNumber(r.qty),
        share_pct: toNumber(r.share_pct),
      }))
    },
  })
}

export function useSalesByDealer(filters: Filters) {
  return useQuery({
    queryKey: key('by-dealer', filters),
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const rows = await callRpc<DealerSales>(
        'get_sales_by_dealer',
        toRpcParams(filters),
      )
      return rows.map((r) => ({
        ...r,
        revenue: toNumber(r.revenue),
        qty: toNumber(r.qty),
        share_pct: toNumber(r.share_pct),
      }))
    },
  })
}

export function useSalesByCategory(filters: Filters) {
  return useQuery({
    queryKey: key('by-category', filters),
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const rows = await callRpc<CategorySales>(
        'get_sales_by_category',
        toRpcParams(filters),
      )
      return rows.map((r) => ({
        ...r,
        revenue: toNumber(r.revenue),
        qty: toNumber(r.qty),
        share_pct: toNumber(r.share_pct),
      }))
    },
  })
}

export function useSalesByProduct(filters: Filters) {
  return useQuery({
    queryKey: key('by-product', filters),
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const rows = await callRpc<ProductSales>('get_sales_by_product', {
        ...toRpcParams(filters),
        p_limit: 10,
      })
      return rows.map((r) => ({
        ...r,
        revenue: toNumber(r.revenue),
        qty: toNumber(r.qty),
      }))
    },
  })
}

export function useSalesByDow(filters: Filters) {
  return useQuery({
    queryKey: key('by-dow', filters),
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const rows = await callRpc<DowSales>(
        'get_sales_by_dow',
        toRpcParams(filters),
      )
      return rows.map((r) => ({
        ...r,
        revenue: toNumber(r.revenue),
        avg_revenue: toNumber(r.avg_revenue),
      }))
    },
  })
}

export function useDealerCategoryMatrix(filters: Filters) {
  return useQuery({
    queryKey: key('matrix', filters),
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const rows = await callRpc<MatrixCell>(
        'get_dealer_category_matrix',
        toRpcParams(filters),
      )
      return rows.map((r) => ({ ...r, revenue: toNumber(r.revenue) }))
    },
  })
}
