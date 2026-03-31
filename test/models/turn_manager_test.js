import { beforeEach, describe, it } from "@std/testing/bdd";
import { assert, assertEquals, assertNotEquals } from "@std/assert";
import TurnManager from "../../src/models/turn_manager.js";

describe("tests for moving pin", () => {
  let turnManager;
  let currentPlayer;
  beforeEach(() => {
    currentPlayer = {
      id: 1,
      tokens: 2,
      pin: { color: 3, position: { x: 1, y: 0 } },
    };

    const mockGame = {
      currentPlayer,
      players: [currentPlayer, { id: 2, tokens: 3 }, { id: 3, tokens: 2 }],

      board: {
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
            { value: null, playerId: 1 },
            { value: 1, playerId: null },
            { value: 2, playerId: 2 },
            { value: 3, playerId: null },
            { value: 4, playerId: 3 },
            { value: null, playerId: null },
          ],
          [
            { value: null, playerId: null },
            { value: 5, playerId: null },
            { value: 6, playerId: null },
            { value: 1, playerId: null },
            { value: 2, playerId: null },
            { value: null, playerId: null },
          ],
          [
            { value: null, playerId: null },
            { value: 3, playerId: null },
            { value: 4, playerId: null },
            { value: 5, playerId: null },
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

    turnManager = new TurnManager(mockGame);
  });

  describe("test for Destination: ", () => {
    beforeEach(() => {
      turnManager.destinations = [
        { x: 1, y: 3 },
        { x: 2, y: 4 },
      ];
    });

    it("Invalid destination, so position won't be changed", () => {
      const path = [
        { x: 1, y: 0 },
        { x: 1, y: 1 },
      ];

      const destination = { x: 2, y: 0 };

      const newPosition = turnManager.move(path, destination);
      assertNotEquals(newPosition, destination);
    });

    it("Valid destination, so position should be changed to destination", () => {
      const path = [
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 2, y: 1 },
        { x: 2, y: 2 },
        { x: 2, y: 3 },
      ];

      const destination = { x: 2, y: 4 };

      const newPosition = turnManager.move(path, destination);
      assertEquals(newPosition, destination);
    });
  });

  describe("When current player is taking a path through occupied tile, they have to pay: ", () => {
    it("should pay to one player", () => {
      turnManager["destinations"] = [{ x: 1, y: 3 }];

      const path = [
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 1, y: 2 },
      ];

      const destination = { x: 1, y: 3 };

      const newPosition = turnManager.move(path, destination);
      assertEquals(destination.x, newPosition.x);
      assertEquals(destination.y, newPosition.y);
      assertEquals(currentPlayer.tokens, 1);
    });

    it("should pay to tow players", () => {
      turnManager.destinations = [{ x: 1, y: 5 }];

      const path = [
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 1, y: 2 },
        { x: 1, y: 3 },
        { x: 1, y: 4 },
      ];

      const destination = { x: 1, y: 5 };

      const newPosition = turnManager.move(path, destination);
      assertEquals(destination.x, newPosition.x);
      assertEquals(destination.y, newPosition.y);
      assertEquals(currentPlayer.tokens, 0);
    });

    it("should not pay to another player", () => {
      turnManager.destinations = [{ x: 1, y: 3 }];

      const path = [
        { x: 1, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: 0, y: 2 },
        { x: 0, y: 3 },
      ];

      const destination = { x: 1, y: 3 };

      const newPosition = turnManager.move(path, destination);
      assertEquals(destination.x, newPosition.x);
      assertEquals(destination.y, newPosition.y);
      assertEquals(currentPlayer.tokens, 2);
    });
  });
});

