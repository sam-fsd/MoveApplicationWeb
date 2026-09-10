import type { Config } from "tailwindcss";

/**
 * Tokens sampled from the Stitch HTML exports in `docs/code/`, which win over
 * `docs/DESIGN_SYSTEM.md` wherever the two disagree (the design doc was written
 * by eye and every one of its hex values is slightly off).
 *
 * The exports ship three different token vocabularies across the 24 screens
 * (Material-3 names on 22, `brand.*` on screen 02, a third scheme on screen 12).
 * The names below are the project's own vocabulary; the values are the exports'.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: "#FFC93C",
        "brand-hover": "#F4BF32",
        "brand-subtle": "#FFF7DB",

        ink: "#12151C",
        "ink-soft": "#1E232F",
        muted: "#5A6472",
        "muted-subtle": "#9EABB9",

        bg: "#FAF9F6",
        surface: "#FFFFFF",
        "surface-low": "#F4F3F1",
        "surface-container": "#EFEEEB",
        border: "#E6E3DC",

        success: "#1F9D55",
        "success-bg": "#E8F8EE",
        warning: "#E08700",
        "warning-bg": "#FEF3E2",
        danger: "#D93025",
        "danger-bg": "#FCE8E6",

        whatsapp: "#1F9D55",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-jakarta)", "var(--font-inter)", "sans-serif"],
      },
      fontSize: {
        "headline-xl": ["36px", { lineHeight: "44px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-xl-mobile": ["28px", { lineHeight: "36px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-lg": ["30px", { lineHeight: "38px", letterSpacing: "-0.02em", fontWeight: "600" }],
        "headline-lg-mobile": ["24px", { lineHeight: "32px", letterSpacing: "-0.02em", fontWeight: "600" }],
        "headline-md": ["22px", { lineHeight: "28px", letterSpacing: "-0.015em", fontWeight: "600" }],
        "headline-sm": ["18px", { lineHeight: "24px", letterSpacing: "-0.01em", fontWeight: "600" }],
        "price-hero": ["28px", { lineHeight: "34px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "price-listing": ["20px", { lineHeight: "26px", letterSpacing: "-0.01em", fontWeight: "600" }],
        "body-lg": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "body-md": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "body-sm": ["12px", { lineHeight: "16px", fontWeight: "400" }],
        "label-md": ["14px", { lineHeight: "20px", fontWeight: "600" }],
        "label-sm": ["12px", { lineHeight: "16px", letterSpacing: "0.01em", fontWeight: "600" }],
        caption: ["11px", { lineHeight: "14px", fontWeight: "500" }],
      },
      spacing: {
        "space-2xs": "0.25rem",
        "space-xs": "0.5rem",
        "space-sm": "0.75rem",
        "space-md": "1rem",
        "space-lg": "1.5rem",
        "space-xl": "2rem",
        "space-2xl": "2.5rem",
        "space-3xl": "3rem",
        "section-gap": "2rem",
        "gutter-mobile": "1rem",
        "gutter-desktop": "1.5rem",
        "container-max": "1280px",
        sidebar: "16rem",
      },
      maxWidth: {
        "container-max": "1280px",
      },
      boxShadow: {
        card: "0 1px 8px rgba(18,21,28,0.04)",
        raised: "0 4px 16px rgba(18,21,28,0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
