import { assertEquals } from "@std/assert";
import { beforeEach, describe, it } from "@std/testing/bdd";
import { Bank } from "../../src/models/bank.js";

describe("bank", () => {
  let designCards;
  let actionCards;

  beforeEach(() => {
    designCards = [{ "id": 1, "victoryPoints": 1 }];
    actionCards = [{
      "id": 1,
      "type": "move",
      "description": "Move the pin to any unoccupied square.",
    }];
  });

  describe("Get bank", () => {
    it("should return bank data in a rich object when passing shuffle function", () => {
      const shuffleFn = (patterns) => patterns;
      const bank = new Bank(designCards, actionCards, shuffleFn);
      const result = {
        tokens: 55,
        availableDesignCards: 1,
        availableActionCards: 1,
        yarns: [1, 2, 3, 4, 5],
        tiles: [1, 2],
      };

      assertEquals(bank.getBank(), result);
    });

    it(
      "length of cards should be zero when design and action cards are undefined",
      () => {
        const shuffleFn = (patterns) => patterns;

        const result = {
          tokens: 55,
          availableDesignCards: 0,
          availableActionCards: 0,
          yarns: [1, 2, 3, 4, 5],
          tiles: [1, 2],
        };
        const bank = new Bank(undefined, undefined, shuffleFn);
        assertEquals(bank.getBank(), result);
      },
    );
  });
});
