// Unit tests for the pure helpers of src/lib (formatting, selection, query building, sanitizer).
// Separate from vite.config.mjs so the Jahia build plugin is not involved.
export default {
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
};
