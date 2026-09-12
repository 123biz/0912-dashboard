import { useCallback, useEffect, useState } from 'react'
import type { Filters } from '../types'

export const EMPTY_FILTERS: Filters = {
  from: null,
  to: null,
  dealerIds: [],
  categories: [],
}

function parseFilters(search: string): Filters {
  const params = new URLSearchParams(search)
  const dealers = params.get('dealers')
  const cats = params.get('cats')

  return {
    from: params.get('from'),
    to: params.get('to'),
    dealerIds: dealers
      ? dealers.split(',').map(Number).filter(Number.isFinite)
      : [],
    categories: cats ? cats.split(',').filter(Boolean) : [],
  }
}

function buildUrl(filters: Filters): string {
  const params = new URLSearchParams()
  if (filters.from) params.set('from', filters.from)
  if (filters.to) params.set('to', filters.to)
  if (filters.dealerIds.length) params.set('dealers', filters.dealerIds.join(','))
  if (filters.categories.length) params.set('cats', filters.categories.join(','))

  const query = params.toString()
  return query
    ? `${window.location.pathname}?${query}`
    : window.location.pathname
}

/**
 * 필터 상태를 URL 쿼리스트링에 동기화한다.
 * 링크를 복사해 전달하면 동일한 화면이 재현된다.
 */
export function useFilters() {
  const [filters, setFilters] = useState<Filters>(() =>
    parseFilters(window.location.search),
  )

  // 브라우저 뒤로/앞으로 가기 대응
  useEffect(() => {
    const onPopState = () => setFilters(parseFilters(window.location.search))
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  // URL 동기화는 렌더 후 부수효과로 처리한다.
  // setState 업데이터 안에서 history 를 건드리면 StrictMode 가
  // 업데이터를 두 번 호출할 때 부수효과도 두 번 실행된다.
  useEffect(() => {
    const next = buildUrl(filters)
    const current = window.location.pathname + window.location.search
    if (next !== current) window.history.replaceState(null, '', next)
  }, [filters])

  const update = useCallback((patch: Partial<Filters>) => {
    setFilters((prev) => ({ ...prev, ...patch }))
  }, [])

  const reset = useCallback(() => setFilters(EMPTY_FILTERS), [])

  const isDefault =
    !filters.from &&
    !filters.to &&
    filters.dealerIds.length === 0 &&
    filters.categories.length === 0

  return { filters, update, reset, isDefault }
}

/** RPC 파라미터로 변환 — 빈 배열은 "전체"를 뜻하는 null 로 보낸다 */
export function toRpcParams(filters: Filters) {
  return {
    p_from: filters.from,
    p_to: filters.to,
    p_dealer_ids: filters.dealerIds.length ? filters.dealerIds : null,
    p_categories: filters.categories.length ? filters.categories : null,
  }
}
