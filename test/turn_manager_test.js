import { describe, it, beforeEach } from "@std/testing/bdd";
import { assert, assertEquals } from "@std/assert";
import { TurnManager } from "../src/models/Turn_manager.js";

describe("current user turn :", () => {
  let turnManager;

  beforeEach(() => {
    const randomFn = () => 0.9;
    const board = {
      yarns: [
        [1, 1, 1, 1, 1],
        [2, 2, 2, 2, 2],
        [3, 3, 3, 3, 3],
        [4, 4, 4, 4, 4],
        [5, 5, 5, 5, 5],
      ],
      tiles: [
        [
          { value: 0, playerId: null },
          { value: 1, playerId: null },
          { value: 2, playerId: null },
          { value: 3, playerId: null },
          { value: 4, playerId: null },
          { value: 0, playerId: null },
        ],
        [
          { value: 0, playerId: null },
          { value: 5, playerId: null },
          { value: 6, playerId: null },
          { value: 1, playerId: null },
          { value: 2, playerId: null },
          { value: 0, playerId: null },
        ],
        [
          { value: 0, playerId: null },
          { value: 3, playerId: null },
          { value: 4, playerId: null },
          { value: 5, playerId: null },
          { value: 6, playerId: null },
          { value: 0, playerId: null },
        ],
        [
          { value: 0, playerId: null },
          { value: 1, playerId: null },
          { value: 2, playerId: null },
          { value: 3, playerId: 123 },
          { value: 4, playerId: null },
          { value: 0, playerId: null },
        ],
        [
          { value: 0, playerId: null },
          { value: 5, playerId: null },
          { value: 6, playerId: null },
          { value: 1, playerId: null },
          { value: 2, playerId: null },
          { value: 0, playerId: null },
        ],
        [
          { value: 0, playerId: null },
          { value: 3, playerId: null },
          { value: 4, playerId: null },
          { value: 5, playerId: null },
          { value: 6, playerId: null },
          { value: 0, playerId: null },
        ],
      ],
    };

    turnManager = new TurnManager({ board }, randomFn);
  });

  describe("roll dice :", () => {
    it("when rollDice invoked, should return two random values :", () => {
      const actual = turnManager.rollDice();
      const expected = { number: 6, colorId: 6 };
      assertEquals(actual, expected);
    });
  });

  describe("find possible path : ", () => {
    it("when position, steps given, should return all possible locations", () => {
      const actual = turnManager.findPossibleDestinations({ x: 1, y: 1 }, 1);
      const expected = [
        { x: 1, y: 2, type: "normal", path: [{ x: 1, y: 1 }] },
        { x: 2, y: 1, type: "normal", path: [{ x: 1, y: 1 }] },
        { x: 1, y: 0, type: "normal", path: [{ x: 1, y: 1 }] },
        { x: 0, y: 1, type: "jump" },
        { x: 1, y: 3, type: "jump" },
        { x: 3, y: 1, type: "jump" },
        { x: 4, y: 3, type: "jump" },
      ];

      assertEquals(actual, expected);
    });

    it("when all number tiles are occupied then, should not show the type jump", () => {
      const board = {
        yarns: [
          [1, 1, 1, 1, 1],
          [2, 2, 2, 2, 2],
          [3, 3, 3, 3, 3],
          [4, 4, 4, 4, 4],
          [5, 5, 5, 5, 5],
        ],
        tiles: [
          [
            { value: 0, playerId: null },
            { value: 1, playerId: 2 },
            { value: 2, playerId: null },
            { value: 3, playerId: null },
            { value: 4, playerId: null },
            { value: 0, playerId: null },
          ],
          [
            { value: 0, playerId: null },
            { value: 5, playerId: null },
            { value: 6, playerId: null },
            { value: 1, playerId: 4 },
            { value: 2, playerId: null },
            { value: 0, playerId: null },
          ],
          [
            { value: 0, playerId: null },
            { value: 3, playerId: null },
            { value: 4, playerId: null },
            { value: 5, playerId: null },
            { value: 6, playerId: null },
            { value: 0, playerId: null },
          ],
          [
            { value: 0, playerId: null },
            { value: 1, playerId: 3 },
            { value: 2, playerId: null },
            { value: 3, playerId: 123 },
            { value: 4, playerId: null },
            { value: 0, playerId: null },
          ],
          [
            { value: 0, playerId: null },
            { value: 5, playerId: null },
            { value: 6, playerId: null },
            { value: 1, playerId: 2 },
            { value: 2, playerId: null },
            { value: 0, playerId: null },
          ],
          [
            { value: 0, playerId: null },
            { value: 3, playerId: null },
            { value: 4, playerId: null },
            { value: 5, playerId: null },
            { value: 6, playerId: null },
            { value: 0, playerId: null },
          ],
        ],
      };
      turnManager = new TurnManager({ board }, () => 0.1);
      const actual = turnManager.findPossibleDestinations({ x: 1, y: 1 }, 1);
      const expected = [
        { x: 1, y: 2, type: "normal", path: [{ x: 1, y: 1 }] },
        { x: 2, y: 1, type: "normal", path: [{ x: 1, y: 1 }] },
        { x: 1, y: 0, type: "normal", path: [{ x: 1, y: 1 }] },
      ];
      assertEquals(actual, expected);
    });

    it("when possible locations are provided, there should be no duplicates in the path", () => {
      const areDistinct = (coords) => {
        const positions = coords.map((coord) => {
          const key = `${coord.x},${coord.y}`;
          return key;
        });

        const set = new Set(positions);
        return coords.length === set.size;
      };

      const actual = turnManager.findPossibleDestinations({ x: 1, y: 2 }, 4);
      const status = actual.every(
        ({ type, path }) => type === "jump" || areDistinct(path),
      );
      assert(status);
    });
  });
});