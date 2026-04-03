import { beforeEach, describe, it } from "@std/testing/bdd";
import Game from "../../src/models/game.js";
import Bank from "../../src/models/bank.js";
import Board from "../../src/models/board.js";
import Player from "../../src/models/player.js";
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

  const player1 = new Player(1, "Ajoy");
  player1.setup(2, { x: 2, y: 1 });
  player1.addAllDesignCardDev(...designCards);
  player1.addActionCard(actionCards[0]);

  const player2 = new Player(2, "Dinesh");
  player1.setup(3, { x: 4, y: 1 });

  const players = [
    player1,
    player2,
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
      assertEquals(gameState.players[0].dc, 2); // 2 design cards added for claim design card test
      assertEquals(gameState.players[0].ac, 2); // 2 action cards added for claim design card test
      assertEquals(gameState.players[1].dc, 1);
      assertEquals(gameState.players[1].ac, 1);
    });
  });

  describe("Get current player", () => {
    it("Get current player id", () => {
      const currentPlayerId = game.getCurrentPlayerId();
      assertEquals(currentPlayerId, 1);
    });
  });

  describe("Distribute initial assets", () => {
    it(
      "when game starts, then should update bank state after initial token and card distribution",
      () => {
        const result = {
          tokens: 51,
          availableDesignCards: 0,
          availableActionCards: 2,
          yarns: [1, 2, 3, 4, 5],
          tiles: [1, 6],
        };

        game.distributeInitialAssets();

        assertEquals(bank.getBank(), result);
      },
    );
  });
});
