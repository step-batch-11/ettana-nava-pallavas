import { assertEquals } from "@std/assert";
import { beforeEach, describe, it } from "@std/testing/bdd";
import { gameState } from "../../src/data/state.js";
import { movePin } from "../../src/models/action.js";
import { tax } from "../../src/models/action.js";
import Bank from "../../src/models/bank.js";

describe("Test move pin action", () => {
  it("returns all the possible unoccupied tile positions ", () => {
    const possiblePositions = [
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: 2 },
      { x: 0, y: 3 },
      { x: 0, y: 4 },
      { x: 0, y: 5 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 1, y: 2 },
      { x: 1, y: 3 },
      { x: 1, y: 4 },
      { x: 1, y: 5 },
      { x: 2, y: 0 },
      { x: 2, y: 1 },
      { x: 2, y: 3 },
      { x: 2, y: 4 },
      { x: 2, y: 5 },
      { x: 3, y: 0 },
      { x: 3, y: 1 },
      { x: 3, y: 2 },
      { x: 3, y: 4 },
      { x: 3, y: 5 },
      { x: 4, y: 0 },
      { x: 4, y: 1 },
      { x: 4, y: 2 },
      { x: 4, y: 3 },
      { x: 4, y: 4 },
      { x: 4, y: 5 },
      { x: 5, y: 0 },
      { x: 5, y: 1 },
      { x: 5, y: 2 },
      { x: 5, y: 3 },
      { x: 5, y: 4 },
      { x: 5, y: 5 },
    ];
    assertEquals(movePin(gameState.players), possiblePositions);
  });
});

describe("Action Cards", () => {
  describe("Tax", () => {
    let game, bank;
    beforeEach(() => {
      game = {
        players: [{ id: 1, tokens: 2 }, { id: 2, tokens: 2 }],
        currentPlayer: 1,
      };
      bank = new Bank([], []);
    });

    it("when tax action card played, then one token should be deducted and bank tokens should incremented: ", () => {
      tax(game, bank);
      const bankTokens = bank.getBank().tokens;
      assertEquals(game.players[1].tokens, 1);
      assertEquals(bankTokens, 56);
    });

    it("when tax action card played and other player has 0 token, then no token should be deducted and bank token should not incremented: ", () => {
      const game = {
        players: [{ id: 1, tokens: 2 }, { id: 2, tokens: 0 }],
        currentPlayer: 1,
      };
      const bankTokens = bank.getBank().tokens;
      tax(game, bank);
      assertEquals(game.players[1].tokens, 0);
      assertEquals(bankTokens, 55);
    });
  });
});
