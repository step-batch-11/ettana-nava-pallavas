import { beforeEach, describe, it } from "@std/testing/bdd";
import { createApp } from "../../src/app.js";
import { assertEquals } from "@std/assert/equals";
import Bank from "../../src/models/bank.js";
import Board from "../../src/models/board.js";
import TurnManager from "../../src/models/turn_manager.js";
import Game from "../../src/models/game.js";
import { diceValue, tiles, yarns } from "../../src/data/state.js";
import Player from "../../src/models/player.js";
import {
  buyActionCard,
  buyDesignCard,
} from "../../src/handlers/game_handlers.js";

describe("Game route", () => {
  let app, players, game, bank;

  const designCards = [{ "id": 1, "victoryPoints": 1 }];
  const actionCards = [{
    "id": 1,
    "type": "move",
    "description": "Move the pin to any unoccupied square.",
  }, {
    "id": 4,
    "type": "get tokens",
    "description": "Get 3 tokens from the reserve.",
  }];

  beforeEach(() => {
    players = [new Player(1, "Ajoy"), new Player(2, "Dinesh")];
    bank = new Bank(designCards, actionCards);
    game = new Game(
      players,
      bank,
      new Board(tiles, yarns),
      diceValue,
    );
    app = createApp(game, new TurnManager(game));
  });

  describe("Buy Design Card", () => {
    it("should give a new design card", async () => {
      players[0].creditTokens(5);
      const response = await app.request("/game/buy-design-card");
      const card = await response.json();

      assertEquals(response.status, 200);
      assertEquals(card, {
        message: "Design card bought successfully",
        success: true,
      });
    });

    it("should fail when context is invalid", () => {
      const context = { get: () => [], json: (x) => x };
      const res = buyDesignCard(context);

      assertEquals(res.success, false);
    });

    it("should inform if tokens are insufficient", () => {
      const context = {
        get: (key) => {
          if (key === "gameState") {
            return new Game(
              players,
              new Bank(designCards, actionCards),
              new Board(tiles, yarns),
              diceValue,
            );
          }
        },
        json: (x) => x,
      };

      const res = buyDesignCard(context);
      assertEquals(res, {
        success: false,
        message: "You do not have enough tokens",
      });
    });
  });

  describe("Buy Action Card", () => {
    it("should give a new action card", async () => {
      players[0].creditTokens(5);
      const response = await app.request("/game/buy-action-card");
      const responseBody = await response.json();

      assertEquals(response.status, 200);

      assertEquals(responseBody.message, "Action card bought successfully");
      assertEquals(responseBody.success, true);
    });

    it("should fail when context is invalid", () => {
      const context = { get: () => [], json: (x) => x };
      const res = buyActionCard(context);

      assertEquals(res.success, false);
    });

    it("should inform if tokens are insufficient", () => {
      const context = {
        get: (key) => {
          if (key === "gameState") {
            return new Game(
              players,
              new Bank(designCards, actionCards),
              new Board(tiles, yarns),
              diceValue,
            );
          }
        },
        json: (x) => x,
      };

      const res = buyActionCard(context);

      assertEquals(res, {
        success: false,
        message: "You do not have enough tokens",
      });
    });
  });

  describe("Action Cards", () => {
    describe("Tax Action Card", () => {
      it("when tax action card played, then one token from other players should be deducted and bank tokens should incremented: ", async () => {
        players[0].addActionCard({
          "id": 6,
          "type": "tax",
          "description": "All other players pay 1 token to the reserve.",
        });
        players[1].creditTokens(2);
        const response = await app.request("/game/action-card/6", {
          method: "PATCH",
        });
        const { success, affectedPlayers } = await response.json();

        assertEquals(success, true);
        assertEquals(response.status, 200);
        assertEquals(affectedPlayers, [2]);
        assertEquals(bank.getBank().tokens, 56);
        assertEquals(players[1].getTokens(), 1);
        assertEquals(players[0].getAc(), []);
      });

      it("when tax action card played and other player has 0 token, then no token should be deducted and bank token should not incremented: ", async () => {
        players[0].addActionCard({
          "id": 6,
          "type": "tax",
          "description": "All other players pay 1 token to the reserve.",
        });

        const response = await app.request("/game/action-card/6", {
          method: "PATCH",
        });
        const { success, affectedPlayers } = await response.json();

        assertEquals(success, true);
        assertEquals(response.status, 200);
        assertEquals(affectedPlayers, []);
        assertEquals(bank.getBank().tokens, 55);
        assertEquals(players[1].getTokens(), 0);
        assertEquals(players[0].getAc(), []);
      });

      it("when played action card is invalid, then should throw error and no update in state: ", async () => {
        players[0].addActionCard({
          "id": 6,
          "type": "tax",
          "description": "All other players pay 1 token to the reserve.",
        });
        const response = await app.request("/game/action-card/0", {
          method: "PATCH",
        });
        const { success } = await response.json();

        assertEquals(success, false);
        assertEquals(response.status, 400);
        assertEquals(players[1].getTokens(), 0);
        assertEquals(bank.getBank().tokens, 55);
        assertEquals(players[0].getAc().length, 1);
      });

      it("when player does not have action card but wants to play, then should throw error and no update in state: ", async () => {
        const response = await app.request("/game/action-card/6", {
          method: "PATCH",
        });
        const { success } = await response.json();

        assertEquals(success, false);
        assertEquals(response.status, 400);
        assertEquals(players[1].getTokens(), 0);
        assertEquals(bank.getBank().tokens, 55);
        assertEquals(players[0].getAc().length, 0);
      });
    });
  });
});
