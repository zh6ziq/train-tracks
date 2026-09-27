import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

// `npm run icons` turns public/icon.svg into every icon size iPhone/Android need.
export default defineConfig({
  preset: minimal2023Preset,
  images: ['public/icon.svg'],
})
