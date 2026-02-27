import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/arhitecte-ai---123/',
  plugins: [
    react(),
    tailwindcss(),
  ],
})
