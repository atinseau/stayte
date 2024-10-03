/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js,tsx,jsx,mdx,md}",
    "./docs/**/*.{html,js,tsx,jsx,mdx,md}"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  darkMode: ['selector', '[data-theme="dark"]']
}