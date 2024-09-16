import {
  defineConfig,
  presetUno,
  presetWind,
  presetAttributify,
  presetTypography,
  transformerDirectives,
  transformerVariantGroup,
} from "unocss";

export default defineConfig({
  content: {
    filesystem: ["**/*.{html,js,ts,jsx,tsx,vue,svelte,astro}"],
  },
  theme: {
    colors: {
      primary: "#FFD700",
      secondary: "#b5a26d",
      gold: "#FFD700",
      sliver: "#C0C0C0",
      bronze: "#CD7F32",
    },
  },
  shortcuts: {},
  presets: [presetUno(), presetWind(), presetTypography(), presetAttributify()],
  transformers: [transformerDirectives(), transformerVariantGroup()],
});
