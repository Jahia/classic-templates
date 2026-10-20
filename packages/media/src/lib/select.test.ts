import { describe, expect, it } from "vitest";
import { facetValues, groupByDay, indexOf, related, sortPeople } from "./select.js";

describe("sortPeople and indexOf", () => {
  const people = [
    { id: "1", sortName: "Okafor" },
    { id: "2", sortName: "álvarez" },
    { id: "3", sortName: "Lindqvist" },
    { id: "4", sortName: "Abara" },
  ];

  it("sorts by sort name in the page's language, accents and case ignored", () => {
    expect(sortPeople(people, "fr").map((p) => p.id)).toEqual(["4", "2", "3", "1"]);
  });

  it("indexes each letter once, pointing at its first person", () => {
    expect(indexOf(sortPeople(people, "en"))).toEqual([
      { letter: "A", id: "4" },
      { letter: "L", id: "3" },
      { letter: "O", id: "1" },
    ]);
  });
});

describe("groupByDay and facetValues", () => {
  const sessions = [
    {
      id: "b",
      day: "2027-06-08",
      start: "2027-06-08T11:00:00Z",
      stream: "Conference",
      room: "B2",
      type: "panel",
    },
    {
      id: "a",
      day: "2027-06-08",
      start: "2027-06-08T09:00:00Z",
      stream: "Awards",
      room: "Main stage",
      type: "keynote",
    },
    {
      id: "c",
      day: "2027-06-09",
      start: "2027-06-09T09:00:00Z",
      stream: "Conference",
      room: "B2",
      type: "talk",
    },
    { id: "undated" },
  ];

  it("groups by day, in order, sessions by start time, undated ones left out", () => {
    expect(groupByDay(sessions).map((d) => [d.day, d.sessions.map((s) => s.id)])).toEqual([
      ["2027-06-08", ["a", "b"]],
      ["2027-06-09", ["c"]],
    ]);
  });

  it("lists each facet value once, sorted", () => {
    expect(facetValues(sessions, "stream", "en")).toEqual(["Awards", "Conference"]);
    expect(facetValues(sessions, "room", "en")).toEqual(["B2", "Main stage"]);
  });
});

describe("related", () => {
  it("prefers the most shared categories, then the newest, never the story itself", () => {
    const story = { id: "s", categories: ["ai", "cloud"] };
    const candidates = [
      { id: "s", categories: ["ai", "cloud"], published: "2026-10-09" },
      { id: "old-two", categories: ["ai", "cloud"], published: "2026-09-01" },
      { id: "new-one", categories: ["ai"], published: "2026-10-08" },
      { id: "older-one", categories: ["cloud"], published: "2026-08-01" },
      { id: "none", categories: ["sport"], published: "2026-10-10" },
    ];
    expect(related(story, candidates, 2).map((c) => c.id)).toEqual(["old-two", "new-one"]);
  });
});
