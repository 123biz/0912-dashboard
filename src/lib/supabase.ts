import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  throw new Error(
    'VITE_SUPABASE_URL 과 VITE_SUPABASE_ANON_KEY 가 설정되지 않았습니다. ' +
      '.env.local 파일을 확인하세요.',
  )
}

export const supabase = createClient(url, anonKey)

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
