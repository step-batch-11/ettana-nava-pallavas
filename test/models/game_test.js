import { beforeEach, describe, it } from "@std/testing/bdd";
import Game from "../../src/models/game.js";
import Bank from "../../src/models/bank.js";
import Board from "../../src/models/board.js";
import { assertEquals } from "@std/assert/equals";

describe("Game controller test", () => {
  let game;
  let board;
  let bank;
  const designCards = [
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

  const actionCards = [{
    "id": 1,
    "type": "move",
    "description": "Move the pin to any unoccupied square.",
  }, {
    "id": 2,
    "type": "move",
    "description": "Move the pin to any unoccupied square.",
  }];

  const players = [
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

  const tiles = [
    [0, 0, 0, 0, 0, 0],
    [0, 1, 2, 3, 4, 0],
    [0, 5, 6, 1, 2, 0],
    [0, 3, 4, 5, 6, 0],
    [0, 2, 3, 4, 5, 0],
    [0, 0, 0, 0, 0, 0],
  ];

  const yarns = [
    [1, 2, 3, 4, 5],
    [5, 4, 3, 2, 1],
    [1, 2, 3, 4, 5],
    [5, 4, 3, 2, 1],
    [1, 2, 3, 4, 5],
  ];

  beforeEach(() => {
    bank = new Bank(designCards, actionCards);
    board = new Board(tiles, yarns);
    game = new Game(
      players,
      bank,
      board,
      2,
    );
  });

  describe("Claim design", () => {
    it("should match a design pattern that is present in the board", () => {
      const matchingStatus = game.claimDesign(1);
      assertEquals(matchingStatus.isMatched, true);
      assertEquals(matchingStatus.matches, [
        { x: 0, y: 2 },
        { x: 1, y: 2 },
        { x: 2, y: 2 },
      ]);
    });

    it("should not match a design pattern that is not there in the board", () => {
      const matchingStatus = game.claimDesign(2);
      assertEquals(matchingStatus.isMatched, false);
    });
  });

  describe("Initial asset distribution", () => {
    it("should distribute assets when they have 0 tokens", () => {
      game.distributeInitialAssets();
      const gameState = game.getGameState();
      assertEquals(gameState.players[0].tokens, 2);
      assertEquals(gameState.players[1].tokens, 2);
      assertEquals(gameState.players[0].designCards.length, 3); // 2 design cards added for claim design card test
      assertEquals(gameState.players[0].actionCards.length, 3); // 2 action cards added for claim design card test
      assertEquals(gameState.players[1].designCards.length, 1);
      assertEquals(gameState.players[1].actionCards.length, 1);
    });
  });

  describe("Get current player", () => {
    it("Get current player id", () => {
      const currentPlayerId = game.getCurrentPlayerId();
      assertEquals(currentPlayerId, 1);
    });
  });
});
