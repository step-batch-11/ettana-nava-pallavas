import { beforeEach, describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
import {
  removeAcs,
  sendRequest,
  setupState,
} from "../../../src/utils/util.js";

const actionCards = [
  {
    id: 10,
    type: "steal token",
    description: "Choose a player and steal a maximum of 2 tokens.",
  },
  {
    id: 22,
    type: "steal action card",
    description: "Choose a player and steal an action card.",
  },
];

describe("test action handlers", () => {

  describe("/action-card/ -> steal cards", () => {
    it("case: when player don't have steal card", async () => {
      const {
        app,
        headers,
        currentPlayer,
      } = await setupState();

      currentPlayer.removeActionCard(22);

      const response = await app.request("/game/action-card/22", {
        method: "PATCH",
        headers,
      });

      const { error } = await response.json();

      assertEquals(error.message, "Card is missing");
    });

    it("case: when other players don't have any cards", async () => {
      const {
        app,
        players,
        headers,
        currentPlayer,
        currentPlayerSId,
      } = await setupState();

      const opponent = Object.values(players).find((x) =>
        x.getId() !== currentPlayerSId
      );

      const acs = opponent.getAc();
      acs.forEach((card) => {
        opponent.removeActionCard(card.id);
      });

      currentPlayer.addActionCard(actionCards[1]);

      const response = await app.request("/game/action-card/22", {
        method: "PATCH",
        headers,
      });

      const { result } = await response.json();

      assertEquals(result.message, "Choose an opponent");
      assertEquals(result.opponents, []);
    });

    it("case: when other players have cards", async () => {
      const {
        app,
        players,
        headers,
        currentPlayer,
        currentPlayerSId,
      } = await setupState();

      const opponent = Object.values(players).find((x) =>
        x.getId() !== currentPlayerSId
      );

      opponent.addActionCard(actionCards[1]);
      currentPlayer.addActionCard(actionCards[1]);

      const response = await app.request("/game/action-card/22", {
        method: "PATCH",
        headers,
      });

      const { result } = await response.json();

      assertEquals(result.opponents.length, 1);
    });
  });

  describe("/action-card/ -> steal tokens", () => {
    let app, opponent, currentPlayer, currentPlayerSId, players, headers;

    beforeEach(async () => {
      const result = await setupState();
      app = result.app;
      currentPlayer = result.currentPlayer;
      currentPlayerSId = result.currentPlayerSId;
      players = result.players;
      headers = result.headers;

      opponent = Object.values(players).find((x) =>
        x.getId() !== currentPlayerSId
      );

      currentPlayer.addActionCard(actionCards[0]);
    });

    it("case: when other players have tokens", async () => {
      opponent.creditTokens(2);

      const response = await app.request("/game/action-card/10", {
        method: "PATCH",
        headers,
      });

      const { result } = await response.json();
      assertEquals(result.opponents.length, 1);
    });
  });

  describe("perform action cards", () => {
    let app, opponent, currentPlayer, currentPlayerSId, players, headers;

    beforeEach(async () => {
      const result = await setupState();
      app = result.app;
      currentPlayer = result.currentPlayer;
      currentPlayerSId = result.currentPlayerSId;
      players = result.players;
      headers = result.headers;

      opponent = Object.values(players).find((x) =>
        x.getId() !== currentPlayerSId
      );

      currentPlayer.addActionCard(actionCards[0]);
    });

    describe("/perform-action-card/ -> action-card", () => {
      const setUp = async () => {
        currentPlayer.addActionCard(actionCards[1]);

        const { result } = await sendRequest(
          app,
          "/game/action-card/22",
          { headers },
          "PATCH",
        );

        return result;
      };

      it("case: when player calls this wit curl or something", async () => {
        currentPlayer.addActionCard(actionCards[1]);

        const body = { opponentPlayerId: 1, cardId: 22 };
        const response = await app.request("/game/perform-action-card", {
          method: "POST",
          body: JSON.stringify(body),
          headers,
        });

        const { error } = await response.json();

        assertEquals(error.message, "You did not play steal action card");
      });

      it("case: when player selects himself", async () => {
        await setUp();

        const body = { opponentPlayerId: currentPlayer.getId(), cardId: 22 };
        const response = await app.request("/game/perform-action-card", {
          method: "POST",
          body: JSON.stringify(body),
          headers,
        });

        const { error } = await response.json();
        assertEquals(error.message, "player can't take from himself");
      });

      it("case: when player has no steal action card", async () => {
        const { opponents } = await setUp();

        removeAcs(currentPlayer);
        const body = { opponentPlayerId: opponents[0], cardId: 22 };

        const response = await app.request("/game/perform-action-card", {
          method: "POST",
          body: JSON.stringify(body),
          headers,
        });

        const { error } = await response.json();
        assertEquals(error.message, "Card is missing");
      });

      it("case: when the selected opponent has no cards", async () => {
        const { opponents } = await setUp();
        const body = { opponentPlayerId: opponents[0], cardId: 22 };

        removeAcs(opponent);
        const response = await app.request("/game/perform-action-card", {
          method: "POST",
          body: JSON.stringify(body),
          headers,
        });

        const { error } = await response.json();
        assertEquals(error.message, "Player has no cards");
      });

      it("case: when the selected opponent has cards", async () => {
        await setUp();
        currentPlayer.addActionCard(actionCards[1]);
        opponent.addActionCard(actionCards[1]);
        const body = { opponentPlayerId: opponent.getId(), cardId: 22 };

        const response = await app.request("/game/perform-action-card", {
          method: "POST",
          body: JSON.stringify(body),
          headers,
        });

        const { result } = await response.json();
        assertEquals(
          result.message,
          `${currentPlayer.getName()} stolen 1 action card from ${opponent.getName()}`,
        );
      });
    });

    describe("/perform-action-card/ -> tokens", () => {
      const setUp = async () => {
        currentPlayer.addActionCard(actionCards[0]);

        const { result } = await sendRequest(
          app,
          "/game/action-card/10",
          { headers },
          "PATCH",
        );

        return result;
      };

      it("case: when player selects himself", async () => {
        await setUp();
        const body = { opponentPlayerId: currentPlayer.getId(), cardId: 10 };

        const response = await app.request("/game/perform-action-card", {
          method: "POST",
          body: JSON.stringify(body),
          headers,
        });

        const { error } = await response.json();
        assertEquals(error.message, "player can't take from himself");
      });

      it("case: when player has no steal token card", async () => {
        await setUp();

        const body = { opponentPlayerId: 2, cardId: 10 };
        removeAcs(currentPlayer);

        const response = await app.request("/game/perform-action-card", {
          method: "POST",
          body: JSON.stringify(body),
          headers,
        });

        const { error } = await response.json();
        assertEquals(error.message, "Card is missing");
      });

      it("case: when the selected opponent has tokens", async () => {
        await setUp();
        currentPlayer.addActionCard(actionCards[0]);
        opponent.creditTokens(3);

        const body = { opponentPlayerId: opponent.getId(), cardId: 10 };

        const response = await app.request("/game/perform-action-card", {
          method: "POST",
          body: JSON.stringify(body),
          headers,
        });

        const { result } = await response.json();
        assertEquals(
          result.message,
          `${currentPlayer.getName()} stolen 2 tokens from ${opponent.getName()}`,
        );
      });
    });
  });
});
