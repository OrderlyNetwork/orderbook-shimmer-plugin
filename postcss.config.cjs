/** @type {import('postcss-load-config').Config} */
module.exports = {
  // Tailwind is required so Vite/Storybook can expand `@tailwind ...` directives
  // inside `src/tailwind.css` at dev/build time.
  plugins: {
    tailwindcss: {},
  },
};

