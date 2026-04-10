import { beforeEach, describe, it } from "@std/testing/bdd";
import { assert, assertEquals } from "@std/assert";
import { removeAcs, sendRequest, setupState } from "../../../src/utils/util.js";

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
  {
    "id": 7,
    "type": "get design card",
    "description": "Get a design card from the stack.",
  },
  {
    "id": 13,
    "type": "preset",
    "description": "Preset color of the die and roll only the number die.",
  },
  {
    "id": 28,
    "type": "roll again",
    "description":
      "Roll the dice again (cannot be played with Preset action card).",
  },
  {
    "id": 34,
    "type": "replace",
    "description":
      "Replace a yarn or a number tile with the reserve which has 5 yarns and 2 number tiles.",
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
    it("Player should be able to play victory point action card only if they have that card", async () => {
      removeAcs(currentPlayer);

      currentPlayer.addActionCard(actionCards[0]);

      const res = await app.request(`/game/action-card/16`, {
        method: "PATCH",
        headers,
      });

      const { success } = await res.json();

      assertEquals(success, true);
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

  describe("PATCH /action-card/7 (Get Design Card)", () => {
    it("getting a dc when player have an action card", async () => {
      removeAcs(currentPlayer);

      currentPlayer.addActionCard(actionCards[2]);

      const { result, success } = await sendRequest(
        app,
        `/game/action-card/7`,
        { headers },
        "PATCH",
      );

      assert(success);
      assertEquals(result.message, "design card added");
    });

    it("getting a dc when player don't an have action card", async () => {
      removeAcs(currentPlayer);

      const { error, success } = await sendRequest(
        app,
        `/game/action-card/7`,
        { headers },
        "PATCH",
      );

      assert(!success);
      assertEquals(error.message, "Card is missing");
    });
  });

  describe("PATCH /action-card/34 (Replace Tiles / yarns)", () => {
    it("replacing tiles when player have an action card", async () => {
      removeAcs(currentPlayer);

      currentPlayer.addActionCard(actionCards.at(-1));

      const { result, success } = await sendRequest(
        app,
        `/game/action-card/34`,
        { headers },
        "PATCH",
      );

      assert(success);
      assertEquals(result.message, "Choose tiles to replace");
    });

    it("replacing tiles when player don't an have action card", async () => {
      removeAcs(currentPlayer);

      const { error, success } = await sendRequest(
        app,
        `/game/action-card/34`,
        { headers },
        "PATCH",
      );

      assert(!success);
      assertEquals(error.message, "Card is missing");
    });

    it("playing replacing yarns without playing replace action card", async () => {
      currentPlayer.addActionCard(actionCards.at(-1));
      const { error, success } = await sendRequest(
        app,
        `/game/perform-action-card`,
        { headers, body: JSON.stringify({ cardId: 34 }) },
      );

      assert(!success);
      assertEquals(error.message, "You did not play replace action card");
    });

    describe("playing the replace tiles", () => {
      let res;
      beforeEach(async () => {
        removeAcs(currentPlayer);

        currentPlayer.addActionCard(actionCards.at(-1));

        res = await sendRequest(
          app,
          `/game/action-card/34`,
          { headers },
          "PATCH",
        );
      });

      it("playing replacing tiles when player have an action card", async () => {
        const { boardTiles } = res.result;
        const position = { x: boardTiles[0][0], y: boardTiles[0][1] };
        const body = JSON.stringify({
          cardId: 34,
          type: "tile",
          position,
          reservePosition: 0,
        });

        const { result, success } = await sendRequest(
          app,
          `/game/perform-action-card`,
          { headers, body },
        );

        assert(success);
        assertEquals(result.message, "tile changed with reserved");
      });

      it("playing replacing tiles when player don't have an action card", async () => {
        currentPlayer.removeActionCard(34);
        const { boardTiles } = res.result;
        const position = { x: boardTiles[0][0], y: boardTiles[0][1] };
        const body = JSON.stringify({
          cardId: 34,
          type: "tile",
          position,
          reservePosition: 0,
        });

        const { error, success } = await sendRequest(
          app,
          `/game/perform-action-card`,
          { headers, body },
        );

        assert(!success);
        assertEquals(error.message, "Card is missing");
      });

      it("playing replacing yarns when player have an action card", async () => {
        const { boardYarns } = res.result;
        const position = { x: boardYarns[0][0], y: boardYarns[0][1] };
        const body = JSON.stringify({
          cardId: 34,
          type: "yarn",
          position,
          reservePosition: 0,
        });

        const { result, success } = await sendRequest(
          app,
          `/game/perform-action-card`,
          { headers, body },
        );

        assert(success);
        assertEquals(result.message, "yarn changed with reserved");
      });
    });
  });

  describe("PATCH /action-card/28 (Roll Again)", () => {
    it("playing roll again when player have the card", async () => {
      removeAcs(currentPlayer);

      currentPlayer.addActionCard(actionCards[4]);

      const { result, success } = await sendRequest(
        app,
        `/game/action-card/28`,
        { headers },
        "PATCH",
      );

      assert(success);
      assertEquals(result.message, "Roll again card played successfully");
    });

    it("playing roll again when player don't have the card", async () => {
      removeAcs(currentPlayer);

      const { error, success } = await sendRequest(
        app,
        `/game/action-card/28`,
        { headers },
        "PATCH",
      );

      assert(!success);
      assertEquals(error.message, "Card is missing");
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

describe("preset and roll again cards", () => {
  let currentPlayer, app, headers;

  beforeEach(async () => {
    const result = await setupState(false);

    app = result.app;
    currentPlayer = result.currentPlayer;
    headers = result.headers;
  });

  describe("PATCH /action-card/13 (Preset)", () => {
    it("playing preset when player have the card", async () => {
      removeAcs(currentPlayer);

      currentPlayer.addActionCard(actionCards[3]);

      const { result, success } = await sendRequest(
        app,
        `/game/action-card/13`,
        { headers },
        "PATCH",
      );

      assert(success);
      assertEquals(result.message, "Choose a color dice");
    });

    it("playing preset when player don't have the card", async () => {
      removeAcs(currentPlayer);

      const { error, success } = await sendRequest(
        app,
        `/game/action-card/13`,
        { headers },
        "PATCH",
      );

      assert(!success);
      assertEquals(error.message, "Card is missing");
    });

    it("performing the preset action without playing action card", async () => {
      currentPlayer.addActionCard(actionCards[3]);
      const body = JSON.stringify({ colorId: 2, cardId: 13 });
      const { error, success } = await sendRequest(
        app,
        "/game/perform-action-card",
        {
          headers,
          body,
        },
      );

      assert(!success);
      assertEquals(error.message, "You didn't play preset action card");
    });

    it("performing the preset action", async () => {
      removeAcs(currentPlayer);
      currentPlayer.addActionCard(actionCards[3]);
      await sendRequest(
        app,
        `/game/action-card/13`,
        { headers },
        "PATCH",
      );

      const body = JSON.stringify({ colorId: 2, cardId: 13 });
      const { result, success } = await sendRequest(
        app,
        "/game/perform-action-card",
        {
          headers,
          body,
        },
      );

      assert(success);
      assert(Array.isArray(result.destinations));
      assertEquals(result.message, "preset action card played successfully");
    });

    it("performing the roll again action after playing preset action card", async () => {
      currentPlayer.addActionCard(actionCards[4]);

      const { error, success } = await sendRequest(
        app,
        "/game/action-card/28",
        {
          headers,
        },
        "PATCH",
      );

      assert(!success);
      assertEquals(error.message, "action card can't be played");
    });
  });
});
