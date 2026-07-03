// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://enes-portfolio-brown.vercel.app',
  redirects: {
    '/projects/cargo-simulator': '/#/project/cargo-simulator',
    '/projects/highstreet': '/#/project/highstreet',
    '/projects/hero-games': '/#/project/hero-games',
    '/projects/idle-town': '/#/project/idle-town',
  },
});
