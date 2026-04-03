import { beforeEach, describe, it } from "@std/testing/bdd";
import { createApp } from "../../src/app.js";
import { assertEquals } from "@std/assert/equals";
import { serveGameState } from "../../src/handlers/game_handlers.js";
import Bank from "../../src/models/bank.js";
import Board from "../../src/models/board.js";
import TurnManager from "../../src/models/turn_manager.js";
import Game from "../../src/models/game.js";

describe.ignore("Game route", () => {
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
    players = [
      {
        name: "A",
        id: 1,
        tokens: 0,
        victoryPoint: 0,
        actionCards: [],
        designCards: [],
        pin: { color: 2, pos: { x: 2, y: 1 } },
      },
      {
        name: "B",
        id: 2,
        tokens: 0,
        victoryPoint: 0,
        actionCards: [],
        designCards: [],
        pin: { color: 3, pos: { x: 4, y: 1 } },
      },
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

    designCards = [
      { "id": 1, "victoryPoints": 1 },
      { "id": 2, "victoryPoints": 1 },
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

    bank = new Bank(designCards, actionCards);
    board = new Board(tiles, yarns);
    gameState = new Game(
      players,
      bank,
      board,
      2,
    );

    app = createApp(gameState, new TurnManager());
  });

  it("GET /game/game-state should return the initial state as it is", async () => {
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
