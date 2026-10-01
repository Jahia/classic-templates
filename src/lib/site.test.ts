import { describe, expect, it } from "vitest";
import type { RenderContext } from "org.jahia.services.render";
import { pageSite } from "./site.js";

const site = (key: string) => ({ getSiteKey: () => key }) as never;
const context = (requestSite: string, pageSiteKey?: string, throws = false) =>
  ({
    getSite: () => site(requestSite),
    getMainResource: () => {
      if (throws) throw new Error("no main resource");
      return pageSiteKey === undefined
        ? undefined
        : { getNode: () => ({ getResolveSite: () => site(pageSiteKey) }) };
    },
  }) as unknown as RenderContext;

const keyOf = (s: unknown) => (s as { getSiteKey: () => string }).getSiteKey();

describe("pageSite", () => {
  it("returns the site of the page, not the one resolved from the request", () => {
    expect(keyOf(pageSite(context("classic-dev", "skylantern")))).toBe("skylantern");
  });

  it("falls back to the request's site without a main resource", () => {
    expect(keyOf(pageSite(context("classic-dev")))).toBe("classic-dev");
    expect(keyOf(pageSite(context("classic-dev", undefined, true)))).toBe("classic-dev");
  });
});
