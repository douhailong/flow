import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: '@', replacement: resolve(__dirname, 'src') },
      { find: '@pages', replacement: resolve(__dirname, 'src/pages') },
      { find: '@hooks', replacement: resolve(__dirname, 'src/hooks') },
      { find: '@utils', replacement: resolve(__dirname, 'src/utils') },
      { find: '@layout', replacement: resolve(__dirname, 'src/layout') },
      { find: '@router', replacement: resolve(__dirname, 'src/router') },
      { find: '@assets', replacement: resolve(__dirname, 'src/assets') },
      { find: '@store', replacement: resolve(__dirname, 'src/store') },
      { find: '@config', replacement: resolve(__dirname, 'src/config') },
      {
        find: '@services',
        replacement: resolve(__dirname, 'src/services')
      },
      {
        find: '@components',
        replacement: resolve(__dirname, 'src/components')
      }
    ]
  },
  server: {
    proxy: {
      '/api': {
        // target: 'http://192.168.2.3:8080',
        target: 'http://47.101.180.183:8016',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
    // open: true
  }
});
