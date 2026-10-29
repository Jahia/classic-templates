/**
 * The view of the page that another module names as the body of its own template (the ctplShell
 * view's "body" module parameter): a view name, nothing that could reach another node type or a
 * path. Anything else is ignored and the shell renders the page title only.
 */
export const bodyViewOf = (value: unknown): string | undefined =>
  typeof value === "string" && /^[A-Za-z][\w-]{0,63}$/.test(value) ? value : undefined;
