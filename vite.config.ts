import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(root, 'index.html'),
        timeline: resolve(root, 'timeline/index.html'),
        tree: resolve(root, 'tree/index.html'),
        achievements: resolve(root, 'achievements/index.html')
      }
    }
  }
});
