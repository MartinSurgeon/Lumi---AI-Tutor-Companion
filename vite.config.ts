import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    // In production (Vercel), use environment variables directly
    const apiKey = mode === 'production' 
      ? process.env.GEMINI_API_KEY || env.GEMINI_API_KEY
      : env.GEMINI_API_KEY;
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        hmr: {
          clientPort: 443,
        },
        // Allow ngrok and other tunnel services
        allowedHosts: [
          '.ngrok-free.app',
          '.ngrok.io',
          '.ngrok.app',
          'localhost',
          '127.0.0.1',
        ],
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(apiKey),
        'process.env.GEMINI_API_KEY': JSON.stringify(apiKey)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        outDir: 'dist',
        sourcemap: false,
        minify: 'terser',
        rollupOptions: {
          output: {
            manualChunks: {
              'react-vendor': ['react', 'react-dom'],
              'ui-vendor': ['lucide-react'],
            }
          }
        }
      }
    };
});
