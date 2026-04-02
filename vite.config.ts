import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  root: '.',
  publicDir: 'public',
  server: {
    port: 3000,
    open: true,
    host: true,
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main:  path.resolve(__dirname, 'index.html'),
        login: path.resolve(__dirname, 'login.html'),
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // variáveis globais acessíveis em todos os módulos SCSS
        additionalData: `@use './src/styles/variables' as *;`,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
})
