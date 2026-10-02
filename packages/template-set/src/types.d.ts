/// <reference types="vite/client" />

/**
 * GraalJS host access, available in server code only (never in a .client.tsx island). Kept narrow:
 * the module only uses it to read type labels from Jahia's node type registry.
 */
declare global {
  const Java: {
    type<T = unknown>(className: string): T;
  };
}

export {};
