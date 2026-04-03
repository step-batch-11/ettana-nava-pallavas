import { beforeAll, beforeEach, describe, it } from "@std/testing/bdd";
import { assert, assertEquals, assertNotEquals } from "@std/assert";
import TurnManager from "../../src/models/turn_manager.js";
import Bank from "../../src/models/bank.js";
import Player from "../../src/models/player.js";
import Game from "../../src/models/game.js";
import Board from "../../src/models/board.js";

const getCoords = ({ x, y }) => ({ x, y });

describe("Tests for moving pin", () => {
  let turnManager, gameState;

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

    const board = new Board(tiles, yarns);
    const bank = new Bank([], []);
    const diceValue = { colorId: 1, number: 2 };

    gameState = new Game(players, bank, board, diceValue);

    turnManager = new TurnManager(gameState);
  });

  describe("Move pin", () => {
    describe("test for Destination: ", () => {
      beforeEach(() => {
        turnManager.destinations = [
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

        const positions = turnManager.move(route);
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

        const positions = turnManager.move(route);
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

        turnManager.destinations = [{
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

        const positions = turnManager.move(route);
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

        turnManager.destinations = [{
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

        const positions = turnManager.move(route);
        assertEquals(positions.destination, getCoords(route.destination));
        assertEquals(currentPlayer.getTokens(), 2);
      });

      it("No one in path, should not pay to any player", () => {
        turnManager.destinations = [{
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

        const positions = turnManager.move(route);
        assertEquals(positions.destination, getCoords(route.destination));
        assertEquals(currentPlayer.getTokens(), 2);
      });
    });
  });

  describe("Get adjacent yarns: ", () => {
    it("It is a normal tile, should give four adjacent yarns position", () => {
      const pinPosition = { x: 1, y: 2 };
      const adjYarns = turnManager.getAdjYarnsPositions(pinPosition);
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
      const adjYarns = turnManager.getAdjYarnsPositions(pinPosition);
      const expected = [
        { x: 0, y: 1 },
        { x: 0, y: 2 },
      ];
      assertEquals(adjYarns, expected);
    });

    it("It is a side (bottom) tile, should give two adjacent yarns position", () => {
      const pinPosition = { x: 5, y: 2 };
      const adjYarns = turnManager.getAdjYarnsPositions(pinPosition);
      const expected = [
        { x: 4, y: 1 },
        { x: 4, y: 2 },
      ];
      assertEquals(adjYarns, expected);
    });

    it("It is a corner (left-top) tile, should give only one adjacent yarn position", () => {
      const pinPosition = { x: 5, y: 0 };
      const adjYarns = turnManager.getAdjYarnsPositions(pinPosition);
      const expected = [
        { x: 4, y: 0 },
      ];
      assertEquals(adjYarns, expected);
    });

    it("It is a corner (right-bottom) tile, should give only one adjacent yarn position", () => {
      const pinPosition = { x: 0, y: 5 };
      const adjYarns = turnManager.getAdjYarnsPositions(pinPosition);
      const expected = [
        { x: 0, y: 4 },
      ];
      assertEquals(adjYarns, expected);
    });
  });

  describe("Swap Yarns: ", () => {
    let mockGame;

    beforeAll(() => {
      mockGame = gameState.getGameState();
    });

    it("Source and destination yarns positions are valid, should be swapped", () => {
      const source = { x: 1, y: 2 };
      const destination = { x: 2, y: 3 };
      //currentPlayer's position = {x:2, y: 3};
      const expected = [
        [1, 2, 3, 4, 5],
        [5, 4, 3, 2, 1],
        [1, 2, 3, 4, 5],
        [5, 4, 3, 2, 1],
        [1, 2, 3, 4, 5],
      ];

      const swapResult = turnManager.freeSwap(source, destination);
      assertEquals(swapResult.success, true);
      assertEquals(mockGame.board.yarns, expected);
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

      const swapResult = turnManager.freeSwap(source, destination);
      assertEquals(swapResult.success, false);
      assertEquals(mockGame.board.yarns, expected);
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

      const swapResult = turnManager.freeSwap(source, destination);
      assertEquals(swapResult.success, false);
      assertEquals(mockGame.board.yarns, expected);
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

      const swapResult = turnManager.freeSwap(source, destination);
      assertEquals(swapResult.success, false);
      assertEquals(mockGame.board.yarns, expected);
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

      const swapResult = turnManager.freeSwap(source, destination);
      assertEquals(swapResult.success, false);
      assertEquals(mockGame.board.yarns, expected);
    });
  });
});

describe("Roll dice and find possible path :", () => {
  let turnManager;
  const yarns = [
    [1, 1, 1, 1, 1],
    [2, 2, 2, 2, 2],
    [3, 3, 3, 3, 3],
    [4, 4, 4, 4, 4],
    [5, 5, 5, 5, 5],
  ];

  const tiles = [
    [0, 1, 2, 3, 4, 0],
    [0, 5, 6, 1, 2, 0],
    [0, 3, 4, 5, 6, 0],
    [0, 1, 2, 3, 4, 0],
    [0, 5, 6, 1, 2, 0],
    [0, 3, 4, 5, 6, 0],
  ];

  beforeEach(() => {
    const randomFn = () => 0.9;
    const board = new Board(tiles, yarns);
    const bank = new Bank([], []);
    const player = new Player(2, "john");
    player.setup(1, { x: 1, y: 1 });

    const player2 = new Player(123, "john");
    player2.setup(2, { x: 3, y: 3 });

    const diceValue = { colorId: 1, number: 1 };

    const mockGame = new Game([player, player2], bank, board, diceValue);
    turnManager = new TurnManager(mockGame, randomFn);
  });

  describe("roll dice :", () => {
    it("when rollDice invoked, should return two random values :", () => {
      const actual = turnManager.rollDice();
      const expected = { number: 6, colorId: 6 };
      assertEquals(actual, expected);
    });
  });

  describe("find possible path : ", () => {
    it("when position, steps given, should return all possible locations", () => {
      const actual = turnManager.findPossibleDestinations(1);
      const expected = [
        { destination: { x: 1, y: 2 }, type: "normal", path: [{ x: 1, y: 1 }] },
        { destination: { x: 2, y: 1 }, type: "normal", path: [{ x: 1, y: 1 }] },
        { destination: { x: 1, y: 0 }, type: "normal", path: [{ x: 1, y: 1 }] },
        { destination: { x: 0, y: 1 }, type: "jump" },
        { destination: { x: 1, y: 3 }, type: "jump" },
        { destination: { x: 3, y: 1 }, type: "jump" },
        { destination: { x: 4, y: 3 }, type: "jump" },
      ];
      assertEquals(actual, expected);
    });

    it("when all number tiles are occupied then, should not show the type jump", () => {
      const tiles = [
        [0, 1, 2, 3, 4, 0],
        [0, 5, 6, 1, 2, 0],
        [0, 3, 4, 5, 6, 0],
        [0, 1, 2, 3, 4, 0],
        [0, 5, 6, 1, 2, 0],
        [0, 3, 4, 5, 6, 0],
      ];

      const randomFn = () => 0.1;
      const board = new Board(tiles, yarns);
      const bank = new Bank([], []);
      const player1 = new Player(2, "john");
      const player2 = new Player(4, "jane");
      const player3 = new Player(3, "jean");
      const player4 = new Player(123, "jaju");
      const player5 = new Player(1, "jaanu");
      const player6 = new Player(8, "jaanu");

      player1.setup(6, { x: 1, y: 1 });
      player2.setup(2, { x: 1, y: 3 });
      player3.setup(3, { x: 3, y: 1 });
      player4.setup(4, { x: 3, y: 3 });
      player5.setup(5, { x: 4, y: 3 });
      player6.setup(5, { x: 0, y: 1 });

      const diceValue = { colorId: 1, number: 2 };

      const mockGame = new Game(
        [player1, player2, player3, player4, player5, player6],
        bank,
        board,
        diceValue,
      );

      turnManager = new TurnManager(mockGame, randomFn);

      const actual = turnManager.findPossibleDestinations(1);
      const expected = [
        { destination: { x: 1, y: 2 }, type: "normal", path: [{ x: 1, y: 1 }] },
        { destination: { x: 2, y: 1 }, type: "normal", path: [{ x: 1, y: 1 }] },
        { destination: { x: 1, y: 0 }, type: "normal", path: [{ x: 1, y: 1 }] },
      ];
      assertEquals(actual, expected);
    });

    it("when possible locations are provided, there should be no duplicates in the path", () => {
      const areDistinct = (coords) => {
        const positions = coords.map((coord) => {
          const key = `${coord.x},${coord.y}`;
          return key;
        });

        const set = new Set(positions);
        return coords.length === set.size;
      };

      const actual = turnManager.findPossibleDestinations(4);
      const status = actual.every(
        ({ type, path }) => type === "jump" || areDistinct(path),
      );
      assert(status);
    });

    it("When board is not given, there should be no possible destinations", () => {
      const randomFn = () => 0.1;
      const board = new Board([[]], []);
      const bank = new Bank([], []);
      const player = new Player(2, "john");
      player.setup(1, { x: 0, y: 0 });

      const diceValue = { colorId: 1, number: 1 };

      const mockGame = new Game([player], bank, board, diceValue);
      turnManager = new TurnManager(mockGame, randomFn);

      const actual = turnManager.findPossibleDestinations(1);
      assertEquals(actual.length, 0);
    });

    it("when player is at edge of the board, it should show 2 destination locations for step 1 :", () => {
      const randomFn = () => 0.1;
      const tiles = [
        [0, 1, 2, 3, 4, 0],
        [0, 5, 6, 1, 2, 0],
        [0, 3, 4, 5, 6, 0],
        [0, 1, 2, 3, 4, 0],
        [0, 5, 6, 1, 2, 0],
        [0, 3, 4, 5, 6, 0],
      ];
      const board = new Board(tiles, yarns);
      const bank = new Bank([], []);
      const player1 = new Player(2, "john");
      const player2 = new Player(3, "john");
      const player3 = new Player(4, "john");
      const player4 = new Player(1, "john");
      const player5 = new Player(7, "john");
      player1.setup(1, { x: 0, y: 0 });
      player2.setup(1, { x: 1, y: 3 });
      player3.setup(1, { x: 3, y: 1 });
      player4.setup(1, { x: 3, y: 3 });
      player5.setup(1, { x: 4, y: 3 });

      const diceValue = { colorId: 1, number: 1 };

      const mockGame = new Game(
        [player1, player2, player3, player4, player5],
        bank,
        board,
        diceValue,
      );
      turnManager = new TurnManager(mockGame, randomFn);

      const actual = turnManager.findPossibleDestinations(1);
      assertEquals(actual.length, 2);
    });
    it("when player is at edge of the board, it should show 5 destination locations for 2 steps :", () => {
      const randomFn = () => 0.1;
      const tiles = [
        [0, 1, 2, 3, 4, 0],
        [0, 5, 6, 1, 2, 0],
        [0, 3, 4, 5, 6, 0],
        [0, 1, 2, 3, 4, 0],
        [0, 5, 6, 1, 2, 0],
        [0, 3, 4, 5, 6, 0],
      ];
      const board = new Board(tiles, yarns);
      const bank = new Bank([], []);
      const player1 = new Player(2, "john");
      const player2 = new Player(3, "john");
      const player3 = new Player(4, "john");
      const player4 = new Player(1, "john");
      const player5 = new Player(7, "john");
      player1.setup(1, { x: 0, y: 0 });
      player2.setup(1, { x: 1, y: 3 });
      player3.setup(1, { x: 3, y: 1 });
      player4.setup(1, { x: 3, y: 3 });
      player5.setup(1, { x: 4, y: 3 });

      const diceValue = { colorId: 1, number: 1 };

      const mockGame = new Game(
        [player1, player2, player3, player4, player5],
        bank,
        board,
        diceValue,
      );
      turnManager = new TurnManager(mockGame, randomFn);

      const actual = turnManager.findPossibleDestinations(2);
      assertEquals(actual.length, 6);
    });
    it("when player is blocked ,should show at least one premium destination ", () => {
      const randomFn = () => 0.1;
      const tiles = [
        [0, 1, 4, 3, 4, 0],
        [0, 5, 6, 1, 2, 0],
        [0, 3, 4, 5, 6, 0],
        [0, 1, 2, 3, 4, 0],
        [0, 5, 6, 1, 2, 0],
        [0, 3, 4, 5, 6, 0],
      ];

      const board = new Board(tiles, yarns);
      const bank = new Bank([], []);

      const player1 = new Player(2, "john");
      const player2 = new Player(3, "john");
      const player3 = new Player(4, "john");
      const player4 = new Player(1, "john");
      const player5 = new Player(7, "john");

      player1.setup(1, { x: 0, y: 0 });
      player2.setup(1, { x: 0, y: 1 });
      player3.setup(1, { x: 3, y: 1 });
      player4.setup(1, { x: 3, y: 3 });
      player5.setup(1, { x: 4, y: 3 });

      const diceValue = { colorId: 1, number: 1 };

      const mockGame = new Game(
        [player1, player2, player3, player4, player5],
        bank,
        board,
        diceValue,
      );
      turnManager = new TurnManager(mockGame, randomFn);

      const actual = turnManager.findPossibleDestinations(2);
      assert(actual.some((x) => x.type === "premium"));
      assertEquals(actual.length, 6);
    });
    it("when there are multiple premium routes exist , should choose cheapest route : ", () => {
      const randomFn = () => 0.1;
      const tiles = [
        [0, 1, 5, 6, 4, 0],
        [0, 5, 6, 1, 2, 0],
        [0, 3, 4, 5, 6, 0],
        [0, 1, 2, 3, 4, 0],
        [0, 5, 6, 1, 2, 0],
        [0, 3, 4, 5, 6, 0],
      ];

      const board = new Board(tiles, yarns);
      const bank = new Bank([], []);

      const player1 = new Player(2, "john");
      const player2 = new Player(1, "john");
      const player3 = new Player(3, "john");
      const player4 = new Player(4, "john");
      const player5 = new Player(123, "john");

      player1.setup(1, { x: 0, y: 0 });
      player2.setup(1, { x: 0, y: 1 });
      player3.setup(1, { x: 0, y: 2 });
      player4.setup(1, { x: 1, y: 0 });
      player5.setup(1, { x: 3, y: 3 });

      const diceValue = { colorId: 1, number: 1 };

      const mockGame = new Game(
        [player1, player2, player3, player4, player5],
        bank,
        board,
        diceValue,
      );
      turnManager = new TurnManager(mockGame, randomFn);

      const actual = turnManager.findPossibleDestinations(3);
      const route = actual.find(
        (loc) => loc.destination.x === 1 && loc.destination.y === 2,
      );

      assertEquals(route.path, [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
      ]);
      assertEquals(route.recipients, [4]);
      assertEquals(actual.length, 5);
    });
    it("when there are multiple premium routes exist , should choose cheapest route : ", () => {
      const randomFn = () => 0.1;
      const tiles = [
        [0, 1, 5, 6, 4, 0],
        [0, 5, 6, 1, 2, 0],
        [0, 3, 4, 5, 6, 0],
        [0, 1, 2, 3, 4, 0],
        [0, 5, 6, 1, 2, 0],
        [0, 3, 4, 5, 6, 0],
      ];

      const board = new Board(tiles, yarns);
      const bank = new Bank([], []);

      const player1 = new Player(1, "john");
      const player2 = new Player(2, "john");
      const player3 = new Player(3, "john");
      const player4 = new Player(4, "john");
      const player5 = new Player(123, "john");

      player1.setup(1, { x: 0, y: 0 });
      player2.setup(1, { x: 0, y: 1 });
      player3.setup(1, { x: 1, y: 1 });
      player4.setup(1, { x: 1, y: 0 });
      player5.setup(1, { x: 3, y: 3 });

      const diceValue = { colorId: 1, number: 1 };

      const mockGame = new Game(
        [player1, player2, player3, player4, player5],
        bank,
        board,
        diceValue,
      );
      turnManager = new TurnManager(mockGame, randomFn);
      const actual = turnManager.findPossibleDestinations(3);
      const point = actual.find(
        (loc) => loc.destination.x === 1 && loc.destination.y === 2,
      );
      assertEquals(point.path, [
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: 0, y: 2 },
      ]);
      assertEquals(point.recipients, [2]);
      assertEquals(actual.length, 5);
    });
  });

  describe("token or action card distribution : ", () => {
    let gameState;
    let bank;
    beforeEach(() => {
      const player1 = new Player(1, "Ajoy");
      const player2 = new Player(2, "Dinesh");

      player1.setup(2, { x: 2, y: 2 });
      player2.setup(3, { x: 3, y: 3 });
      const players = [player2, player1];

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
      const actionCards = [{
        "id": 1,
        "type": "move",
        "description": "Move the pin to any unoccupied square.",
      }];

      bank = new Bank([], actionCards, (x) => x);
      const diceValue = { colorId: 1, number: 2 };

      gameState = new Game(players, bank, board, diceValue);

      turnManager = new TurnManager(gameState, () => 0.1);
    });

    it("after rolling dice when color id is other than black, then should distribute the tokens to players based on the positions and yarns surrounded by the players pins", () => {
      turnManager.processColorAction(2, bank);
      const mockGame = gameState.getGameState();

      const actual = mockGame.players.every((player) =>
        player.getTokens() === 1
      );

      const expected = true;
      const reserveTokens = bank.getBank().tokens;

      assertEquals(actual, expected);
      assertEquals(reserveTokens, 53);
    });

    it("when black color dice appeared, then should deduct one action card from the bank and add to current player actionCards store :", () => {
      turnManager.processColorAction(6, bank);
      const mockGame = gameState.getGameState();
      const actual = mockGame.players[0].getAc().length;

      const expected = 1;
      const actionCards = [{
        "id": 1,
        "type": "move",
        "description": "Move the pin to any unoccupied square.",
      }];
      const reserveAvailableTokens = bank.getBank().availableActionCards;
      assertEquals(actual, expected);
      assertEquals(mockGame.players[0].getAc(), actionCards);
      assertEquals(reserveAvailableTokens, 0);
    });

    it("when no players pins are surrounded by colorId, should not distribute tokens to any one", () => {
      turnManager.processColorAction(1, bank);
      const mockGame = gameState.getGameState();
      const actual = mockGame.players.every((player) =>
        player.getTokens() === 0
      );
      const reserveTokens = bank.getBank().tokens;
      assertEquals(actual, true);
      assertEquals(reserveTokens, 55);
    });

    it("when color dice is black and reserve does not have sufficient actionCards, then should not give action card to current player : ", () => {
      bank = new Bank([], []);
      turnManager.processColorAction(6, bank);
      const mockGame = gameState.getGameState();
      const actual = mockGame.players[1].getAc().length;
      assertEquals(actual, 0);
    });

    it("when available tokens in the reserve less than total expense,then should not pay :", () => {
      bank = new Bank([], []);
      bank.deductTokens(55);
      turnManager.processColorAction(3, bank);
      const mockGame = gameState.getGameState();
      const actual = mockGame.players.every((player) =>
        player.getTokens() === 0
      );
      assert(actual);
    });
  });
});
