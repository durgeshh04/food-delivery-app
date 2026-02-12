/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#FE8C00",
        white: {
          DEFAULT: "#ffffff",
          100: "#fafafa",
          200: "#FE8C00",
        },
        gray: {
          100: "#878787",
          200: "#878787",
        },
        dark: {
          100: "#181C2E",
        },
        error: "#F14141",
        success: "#2F9B65",
      },
      fontFamily: {
        "quicksand-regular": ["QuickSand-Regular"],
        "quicksand-bold": ["QuickSand-Bold"],
        "quicksand-semibold": ["QuickSand-SemiBold"],
        "quicksand-light": ["QuickSand-Light"],
        "quicksand-medium": ["QuickSand-Medium"],
      },
    },
  },
  plugins: [],
};
