import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ticketit: {
          pink: "#F73582",
          "pink-hover": "#E22673",
          "pink-light": "#FDEBF3",
          "pink-subtle": "#FFF5F8",
          navy: "#2B253E",
          "navy-dark": "#1E192D",
          "navy-light": "#3C3554",
          "navy-subtle": "#4D4568",
          green: "#58B97D",
          "green-hover": "#4AA46C",
          "green-light": "#EAF7F0",
          blush: "#FF7B83",
          "blush-hover": "#FA636D",
          "blush-light": "#FFF0F2",
          coral: "#FF5E74",
          bg: "#E7EAEF",
          "bg-light": "#F2F5F8",
          "bg-white": "#FFFFFF",
          border: "#D9DDE5",
          "border-light": "#E8ECF2",
          "table-header": "#E8EDF5",
          "table-stripe": "#F9FAFC",
          "text-main": "#2B253E",
          "text-muted": "#6C758A",
          "text-light": "#96A0B5",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(43, 37, 62, 0.06), 0 1px 2px 0 rgba(43, 37, 62, 0.04)",
        dropdown: "0 4px 16px -2px rgba(43, 37, 62, 0.12), 0 2px 6px -1px rgba(43, 37, 62, 0.08)",
        modal: "0 20px 35px -5px rgba(43, 37, 62, 0.25), 0 10px 15px -5px rgba(43, 37, 62, 0.1)",
        btn: "0 1px 2px 0 rgba(0, 0, 0, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