describe("current user turn :", () => {
  let turnManager;

  beforeEach(() => {
    const randomFn = () => 0.9;
    const board = {
      yarns: [
        [1, 1, 1, 1, 1],
        [2, 2, 2, 2, 2],
        [3, 3, 3, 3, 3],
        [4, 4, 4, 4, 4],
        [5, 5, 5, 5, 5],
      ],
      tiles: [
        [
          { value: 0, playerId: null },
          { value: 1, playerId: null },
          { value: 2, playerId: null },
          { value: 3, playerId: null },
          { value: 4, playerId: null },
          { value: 0, playerId: null },
        ],
        [
          { value: 0, playerId: null },
          { value: 5, playerId: null },
          { value: 6, playerId: null },
          { value: 1, playerId: null },
          { value: 2, playerId: null },
          { value: 0, playerId: null },
        ],
        [
          { value: 0, playerId: null },
          { value: 3, playerId: null },
          { value: 4, playerId: null },
          { value: 5, playerId: null },
          { value: 6, playerId: null },
          { value: 0, playerId: null },
        ],
        [
          { value: 0, playerId: null },
          { value: 1, playerId: null },
          { value: 2, playerId: null },
          { value: 3, playerId: 123 },
          { value: 4, playerId: null },
          { value: 0, playerId: null },
        ],
        [
          { value: 0, playerId: null },
          { value: 5, playerId: null },
          { value: 6, playerId: null },
          { value: 1, playerId: null },
          { value: 2, playerId: null },
          { value: 0, playerId: null },
        ],
        [
          { value: 0, playerId: null },
          { value: 3, playerId: null },
          { value: 4, playerId: null },
          { value: 5, playerId: null },
          { value: 6, playerId: null },
          { value: 0, playerId: null },
        ],
      ],
    };

    turnManager = new TurnManager(
      { currentPlayer: { pin: { position: { x: 1, y: 1 } } }, board },
      randomFn,
    );
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
        { x: 1, y: 2, type: "normal", path: [{ x: 1, y: 1 }] },
        { x: 2, y: 1, type: "normal", path: [{ x: 1, y: 1 }] },
        { x: 1, y: 0, type: "normal", path: [{ x: 1, y: 1 }] },
        { x: 0, y: 1, type: "jump" },
        { x: 1, y: 3, type: "jump" },
        { x: 3, y: 1, type: "jump" },
        { x: 4, y: 3, type: "jump" },
      ];
      assertEquals(actual, expected);
    });

    it("when all number tiles are occupied then, should not show the type jump", () => {
      const board = {
        yarns: [
          [1, 1, 1, 1, 1],
          [2, 2, 2, 2, 2],
          [3, 3, 3, 3, 3],
          [4, 4, 4, 4, 4],
          [5, 5, 5, 5, 5],
        ],
        tiles: [
          [
            { value: 0, playerId: null },
            { value: 1, playerId: 2 },
            { value: 2, playerId: null },
            { value: 3, playerId: null },
            { value: 4, playerId: null },
            { value: 0, playerId: null },
          ],
          [
            { value: 0, playerId: null },
            { value: 5, playerId: null },
            { value: 6, playerId: null },
            { value: 1, playerId: 4 },
            { value: 2, playerId: null },
            { value: 0, playerId: null },
          ],
          [
            { value: 0, playerId: null },
            { value: 3, playerId: null },
            { value: 4, playerId: null },
            { value: 5, playerId: null },
            { value: 6, playerId: null },
            { value: 0, playerId: null },
          ],
          [
            { value: 0, playerId: null },
            { value: 1, playerId: 3 },
            { value: 2, playerId: null },
            { value: 3, playerId: 123 },
            { value: 4, playerId: null },
            { value: 0, playerId: null },
          ],
          [
            { value: 0, playerId: null },
            { value: 5, playerId: null },
            { value: 6, playerId: null },
            { value: 1, playerId: 2 },
            { value: 2, playerId: null },
            { value: 0, playerId: null },
          ],
          [
            { value: 0, playerId: null },
            { value: 3, playerId: null },
            { value: 4, playerId: null },
            { value: 5, playerId: null },
            { value: 6, playerId: null },
            { value: 0, playerId: null },
          ],
        ],
      };
      turnManager = new TurnManager(
        { currentPlayer: { pin: { position: { x: 1, y: 1 } } }, board },
        () => 0.1,
      );
      const actual = turnManager.findPossibleDestinations(1);
      const expected = [
        { x: 1, y: 2, type: "normal", path: [{ x: 1, y: 1 }] },
        { x: 2, y: 1, type: "normal", path: [{ x: 1, y: 1 }] },
        { x: 1, y: 0, type: "normal", path: [{ x: 1, y: 1 }] },
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
      turnManager = new TurnManager(
        {
          currentPlayer: { pin: { position: { x: 1, y: 1 } } },
          board: { tiles: [[]] },
        },
        () => 0.1,
      );
      const actual = turnManager.findPossibleDestinations(1);
      assertEquals(actual.length, 0);
    });

    it("when player is at edge of the board, it should show 2 destination locations for step 1 :", () => {
      const board = {
        yarns: [
          [1, 1, 1, 1, 1],
          [2, 2, 2, 2, 2],
          [3, 3, 3, 3, 3],
          [4, 4, 4, 4, 4],
          [5, 5, 5, 5, 5],
        ],
        tiles: [
          [
            { value: 0, playerId: 1 },
            { value: 1, playerId: null },
            { value: 2, playerId: null },
            { value: 3, playerId: null },
            { value: 4, playerId: null },
            { value: 0, playerId: null },
          ],
          [
            { value: 0, playerId: null },
            { value: 5, playerId: null },
            { value: 6, playerId: null },
            { value: 1, playerId: 4 },
            { value: 2, playerId: null },
            { value: 0, playerId: null },
          ],
          [
            { value: 0, playerId: null },
            { value: 3, playerId: null },
            { value: 4, playerId: null },
            { value: 5, playerId: null },
            { value: 6, playerId: null },
            { value: 0, playerId: null },
          ],
          [
            { value: 0, playerId: null },
            { value: 1, playerId: 3 },
            { value: 2, playerId: null },
            { value: 3, playerId: 123 },
            { value: 4, playerId: null },
            { value: 0, playerId: null },
          ],
          [
            { value: 0, playerId: null },
            { value: 5, playerId: null },
            { value: 6, playerId: null },
            { value: 1, playerId: 4 },
            { value: 2, playerId: null },
            { value: 0, playerId: null },
          ],
          [
            { value: 0, playerId: null },
            { value: 3, playerId: null },
            { value: 4, playerId: null },
            { value: 5, playerId: null },
            { value: 6, playerId: null },
            { value: 0, playerId: null },
          ],
        ],
      };
      turnManager = new TurnManager(
        { currentPlayer: { pin: { position: { x: 0, y: 0 } } }, board },
        () => 0.1,
      );
      const actual = turnManager.findPossibleDestinations(1);
      assertEquals(actual.length, 2);
    });
    it("when player is at edge of the board, it should show 5 destination locations for 2 steps :", () => {
      const board = {
        yarns: [
          [1, 1, 1, 1, 1],
          [2, 2, 2, 2, 2],
          [3, 3, 3, 3, 3],
          [4, 4, 4, 4, 4],
          [5, 5, 5, 5, 5],
        ],
        tiles: [
          [
            { value: 0, playerId: 1 },
            { value: 1, playerId: null },
            { value: 2, playerId: null },
            { value: 3, playerId: null },
            { value: 4, playerId: null },
            { value: 0, playerId: null },
          ],
          [
            { value: 0, playerId: null },
            { value: 5, playerId: null },
            { value: 6, playerId: null },
            { value: 1, playerId: 4 },
            { value: 2, playerId: null },
            { value: 0, playerId: null },
          ],
          [
            { value: 0, playerId: null },
            { value: 3, playerId: null },
            { value: 4, playerId: null },
            { value: 5, playerId: null },
            { value: 6, playerId: null },
            { value: 0, playerId: null },
          ],
          [
            { value: 0, playerId: null },
            { value: 1, playerId: 3 },
            { value: 2, playerId: null },
            { value: 3, playerId: 123 },
            { value: 4, playerId: null },
            { value: 0, playerId: null },
          ],
          [
            { value: 0, playerId: null },
            { value: 5, playerId: null },
            { value: 6, playerId: null },
            { value: 1, playerId: 4 },
            { value: 2, playerId: null },
            { value: 0, playerId: null },
          ],
          [
            { value: 0, playerId: null },
            { value: 3, playerId: null },
            { value: 4, playerId: null },
            { value: 5, playerId: null },
            { value: 6, playerId: null },
            { value: 0, playerId: null },
          ],
        ],
      };
      turnManager = new TurnManager(
        { currentPlayer: { pin: { position: { x: 0, y: 0 } } }, board },
        () => 0.1,
      );
      const actual = turnManager.findPossibleDestinations(2);
      assertEquals(actual.length, 6);
    });
    it("when player is blocked ,should show at least one premium destination ", () => {
      const board = {
        yarns: [
          [1, 1, 1, 1, 1],
          [2, 2, 2, 2, 2],
          [3, 3, 3, 3, 3],
          [4, 4, 4, 4, 4],
          [5, 5, 5, 5, 5],
        ],
        tiles: [
          [
            { value: 0, playerId: 1 },
            { value: 1, playerId: 2 },
            { value: 5, playerId: null },
            { value: 3, playerId: null },
            { value: 4, playerId: null },
            { value: 0, playerId: null },
          ],
          [
            { value: 0, playerId: null },
            { value: 5, playerId: null },
            { value: 6, playerId: null },
            { value: 1, playerId: 4 },
            { value: 2, playerId: null },
            { value: 0, playerId: null },
          ],
          [
            { value: 0, playerId: null },
            { value: 3, playerId: null },
            { value: 4, playerId: null },
            { value: 5, playerId: null },
            { value: 6, playerId: null },
            { value: 0, playerId: null },
          ],
          [
            { value: 0, playerId: null },
            { value: 1, playerId: 3 },
            { value: 2, playerId: null },
            { value: 3, playerId: 123 },
            { value: 4, playerId: null },
            { value: 0, playerId: null },
          ],
          [
            { value: 0, playerId: null },
            { value: 5, playerId: null },
            { value: 6, playerId: null },
            { value: 1, playerId: 4 },
            { value: 2, playerId: null },
            { value: 0, playerId: null },
          ],
          [
            { value: 0, playerId: null },
            { value: 3, playerId: null },
            { value: 4, playerId: null },
            { value: 5, playerId: null },
            { value: 6, playerId: null },
            { value: 0, playerId: null },
          ],
        ],
      };
      turnManager = new TurnManager(
        { currentPlayer: { pin: { position: { x: 0, y: 0 } } }, board },
        () => 0.1,
      );
      const actual = turnManager.findPossibleDestinations(2);
      assertEquals(actual[0].type, "premium");
      assertEquals(actual.length, 6);
    });
    it("when there are multiple premium routes exist , should choose cheapest route : ", () => {
      const board = {
        yarns: [
          [1, 1, 1, 1, 1],
          [2, 2, 2, 2, 2],
          [3, 3, 3, 3, 3],
          [4, 4, 4, 4, 4],
          [5, 5, 5, 5, 5],
        ],
        tiles: [
          [
            { value: 0, playerId: 1 },
            { value: 1, playerId: 2 },
            { value: 5, playerId: 3 },
            { value: 6, playerId: null },
            { value: 4, playerId: null },
            { value: 0, playerId: null },
          ],
          [
            { value: 0, playerId: 4 },
            { value: 5, playerId: null },
            { value: 6, playerId: null },
            { value: 1, playerId: null },
            { value: 2, playerId: null },
            { value: 0, playerId: null },
          ],
          [
            { value: 0, playerId: null },
            { value: 3, playerId: null },
            { value: 4, playerId: null },
            { value: 5, playerId: null },
            { value: 6, playerId: null },
            { value: 0, playerId: null },
          ],
          [
            { value: 0, playerId: null },
            { value: 1, playerId: null },
            { value: 2, playerId: null },
            { value: 3, playerId: 123 },
            { value: 4, playerId: null },
            { value: 0, playerId: null },
          ],
          [
            { value: 0, playerId: null },
            { value: 5, playerId: null },
            { value: 6, playerId: null },
            { value: 1, playerId: null },
            { value: 2, playerId: null },
            { value: 0, playerId: null },
          ],
          [
            { value: 0, playerId: null },
            { value: 3, playerId: null },
            { value: 4, playerId: null },
            { value: 5, playerId: null },
            { value: 6, playerId: null },
            { value: 0, playerId: null },
          ],
        ],
      };
      turnManager = new TurnManager(
        { currentPlayer: { pin: { position: { x: 0, y: 0 } } }, board },
        () => 0.1,
      );
      const actual = turnManager.findPossibleDestinations(3);
      const point = actual.find((loc) => loc.x === 1 && loc.y === 2);
      assertEquals(point.path, [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
      ]);
      assertEquals(point.recipients, [4]);
      assertEquals(actual.length, 5);
    });
    it("when there are multiple premium routes exist , should choose cheapest route : ", () => {
      const board = {
        yarns: [
          [1, 1, 1, 1, 1],
          [2, 2, 2, 2, 2],
          [3, 3, 3, 3, 3],
          [4, 4, 4, 4, 4],
          [5, 5, 5, 5, 5],
        ],
        tiles: [
          [
            { value: 0, playerId: 1 },
            { value: 1, playerId: 2 },
            { value: 5, playerId: null },
            { value: 6, playerId: null },
            { value: 4, playerId: null },
            { value: 0, playerId: null },
          ],
          [
            { value: 0, playerId: 4 },
            { value: 5, playerId: 3 },
            { value: 6, playerId: null },
            { value: 1, playerId: null },
            { value: 2, playerId: null },
            { value: 0, playerId: null },
          ],
          [
            { value: 0, playerId: null },
            { value: 3, playerId: null },
            { value: 4, playerId: null },
            { value: 5, playerId: null },
            { value: 6, playerId: null },
            { value: 0, playerId: null },
          ],
          [
            { value: 0, playerId: null },
            { value: 1, playerId: null },
            { value: 2, playerId: null },
            { value: 3, playerId: 123 },
            { value: 4, playerId: null },
            { value: 0, playerId: null },
          ],
          [
            { value: 0, playerId: null },
            { value: 5, playerId: null },
            { value: 6, playerId: null },
            { value: 1, playerId: null },
            { value: 2, playerId: null },
            { value: 0, playerId: null },
          ],
          [
            { value: 0, playerId: null },
            { value: 3, playerId: null },
            { value: 4, playerId: null },
            { value: 5, playerId: null },
            { value: 6, playerId: null },
            { value: 0, playerId: null },
          ],
        ],
      };
      turnManager = new TurnManager(
        { currentPlayer: { pin: { position: { x: 0, y: 0 } } }, board },
        () => 0.1,
      );
      const actual = turnManager.findPossibleDestinations(3);
      const point = actual.find((loc) => loc.x === 1 && loc.y === 2);
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
