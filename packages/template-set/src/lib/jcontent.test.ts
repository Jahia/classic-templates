import { describe, expect, it } from "vitest";
import { jcontentUrl } from "./jcontent.js";

describe("jcontentUrl", () => {
  it("opens a content folder in the content folders accordion", () => {
    expect(jcontentUrl("/sites/molex/contents/news", "en")).toBe(
      "/jahia/jcontent/molex/en/content-folders/contents/news",
    );
  });

  it("opens a page in pages, a file folder in media", () => {
    expect(jcontentUrl("/sites/molex/home/products", "fr")).toBe(
      "/jahia/jcontent/molex/fr/pages/home/products",
    );
    expect(jcontentUrl("/sites/molex/files/images", "en")).toBe(
      "/jahia/jcontent/molex/en/media/files/images",
    );
  });

  it("opens the site's content folders for the site itself", () => {
    expect(jcontentUrl("/sites/molex", "en")).toBe(
      "/jahia/jcontent/molex/en/content-folders/contents",
    );
  });

  it("starts with the context path, once", () => {
    expect(jcontentUrl("/sites/molex/contents", "en", "/jahia-app/")).toBe(
      "/jahia-app/jahia/jcontent/molex/en/content-folders/contents",
    );
  });

  it("encodes each segment and refuses a node outside a site", () => {
    expect(jcontentUrl("/sites/molex/contents/a b", "zh_CN")).toBe(
      "/jahia/jcontent/molex/zh_CN/content-folders/contents/a%20b",
    );
    expect(jcontentUrl("/users/root", "en")).toBeUndefined();
  });
});
