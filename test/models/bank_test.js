import { assertEquals, assertThrows } from "@std/assert";
import { beforeEach, describe, it } from "@std/testing/bdd";
import Bank from "../../src/models/bank.js";

describe("bank", () => {
  let designCards;
  let actionCards;
  const shuffle = (pattern) => pattern;

  beforeEach(() => {
    designCards = [
      { "id": 1, "victoryPoints": 1 },
      { "id": 2, "victoryPoints": 1 },
    ];
    actionCards = [{
      "id": 1,
      "type": "move",
      "description": "Move the pin to any unoccupied square.",
    }, {
      "id": 2,
      "type": "move",
      "description": "Move the pin to any unoccupied square.",
    }];
  });

  describe("Get bank", () => {
    it("should return bank data in a rich object when passing shuffle function", () => {
      const bank = new Bank(designCards, actionCards, shuffle);
      const result = {
        tokens: 55,
        availableDesignCards: 2,
        availableActionCards: 2,
        yarns: [1, 2, 3, 4, 5],
        tiles: [{ value: 1, playerId: null }, { value: 6, playerId: null }],
      };

      assertEquals(bank.getBank(), result);
    });

    it(
      "length of cards should be zero when design and action cards are undefined",
      () => {
        const result = {
          tokens: 55,
          availableDesignCards: 0,
          availableActionCards: 0,
          yarns: [1, 2, 3, 4, 5],
          tiles: [{ value: 1, playerId: null }, { value: 6, playerId: null }],
        };
        const bank = new Bank(undefined, undefined, shuffle);
        assertEquals(bank.getBank(), result);
      },
    );

    it(
      "should update bank state after initial token and card distribution",
      () => {
        const players = [
          {
            name: "A",
            id: 1,
            tokens: 0,
            victoryPoint: 0,
            actionCards: [],
            designCards: [],
            pin: { color: 2, pos: { x: 2, y: 1 } },
          },
          {
            name: "B",
            id: 1,
            tokens: 0,
            victoryPoint: 0,
            actionCards: [],
            designCards: [],
            pin: { color: 3, pos: { x: 4, y: 1 } },
          },
        ];

        const result = {
          tokens: 51,
          availableDesignCards: 0,
          availableActionCards: 0,
          yarns: [1, 2, 3, 4, 5],
          tiles: [{ value: 1, playerId: null }, { value: 6, playerId: null }],
        };

        const bank = new Bank(designCards, actionCards, shuffle);
        bank.distributeInitialAssets(players);

        assertEquals(bank.getBank(), result);
      },
    );
  });

  describe("Buy Design Card", () => {
    it("shuld return new design card", () => {
      const bank = new Bank(designCards, actionCards, (x) => x);
      const result = { "id": 1, "victoryPoints": 1 };

      assertEquals(bank.buyDesignCard(), result);
    });

    it("shuld throw error as design card are empty", () => {
      const bank = new Bank([], actionCards);

      assertThrows(() => bank.buyDesignCard());
    });
  });

  describe("Buy Action Card", () => {
    it("shuld return new action card", () => {
      const bank = new Bank(designCards, actionCards, shuffle);
      const result = {
        "id": 1,
        "type": "move",
        "description": "Move the pin to any unoccupied square.",
      };

      assertEquals(bank.buyActionCard(), result);
    });

    it("should give new action card after re-shuffle when deck is empty", () => {
      const bank = new Bank(designCards, actionCards, shuffle);
      bank.buyActionCard();
      bank.buyActionCard();

      const result = {
        "id": 1,
        "type": "move",
        "description": "Move the pin to any unoccupied square.",
      };

      assertEquals(bank.buyActionCard(), result);
    });
  });
});
