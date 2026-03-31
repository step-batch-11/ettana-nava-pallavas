import { beforeEach, describe, it } from "@std/testing/bdd";
import { createApp } from "../../src/app.js";
import { assertEquals } from "@std/assert/equals";
import { Bank } from "../../src/models/bank.js";

describe("Game route", () => {
  const game = {};
  const bank = new Bank();
  let app;

  beforeEach(() => {
    app = createApp(game, bank);
  });

  it("simple bank request to get bank state", async () => {
    const response = await app.request("/game/bank-state");
    const actualBankState = await response.json();

    const expectedBankState = {
      tokens: 55,
      availableActionCards: 0,
      availableDesignCards: 0,
      yarns: [1, 2, 3, 4, 5],
      tiles: [{ value: 1, playerId: null }, { value: 6, playerId: null }],
    };

    assertEquals(response.status, 200);
    assertEquals(actualBankState, expectedBankState);
  });
});
