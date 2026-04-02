import { beforeEach, describe, it } from "@std/testing/bdd";
import { createApp } from "../../src/app.js";
import { assertEquals } from "@std/assert/equals";
import {
  distributeInitialAssets,
  serveBoardState,
  validateTileWithBank,
} from "../../src/handlers/game_handlers.js";
import Bank from "../../src/models/bank.js";

describe("Game route", () => {
  let app;

  const players = [
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

  const gameState = {
    players,
    currentPlayer: 2,
    board: {
      yarns: [
        [1, 2, 3, 4, 5],
        [5, 4, 3, 2, 1],
        [1, 2, 3, 4, 5],
        [5, 4, 3, 2, 1],
        [1, 2, 3, 4, 5],
      ],
      tiles: [
        [
          { value: null, playerId: null },
          { value: null, playerId: null },
          { value: null, playerId: null },
          { value: null, playerId: null },
          { value: null, playerId: null },
          { value: null, playerId: null },
        ],
        [
          { value: null, playerId: null },
          { value: 1, playerId: null },
          { value: 2, playerId: null },
          { value: 3, playerId: null },
          { value: 4, playerId: null },
          { value: null, playerId: null },
        ],
        [
          { value: null, playerId: null },
          { value: 5, playerId: null },
          { value: 6, playerId: 2 },
          { value: 1, playerId: null },
          { value: 2, playerId: null },
          { value: null, playerId: null },
        ],
        [
          { value: null, playerId: null },
          { value: 3, playerId: null },
          { value: 4, playerId: null },
          { value: 5, playerId: 3 },
          { value: 6, playerId: null },
          { value: null, playerId: null },
        ],
        [
          { value: null, playerId: null },
          { value: 2, playerId: null },
          { value: 3, playerId: null },
          { value: 4, playerId: null },
          { value: 5, playerId: null },
          { value: null, playerId: null },
        ],
        [
          { value: null, playerId: null },
          { value: null, playerId: null },
          { value: null, playerId: null },
          { value: null, playerId: null },
          { value: null, playerId: null },
          { value: null, playerId: null },
        ],
      ],
    },
  };

  const designCards = [
    { "id": 1, "victoryPoints": 1 },
    { "id": 2, "victoryPoints": 1 },
  ];

  const actionCards = [{
    "id": 1,
    "type": "move",
    "description": "Move the pin to any unoccupied square.",
  }, {
    "id": 2,
    "type": "move",
    "description": "Move the pin to any unoccupied square.",
  }];

  const bank = new Bank(designCards, actionCards);

  beforeEach(() => {
    app = createApp(gameState, bank);
  });

  it("GET /game/board-state should return the initial state as it is", async () => {
    const res = await app.request("/game/board-state");
    const boardState = await res.json();

    assertEquals(boardState.success, true);
    assertEquals(boardState.state, gameState);
  });

  it("should fail if the context is wrong", () => {
    const mockCtx = {
      get: () => {
        throw new Error("forced failure");
      },
      json: (data) => data,
    };

    const result = serveBoardState(mockCtx);

    assertEquals(result.success, false);
    assertEquals(result.error, "forced failure");
  });

  it("should fail if the context is wrong", () => {
    const mockCtx = {
      get: () => {
        throw new Error("distribution failed");
      },
      json: (data) => data,
    };

    const result = distributeInitialAssets(mockCtx);

    assertEquals(result.success, false);
    assertEquals(result.error, "distribution failed");
  });

  it("GET /game/distribute-initial-assets successfully distribute tokens and card initially", async () => {
    const res = await app.request("/game/distribute-initial-assets");
    const boardState = await res.json();

    assertEquals(boardState.success, true);
  });
});

describe("Validate with bank", () => {
  let app;
  const players = [
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

  const gameState = {
    players,
    currentPlayer: 2,
    board: {
      yarns: [
        [1, 2, 3, 4, 5],
        [5, 4, 3, 2, 1],
        [1, 2, 3, 4, 5],
        [5, 4, 3, 2, 1],
        [1, 2, 3, 4, 5],
      ],
      tiles: [
        [
          { value: null, playerId: null },
          { value: null, playerId: null },
          { value: null, playerId: null },
          { value: null, playerId: null },
          { value: null, playerId: null },
          { value: null, playerId: null },
        ],
        [
          { value: null, playerId: null },
          { value: 1, playerId: null },
          { value: 2, playerId: null },
          { value: 3, playerId: null },
          { value: 4, playerId: null },
          { value: null, playerId: null },
        ],
        [
          { value: null, playerId: null },
          { value: 5, playerId: null },
          { value: 6, playerId: 2 },
          { value: 1, playerId: null },
          { value: 2, playerId: null },
          { value: null, playerId: null },
        ],
        [
          { value: null, playerId: null },
          { value: 1, playerId: null },
          { value: 4, playerId: null },
          { value: 5, playerId: 3 },
          { value: 6, playerId: null },
          { value: null, playerId: null },
        ],
        [
          { value: null, playerId: null },
          { value: 2, playerId: null },
          { value: 3, playerId: null },
          { value: 4, playerId: null },
          { value: 5, playerId: null },
          { value: null, playerId: null },
        ],
        [
          { value: null, playerId: null },
          { value: null, playerId: null },
          { value: null, playerId: null },
          { value: null, playerId: null },
          { value: null, playerId: null },
          { value: null, playerId: null },
        ],
      ],
    },
  };

  const designCards = [
    { "id": 1, "victoryPoints": 1 },
    { "id": 2, "victoryPoints": 1 },
  ];

  const actionCards = [{
    "id": 1,
    "type": "move",
    "description": "Move the pin to any unoccupied square.",
  }, {
    "id": 2,
    "type": "move",
    "description": "Move the pin to any unoccupied square.",
  }];

  const bank = new Bank(designCards, actionCards);

  beforeEach(() => {
    app = createApp(gameState, bank);
  });

  it("should return true when board has less than 2 occurrences of bank tiles", () => {
    const boardTiles = [
      [{ value: 1, playerId: null }, { value: 6, playerId: null }],
    ];

    const bankTiles = [
      { value: 1, playerId: null },
      { value: 1, playerId: null },
      { value: 6, playerId: null },
      { value: 6, playerId: null },
    ];

    assertEquals(validateTileWithBank(boardTiles, bankTiles), true);
  });

  it.ignore("Should fail if the tiles are not validated with bank before sending it", async () => {
    const res = await app.request("/game/board-state");
    const boardState = await res.json();

    assertEquals(boardState, {
      success: false,
      error: "Tiles placement is wrong",
    });
  });
});
