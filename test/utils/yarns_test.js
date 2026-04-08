import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { areYarnsSwappable } from "../../src/utils/yarns.js";

describe("test areYarnsSwappable", () => {
  it("should return true if destination is belongs to allSwappableYarns", () => {
    const source = { x: 0, y: 0 };
    const destination = { x: 1, y: 1 };
    const allSwappableYarns = [destination, source];

    assertEquals(
      areYarnsSwappable(source, destination, allSwappableYarns),
      true,
    );
  });

  it("should return false if destination is not belongs to allSwappableYarns", () => {
    const source = { x: 0, y: 0 };
    const destination = { x: 1, y: 1 };
    const allSwappableYarns = [source, source];

    assertEquals(
      areYarnsSwappable(source, destination, allSwappableYarns),
      false,
    );
  });

  it("should return false if source is not belongs to allSwappableYarns", () => {
    const source = { x: 0, y: 0 };
    const destination = { x: 1, y: 1 };
    const allSwappableYarns = [destination, destination];

    assertEquals(
      areYarnsSwappable(source, destination, allSwappableYarns),
      false,
    );
  });
});
