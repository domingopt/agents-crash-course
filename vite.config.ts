import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' keeps asset paths relative, so the build works on GitHub Pages
// under /<repo-name>/ as well as on Netlify/Vercel at the domain root.
export default defineConfig({
  base: './',
  plugins: [react()],
});
