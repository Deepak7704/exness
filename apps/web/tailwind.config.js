const { BENTO_TAILWIND_CONFIG } = require("@bentoproject/tailwindcss");

/** @type {import('tailwindcss').Config} */
module.exports = {
  ...BENTO_TAILWIND_CONFIG,
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
};