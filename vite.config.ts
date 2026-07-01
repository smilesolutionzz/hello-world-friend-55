import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';

// 빌드 시점마다 /version.json 을 생성해 프론트가 폴링으로 최신 배포 여부를 감지.
const BUILD_VERSION = `${Date.now()}`;
function versionJsonPlugin(): Plugin {
  return {
    name: 'aihpro-version-json',
    apply: 'build',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'version.json',
        source: JSON.stringify({ version: BUILD_VERSION, builtAt: new Date().toISOString() }),
      });
    },
    configureServer(server) {
      // 개발 환경에서도 /version.json 이 404 나지 않도록 응답.
      server.middlewares.use('/version.json', (_req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'no-store');
        res.end(JSON.stringify({ version: 'dev', builtAt: new Date().toISOString() }));
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'AI하이라이트PRO - 심리검사',
        short_name: 'AI하이라이트PRO',
        description: '3분만에 완성하는 AI 심리분석 및 발달진단',
        theme_color: '#9b87f5',
        background_color: '#1A1F2C',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        navigateFallbackDenylist: [/^\/~oauth/],
        maximumFileSizeToCacheInBytes: 30 * 1024 * 1024 // 30MB
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['framer-motion', 'lucide-react'],
          'supabase': ['@supabase/supabase-js'],
          'charts': ['recharts'],
          'pdf': ['jspdf', 'html2canvas'],
          'tosspayments': ['@tosspayments/payment-sdk'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
}));
