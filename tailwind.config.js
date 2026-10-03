/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        admin: {
          header: "#1E1B4B",
          tab: "#312E81",
          primary: "#4F46E5",
          royal: "#1E66F5",
          destructive: "#DC2626",
          bgFrom: "#F8FAFC",
          bgVia: "#F1F5F9",
          bgTo: "#EEF2FF",
          cardBorder: "#E2E8F0",
          heading: "#0F172A",
          muted: "#64748B",
          gold: "#F59E0B",
          emerald: "#10B981"
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        'card': '16px',
        'button': '12px',
      }
    },
  },
  plugins: [],
}
