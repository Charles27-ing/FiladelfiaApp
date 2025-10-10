// astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import vercel from "@astrojs/vercel";
// https://astro.build/config
export default defineConfig({
  // ¡LA LÍNEA QUE LO CAMBIA TODO!
  output: 'server',
   adapter: vercel( ),
  integrations: [tailwind( )]
});
