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

describe.ignore("Game route", () => {
  let app, game;

  const designCards = [{ "id": 1, "victoryPoints": 1 }];
  const actionCards = [{
    "id": 1,
    "type": "move",
    "description": "Move the pin to any unoccupied square.",
  }];
  beforeEach(() => {
    game = {
      currentPlayer: 1,
      players: [{ id: 1, designCards: [], actionCards: [] }],
      bank: new Bank(designCards, actionCards),
      board: new Board(),
    };
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
            return {
              currentPlayer: 0,
              players: [
                {
                  id: 0,
                  tokens: 1,
                  designCards: [],
                },
              ],
              bank: new Bank(designCards, actionCards),
            };
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
      const card = await response.json();

      assertEquals(response.status, 200);
      assertEquals(card, {
        card: {
          description: "Move the pin to any unoccupied square.",
          id: 1,
          type: "move",
        },
        message: "Action card bought successfully",
        success: true,
      });
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
            return {
              currentPlayer: 0,
              players: [
                {
                  id: 0,
                  tokens: 1,
                  designCards: [],
                },
              ],
              bank: new Bank(designCards, actionCards),
            };
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
