import { beforeAll, beforeEach, describe, it } from "@std/testing/bdd";
import Game from "../../src/models/game.js";
import Bank from "../../src/models/bank.js";
import Board from "../../src/models/board.js";
import Player from "../../src/models/player.js";
import { assertEquals } from "@std/assert/equals";
import { assertThrows } from "@std/assert/throws";
import { assertNotEquals } from "@std/assert/not-equals";

const getCoords = ({ x, y }) => ({ x, y });

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

  describe("Tests for moving pin and swap yarns", () => {
    let board, gameState;

    const currentPlayer = new Player(1, "John");
    currentPlayer.setup(3, { x: 1, y: 0 });
    currentPlayer.creditTokens(5);

    beforeEach(() => {
      const player2 = new Player(2, "Jane");
      const player3 = new Player(3, "Jean");

      player2.setup(2, { x: 1, y: 2 });
      player3.setup(1, { x: 1, y: 4 });

      const players = [currentPlayer, player2, player3];
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

      board = new Board(tiles, yarns);
      const bank = new Bank([], []);
      const diceValue = { colorId: 1, number: 2 };

      gameState = new Game(players, bank, board, diceValue);
    });

    describe("Move pin", () => {
      describe("test for Destination: ", () => {
        beforeEach(() => {
          board.destinations = [
            { destination: { x: 2, y: 4 }, path: [], type: "normal" },
            { destination: { x: 1, y: 0 }, path: [], type: "normal" },
          ];
        });

        it("Invalid destination, position should not be changed", () => {
          const path = [
            { x: 1, y: 0 },
            { x: 1, y: 1 },
          ];

          const route = { destination: { x: 2, y: 0 }, path, type: "normal" };

          const positions = gameState.move(route);
          assertNotEquals(positions.destination, getCoords(route.destination));
        });

        it("Valid destination, position should be changed to destination", () => {
          const path = [
            { x: 1, y: 0 },
            { x: 1, y: 1 },
            { x: 2, y: 1 },
            { x: 2, y: 2 },
            { x: 2, y: 3 },
          ];

          const route = { destination: { x: 2, y: 4 }, path, type: "normal" };

          const positions = gameState.move(route);
          assertEquals(positions.destination, getCoords(route.destination));
        });
      });

      describe("Path penalty for premium path: ", () => {
        it("One player is in path, should pay to one player", () => {
          const path = [
            { x: 1, y: 0 },
            { x: 1, y: 1 },
            { x: 1, y: 2 },
          ];

          board.destinations = [{
            destination: { x: 1, y: 3 },
            path,
            type: "premium",
            recipients: [2],
          }];

          const route = {
            destination: { x: 1, y: 3 },
            path,
            type: "premium",
            recipients: [2],
          };

          const positions = gameState.move(route);
          assertEquals(positions.destination, getCoords(route.destination));
          assertEquals(currentPlayer.getTokens(), 4);
        });

        it("Two players is in path, should pay to two players", () => {
          const path = [
            { x: 1, y: 0 },
            { x: 1, y: 1 },
            { x: 1, y: 2 },
            { x: 1, y: 3 },
            { x: 1, y: 4 },
          ];

          board.destinations = [{
            destination: { x: 1, y: 5 },
            path,
            type: "premium",
            recipients: [2, 3],
          }];

          const route = {
            destination: { x: 1, y: 5 },
            path,
            type: "premium",
            recipients: [2, 3],
          };

          const positions = gameState.move(route);
          assertEquals(positions.destination, getCoords(route.destination));
          assertEquals(currentPlayer.getTokens(), 2);
        });

        it("No one in path, should not pay to any player", () => {
          board.destinations = [{
            destination: { x: 2, y: 3 },
            path: [],
            type: "normal",
          }];

          const path = [
            { x: 1, y: 0 },
            { x: 0, y: 0 },
            { x: 0, y: 1 },
            { x: 0, y: 2 },
            { x: 0, y: 3 },
          ];

          const route = { destination: { x: 2, y: 3 }, path, type: "normal" };

          const positions = gameState.move(route);
          assertEquals(positions.destination, getCoords(route.destination));
          assertEquals(currentPlayer.getTokens(), 2);
        });
      });
    });

    describe("Get adjacent yarns: ", () => {
      it("It is a normal tile, should give four adjacent yarns position", () => {
        const pinPosition = { x: 1, y: 2 };
        const adjYarns = board.getAdjYarnsPositions(pinPosition);
        const expected = [
          { x: 0, y: 1 },
          { x: 0, y: 2 },
          { x: 1, y: 1 },
          { x: 1, y: 2 },
        ];
        assertEquals(adjYarns, expected);
      });

      it("It is a side (top) tile, should give two adjacent yarns position", () => {
        const pinPosition = { x: 0, y: 2 };
        const adjYarns = board.getAdjYarnsPositions(pinPosition);
        const expected = [
          { x: 0, y: 1 },
          { x: 0, y: 2 },
        ];
        assertEquals(adjYarns, expected);
      });

      it("It is a side (bottom) tile, should give two adjacent yarns position", () => {
        const pinPosition = { x: 5, y: 2 };
        const adjYarns = board.getAdjYarnsPositions(pinPosition);
        const expected = [
          { x: 4, y: 1 },
          { x: 4, y: 2 },
        ];
        assertEquals(adjYarns, expected);
      });

      it("It is a corner (left-top) tile, should give only one adjacent yarn position", () => {
        const pinPosition = { x: 5, y: 0 };
        const adjYarns = board.getAdjYarnsPositions(pinPosition);
        const expected = [
          { x: 4, y: 0 },
        ];
        assertEquals(adjYarns, expected);
      });

      it("It is a corner (right-bottom) tile, should give only one adjacent yarn position", () => {
        const pinPosition = { x: 0, y: 5 };
        const adjYarns = board.getAdjYarnsPositions(pinPosition);
        const expected = [
          { x: 0, y: 4 },
        ];
        assertEquals(adjYarns, expected);
      });
    });

    describe("Free yarn swap: ", () => {
      let mockGame;

      beforeAll(() => {
        mockGame = gameState.getGameState();
      });

      it("Source and destination yarns positions are valid, should be swapped", () => {
        const source = { x: 1, y: 2 };
        const destination = { x: 2, y: 3 };
        const expected = [
          [1, 2, 3, 4, 5],
          [5, 4, 3, 2, 1],
          [1, 2, 3, 4, 5],
          [5, 4, 3, 2, 1],
          [1, 2, 3, 4, 5],
        ];

        gameState.freeSwap(source, destination);
        assertEquals(mockGame.board.getYarns(), expected);
      });

      it("Source yarn position is not valid (out of board: negative value), should not be swapped", () => {
        const source = { x: -1, y: 1 };
        const destination = { x: 2, y: 2 };
        const expected = [
          [1, 2, 3, 4, 5],
          [5, 4, 3, 2, 1],
          [1, 2, 3, 4, 5],
          [5, 4, 3, 2, 1],
          [1, 2, 3, 4, 5],
        ];

        assertThrows(() => gameState.freeSwap(source, destination));
        assertEquals(mockGame.board.getYarns(), expected);
      });

      it("Source yarn position is not valid (out of board: higher value), should not be swapped", () => {
        const source = { x: 5, y: 1 };
        const destination = { x: 2, y: 2 };
        const expected = [
          [1, 2, 3, 4, 5],
          [5, 4, 3, 2, 1],
          [1, 2, 3, 4, 5],
          [5, 4, 3, 2, 1],
          [1, 2, 3, 4, 5],
        ];

        assertThrows(() => gameState.freeSwap(source, destination));
        assertEquals(mockGame.board.getYarns(), expected);
      });

      it("Destination yarn position is not valid (out of board: higher value), should not be swapped", () => {
        const source = { x: 1, y: 1 };
        const destination = { x: 5, y: 2 };
        const expected = [
          [1, 2, 3, 4, 5],
          [5, 4, 3, 2, 1],
          [1, 2, 3, 4, 5],
          [5, 4, 3, 2, 1],
          [1, 2, 3, 4, 5],
        ];

        assertThrows(() => gameState.freeSwap(source, destination));
        assertEquals(mockGame.board.getYarns(), expected);
      });

      it("Source and destination yarns positions are same, should not be swapped", () => {
        const source = { x: 1, y: 1 };
        const destination = { x: 1, y: 1 };
        const expected = [
          [1, 2, 3, 4, 5],
          [5, 4, 3, 2, 1],
          [1, 2, 3, 4, 5],
          [5, 4, 3, 2, 1],
          [1, 2, 3, 4, 5],
        ];

        assertThrows(() => gameState.freeSwap(source, destination));
        assertEquals(mockGame.board.getYarns(), expected);
      });
    });

    describe("Paid yarn swap", () => {
      let mockGame;

      beforeEach(() => {
        mockGame = gameState.getGameState();
      });

      it("Player have more than 3 tokens, should get a chance", () => {
        const { currentPlayerId, players } = mockGame;
        const currentPlayer = players.find((player) =>
          player.id === currentPlayerId
        );

        currentPlayer.creditTokens(3);
        const tokens = currentPlayer.getTokens();

        gameState.purchaseSwap();
        const updatedTokens = currentPlayer.getTokens();
        assertEquals(tokens - 3, updatedTokens);
      });

      it("Player don't have more than 3 tokens, should throw an error", () => {
        assertThrows(() => gameState.purchaseSwa());
      });
    });
  });
});
