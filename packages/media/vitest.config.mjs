// Unit tests for the pure helpers of src/lib (formatting, selection, query building, sanitizer, the
// search state, query and connector) and the markup of the search section (rendered to a string).
// Separate from vite.config.mjs so the Jahia build plugin is not involved.
export default {
  esbuild: { jsx: "automatic" },
  test: {
    include: ["src/**/*.test.{ts,tsx}"],
    environment: "node",
  },
};
