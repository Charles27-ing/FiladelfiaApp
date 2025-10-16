// astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import netlify from "@astrojs/netlify";
// https://astro.build/config
export default defineConfig({
  // ¡LA LÍNEA QUE LO CAMBIA TODO!
  output: 'server',
  adapter: netlify(),
  integrations: [tailwind( )]
});
