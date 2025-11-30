import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // GitHub Pagesで正しく動作するように追加
  server: {
    port: 1398,
  },
  preview: {
    port: 1398,
  },
  build: {
    outDir: 'docs', // ビルド出力先を 'docs' ディレクトリに変更
  },
})
