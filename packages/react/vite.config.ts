import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [
      react(), 
      tailwindcss()
    ],
    server: {
      port: Number(env.VITE_DEV_FRONTEND_PORT) || 5173,
      proxy: {
        '/collection': {
          target: `http://localhost:${env.VITE_DEV_BACKEND_PORT || 8000}`,
          changeOrigin: true,
          secure: false,
        },
        '/php-api': {
          target: `http://localhost:${env.VITE_DEV_BACKEND_PORT || 8000}`,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(new RegExp(`^/php-api`), ''),
        },
        '/api': {
          target: `http://localhost:${env.VITE_DEV_BACKEND_PORT || 8000}`,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(new RegExp(`^/api`), ''),
        }
      }
    }
  }
})