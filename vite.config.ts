import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
          // Explicitly alias react and react-dom to ensure dependencies use the external version
          'react': 'https://aistudiocdn.com/react@^19.2.0',
          'react-dom': 'https://aistudiocdn.com/react-dom@^19.2.0',
        }
      },
      // Explicitly mark React and ReactDOM as external to rely on importmap
      build: {
        rollupOptions: {
          external: ['react', 'react-dom', 'react/jsx-runtime'],
        },
      },
    };
});