import { describe, it } from "@std/testing/bdd";
import { rotateDesign } from "../../src/utils/pattern_match.js";
import { assertEquals } from "@std/assert/equals";


describe("Rotating design", () => {
  it("", () => {
    const single = [
      { coord: { x: 2, y: 2 }, color: 9 },
    ];

    const result = rotateDesign(single, 5);

    const expected = [
      { coord: { x: 2, y: 2 }, color: 9 },
    ];

    assertEquals(result, expected);
  });
});
