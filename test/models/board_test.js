import { beforeEach, describe, it } from "@std/testing/bdd";
import Board from "../../src/models/board.js";
import Bank from "../../src/models/bank.js";
import Player from "../../src/models/player.js";
import Game from "../../src/models/game.js";
import { assertEquals } from "@std/assert/equals";
import { assert } from "@std/assert/assert";
import { getPlayerById } from "../../src/utils/util.js";

describe("board test", () => {
  let board, gameState;

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
  let players;
  beforeEach(() => {
    board = new Board(tiles, yarns);
    const bank = new Bank([], []);
    const player = new Player(2, "john");
    player.setup(1, { x: 1, y: 1 });

    const player2 = new Player(123, "john");
    player2.setup(2, { x: 3, y: 3 });

    const diceValue = { colorId: 1, number: 1 };
    players = [player, player2];
    gameState = new Game(players, bank, board, diceValue);
  });

  describe("find possible path : ", () => {
    it("when position, steps given, should return all possible locations", () => {
      const { currentPlayerId } = gameState.getGameState();
      const currentPlayer = getPlayerById(players, currentPlayerId);
      const actual = board.findPossibleDestinations(currentPlayer, players, 1);
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

      const players = [player1, player2, player3, player4, player5, player6];
      const mockGame = new Game(players, bank, board, diceValue);

      const { currentPlayerId } = mockGame.getGameState();
      const currentPlayer = getPlayerById(players, currentPlayerId);

      const actual = board.findPossibleDestinations(currentPlayer, players, 1);
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

      const { currentPlayerId } = gameState.getGameState();
      const currentPlayer = getPlayerById(players, currentPlayerId);

      const actual = board.findPossibleDestinations(currentPlayer, players, 4);
      const status = actual.every(
        ({ type, path }) => type === "jump" || areDistinct(path),
      );
      assert(status);
    });

    it("When board is not given, there should be no possible destinations", () => {
      const board = new Board([[]], []);
      const bank = new Bank([], []);
      const player = new Player(2, "john");
      player.setup(1, { x: 0, y: 0 });

      const diceValue = { colorId: 1, number: 1 };

      const mockGame = new Game([player], bank, board, diceValue);
      const { currentPlayerId } = mockGame.getGameState();
      const currentPlayer = getPlayerById(players, currentPlayerId);

      const actual = board.findPossibleDestinations(currentPlayer, players, 1);
      assertEquals(actual.length, 0);
    });

    it("when player is at edge of the board, it should show 2 destination locations for step 1 :", () => {
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
      const players = [player1, player2, player3, player4, player5];
      const mockGame = new Game(players, bank, board, diceValue);

      const { currentPlayerId } = mockGame.getGameState();
      const currentPlayer = getPlayerById(players, currentPlayerId);
      const actual = board.findPossibleDestinations(currentPlayer, players, 1);
      assertEquals(actual.length, 2);
    });

    it("when player is at edge of the board, it should show 5 destination locations for 2 steps :", () => {
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

      const players = [player1, player2, player3, player4, player5];
      const mockGame = new Game(players, bank, board, diceValue);
      const { currentPlayerId } = mockGame.getGameState();
      const currentPlayer = getPlayerById(players, currentPlayerId);

      const actual = board.findPossibleDestinations(currentPlayer, players, 2);
      assertEquals(actual.length, 6);
    });
    it("when player is blocked ,should show at least one premium destination ", () => {
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

      const players = [player1, player2, player3, player4, player5];
      const mockGame = new Game(players, bank, board, diceValue);

      const { currentPlayerId } = mockGame.getGameState();
      const currentPlayer = getPlayerById(players, currentPlayerId);

      const actual = board.findPossibleDestinations(currentPlayer, players, 2);
      assert(actual.some((x) => x.type === "premium"));
      assertEquals(actual.length, 6);
    });
    it("when there are multiple premium routes exist , should choose cheapest route : ", () => {
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

      const players = [player1, player2, player3, player4, player5];
      const mockGame = new Game(players, bank, board, diceValue);

      const { currentPlayerId } = mockGame.getGameState();
      const currentPlayer = getPlayerById(players, currentPlayerId);

      const actual = board.findPossibleDestinations(currentPlayer, players, 3);
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

      const players = [player1, player2, player3, player4, player5];
      const mockGame = new Game(players, bank, board, diceValue);

      const { currentPlayerId } = mockGame.getGameState();
      const currentPlayer = getPlayerById(players, currentPlayerId);

      const actual = board.findPossibleDestinations(currentPlayer, players, 3);
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
});

describe("matchPattern", () => {
  let board;

  beforeEach(() => {
    const yarns = [
      [2, 1, 1, 1, 1],
      [2, 3, 2, 2, 2],
      [3, 3, 1, 3, 3],
      [4, 4, 4, 3, 1],
      [5, 5, 1, 5, 5],
    ];
    const tiles = [];

    board = new Board(tiles, yarns);
  });

  it("should match a horizontal pattern of same colors", () => {
    const pattern = [
      { coord: { x: 0, y: 0 }, color: 1 },
      { coord: { x: 0, y: 1 }, color: 1 },
      { coord: { x: 0, y: 2 }, color: 1 },
    ];
    const { yarns } = board.getState();

    const result = [
      { x: 0, y: 1 },
      { x: 0, y: 2 },
      { x: 0, y: 3 },
    ];
    const matchingStatus = board.matchPattern(yarns, pattern);

    assertEquals(matchingStatus.isMatched, true);
    assertEquals(matchingStatus.matches, result);
  });

  it("should match pattern after translation", () => {
    const shiftedPattern = [
      { coord: { x: 2, y: 0 }, color: 1 },
      { coord: { x: 2, y: 1 }, color: 2 },
      { coord: { x: 2, y: 2 }, color: 1 },
    ];
    const { yarns } = board.getState();
    const result = [
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 1, y: 2 },
    ];

    const matchingStatus = board.matchPattern(yarns, shiftedPattern);

    assertEquals(matchingStatus.isMatched, true);
    assertEquals(matchingStatus.matches, result);
  });

  it("should allow different pattern colors to map to different yarns", () => {
    const multiColorPattern = [
      { coord: { x: 0, y: 0 }, color: 1 },
      { coord: { x: 0, y: 1 }, color: 2 },
      { coord: { x: 0, y: 2 }, color: 3 },
    ];
    const { yarns } = board.getState();

    const result = [
      { x: 3, y: 2 },
      { x: 3, y: 3 },
      { x: 3, y: 4 },
    ];

    const matchingStatus = board.matchPattern(yarns, multiColorPattern);

    assertEquals(matchingStatus.isMatched, true);
    assertEquals(matchingStatus.matches, result);
  });

  it("should match single-point pattern", () => {
    const singlePointPattern = [{ coord: { x: 0, y: 0 }, color: 1 }];
    const { yarns } = board.getState();
    const result = [{ x: 0, y: 0 }];
    const matchingStatus = board.matchPattern(yarns, singlePointPattern);

    assertEquals(matchingStatus.isMatched, true);
    assertEquals(matchingStatus.matches, result);
  });

  it("should fail when pattern goes out of bounds after translation", () => {
    const largePattern = [
      { coord: { x: 0, y: 0 }, color: 1 },
      { coord: { x: 0, y: 1 }, color: 1 },
      { coord: { x: 0, y: 2 }, color: 1 },
      { coord: { x: 0, y: 3 }, color: 1 },
      { coord: { x: 0, y: 4 }, color: 1 },
      { coord: { x: 0, y: 5 }, color: 1 },
    ];
    const { yarns } = board.getState();
    const matchingStatus = board.matchPattern(yarns, largePattern);

    assertEquals(matchingStatus.isMatched, false);
  });

  it("should match vertical pattern after rotation", () => {
    const verticalPattern = [
      { coord: { x: 0, y: 0 }, color: 1 },
      { coord: { x: 1, y: 0 }, color: 1 },
      { coord: { x: 2, y: 0 }, color: 1 },
    ];
    const { yarns } = board.getState();

    const result = [
      { x: 0, y: 1 },
      { x: 0, y: 2 },
      { x: 0, y: 3 },
    ];
    const matchingStatus = board.matchPattern(yarns, verticalPattern);

    assertEquals(matchingStatus.isMatched, true);
    assertEquals(matchingStatus.matches, result);
  });

  it("should match a pattern that present before the actual design coordinate", () => {
    const pattern = [
      { coord: { x: 4, y: 0 }, color: 1 },
      { coord: { x: 4, y: 1 }, color: 1 },
      { coord: { x: 4, y: 2 }, color: 1 },
      { coord: { x: 4, y: 3 }, color: 1 },
    ];
    const { yarns } = board.getState();

    const result = [
      { x: 0, y: 1 },
      { x: 0, y: 2 },
      { x: 0, y: 3 },
      { x: 0, y: 4 },
    ];
    const matchingStatus = board.matchPattern(yarns, pattern);

    assertEquals(matchingStatus.isMatched, true);
    assertEquals(matchingStatus.matches, result);
  });

  it("complex pattern matches after translation", () => {
    const yarns = [
      [2, 1, 1, 3, 1],
      [2, 2, 3, 1, 2],
      [3, 2, 1, 3, 3],
      [4, 4, 5, 1, 1],
      [4, 5, 1, 5, 5],
    ];

    const board = new Board([], yarns);
    const boardState = board.getState();

    const pattern = [
      { coord: { x: 1, y: 1 }, color: 1 },
      { coord: { x: 1, y: 4 }, color: 2 },
      { coord: { x: 2, y: 2 }, color: 1 },
      { coord: { x: 2, y: 3 }, color: 2 },
      { coord: { x: 3, y: 2 }, color: 3 },
      { coord: { x: 3, y: 3 }, color: 4 },
      { coord: { x: 4, y: 1 }, color: 3 },
      { coord: { x: 4, y: 4 }, color: 4 },
    ];

    const result = [
      { x: 1, y: 0 },
      { x: 1, y: 3 },
      { x: 2, y: 1 },
      { x: 2, y: 2 },
      { x: 3, y: 1 },
      { x: 3, y: 2 },
      { x: 4, y: 0 },
      { x: 4, y: 3 },
    ];
    const matchingStatus = board.matchPattern(boardState.yarns, pattern);

    assertEquals(matchingStatus.isMatched, true);
    assertEquals(matchingStatus.matches, result);
  });

  it("complex pattern matches after rotation", () => {
    const yarns = [
      [2, 1, 3, 3, 1],
      [2, 2, 3, 3, 2],
      [2, 2, 2, 1, 3],
      [2, 4, 5, 3, 1],
      [2, 5, 1, 3, 5],
    ];

    const pattern = [
      { coord: { x: 0, y: 2 }, color: 1 },
      { coord: { x: 1, y: 2 }, color: 1 },
      { coord: { x: 2, y: 2 }, color: 2 },
      { coord: { x: 2, y: 3 }, color: 3 },
      { coord: { x: 2, y: 4 }, color: 3 },
      { coord: { x: 3, y: 2 }, color: 1 },
      { coord: { x: 4, y: 2 }, color: 1 },
    ];

    const board = new Board([], yarns);
    const boardState = board.getState();

    const result = [
      { x: 0, y: 3 },
      { x: 1, y: 3 },
      { x: 2, y: 1 },
      { x: 2, y: 2 },
      { x: 2, y: 3 },
      { x: 3, y: 3 },
      { x: 4, y: 3 },
    ];
    const matchingStatus = board.matchPattern(boardState.yarns, pattern);

    assertEquals(matchingStatus.isMatched, true);
    assertEquals(matchingStatus.matches, result);
  });
});
