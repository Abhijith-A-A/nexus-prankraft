import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/nexus-prankraft/',
  plugins: [react()],
  publicDir: 'Public',
  server: {
    port: 5173,
    open: false,
  },
})
