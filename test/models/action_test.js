import { assertEquals } from "@std/assert";
import { beforeEach, describe, it } from "@std/testing/bdd";
import { removeCard, tax } from "../../src/models/action.js";
import Bank from "../../src/models/bank.js";

describe("Action Cards", () => {
  describe("Tax", () => {
    let game, bank;
    beforeEach(() => {
      game = {
        players: [{ id: 1, tokens: 2, actionCards: [{ id: 1 }] }, {
          id: 2,
          tokens: 2,
        }],
        currentPlayer: 1,
      };
      bank = new Bank([], []);
    });

    it("when tax action card played, then one token should be deducted, remove action card and bank tokens should incremented: ", () => {
      tax(game, bank, 1);
      const bankTokens = bank.getBank().tokens;
      assertEquals(game.players[1].tokens, 1);
      assertEquals(game.players[0].actionCards.length, 0);
      assertEquals(bankTokens, 56);
    });

    it("when tax action card played and other player has 0 token, then no token should be deducted and bank token should not incremented: ", () => {
      const game = {
        players: [{ id: 1, tokens: 2, actionCards: [{ id: 1 }] }, {
          id: 2,
          tokens: 0,
        }],
        currentPlayer: 1,
      };
      const bankTokens = bank.getBank().tokens;
      tax(game, bank, 1);
      assertEquals(game.players[1].tokens, 0);
      assertEquals(game.players[0].actionCards.length, 0);
      assertEquals(bankTokens, 55);
    });

    it("when removeCard function is called, then it should remove the card from the player action cards based on the id", () => {
      const player = { id: 1, tokens: 2, actionCards: [{ id: 1 }] };
      removeCard(player, 1);
      assertEquals(player.actionCards.length, 0);
    });
  });
});
