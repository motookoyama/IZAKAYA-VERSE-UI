import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 1398, // ローカル開発用ポート
  },
  build: {
    outDir: 'dist', // 標準出力先
  },
})
