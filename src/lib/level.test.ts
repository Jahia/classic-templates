import { describe, expect, it } from "vitest";
import { clampLevel, innerLevel, sectionLevel, type LevelTree } from "./level.js";

interface FakeNode {
  name: string;
  type: string;
  title?: string;
  parent?: FakeNode;
}

/** A chain of nodes from the outermost container down; returns the innermost (the section). */
const chain = (...nodes: Omit<FakeNode, "parent">[]): FakeNode =>
  nodes.reduce<FakeNode | undefined>((parent, node) => ({ ...node, parent }), undefined)!;

const tree = (depends: string[] = []): LevelTree<FakeNode> => ({
  parent: (node) => {
    if (!node.parent) throw new Error("no parent");
    return node.parent;
  },
  isType: (node, type) => node.type === type,
  titled: (node) => Boolean(node.title),
  depend: (node) => depends.push(node.name),
});

const page = { name: "page", type: "jnt:page" };
const area = { name: "main", type: "ctpl:pageArea" };
const fareList = { name: "fares", type: "ctrv:fareList", title: "Fares" };
const titledColumns = { name: "row", type: "ctpl:columns", title: "Row" };
const untitledColumns = { name: "row", type: "ctpl:columns" };
const column = { name: "col1", type: "ctpl:column" };
const titledTabs = { name: "tabs", type: "ctpl:tabs", title: "Tabs" };
const untitledTabs = { name: "tabs", type: "ctpl:tabs" };
const tab = { name: "tab1", type: "ctpl:tab", title: "Tab" };
const titledZone = { name: "zone", type: "ctpl:freeZone", title: "Zone" };
const untitledZone = { name: "zone", type: "ctpl:freeZone" };

describe("sectionLevel", () => {
  it("is h2 in a page area, and for a node without a readable parent", () => {
    expect(sectionLevel(chain(page, area, fareList), tree())).toBe(2);
    expect(sectionLevel(chain(fareList), tree())).toBe(2);
  });

  it("steps down in a column of a titled row only", () => {
    expect(sectionLevel(chain(page, area, titledColumns, column, fareList), tree())).toBe(3);
    expect(sectionLevel(chain(page, area, untitledColumns, column, fareList), tree())).toBe(2);
  });

  it("puts a tab's sections one below the tab label, itself one below a tabs title", () => {
    const tabs = chain(page, area, titledTabs);
    const label = innerLevel(sectionLevel(tabs, tree()), true);
    expect(label).toBe(3);
    expect(sectionLevel(chain(page, area, titledTabs, tab, fareList), tree())).toBe(4);
  });

  it("does not count an untitled tabs section, but still the tab label", () => {
    const label = innerLevel(sectionLevel(chain(page, area, untitledTabs), tree()), false);
    expect(label).toBe(2);
    expect(sectionLevel(chain(page, area, untitledTabs, tab, fareList), tree())).toBe(3);
  });

  it("follows tabs nested in a column of a titled row", () => {
    const tabs = chain(page, area, titledColumns, column, titledTabs);
    expect(sectionLevel(tabs, tree())).toBe(3);
    expect(innerLevel(sectionLevel(tabs, tree()), true)).toBe(4);
    expect(
      sectionLevel(chain(page, area, titledColumns, column, titledTabs, tab, fareList), tree()),
    ).toBe(5);
    expect(
      sectionLevel(chain(page, area, untitledColumns, column, untitledTabs, tab, fareList), tree()),
    ).toBe(3);
  });

  it("steps down in a titled free zone only, wherever the zone sits", () => {
    expect(sectionLevel(chain(page, area, titledZone, fareList), tree())).toBe(3);
    expect(sectionLevel(chain(page, area, untitledZone, fareList), tree())).toBe(2);
    expect(sectionLevel(chain(page, area, titledTabs, tab, titledZone, fareList), tree())).toBe(5);
  });

  it("clamps at h6", () => {
    const deep = chain(
      page,
      area,
      titledColumns,
      column,
      titledTabs,
      tab,
      { ...titledColumns, name: "row2" },
      column,
      titledTabs,
      tab,
      fareList,
    );
    expect(sectionLevel(deep, tree())).toBe(6);
  });

  it("registers every container whose title decides the level", () => {
    const depends: string[] = [];
    sectionLevel(
      chain(page, area, titledColumns, column, titledTabs, tab, fareList),
      tree(depends),
    );
    expect(depends).toEqual(["tabs", "row"]);
    const none: string[] = [];
    sectionLevel(chain(page, area, fareList), tree(none));
    expect(none).toEqual([]);
  });
});

describe("levels", () => {
  it("keeps a level between h2 and h6", () => {
    expect(clampLevel(1)).toBe(2);
    expect(clampLevel(9)).toBe(6);
    expect(clampLevel(Number.NaN)).toBe(2);
    expect(clampLevel(3.4)).toBe(3);
  });

  it("puts a section's inner headings one below its title when it shows one", () => {
    expect(innerLevel(2, true)).toBe(3);
    expect(innerLevel(2, false)).toBe(2);
    expect(innerLevel(6, true)).toBe(6);
  });
});
