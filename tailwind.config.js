/** https://uicolors.app/create */
const COLOR_MAP = {
  DARK: {
    50: '#f4f6fa',
    100: '#e7eaf2',
    200: '#d5dae8',
    300: '#b7c1d9',
    400: '#95a2c5',
    500: '#7b87b6',
    600: '#6971a7',
    700: '#5d6398',
    800: '#50527d',
    900: '#434665',
    950: '#272838'
  },
  BLUE: {
    50: '#f0fbfa',
    100: '#d8f5f5',
    200: '#b6e9eb',
    300: '#8ddbe0',
    400: '#49bdc7',
    500: '#2da1ad',
    600: '#288392',
    700: '#276a77',
    800: '#275763',
    900: '#254a54',
    950: '#133039'
  },
  QUARTZ: {
    50: '#f9f8fa',
    100: '#f4f2f5',
    200: '#eae8ec',
    300: '#d9d5dd',
    400: '#c2bdc8',
    500: '#aaa1b1',
    600: '#9c92a3',
    700: '#837889',
    800: '#6d6473',
    900: '#5b535f',
    950: '#3b363f'
  },
  THISTLE: {
    50: '#f9f8fa',
    100: '#f3f2f5',
    200: '#ebe6ee',
    300: '#dbd2e0',
    400: '#c6b9cd',
    500: '#af9bb7',
    600: '#9c83a4',
    700: '#8a7091',
    800: '#745e79',
    900: '#604e64',
    950: '#3e3342'
  },
  GREEN: {
    50: '#effef7',
    100: '#dafeed',
    200: '#b8fadc',
    300: '#80f5c2',
    400: '#3de69d',
    500: '#19ce81',
    600: '#0eab68',
    700: '#0f8653',
    800: '#116a45',
    900: '#10573a',
    950: '#03301f'
  },
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
        quartz: COLOR_MAP.QUARTZ,
        thistle: COLOR_MAP.THISTLE,
        green: COLOR_MAP.GREEN
      }
    },
  },
  plugins: [],
}

