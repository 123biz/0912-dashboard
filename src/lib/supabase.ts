import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * 설정 누락은 예외로 던지지 않는다.
 * 모듈 로드 중 예외가 나면 화면이 통째로 하얗게 비어
 * 무엇이 잘못됐는지 알 수 없게 된다. 대신 사유를 노출하고
 * main.tsx 가 안내 화면을 그리도록 한다.
 */
export const configError: string | null = !url
  ? 'VITE_SUPABASE_URL 이 비어 있습니다.'
  : !anonKey
    ? 'VITE_SUPABASE_ANON_KEY 가 비어 있습니다.'
    : null

export const supabase = createClient(
  url || 'https://unconfigured.invalid',
  anonKey || 'unconfigured',
)

/**
 * RPC 호출 공통 래퍼.
 * Supabase 의 { data, error } 형태를 예외로 승격시켜
 * React Query 가 에러 상태를 일관되게 다루도록 한다.
 */
export async function callRpc<T>(
  fn: string,
  params: Record<string, unknown>,
): Promise<T[]> {
  const { data, error } = await supabase.rpc(fn, params)

  if (error) {
    console.error(`RPC ${fn} 실패:`, error)
    throw new Error(`데이터를 불러오지 못했습니다 (${fn}): ${error.message}`)
  }

  return (data ?? []) as T[]
}
