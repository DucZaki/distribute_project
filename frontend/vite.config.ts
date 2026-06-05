import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

/** Các file .jsx build sẵn bằng React.createElement cần import React. */
function reactJsxShim(): Plugin {
  return {
    name: 'react-jsx-shim',
    transform(code, id) {
      if (!id.endsWith('.jsx') || !code.includes('React.createElement')) return null
      if (/import\s+React\b/.test(code) || /import\s*\{[^}]*\bReact\b/.test(code)) return null
      return { code: `import React from 'react'\n${code}`, map: null }
    },
  }
}

export default defineConfig({
  plugins: [reactJsxShim(), react()],
  resolve: {
    // Ưu tiên .tsx/.ts trước .jsx — tránh file .jsx build sẵn che bản nguồn TypeScript
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.mjs', '.json'],
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/oauth2': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/login/oauth2': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
