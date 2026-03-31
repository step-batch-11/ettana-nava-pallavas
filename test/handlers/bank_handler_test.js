import { beforeEach, describe, it } from "@std/testing/bdd";
import { createApp } from "../../src/app.js";
import { assertEquals } from "@std/assert/equals";
import { Bank } from "../../src/models/bank.js";
import { buyDesignCard } from "../../src/handlers/bank_handler.js";

describe("Game route", () => {
  const game = {};
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
      assertEquals(card, { "id": 1, "victoryPoints": 1 });
    });

    it("should fail when context is invalid", () => {
      const context = { get: () => [], json: (x) => x };
      const res = buyDesignCard(context);

      assertEquals(res.hasError, true);
    });
  });
});
