/// <reference types="vitest" />
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'
import type { ConfigEnv, UserConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [
      react(),
      basicSsl()
    ],
    server: {
      host: true,
      port: 443,
      https: env.VITE_SSL_ENABLED === 'true' ? {
        key: undefined,
        cert: undefined
      } : undefined,
      proxy: {
        '/api': {
          target: env.VITE_API_URL,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    },
    test: {
      globals: true,
      environment: 'jsdom',
      css: true,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        include: [
          'src/layout/MainLayout.tsx',
          'src/pages/attendance/AttendancePage.tsx'
        ],
        exclude: ['node_modules/', 'src/setupTests.ts'],
        thresholds: {
          statements: 100,
          branches: 100,
          functions: 100,
          lines: 100
        }
      }
    }
  }
})
