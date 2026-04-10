import { beforeEach, describe, it } from "@std/testing/bdd";
import { createApp } from "../../../src/app.js";
import { assertEquals } from "@std/assert";
import {
  rollAndMove,
  sendRequest,
  setSession,
} from "../../../src/utils/util.js";
import Session from "../../../src/models/session.js";

const removeAcs = (player) => {
  const acs = player.getAc();
  acs.forEach((card) => {
    player.removeActionCard(card.id);
  });
};

const manageTurns = async (app, p1Sid, p2Sid) => {
  const p1 = await rollAndMove(p1Sid, app);
  const p2 = await rollAndMove(p2Sid, app);

  const currentPlayerSId = p1.diceValues.number >= p2.diceValues.number
    ? p1Sid
    : p2Sid;

  await rollAndMove(currentPlayerSId, app, false);

  return { p1, p2, currentPlayerSId };
};

const setPlayer = (players, currPSid) =>
  Object.values(players).find(
    (x) => x.getId() === currPSid,
  );

const createPlayers = async (app, p1Name, p2Name) => {
  let payload = JSON.stringify({ username: p1Name });
  const player1 = await sendRequest(app, "/lobby/host-game", {
    body: payload,
  }); //request to host

  const roomId = player1.roomId;

  await new Promise((r) => setTimeout(r, 200));

  payload = JSON.stringify({ username: p2Name, roomId });
  const player2 = await sendRequest(app, "/lobby/join", { body: payload }); //request to join

  return {
    player1SessionId: player1.sessionId,
    player2SessionId: player2.sessionId,
  };
};

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
  const setupState = async () => {
    const rooms = {};
    const players = {};
    const sessions = new Session();

    const app = createApp(rooms, players, sessions);

    const { player1SessionId, player2SessionId } = await createPlayers(
      app,
      "kha",
      "sim",
    );

    const headers = setSession(player1SessionId);

    await sendRequest(app, "/lobby/start-game", { headers }, "GET");

    const turnRes = await manageTurns(
      app,
      player1SessionId,
      player2SessionId,
    );

    const { currentPlayerSId } = turnRes;

    headers.set("Cookie", `sessionId=${currentPlayerSId}`);
    const currentPlayer = setPlayer(players, currentPlayerSId);

    return {
      app,
      players,
      rooms,
      sessions,
      headers,
      player1SessionId,
      player2SessionId,
      currentPlayer,
      currentPlayerSId,
    };
  };

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
