/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0b3d0b',
        secondary: '#2e8b57',
        background: '#f0f7f0',
        border: '#c8e6c9',
        text: '#333',
        'message-bg': '#e8f5e9',
      },
    },
  },
  plugins: [],
}

