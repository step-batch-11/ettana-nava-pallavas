import { beforeEach, describe, it } from "@std/testing/bdd";
import { createApp } from "../../src/app.js";
import {
  assert,
  assertAlmostEquals,
  assertEquals,
  assertThrows,
} from "@std/assert";
import { serveGameState } from "../../src/handlers/game_handlers.js";
import Session from "../../src/models/session.js";
import { toJSON, rollAndMove } from "../../src/utils/util.js";

const getBankTokens = async (app, headers) => {
  const { state } = await app
    .request("/game/game-state", { headers })
    .then(toJSON);

  return state.bank.tokens;
};

describe("Game route", () => {
  let app,
    players,
    rooms,
    sessions,
    headers,
    player1SessionId,
    player2SessionId;

  beforeEach(async () => {
    rooms = {};
    players = {};
    sessions = new Session();

    app = createApp(rooms, players, sessions);

    const req1 = JSON.stringify({ username: "kha" });
    const res = await app.request("/lobby/host-game", {
      body: req1,
      method: "POST",
    });

    const result = await toJSON(res);
    player1SessionId = result.sessionId;
    const roomId = result.roomId;
    await new Promise((r) => setTimeout(r, 200));

    const req2 = JSON.stringify({ username: "sim", roomId });
    const res2 = await app
      .request("/lobby/join", {
        body: req2,
        method: "POST",
      })
      .then(toJSON);

    player2SessionId = res2.sessionId;

    headers = new Headers();
    headers.append("Cookie", `sessionId=${player1SessionId}`);

    await app
      .request("/lobby/start-game", {
        method: "GET",
        headers,
      })
      .then(toJSON);
  });

  describe("GET /game/game-state", () => {
    it("should return the initial state as it is", async () => {
      const res = await app.request("/game/game-state", { headers });
      const game = await res.json();
      assertEquals(game.success, true);
      assertEquals(game.state.players.length, 2);
    });

    it("should fail if the context is wrong", () => {
      const mockCtx = {
        get: () => {
          throw new Error("forced failure");
        },
        json: (data) => data,
      };

      assertThrows(() => serveGameState(mockCtx));
    });
  });

  describe("POST game/roll ", () => {
    it("rolling as current player", async () => {
      const result = await app
        .request("/game/roll", {
          headers,
          method: "POST",
        })
        .then(toJSON);
      assert(Array.isArray(result.destinations));
    });

    it("rolling as unknown player", async () => {
      const result = await app
        .request("/game/roll", {
          method: "POST",
        })
        .then(toJSON);

      assert(!result.success);
      assertEquals(result.error.message, "You do not have permission to play");
    });
  });

  describe("POST game/move ", () => {
    let destinations;
    beforeEach(async () => {
      const result = await app
        .request("/game/roll", {
          headers,
          method: "POST",
        })
        .then(toJSON);

      destinations = result.destinations;
    });

    it("Requesting with valid destination, should move to other tile", async () => {
      const destination = destinations[0];
      const response = await app.request("/game/move", {
        method: "POST",
        body: JSON.stringify(destination),
        headers,
      });

      const { result } = await response.json();

      assertEquals(result.moveResult.source, { x: -1, y: -1 });
      assertEquals(result.message, "Moved successfully");
    });

    it("Requesting with invalid destination, should not move to other tile", async () => {
      const destination = { destination: { x: -4, y: 3 }, type: "jump" };

      const response = await app.request("/game/move", {
        method: "POST",
        body: JSON.stringify(destination),
        headers,
      });

      const moveResult = await response.json();

      assertEquals(moveResult.success, false);
      assertEquals(moveResult.error.message, "not a valid move");
    });
  });

  describe("POST game/pass-turn", () => {
    it("passing turn without rolling and moving", async () => {
      const result = await app
        .request("/game/pass-turn", {
          method: "POST",
          headers,
        })
        .then(toJSON);

      assertEquals(result.error.message, "roll and move to end turn");
    });

    it("passing turn as other player", async () => {
      const p1 = await rollAndMove(player1SessionId, app);
      const p2 = await rollAndMove(player2SessionId, app);

      const [nextP, headCookie] =
        p1.diceValues.number >= p2.diceValues.number
          ? [player1SessionId, player2SessionId]
          : [player2SessionId, player1SessionId];

      await rollAndMove(nextP, app);
      headers.set("Cookie", `sessionId=${headCookie}`);

      const result = await app
        .request("/game/pass-turn", {
          method: "POST",
          headers,
        })
        .then(toJSON);

      assertEquals(result.error.message, "Its not your turn");
    });

    it("passing turn with rolling and moving", async () => {
      const p1 = await rollAndMove(player1SessionId, app);
      const p2 = await rollAndMove(player2SessionId, app);

      const nextP =
        p1.diceValues.number >= p2.diceValues.number
          ? player1SessionId
          : player2SessionId;

      await rollAndMove(nextP, app);
      headers.set("Cookie", `sessionId=${nextP}`);

      const { result } = await app
        .request("/game/pass-turn", {
          method: "POST",
          headers,
        })
        .then(toJSON);

      assertEquals(result.message, "turn passed");
    });
  });

  describe("Player's turn actions ", () => {
    let currentPlayerSId, currentPlayer, movedRes;
    beforeEach(async () => {
      const p1 = await rollAndMove(player1SessionId, app);
      const p2 = await rollAndMove(player2SessionId, app);

      currentPlayerSId =
        p1.diceValues.number >= p2.diceValues.number
          ? player1SessionId
          : player2SessionId;

      headers.set("Cookie",`sessionId=${currentPlayerSId}`);

      const playerInstances = Object.values(players);
      currentPlayer =
        currentPlayerSId === player1SessionId
          ? playerInstances[0]
          : playerInstances[1];
      movedRes = await rollAndMove(currentPlayerSId, app);
    });

    describe("GET game/buy-action-card", () => {
      it("should give a new action card", async () => {
        currentPlayer.creditTokens(5);

        const response = await app.request("/game/buy-action-card", {
          headers,
        });
        const responseBody = await response.json();

        assertEquals(responseBody.message, "Action card bought successfully");
        assertEquals(responseBody.success, true);
      });

      it("should fail when context is invalid", async () => {
        const response = await app.request("/game/buy-action-card");
        const responseBody = await response.json();

        assertEquals(
          responseBody.error.message,
          "You do not have permission to play",
        );
        assert(!responseBody.success);
      });

      it("should inform if tokens are insufficient", async () => {
        const tokens = currentPlayer.getTokens();
        currentPlayer.debitTokens(tokens);

        const response = await app.request("/game/buy-action-card", {
          headers,
        });
        const responseBody = await response.json();

        assertEquals(responseBody.error.message, "You don't have enough tokens");
        assert(!responseBody.success);
      });
    });

    describe("GET game/buy-design-card", () => {
      it("should give a new design card", async () => {
        currentPlayer.creditTokens(5);

        const response = await app.request("/game/buy-design-card", {
          headers,
        });
        const responseBody = await response.json();

        assertEquals(responseBody.message, "Design card bought successfully");
        assertEquals(responseBody.success, true);
      });

      it("should fail when context is invalid", async () => {
        const response = await app.request("/game/buy-design-card");
        const responseBody = await response.json();

        assertEquals(
          responseBody.error.message,
          "You do not have permission to play",
        );
        assert(!responseBody.success);
      });

      it("should inform if tokens are insufficient", async () => {
        const tokens = currentPlayer.getTokens();
        currentPlayer.debitTokens(tokens);

        const response = await app.request("/game/buy-design-card", {
          headers,
        });
        const responseBody = await response.json();
        assertEquals(responseBody.error.message, "You don't have enough tokens");
        assert(!responseBody.success);
      });
    });

    describe("GET /game/claim-design", () => {
      it("should return details of design card if that design pattern has matched with the board", async () => {
        const card = {
          id: 5,
          victoryPoints: 1,
          design: [
            { coord: { x: 2, y: 0 }, color: 5 },
            { coord: { x: 2, y: 1 }, color: 5 },
            { coord: { x: 2, y: 2 }, color: 5 },
            { coord: { x: 2, y: 3 }, color: 5 },
            { coord: { x: 2, y: 4 }, color: 5 },
          ],
        };
        currentPlayer.addDesignCard(card);

        const res = await app.request("/game/claim-design/5", { headers });
        const claimingStatus = await res.json();

        assertEquals(claimingStatus.success, true);
        assertEquals(claimingStatus.result.isMatched, true);
      });

      it("should return details of design card if that design pattern is not present in the board", async () => {
        currentPlayer.removeDesignCard(2);
        const res = await app.request("/game/claim-design/2", { headers });
        const claimingStatus = await res.json();

        assertEquals(claimingStatus.success, false);
      });
    });

    describe("POST /game/swap ", () => {
      let yarns;
      beforeEach(() => {
        yarns = movedRes.response.result.adjYarns;
      });

      it("Requesting with valid yarns positions, should be swapped", async () => {
        if (yarns.length > 2) {
          const yarnPosition = yarns[0];
          const draggablePosition = yarns[1];

          const response = await app.request("/game/swap", {
            method: "POST",
            body: JSON.stringify({ draggablePosition, yarnPosition }),
            headers,
          });

          const moveResult = await response.json();

          assert(moveResult.success);
          assertEquals(moveResult.message, "Swapped successfully");
        }
      });

      it("Requesting with invalid source yarn position, should not be swapped", async () => {
        const draggablePosition = { x: 6, y: 1 };
        const yarnPosition = { x: 2, y: 2 };

        const response = await app.request("/game/swap", {
          method: "POST",
          body: JSON.stringify({ draggablePosition, yarnPosition }),
          headers,
        });

        const { success, error } = await response.json();

        assert(!success);
        assertEquals(error.message, "You can't swap these yarns");
      });

      it("Requesting with same source and destination yarns positions, should not be swapped", async () => {
        const draggablePosition = yarns[0];
        const yarnPosition = yarns[0];

        const response = await app.request("/game/swap", {
          method: "POST",
          body: JSON.stringify({ draggablePosition, yarnPosition }),
          headers,
        });

        const { error, success } = await response.json();

        assert(!success);
        assertEquals(error.message, "You can't swap these yarns");
      });
    });

    describe("POST /game/paid-swap", () => {
      it("Player have more than 3 tokens, yarns should be swapped", async () => {
        currentPlayer.creditTokens(4);

        const draggablePosition = { x: 1, y: 1 };
        const yarnPosition = { x: 2, y: 3 };

        const response = await app.request("/game/paid-swap", {
          method: "POST",
          body: JSON.stringify({ draggablePosition, yarnPosition }),
          headers,
        });

        const moveResult = await response.json();

        assert(moveResult.success);
        assertEquals(moveResult.message, "Swapped successfully");
      });

      it("Player have less than 3 tokens, yarns should not be swapped", async () => {
        const tokens = currentPlayer.getTokens();
        currentPlayer.debitTokens(tokens);

        const draggablePosition = { x: 1, y: 1 };
        const yarnPosition = { x: 2, y: 3 };

        const response = await app.request("/game/paid-swap", {
          method: "POST",
          body: JSON.stringify({ draggablePosition, yarnPosition }),
          headers,
        });

        const { error, success } = await response.json();

        assert(!success);
        assertEquals(error.message, "You don't have enough tokens");
      });

      it("Player have more than 3 tokens (invalid source), yarns should not be swapped", async () => {
        currentPlayer.creditTokens(4);

        const draggablePosition = { x: 1, y: 5 };
        const yarnPosition = { x: 2, y: 3 };

        const response = await app.request("/game/paid-swap", {
          method: "POST",
          body: JSON.stringify({ draggablePosition, yarnPosition }),
          headers,
        });

        const { success, error } = await response.json();

        assert(!success);
        assertEquals(error.message, "Invalid position");
      });

      it("Player have more than 3 tokens (invalid destination), yarns should be swapped", async () => {
        currentPlayer.creditTokens(4);

        const draggablePosition = { x: 1, y: 1 };
        const yarnPosition = { x: 2, y: -3 };

        const response = await app.request("/game/paid-swap", {
          method: "POST",
          body: JSON.stringify({ draggablePosition, yarnPosition }),
          headers,
        });

        const { success, error } = await response.json();

        assert(!success);
        assertEquals(error.message, "Invalid position");
      });
    });

    describe("Swap Yarns Action Card", () => {
      it("Player have swap yarn action card, yarns should be swapped", async () => {
        currentPlayer.addActionCard({
          id: 25,
          type: "swap yarns",
          description: "Swap positions of any two yarns on the board.",
        });

        const draggablePosition = { x: 1, y: 1 };
        const yarnPosition = { x: 2, y: 3 };

        const response = await app.request("/game/action-card/25", {
          method: "PATCH",
          body: JSON.stringify({ draggablePosition, yarnPosition }),
          headers,
        });

        const { result, success } = await response.json();

        assert(success);
        assertEquals(result.message, "Swap action card played");
      });

      it("Player don't have swap yarn action card, yarns should not be swapped", async () => {
        currentPlayer.removeActionCard(25);

        const response = await app.request("/game/action-card/25", {
          method: "PATCH",
          headers,
        });

        const { error, success } = await response.json();

        assert(!success);
        assertEquals(error.message, "Card is missing");
      });

      it("Player have swap yarn action card (invalid source), yarns should not be swapped", async () => {
        currentPlayer.addActionCard({
          id: 25,
          type: "swap yarns",
          description: "Swap positions of any two yarns on the board.",
        });

        const draggablePosition = { x: 5, y: 1 };
        const yarnPosition = { x: 2, y: 3 };

        await app.request("/game/action-card/25", {
          method: "PATCH",
          headers,
        });

        const { error, success } = await app
          .request("/game/perform-action-card", {
            headers,
            body: JSON.stringify({
              draggablePosition,
              yarnPosition,
              cardId: 25,
            }),
            method: "POST",
          })
          .then(toJSON);

        assert(!success);
        assertEquals(error.message, "Invalid position");
      });

      it("Player have swap yarn action card (invalid destination), yarns should not be swapped", async () => {
        currentPlayer.addActionCard({
          id: 25,
          type: "swap yarns",
          description: "Swap positions of any two yarns on the board.",
        });

        const draggablePosition = { x: 1, y: 1 };
        const yarnPosition = { x: -2, y: 3 };

        await app.request("/game/action-card/25", {
          method: "PATCH",
          headers,
        });

        const { error, success } = await app
          .request("/game/perform-action-card", {
            headers,
            body: JSON.stringify({
              draggablePosition,
              yarnPosition,
              cardId: 25,
            }),
            method: "POST",
          })
          .then(toJSON);

        assert(!success);
        assertEquals(error.message, "Invalid position");
      });
    });

    describe("Play Action Cards", () => {
      let opponent;
      beforeEach(() => {
        opponent = Object.values(players).find(
          (x) => x.getId() !== currentPlayerSId,
        );
      });

      describe("Tax Action Card", () => {
        it("when tax action card played, then one token from other players should be deducted and bank tokens should incremented: ", async () => {
          currentPlayer.addActionCard({
            id: 6,
            type: "tax",
            description: "All other players pay 1 token to the reserve.",
          });

          const tks = currentPlayer.getTokens();
          currentPlayer.debitTokens(tks);

          const tokens = opponent.getTokens();
          opponent.debitTokens(tokens);
          opponent.creditTokens(2);

          const response = await app.request("/game/action-card/6", {
            method: "PATCH",
            headers,
          });

          const { result, success } = await response.json();

          assertEquals(success, true);
          assertEquals(result.affectedPlayers.length, 1);
          assertEquals(opponent.getTokens(), 1);
        });

        it("when tax action card played and other player has 0 token, then no token should be deducted and bank token should not incremented: ", async () => {
          currentPlayer.addActionCard({
            id: 6,
            type: "tax",
            description: "All other players pay 1 token to the reserve.",
          });

          const tks = currentPlayer.getTokens();
          currentPlayer.debitTokens(tks);

          const opponent = Object.values(players)[1];
          const tokens = opponent.getTokens();
          opponent.debitTokens(tokens);

          const previousBankTokens = await getBankTokens(app, headers);

          const { result } = await app
            .request("/game/action-card/6", {
              method: "PATCH",
              headers,
            })
            .then(toJSON);

          const newBankTokens = await getBankTokens(app, headers);

          assertAlmostEquals(result.affectedPlayers.length, 0, 2);
          assertAlmostEquals(previousBankTokens, newBankTokens, 2);
        });

        it("when played action card is invalid, then should throw error and no update in state: ", async () => {
          const response = await app.request("/game/action-card/0", {
            method: "PATCH",
            headers,
          });

          const { success, error } = await response.json();

          assertEquals(success, false);
          assertEquals(error.message, "Card is missing");
        });

        it("when player does not have action card but wants to play, then should throw error and no update in state: ", async () => {
          currentPlayer.removeActionCard(6);
          const response = await app.request("/game/action-card/6", {
            method: "PATCH",
            headers,
          });

          const { success, error } = await response.json();

          assert(!success);
          assertEquals(error.message, "Card is missing");
        });
      });

      describe("Move Action Card", () => {
        beforeEach(async () => {
          await app.request("/game/pass-turn", { headers, method: "POST" });
          headers.set("Cookie", `sessionId=${opponent.getId()}`);

          const temp = opponent;
          opponent = currentPlayer;
          currentPlayer = temp;

          await app.request("/game/roll", { method: "POST", headers });
        });

        it("when move action card played, then should return all unoccupied positions on the board and remove the action card : ", async () => {
          currentPlayer.setup(1, { x: 0, y: 0 });
          opponent.setup(2, { x: 1, y: 1 });

          const expectedDestinations = [
            [0, 1],
            [0, 2],
            [0, 3],
            [0, 4],
            [0, 5],
            [1, 0],
            [1, 2],
            [1, 3],
            [1, 4],
            [1, 5],
            [2, 0],
            [2, 1],
            [2, 2],
            [2, 3],
            [2, 4],
            [2, 5],
            [3, 0],
            [3, 1],
            [3, 2],
            [3, 3],
            [3, 4],
            [3, 5],
            [4, 0],
            [4, 1],
            [4, 2],
            [4, 3],
            [4, 4],
            [4, 5],
            [5, 0],
            [5, 1],
            [5, 2],
            [5, 3],
            [5, 4],
            [5, 5],
          ];

          currentPlayer.addActionCard({
            id: 1,
            type: "move",
            description: "Move to any unoccupied position",
          });

          const response = await app.request("/game/action-card/1", {
            method: "PATCH",
            headers,
          });

          const { result } = await response.json();

          assertEquals(result.availableDestinations, expectedDestinations);
        });

        it("when played action card is invalid, then should throw error and no update in state: ", async () => {
          currentPlayer.addActionCard({
            id: 1,
            type: "move",
            description: "Move to any unoccupied position",
          });

          const response = await app.request("/game/action-card/0", {
            method: "PATCH",
            headers,
          });

          const { success, error } = await response.json();

          assertEquals(success, false);
          assertEquals(error.message, "Card is missing");
        });

        it("when player does not have move action card but wants to play, then should throw error and no update in state: ", async () => {
          currentPlayer.removeActionCard(1);
          const response = await app.request("/game/action-card/1", {
            method: "PATCH",
            headers,
          });

          const { success, error } = await response.json();

          assertEquals(success, false);
          assertEquals(error.message, "Card is missing");
        });
      });
    });
  });
});
