import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import {
  createLedger,
  findAdjacentYarns,
  isValidPosition,
  settlement,
} from "../../src/utils/color_dice_action.js";

describe("color_dice_action", () => {
  describe("isValidPosition", () => {
    it("should return true for a position that is on the board", () => {
      const isValid = isValidPosition({ x: 1, y: 1 });
      assertEquals(isValid, true);
    });

    it("should return true for position 0, 0", () => {
      const isValid = isValidPosition({ x: 0, y: 0 });
      assertEquals(isValid, true);
    });

    it("should return true for position 4, 4", () => {
      const isValid = isValidPosition({ x: 4, y: 4 });
      assertEquals(isValid, true);
    });

    it("should return true for position 0, 4", () => {
      const isValid = isValidPosition({ x: 0, y: 4 });
      assertEquals(isValid, true);
    });

    it("should return true for position 4, 0", () => {
      const isValid = isValidPosition({ x: 4, y: 0 });
      assertEquals(isValid, true);
    });

    it("should return false for a position that is not on the board", () => {
      const isValid = isValidPosition({ x: -1, y: -1 });
      assertEquals(isValid, false);
    });

    it("should return false for a position where x is valid y is not", () => {
      const isValid = isValidPosition({ x: 2, y: -1 });
      assertEquals(isValid, false);
    });

    it("should return false for a position where y is valid x is not", () => {
      const isValid = isValidPosition({ x: -2, y: 1 });
      assertEquals(isValid, false);
    });
  });

  describe("findAdjacentYarns", () => {
    it("should give 4 adjacent yarns when given a position that has 4 adjacent yarns", () => {
      const adjacent = findAdjacentYarns({ x: 1, y: 1 });
      const expected = [
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
      ];

      assertEquals(adjacent, expected);
    });

    it("should give 2 adjacent yarns when position in right boundary", () => {
      const adjacent = findAdjacentYarns({ x: 2, y: 5 });
      const expected = [
        { x: 1, y: 4 },
        { x: 2, y: 4 },
      ];

      assertEquals(adjacent, expected);
    });

    it("should give 2 adjacent yarns when position in top boundary", () => {
      const adjacent = findAdjacentYarns({ x: 0, y: 1 });
      const expected = [
        { x: 0, y: 0 },
        { x: 0, y: 1 },
      ];

      assertEquals(adjacent, expected);
    });

    it("should give 2 adjacent yarns when position in bottom boundary", () => {
      const adjacent = findAdjacentYarns({ x: 5, y: 1 });
      const expected = [
        { x: 4, y: 0 },
        { x: 4, y: 1 },
      ];

      assertEquals(adjacent, expected);
    });

    it("should give 2 adjacent yarns when position in bottom boundary", () => {
      const adjacent = findAdjacentYarns({ x: 3, y: 0 });
      const expected = [
        { x: 2, y: 0 },
        { x: 3, y: 0 },
      ];

      assertEquals(adjacent, expected);
    });

    it("should give 0,0 adjacent yarn when given a position is in topLeft corner", () => {
      const adjacent = findAdjacentYarns({ x: 0, y: 0 });
      const expected = [
        { x: 0, y: 0 },
      ];

      assertEquals(adjacent, expected);
    });

    it("should give 0,4 adjacent yarn when given a position is in topRight corner", () => {
      const adjacent = findAdjacentYarns({ x: 0, y: 5 });
      const expected = [
        { x: 0, y: 4 },
      ];

      assertEquals(adjacent, expected);
    });

    it("should give 4,4 adjacent yarn when given a position is in bottomRight corner", () => {
      const adjacent = findAdjacentYarns({ x: 5, y: 5 });
      const expected = [
        { x: 4, y: 4 },
      ];

      assertEquals(adjacent, expected);
    });

    it("should give 4,0 adjacent yarn when given a position is in bottomLeft corner", () => {
      const adjacent = findAdjacentYarns({ x: 5, y: 0 });
      const expected = [
        { x: 4, y: 0 },
      ];

      assertEquals(adjacent, expected);
    });
  });

  describe("settlement", () => {
    it("has to give back 1 when player has one adjacent yarn with the color rolled", () => {
      const yarns = [
        [1, 2, 3, 4, 5],
        [5, 4, 3, 2, 1],
        [1, 2, 3, 4, 5],
        [5, 4, 3, 2, 1],
        [1, 2, 3, 4, 5],
      ];
      const player = {
        position: { x: 1, y: 1 },
        getId: () => 1,
        getPosition: () => ({ x: 1, y: 1 }),
      };

      const credit = settlement(player, 1, yarns);
      const expected = 1;

      assertEquals(credit, expected);
    });

    it("has to give back 2 when player has 2 adjacent yarn with the color rolled", () => {
      const yarns = [
        [1, 2, 3, 4, 5],
        [5, 1, 3, 2, 1],
        [1, 2, 3, 4, 5],
        [5, 4, 3, 2, 1],
        [1, 2, 3, 4, 5],
      ];
      const player = {
        position: { x: 1, y: 1 },
        getId: () => 1,
        getPosition: () => ({ x: 1, y: 1 }),
      };

      const credit = settlement(player, 1, yarns);
      const expected = 2;

      assertEquals(credit, expected);
    });

    it("has to give back 3 when player has 3 adjacent yarn with the color rolled", () => {
      const yarns = [
        [1, 1, 3, 4, 5],
        [5, 1, 3, 2, 1],
        [1, 2, 3, 4, 5],
        [5, 4, 3, 2, 1],
        [1, 2, 3, 4, 5],
      ];
      const player = {
        position: { x: 1, y: 1 },
        getId: () => 1,
        getPosition: () => ({ x: 1, y: 1 }),
      };

      const credit = settlement(player, 1, yarns);
      const expected = 3;

      assertEquals(credit, expected);
    });

    it("has to give back 4 when player has 4 adjacent yarn with the color rolled", () => {
      const yarns = [
        [1, 1, 3, 4, 5],
        [1, 1, 3, 2, 1],
        [1, 2, 3, 4, 5],
        [5, 4, 3, 2, 1],
        [1, 2, 3, 4, 5],
      ];
      const player = {
        position: { x: 1, y: 1 },
        getId: () => 1,
        getPosition: () => ({ x: 1, y: 1 }),
      };

      const credit = settlement(player, 1, yarns);
      const expected = 4;

      assertEquals(credit, expected);
    });

    it("has to give back 1 when player has 1 adjacent yarn with the color rolled and is in corner", () => {
      const yarns = [
        [1, 1, 3, 4, 5],
        [1, 1, 3, 2, 1],
        [1, 2, 3, 4, 5],
        [5, 4, 3, 2, 1],
        [1, 2, 3, 4, 5],
      ];
      const player = {
        position: { x: 0, y: 0 },
        getId: () => 1,
        getPosition: () => ({ x: 0, y: 0 }),
      };

      const credit = settlement(player, 1, yarns);
      const expected = 1;

      assertEquals(credit, expected);
    });

    it("has to give back 0 when player has 0 adjacent yarn with the color rolled", () => {
      const yarns = [
        [1, 1, 3, 4, 5],
        [1, 1, 3, 2, 1],
        [1, 2, 3, 4, 5],
        [5, 4, 3, 2, 1],
        [1, 2, 3, 4, 5],
      ];
      const player = {
        position: { x: 3, y: 3 },
        getId: () => 1,
        getPosition: () => ({ x: 3, y: 3 }),
      };

      const credit = settlement(player, 1, yarns);
      const expected = 0;

      assertEquals(credit, expected);
    });

    it("has to give back 0 when player has 0 adjacent yarn with the color rolled and is in corner", () => {
      const yarns = [
        [1, 1, 3, 4, 5],
        [1, 1, 3, 2, 1],
        [1, 2, 3, 4, 5],
        [5, 4, 3, 2, 1],
        [1, 2, 3, 4, 5],
      ];
      const player = {
        position: { x: 5, y: 5 },
        getId: () => 1,
        getPosition: () => ({ x: 5, y: 5 }),
      };

      const credit = settlement(player, 1, yarns);
      const expected = 0;

      assertEquals(credit, expected);
    });
  });

  describe("createledger", () => {
    it("every player has one adjacent and gets 1 each", () => {
      const yarns = [
        [1, 2, 3, 4, 5],
        [5, 4, 3, 2, 4],
        [1, 2, 3, 1, 5],
        [5, 4, 3, 2, 5],
        [1, 2, 3, 4, 1],
      ];
      const players = [
        {
          position: { x: 1, y: 1 },
          getId: () => 1,
          getPosition: () => ({ x: 1, y: 1 }),
        },
        {
          position: { x: 3, y: 3 },
          getId: () => 2,
          getPosition: () => ({ x: 3, y: 3 }),
        },
        {
          position: { x: 2, y: 3 },
          getId: () => 3,
          getPosition: () => ({ x: 3, y: 3 }),
        },
        {
          position: { x: 5, y: 4 },
          getId: () => 4,
          getPosition: () => ({ x: 5, y: 4 }),
        },
      ];

      const legder = createLedger(1, players, yarns);
      const expected = { 1: 1, 2: 1, 3: 1, 4: 1 };
      assertEquals(legder, expected);
    });

    it("only player has one adjacent and gets 1, everyone else 0", () => {
      const yarns = [
        [1, 2, 3, 4, 5],
        [5, 4, 3, 2, 4],
        [4, 2, 3, 3, 5],
        [5, 4, 3, 2, 5],
        [2, 2, 3, 4, 5],
      ];
      const players = [
        {
          position: { x: 1, y: 1 },
          getId: () => 1,
          getPosition: () => ({ x: 1, y: 1 }),
        },
        {
          position: { x: 3, y: 3 },
          getId: () => 2,
          getPosition: () => ({ x: 3, y: 3 }),
        },
        {
          position: { x: 2, y: 3 },
          getId: () => 3,
          getPosition: () => ({ x: 3, y: 3 }),
        },
        {
          position: { x: 5, y: 4 },
          getId: () => 4,
          getPosition: () => ({ x: 5, y: 4 }),
        },
      ];

      const legder = createLedger(1, players, yarns);
      const expected = { 1: 1, 2: 0, 3: 0, 4: 0 };
      assertEquals(legder, expected);
    });

    it("no player has any adjacent everyone 0", () => {
      const yarns = [
        [5, 2, 3, 4, 5],
        [5, 4, 3, 2, 4],
        [4, 2, 3, 3, 5],
        [5, 4, 3, 2, 5],
        [2, 2, 3, 4, 5],
      ];
      const players = [
        {
          position: { x: 1, y: 1 },
          getId: () => 1,
          getPosition: () => ({ x: 1, y: 1 }),
        },
        {
          position: { x: 3, y: 3 },
          getId: () => 2,
          getPosition: () => ({ x: 3, y: 3 }),
        },
        {
          position: { x: 2, y: 3 },
          getId: () => 3,
          getPosition: () => ({ x: 3, y: 3 }),
        },
        {
          position: { x: 5, y: 4 },
          getId: () => 4,
          getPosition: () => ({ x: 5, y: 4 }),
        },
      ];

      const legder = createLedger(1, players, yarns);
      const expected = { 1: 0, 2: 0, 3: 0, 4: 0 };
      assertEquals(legder, expected);
    });

    it("one player has 4 adjacent and everyone 0", () => {
      const yarns = [
        [1, 1, 3, 4, 5],
        [1, 1, 3, 2, 4],
        [4, 2, 3, 3, 5],
        [5, 4, 3, 2, 5],
        [2, 2, 3, 4, 5],
      ];
      const players = [
        {
          position: { x: 1, y: 1 },
          getId: () => 1,
          getPosition: () => ({ x: 1, y: 1 }),
        },
        {
          position: { x: 3, y: 3 },
          getId: () => 2,
          getPosition: () => ({ x: 3, y: 3 }),
        },
        {
          position: { x: 2, y: 3 },
          getId: () => 3,
          getPosition: () => ({ x: 3, y: 3 }),
        },
        {
          position: { x: 5, y: 4 },
          getId: () => 4,
          getPosition: () => ({ x: 5, y: 4 }),
        },
      ];

      const legder = createLedger(1, players, yarns);
      const expected = { 1: 4, 2: 0, 3: 0, 4: 0 };
      assertEquals(legder, expected);
    });

    it("rolled color value is 6", () => {
      const yarns = [
        [1, 1, 3, 4, 5],
        [1, 1, 3, 2, 4],
        [4, 2, 3, 3, 5],
        [5, 4, 3, 2, 5],
        [2, 2, 3, 4, 5],
      ];
      const players = [
        {
          position: { x: 1, y: 1 },
          getId: () => 1,
          getPosition: () => ({ x: 1, y: 1 }),
        },
        {
          position: { x: 3, y: 3 },
          getId: () => 2,
          getPosition: () => ({ x: 3, y: 3 }),
        },
        {
          position: { x: 2, y: 3 },
          getId: () => 3,
          getPosition: () => ({ x: 3, y: 3 }),
        },
        {
          position: { x: 5, y: 4 },
          getId: () => 4,
          getPosition: () => ({ x: 5, y: 4 }),
        },
      ];

      const legder = createLedger(6, players, yarns);
      const expected = { 1: 0, 2: 0, 3: 0, 4: 0 };
      assertEquals(legder, expected);
    });
  });
});
