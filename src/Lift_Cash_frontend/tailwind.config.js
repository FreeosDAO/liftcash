// /** @type {import('tailwindcss').Config} */
// export default {
//   darkMode: "class", // Enables class-based dark mode
//   content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
//   theme: {
//     extend: {
//       colors: {
//         primary: "#479fe6",
//         secondary: "#111827",
//       },
//       fontFamily: {
//         inter: ["Inter", "sans-serif"],
//       },
//     },
//   },
//   plugins: [],
// };

import defaultTheme from "tailwindcss/defaultTheme";

export default {
  darkMode: 'class',
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Montserrat', 'sans-serif'],
      },
      fontSize: {
        base: ["16px", "1.5"],
        sm: ["14px", "1.4"],
        lg: ["20px", "1.5"],
        xl: ["24px", "1.5"],
        "2xl": ["28px", "1.5"],
        "3xl": ["30px", "1.5"],
        "4xl": ["48px", "1.2"],
      },
      fontWeight: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
      colors: {
        primary: "var(--accent-primary)",
        secondary: "var(--bg-secondary)",
        accent: "var(--accent-primary)",
        "accent-hover": "var(--accent-hover)",
        "bg-primary": "var(--bg-primary)",
        "bg-secondary": "var(--bg-secondary)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "card-bg": "var(--card-bg)",
        "border-color": "var(--border-color)",
        "input-bg": "var(--input-bg)",
        "input-border": "var(--input-border)",
        "input-focus": "var(--input-focus)",
        "shadow-color": "var(--shadow-color)",
        // Legacy colors mapped to new theme
        cyan: "var(--accent-primary)",
        coral: "var(--accent-hover)",
        "orange-red": "var(--accent-primary)",
        gold: "#FFD700",
        "blue-violet": "var(--accent-primary)",
        "light-grey": "var(--border-color)",
        "dark-grey": "var(--bg-secondary)",
        "very-light-grey": "#fafafa",
        "medium-grey": "var(--text-secondary)",
        "muted-grey": "var(--card-bg)",
        "transparent-white": "#ffffff0d",
        black: "#000000",
        white: "#FFFFFF",
      },
    },
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
  },
  plugins: [],
};
