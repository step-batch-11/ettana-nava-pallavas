import { beforeEach, describe, it } from "@std/testing/bdd";
import { createApp } from "../../src/app.js";
import { assertEquals } from "@std/assert/equals";
import {
  buyActionCard,
  buyDesignCard,
} from "../../src/handlers/bank_handler.js";
import Bank from "../../src/models/bank.js";
import Board from "../../src/models/board.js";
import TurnManager from "../../src/models/turn_manager.js";
import Game from "../../src/models/game.js";
import { diceValue, tiles, yarns } from "../../src/data/state.js";

describe.ignore("Game route", () => {
  let app, game;

  const designCards = [{ "id": 1, "victoryPoints": 1 }];
  const actionCards = [{
    "id": 1,
    "victoryPoints": 1,
    "design": [
      { "coord": { "x": 0, "y": 0 }, "color": 5 },
      { "coord": { "x": 1, "y": 1 }, "color": 3 },
      { "coord": { "x": 2, "y": 2 }, "color": 1 },
      { "coord": { "x": 3, "y": 3 }, "color": 3 },
      { "coord": { "x": 4, "y": 4 }, "color": 5 },
    ],
  }, {
    "id": 2,
    "victoryPoints": 1,
    "design": [
      { "coord": { "x": 1, "y": 0 }, "color": 5 },
      { "coord": { "x": 2, "y": 1 }, "color": 5 },
      { "coord": { "x": 3, "y": 2 }, "color": 5 },
      { "coord": { "x": 4, "y": 3 }, "color": 5 },
      { "coord": { "x": 3, "y": 1 }, "color": 1 },
      { "coord": { "x": 4, "y": 0 }, "color": 1 },
    ],
  }];

  beforeEach(() => {
    game = new Game(
      [
        {
          name: "Ajoy",
          id: 1,
          tokens: 10,
          roomId: null,
          victoryPoint: 0,
          actionCards: [],
          designCards: [],
          pin: { color: 2, position: { x: 2, y: 2 } },
        },
        {
          name: "Dinesh",
          id: 2,
          tokens: 10,
          roomId: null,
          victoryPoint: 0,
          actionCards: [],
          designCards: [],
          pin: { color: 3, position: { x: 3, y: 3 } },
        },
      ],
      new Bank(designCards, actionCards),
      new Board(tiles, yarns),
      diceValue,
    );
    app = createApp(game, new TurnManager());
  });

  describe("Buy Design Card", () => {
    it("should give a new design card", async () => {
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
              [
                {
                  id: 0,
                  tokens: 1,
                  designCards: [],
                },
              ],
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
              [
                {
                  id: 0,
                  tokens: 1,
                  designCards: [],
                },
              ],
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
});
