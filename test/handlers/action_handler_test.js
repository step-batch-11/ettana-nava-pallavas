import { assertEquals } from "@std/assert";
import { beforeEach, describe, it } from "@std/testing/bdd";
import { createApp } from "../../src/app.js";
import Bank from "../../src/models/bank.js";

describe("Game route", () => {
  let app, game, bank;

  beforeEach(() => {
    game = {
      players: [{ id: 1, tokens: 2 }, { id: 2, tokens: 2 }],
      currentPlayer: 1,
    };
    bank = new Bank([], []);
    app = createApp(game, bank, () => 1, () => async (_, next) => await next());
  });

  it("when tax action card played, then one token should be deducted and bank tokens should incremented: ", async () => {
    const response = await app.request("/game/action-card/19", {
      method: "PATCH",
    });
    const { success } = await response.json();
    const bankTokens = bank.getBank().tokens;

    assertEquals(success, true);
    assertEquals(response.status, 200);
    assertEquals(game.players[1].tokens, 1);
    assertEquals(bankTokens, 56);
  });

  it("when tax action card played and other player has 0 token, then no token should be deducted and bank token should not incremented: ", async () => {
    const game = {
      players: [{ id: 1, tokens: 2 }, { id: 2, tokens: 0 }],
      currentPlayer: 1,
    };
    const app = createApp(
      game,
      bank,
      () => 1,
      () => async (_, next) => await next(),
    );

    const response = await app.request("/game/action-card/19", {
      method: "PATCH",
    });
    const { success } = await response.json();
    const bankTokens = bank.getBank().tokens;

    assertEquals(success, true);
    assertEquals(response.status, 200);
    assertEquals(game.players[1].tokens, 0);
    assertEquals(bankTokens, 55);
  });

  it("when played action card is invalid, then should throw error and no update in state: ", async () => {
    const response = await app.request("/game/action-card/0", {
      method: "PATCH",
    });
    const { success } = await response.json();
    const bankTokens = bank.getBank().tokens;

    assertEquals(success, false);
    assertEquals(response.status, 400);
    assertEquals(game.players[1].tokens, 2);
    assertEquals(bankTokens, 55);
  });
});
