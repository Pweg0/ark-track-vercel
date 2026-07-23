/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        camp: {
          bg: "#12130f",
          panel: "#1b1d16",
          panel2: "#22251b",
          border: "#3a3d2c",
          rust: "#c1541f",
          rustdark: "#8a3a15",
          moss: "#7f9c5a",
          bone: "#e9e4d0",
          dim: "#8c8a72",
          alert: "#d94848",
          gold: "#d6a94e"
        }
      },
      fontFamily: {
        display: ["'Bebas Neue'", "Impact", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"]
      },
      backgroundImage: {
        grain: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.045'/%3E%3C/svg%3E\")"
      }
    }
  },
  plugins: []
};
