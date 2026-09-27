import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

// The preset pads apple/maskable icons on white by default, which showed as a white border on iOS.
const background = { background: '#15171a' }

// `npm run icons` turns public/icon.svg into every icon size iPhone/Android need.
export default defineConfig({
  preset: {
    ...minimal2023Preset,
    apple: { ...minimal2023Preset.apple, padding: 0, resizeOptions: background },
    maskable: { ...minimal2023Preset.maskable, padding: 0.3, resizeOptions: background },
  },
  images: ['public/icon.svg'],
})
