/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
    // 如果你的教案组件在别的路径，可以添加更多路径，例如：
    "./src/agents/**/*.vue",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}