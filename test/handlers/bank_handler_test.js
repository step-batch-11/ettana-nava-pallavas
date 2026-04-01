import { beforeEach, describe, it } from "@std/testing/bdd";
import { createApp } from "../../src/app.js";
import { assertEquals } from "@std/assert/equals";
import {
  buyActionCard,
  buyDesignCard,
} from "../../src/handlers/bank_handler.js";
import Bank from "../../src/models/bank.js";

describe("Game route", () => {
  const game = {
    currentPlayer: 1,
    players: [{ id: 1, designCards: [], actionCards: [] }],
  };
  const designCards = [{ "id": 1, "victoryPoints": 1 }];
  const actionCards = [{
    "id": 1,
    "type": "move",
    "description": "Move the pin to any unoccupied square.",
  }];

  const bank = new Bank(designCards, actionCards);
  let app;

  beforeEach(() => {
    app = createApp(game, bank);
  });

  it("simple bank request to get bank state", async () => {
    const response = await app.request("/game/bank-state");
    const actualBankState = await response.json();

    const expectedBankState = {
      tokens: 55,
      availableActionCards: 1,
      availableDesignCards: 1,
      yarns: [1, 2, 3, 4, 5],
      tiles: [{ value: 1, playerId: null }, { value: 6, playerId: null }],
    };

    assertEquals(response.status, 200);
    assertEquals(actualBankState, expectedBankState);
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
          if (key === "bank") {
            return {
              buyDesignCard: () => ({ id: "card1" }),
            };
          }

          if (key === "boardState") {
            return {
              currentPlayer: "p1",
              players: [
                {
                  id: "p1",
                  tokens: 1,
                  designCards: [],
                },
              ],
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
          if (key === "bank") {
            return {
              buyDesignCard: () => ({ id: "card1" }),
            };
          }

          if (key === "boardState") {
            return {
              currentPlayer: "p1",
              players: [
                {
                  id: "p1",
                  tokens: 1,
                  designCards: [],
                },
              ],
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
