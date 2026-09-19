import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

const root = import.meta.dirname;

// Two builds share one codebase:
// - default: a multi-page static site (landing, learner app, educator view) with a
//   relative base, so it serves from a domain root (Vercel, Render) or a project
//   subpath (GitHub Pages) without rebuilding.
// - artifact: one self-contained HTML file with hash routing, for the Claude artifact.
export default defineConfig(({ mode }) => {
  const artifact = mode === 'artifact';
  const input: Record<string, string> = artifact
    ? { artifact: resolve(root, 'artifact.html') }
    : {
        main: resolve(root, 'index.html'),
        app: resolve(root, 'app/index.html'),
        educators: resolve(root, 'educators/index.html'),
      };
  return {
    base: './',
    plugins: artifact ? [react(), viteSingleFile()] : [react()],
    define: {
      'import.meta.env.VITE_TARGET': JSON.stringify(artifact ? 'artifact' : 'site'),
    },
    build: {
      target: 'es2022',
      outDir: artifact ? 'dist-artifact' : 'dist',
      assetsInlineLimit: artifact ? 100_000_000 : 4096,
      rollupOptions: { input },
    },
  };
});
