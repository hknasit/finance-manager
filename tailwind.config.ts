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
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  extend: {
    keyframes: {
      'slide-left': {
        '0%': { transform: 'translateX(100%)' },
        '100%': { transform: 'translateX(0)' },
      },
      'fade-scale': {
        '0%': { opacity: '0', transform: 'scale(0.95)' },
        '100%': { opacity: '1', transform: 'scale(1)' },
      },
    },
    animation: {
      'slide-left': 'slide-left 0.3s ease-out',
      'fade-scale': 'fade-scale 0.2s ease-out',
    },
  },
  plugins: [],
};
export default config;
