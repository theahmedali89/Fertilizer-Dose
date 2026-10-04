import type { Config } from "tailwindcss";

// Tailwind accepts color functions at runtime; the cast satisfies its types.
const withAlpha = (variable: string) =>
  (( { opacityValue }: any) =>
    opacityValue === undefined
      ? `rgb(var(${variable}))`
      : `rgb(var(${variable}) / ${opacityValue})`) as unknown as string;

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // surfaces & text driven by CSS variables (light/dark)
        canvas: withAlpha("--canvas"),
        surface: withAlpha("--surface"),
        "surface-2": withAlpha("--surface-2"),
        ink: withAlpha("--ink"),
        "ink-soft": withAlpha("--ink-soft"),
        "ink-faint": withAlpha("--ink-faint"),
        line: withAlpha("--line"),
        // brand greens
        leaf: {
          50: "#f2f8f2",
          100: "#e0efe0",
          200: "#c2dfc4",
          300: "#94c79b",
          400: "#63a96e",
          500: "#428c4e",
          600: "#2f7039",
          700: "#275a30",
          800: "#224a29",
          900: "#1d3d24",
          950: "#0e2113",
        },
        // harvest amber accent
        harvest: {
          50: "#fdf8ec",
          100: "#faeed3",
          200: "#f4dca3",
          300: "#edc36d",
          400: "#e6a83f",
          500: "#dd9427",
          600: "#c2741d",
          700: "#a2571a",
          800: "#85441c",
          900: "#6e381b",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgb(0 0 0 / 0.05), 0 8px 24px -12px rgb(20 60 30 / 0.18)",
        lift: "0 2px 4px rgb(0 0 0 / 0.06), 0 16px 40px -16px rgb(20 60 30 / 0.28)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
