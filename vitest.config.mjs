// Unit tests for the pure helpers of src/lib (URL guards, sanitizer, query builder, dates).
// Separate from vite.config.mjs so the Jahia build plugin is not involved.
export default {
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
};
