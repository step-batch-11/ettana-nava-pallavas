import { beforeEach, describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
import { removeAcs, setupState } from "../../../src/utils/util.js";

const actionCards = [
  {
    "id": 16,
    "type": "victory point",
    "description":
      "1 Victory point. Reveal the card immediately and keep face-up. Cannot be stolen.",
  },
  {
    "id": 4,
    "type": "get tokens",
    "description": "Get 3 tokens from the reserve.",
  },
];

describe("Action card handlers", () => {
  let currentPlayer, app, headers;

  beforeEach(async () => {
    const result = await setupState();

    app = result.app;
    currentPlayer = result.currentPlayer;
    headers = result.headers;
  });

  describe("PATCH /action-card/16 (Victory Point)", () => {
    it.ignore("Player should be able to play victory point action card only if they have that card", async () => {
      removeAcs(currentPlayer);

      currentPlayer.addActionCard(actionCards[0]);

      const res = await app.request(`/game/action-card/16`, {
        method: "PATCH",
        headers,
      });

      const { success } = await res.json();

      const playerData = currentPlayer.getPlayerData();

      assertEquals(success, true);
      assertEquals(playerData.vp, 1);
      assertEquals(currentPlayer.haveActionCard(16), false);
    });
  });

  describe("PATCH /action-card/4 (Collect Tokens)", () => {
    it("Player should be able to play victory point action card only if they have that card", async () => {
      removeAcs(currentPlayer);
      currentPlayer.addActionCard(actionCards[1]);

      const playerTokensBefore = currentPlayer.getTokens();

      const res = await app.request(`/game/action-card/4`, {
        method: "PATCH",
        headers,
      });

      const { success } = await res.json();

      const playerTokensAfter = currentPlayer.getTokens();

      assertEquals(success, true);
      assertEquals(playerTokensBefore + 3, playerTokensAfter);
      assertEquals(currentPlayer.haveActionCard(4), false);
    });
  });

  describe("Failed endpoints", () => {
    it("Should fail if card id is invalid", async () => {
      const res = await app.request("/game/action-card/0", {
        method: "PATCH",
        headers,
      });

      const { error } = await res.json();
      assertEquals(error.message, "Card is missing");
    });
  });
});
