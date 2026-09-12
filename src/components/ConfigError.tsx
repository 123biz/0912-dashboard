/** 환경변수가 비었을 때, 하얀 화면 대신 원인과 조치를 보여준다 */
export function ConfigError({ reason }: { reason: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-6">
      <div className="max-w-lg rounded-xl border border-amber-300 bg-white p-6">
        <h1 className="text-base font-semibold text-neutral-900">
          환경변수가 설정되지 않았습니다
        </h1>

        <p className="mt-2 text-sm text-amber-800">{reason}</p>

        <p className="mt-4 text-sm text-neutral-600">
          Vite 는 <code className="text-neutral-900">VITE_</code> 환경변수를{' '}
          <strong className="text-neutral-900">빌드 시점</strong>에 번들에 넣습니다.
          값을 등록한 뒤에는 반드시 <strong className="text-neutral-900">다시
          빌드</strong>해야 반영됩니다.
        </p>

        <dl className="mt-4 space-y-3 text-sm">
          <div>
            <dt className="font-medium text-neutral-900">로컬</dt>
            <dd className="mt-0.5 text-neutral-600">
              프로젝트 루트의 <code>.env.local</code> 에 두 값을 채우고 개발
              서버를 재시작합니다.
            </dd>
          </div>
          <div>
            <dt className="font-medium text-neutral-900">Vercel</dt>
            <dd className="mt-0.5 text-neutral-600">
              Settings → Environment Variables 에 값을 넣고, Deployments 에서
              최신 배포를 <strong>Redeploy</strong> 하되{' '}
              <em>Use existing Build Cache</em> 를 반드시 해제합니다.
            </dd>
          </div>
        </dl>

        <p className="mt-4 border-t border-neutral-200 pt-3 text-xs text-neutral-500">
          필요한 값: <code>VITE_SUPABASE_URL</code>,{' '}
          <code>VITE_SUPABASE_ANON_KEY</code> (Supabase → Settings → API)
        </p>
      </div>
    </div>
  )
}
