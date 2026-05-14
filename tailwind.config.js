/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans:    ["Plus Jakarta Sans", "system-ui", "sans-serif"],
        mono:    ["DM Mono", "monospace"],
      },
      colors: {
        brand: {
          primary:   "#1F7A6C",
          dark:      "#165C51",
          light:     "#E8F4F2",
          mid:       "#2A9C8A",
          accent:    "#F4A261",
          accentDk:  "#E8884A",
          accentLt:  "#FEF0E6",
          secondary: "#2F3E46",
          secMid:    "#4A5C65",
          sage:      "#CAD2C5",
          sageDk:    "#9BB5A6",
          sageLt:    "#EEF1EC",
          bg:        "#F7F8FA",
          bgWarm:    "#F5F3EF",
          card:      "#FFFFFF",
          subtle:    "#F0F2F5",
          border:    "#E4E9EC",
          borderMid: "#CAD5DA",
          text:      "#3D5059",
          heading:   "#1A2B2E",
          muted:     "#7A919A",
        },
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "20px",
        "4xl": "28px",
      },
      boxShadow: {
        soft:  "0 1px 4px rgba(47,62,70,0.06), 0 2px 12px rgba(47,62,70,0.04)",
        card:  "0 4px 16px rgba(47,62,70,0.08), 0 2px 6px rgba(47,62,70,0.05)",
        panel: "0 12px 40px rgba(47,62,70,0.10), 0 4px 12px rgba(47,62,70,0.06)",
      },
      animation: {
        "fade-up":   "fadeUp 0.65s cubic-bezier(0.4,0,0.2,1) forwards",
        "fill-bar":  "fillBar 1.4s cubic-bezier(0.4,0,0.2,1) 0.4s both",
        "dash-move": "dashMove 3s linear infinite",
        "float":     "gentleFloat 4s ease-in-out infinite",
      },
      transitionDuration: {
        250: "250ms",
        350: "350ms",
      },
    },
  },
  plugins: [],
};
