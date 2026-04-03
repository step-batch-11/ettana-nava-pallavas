import { beforeEach, describe, it } from "@std/testing/bdd";
import { createApp } from "../../src/app.js";
import { assertEquals } from "@std/assert/equals";
import { serveGameState } from "../../src/handlers/game_handlers.js";
import Bank from "../../src/models/bank.js";
import Board from "../../src/models/board.js";
import Game from "../../src/models/game.js";
import Player from "../../src/models/player.js";

describe("Game route", () => {
  let app,
    players,
    bank,
    board,
    tiles,
    yarns,
    designCards,
    actionCards,
    gameState;

  beforeEach(() => {
    designCards = [
      {
        "id": 1,
        "victoryPoints": 1,
        "design": [
          { coord: { x: 0, y: 0 }, color: 1 },
          { coord: { x: 0, y: 1 }, color: 1 },
          { coord: { x: 0, y: 2 }, color: 1 },
        ],
      },
      {
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
      },
    ];

    actionCards = [{
      "id": 1,
      "type": "move",
      "description": "Move the pin to any unoccupied square.",
    }, {
      "id": 2,
      "type": "move",
      "description": "Move the pin to any unoccupied square.",
    }];
    const player1 = new Player(1, "Ajoy");
    player1.setup(2, { x: 2, y: 1 });
    player1.addAllDesignCardDev(...designCards);
    // player1.addActionCard(...actionCards);

    const player2 = new Player(2, "Dinesh");
    player1.setup(3, { x: 4, y: 1 });
    players = [
      player1,
      player2,
    ];

    tiles = [
      [0, 0, 0, 0, 0, 0],
      [0, 1, 2, 3, 4, 0],
      [0, 5, 6, 1, 2, 0],
      [0, 3, 4, 5, 6, 0],
      [0, 2, 3, 4, 5, 0],
      [0, 0, 0, 0, 0, 0],
    ];

    yarns = [
      [1, 2, 3, 4, 5],
      [5, 4, 3, 2, 1],
      [1, 2, 3, 4, 5],
      [5, 4, 3, 2, 1],
      [1, 2, 3, 4, 5],
    ];

    bank = new Bank(designCards, actionCards);
    board = new Board(tiles, yarns);
    gameState = new Game(
      players,
      bank,
      board,
      2,
    );

    app = createApp(gameState);
  });

  describe("GET /game/game-state", () => {
    it("should return the initial state as it is", async () => {
      const res = await app.request("/game/game-state");
      const game = await res.json();
      assertEquals(game.success, true);
    });

    it("should fail if the context is wrong", () => {
      const mockCtx = {
        get: () => {
          throw new Error("forced failure");
        },
        json: (data) => data,
      };

      const result = serveGameState(mockCtx);

      assertEquals(result.success, false);
      assertEquals(result.error, "forced failure");
    });
  });

  describe("GET /game/claim-design", () => {
    it(
      "should return details of design card if that design pattern has matched with the board",
      async () => {
        const res = await app.request("/game/claim-design/1");
        const claimingStatus = await res.json();

        assertEquals(claimingStatus.success, true);
        assertEquals(claimingStatus.result.isMatched, true);
      },
    );

    it(
      "should return details of design card if that design pattern is not present in the board",
      async () => {
        const res = await app.request("/game/claim-design/2");
        const claimingStatus = await res.json();

        assertEquals(claimingStatus.success, true);
        assertEquals(claimingStatus.result.isMatched, false);
      },
    );
  });
});
