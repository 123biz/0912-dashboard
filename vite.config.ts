import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        // 차트 라이브러리가 번들의 대부분을 차지하므로 분리해 캐시 효율을 높인다
        manualChunks: {
          charts: ['recharts'],
          data: ['@supabase/supabase-js', '@tanstack/react-query'],
        },
      },
    },
  },
})
