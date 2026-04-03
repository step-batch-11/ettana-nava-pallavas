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
    it("when get bank function is called, then should return the current bank state", () => {
      const bank = new Bank(designCards, actionCards, shuffle);
      const result = {
        tokens: 55,
        availableDesignCards: 2,
        availableActionCards: 2,
        yarns: [1, 2, 3, 4, 5],
        tiles: [1, 6],
      };

      assertEquals(bank.getBank(), result);
    });

    it(
      "when nothing is passed in place of action and design, then should show available design and action cards as 0",
      () => {
        const result = {
          tokens: 55,
          availableDesignCards: 0,
          availableActionCards: 0,
          yarns: [1, 2, 3, 4, 5],
          tiles: [1, 6],
        };
        const bank = new Bank(undefined, undefined, shuffle);
        assertEquals(bank.getBank(), result);
      },
    );

    it(
      "when game starts, then should update bank state after initial token and card distribution",
      () => {
        const players = [
          {
            name: "A",
            id: 1,
            tokens: 0,
            victoryPoint: 0,
            actionCards: [],
            designCards: [],
            pin: { color: 2, position: { x: 2, y: 1 } },
          },
          {
            name: "B",
            id: 1,
            tokens: 0,
            victoryPoint: 0,
            actionCards: [],
            designCards: [],
            pin: { color: 3, position: { x: 4, y: 1 } },
          },
        ];

        const result = {
          tokens: 51,
          availableDesignCards: 0,
          availableActionCards: 2,
          yarns: [1, 2, 3, 4, 5],
          tiles: [1, 6],
        };

        const bank = new Bank(designCards, actionCards, shuffle);
        bank.distributeInitialAssets(players);

        assertEquals(bank.getBank(), result);
      },
    );
  });

  // describe("Buy Design Card", () => {
  //   it("shuld return new design card", () => {
  //     const bank = new Bank(designCards, actionCards, (x) => x);
  //     const result = { "id": 1, "victoryPoints": 1 };

  //     assertEquals(bank.buyDesignCard(), result);
  //   });

  //   it("shuld throw error as design card are empty", () => {
  //     const bank = new Bank([], actionCards);

  //     assertThrows(() => bank.buyDesignCard());
  //   });
  // });

  // describe("Buy Action Card", () => {
  //   it("shuld return new action card", () => {
  //     const bank = new Bank(designCards, actionCards, shuffle, () => 0);
  //     const result = {
  //       "id": 1,
  //       "type": "move",
  //       "description": "Move the pin to any unoccupied square.",
  //     };

  //     assertEquals(bank.buyActionCard(), result);
  //   });
  // });

  describe("Get Design Card", () => {
    it("when get design card is called, then should return a design card and remove the card from the top of deck", () => {
      const bank = new Bank(designCards, actionCards, shuffle);
      const result = { "id": 1, "victoryPoints": 1 };

      assertEquals(bank.getDesignCard(), result);
      assertEquals(designCards.length, 1);
    });

    it("when no design cards remaining in the bank, then should throw error", () => {
      const bank = new Bank([], actionCards, shuffle);

      assertThrows(() => bank.getDesignCard());
    });
  });

  // describe("Exchange Design Card", () => {
  //   it("when exchange design card is called, then should return a new design card from top and add the provided card should be added to the deck at the last", () => {
  //     const bank = new Bank(designCards, actionCards, shuffle);
  //     const result = { "id": 1, "victoryPoints": 1 };
  //     const card = { id: 3, victoryPoints: 2 };

  //     assertEquals(bank.exchangeDesignCard(card), result);
  //     assertEquals(designCards.length, 2);
  //   });

  //   it("when no design cards remaining in the bank, then should throw error", () => {
  //     const bank = new Bank([], actionCards, shuffle);
  //     const card = { id: 3, victoryPoints: 2 };

  //     assertThrows(() => bank.exchangeDesignCard(card));
  //   });
  // });

  describe("Get Action Card", () => {
    it("when get action card is called, then should return a random action card from the deck and should not remove the card from the deck", () => {
      const bank = new Bank(designCards, actionCards, shuffle, () => 0);

      assertEquals(bank.getActionCard(), actionCards[0]);
      assertEquals(actionCards.length, 2);
    });
  });

  describe("Deduct Tokens", () => {
    it("when token count is provided, then should deduct from the bank", () => {
      const bank = new Bank(designCards, actionCards);
      bank.deductTokens(2);
      assertEquals(53, bank.getBank().tokens);
    });

    it("when there is no tokens in the bank, then should not deduct anything", () => {
      const bank = new Bank(designCards, actionCards);
      assertThrows(() => bank.deductTokens(56));
    });
  });

  describe("Increment Tokens", () => {
    it("when token count is provided, then should increment from the bank", () => {
      const bank = new Bank(designCards, actionCards);
      bank.incrementTokens(2);
      assertEquals(57, bank.getBank().tokens);
    });
  });

  // describe("Exchange Tile", () => {
  //   it("When there is reserved tile in the bank, then should exchange with the new tile", () => {
  //     const bank = new Bank(designCards, actionCards, shuffle);

  //     assertEquals(bank.exchangeTile(2, 0), 1);
  //     assertEquals(bank.getBank().tiles.length, 2);
  //   });
  // });

  // describe("Exchange Yarn", () => {
  //   it("When there is reserved yarn in the bank, then should exchange with the new yarn", () => {
  //     const bank = new Bank(designCards, actionCards, shuffle);

  //     assertEquals(bank.exchangeYarn(2, 2), 3);
  //     assertEquals(bank.getBank().yarns.length, 5);
  //   });
  // });
});
