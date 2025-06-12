/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'jsdom',
        css: true,
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            include: [
                'src/layout/MainLayout.tsx',
                'src/pages/attendance/AttendancePage.tsx',
                'src/pages/attendance/Daily.tsx'
            ],
            exclude: ['node_modules/']
        }
    }
});
