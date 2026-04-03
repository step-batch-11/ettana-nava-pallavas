import { beforeEach, describe, it } from "@std/testing/bdd";
import { createApp } from "../../src/app.js";
import { assertEquals } from "@std/assert";
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

    players = [
      {
        name: "A",
        id: 1,
        tokens: 0,
        victoryPoint: 0,
        actionCards: actionCards,
        designCards: designCards,
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

        console.log(claimingStatus);
        assertEquals(claimingStatus.success, true);
        assertEquals(claimingStatus.result.isMatched, false);
      },
    );
  });

  describe.ignore("move request: ", () => {
    let app;

    const randomValue = 0.05;

    beforeEach(() => {
      const bank = new Bank(designCards, actionCards, () => randomValue);

      const player1 = new Player(1, "Sandeep");
      const player2 = new Player(2, "Ajoy");

      player1.setup(1, { x: 3, y: 4 });
      player2.setup(2, { x: 2, y: 1 });

      const players = [player1, player2];
      const yarns = [
        [1, 2, 3, 4, 5],
        [5, 4, 3, 2, 1],
        [1, 2, 3, 4, 5],
        [5, 4, 3, 2, 1],
        [1, 2, 3, 4, 5],
      ];

      const tiles = [
        [0, 0, 0, 0, 0, 0],
        [0, 1, 2, 3, 4, 0],
        [0, 5, 6, 1, 2, 0],
        [0, 3, 4, 5, 6, 0],
        [0, 2, 3, 4, 5, 0],
        [0, 0, 0, 0, 0, 0],
      ];

      const board = new Board(tiles, yarns);
      const diceValue = {
        colorId: 1,
        number: 2,
      };

      const gameState = new Game(players, bank, board, diceValue);
      app = createApp(gameState);
    });

    it("Requesting with valid destination, should move to other tile", async () => {
      await app.request("/game/roll", { method: "POST" });
      const destination = { destination: { x: 2, y: 3 }, type: "jump" };

      const response = await app.request("/game/move", {
        method: "POST",
        body: JSON.stringify(destination),
        headers: { "content-type": "application/json" },
      });

      const moveResult = await response.json();

      assertEquals(response.status, 200);
      assertEquals(moveResult.success, true);
      assertEquals(moveResult.data.adjYarns, [
        { x: 1, y: 2 },
        { x: 1, y: 3 },
        { x: 2, y: 2 },
        { x: 2, y: 3 },
      ]);
      assertEquals(moveResult.data.moveResult, {
        source: { x: 3, y: 4 },
        destination: { x: 2, y: 3 },
      });
    });

    it("Requesting with invalid destination, should not move to other tile", async () => {
      await app.request("/game/roll", { method: "POST" });
      const destination = { destination: { x: 4, y: 3 }, type: "jump" };

      const response = await app.request("/game/move", {
        method: "POST",
        body: JSON.stringify(destination),
        headers: { "content-type": "application/json" },
      });

      const moveResult = await response.json();

      assertEquals(response.status, 400);
      assertEquals(moveResult.success, false);
      assertEquals(moveResult.message, "You can't move there");
    });
  });

  describe("Swap Yarns: ", () => {
    let app;

    beforeEach(() => {
      const yarns = [
        [1, 2, 3, 4, 5],
        [5, 4, 3, 2, 1],
        [1, 2, 3, 4, 5],
        [5, 4, 3, 2, 1],
        [1, 2, 3, 4, 5],
      ];
      const player = new Player(1, "jane");
      player.setup(2, { x: 3, y: 4 });

      const bank = new Bank(designCards, actionCards, () => 0.1);
      const board = new Board([[]], yarns);
      const mockGameState = new Game([player], bank, board, {});

      app = createApp(mockGameState);
    });

    it("Requesting with valid yarns positions, should be swapped", async () => {
      const draggablePosition = { x: 3, y: 4 };
      const yarnPosition = { x: 2, y: 3 };

      const response = await app.request("/game/swap", {
        method: "POST",
        body: JSON.stringify({ draggablePosition, yarnPosition }),
        headers: { "content-type": "application/json" },
      });

      const moveResult = await response.json();

      assertEquals(response.status, 200);
      assertEquals(moveResult.success, true);
      assertEquals(moveResult.message, "Swapped successfully");
    });

    it("Requesting with invalid source yarn position, should not be swapped", async () => {
      const draggablePosition = { x: 6, y: 1 };
      const yarnPosition = { x: 2, y: 2 };

      const response = await app.request("/game/swap", {
        method: "POST",
        body: JSON.stringify({ draggablePosition, yarnPosition }),
        headers: { "content-type": "application/json" },
      });

      const moveResult = await response.json();

      assertEquals(response.status, 400);
      assertEquals(moveResult.success, false);
      assertEquals(moveResult.message, "You can't swap these yarns");
    });

    it("Requesting with same source and destination yarns positions, should not be swapped", async () => {
      const draggablePosition = { x: 1, y: 1 };
      const yarnPosition = { x: 1, y: 1 };

      const response = await app.request("/game/swap", {
        method: "POST",
        body: JSON.stringify({ draggablePosition, yarnPosition }),
        headers: { "content-type": "application/json" },
      });

      const moveResult = await response.json();

      assertEquals(response.status, 400);
      assertEquals(moveResult.success, false);
      assertEquals(moveResult.message, "You can't swap these yarns");
    });
  });
});
