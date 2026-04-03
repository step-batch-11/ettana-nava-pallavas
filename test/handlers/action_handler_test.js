import { assertEquals } from "@std/assert";
import { beforeEach, describe, it } from "@std/testing/bdd";
import { createApp } from "../../src/app.js";
import Bank from "../../src/models/bank.js";
import Board from "../../src/models/board.js";
import TurnManager from "../../src/models/turn_manager.js";

describe.ignore("Game route", () => {
  let app, game;

  beforeEach(() => {
    game = {
      players: [
        { id: 1, tokens: 2, actionCards: [{ id: 1 }] },
        { id: 2, tokens: 2 },
      ],
      currentPlayer: 1,
      bank: new Bank([], []),
      board: new Board([], []),
    };
    app = createApp(game, new TurnManager());
  });

  it("when tax action card played, then one token should be deducted and bank tokens should incremented: ", async () => {
    const response = await app.request("/game/action-card/19", {
      method: "PATCH",
    });
    const { success } = await response.json();
    const bankTokens = game.bank.getBank().tokens;

    assertEquals(success, true);
    assertEquals(response.status, 200);
    assertEquals(game.players[1].tokens, 1);
    assertEquals(bankTokens, 56);
  });

  it("when tax action card played and other player has 0 token, then no token should be deducted and bank token should not incremented: ", async () => {
    const game = {
      players: [{ id: 1, tokens: 2, actionCards: [{ id: 1 }] }, {
        id: 2,
        tokens: 0,
      }],
      currentPlayer: 1,
      bank: new Bank([], []),
      board: new Board([], []),
    };

    const app = createApp(
      game,
      new TurnManager(),
    );

    const response = await app.request("/game/action-card/19", {
      method: "PATCH",
    });
    const { success } = await response.json();
    const bankTokens = game.bank.getBank().tokens;

    assertEquals(success, true);
    assertEquals(response.status, 200);
    assertEquals(game.players[1].tokens, 0);
    assertEquals(bankTokens, 55);
    assertEquals(game.players[0].actionCards.length, 0);
  });

  it("when played action card is invalid, then should throw error and no update in state: ", async () => {
    const response = await app.request("/game/action-card/0", {
      method: "PATCH",
    });
    const { success } = await response.json();
    const bankTokens = game.bank.getBank().tokens;

    assertEquals(success, false);
    assertEquals(response.status, 400);
    assertEquals(game.players[1].tokens, 2);
    assertEquals(bankTokens, 55);
    assertEquals(game.players[0].actionCards.length, 1);
  });
});
