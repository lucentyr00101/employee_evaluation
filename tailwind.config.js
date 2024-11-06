const COLOR_MAP = {
  DARK: '#272838',
  BLUE: '#8DDBE0',
  QUARTZ: '#9C92A3',
  THISTLE: '#C6B9CD',
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
  ],
  theme: {
    extend: {
      colors: {
        dark: COLOR_MAP.DARK,
        blue: COLOR_MAP.BLUE,
        quartz: COLOR_MAP.QUARTZ
      }
    },
  },
  plugins: [],
}

