import { beforeEach, describe, it } from "@std/testing/bdd";
import { assert, assertEquals, assertNotEquals } from "@std/assert";
import { TurnManager } from "../../src/models/turn_manager.js";

const getCoords = ({ x, y }) => ({ x, y });

describe("tests for moving pin", () => {
  let turnManager;
  const currentPlayer = {
    id: 1,
    tokens: 5,
    pin: { color: 3, position: { x: 1, y: 0 } },
  };
  beforeEach(() => {
    const mockGame = {
      currentPlayer: 1,
      players: [
        currentPlayer,
        { id: 2, tokens: 3, pin: { color: 2, position: { x: 1, y: 2 } } },
        { id: 3, tokens: 2, pin: { color: 1, position: { x: 1, y: 4 } } },
      ],

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
        { destination: { x: 2, y: 4 }, path: [], type: "normal" },
        { destination: { x: 1, y: 0 }, path: [], type: "normal" },
      ];
    });

    it("Invalid destination, so position won't be changed", () => {
      const path = [
        { x: 1, y: 0 },
        { x: 1, y: 1 },
      ];

      const route = { destination: { x: 2, y: 0 }, path, type: "normal" };

      const positions = turnManager.move(route);
      assertNotEquals(positions.destination, getCoords(route.destination));
    });

    it("Valid destination, so position should be changed to destination", () => {
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

  describe("When current player is taking a path through occupied tile, they have to pay: ", () => {
    it("should pay to one player", () => {
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
      assertEquals(currentPlayer.tokens, 4);
    });

    it("should pay to two players", () => {
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
      assertEquals(currentPlayer.tokens, 2);
    });

    it("should not pay to another player", () => {
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
      {
        currentPlayer: 2,
        players: [{ id: 2, pin: { position: { x: 1, y: 1 } } }],
        board,
      },
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
        {
          currentPlayer: 2,
          players: [{ id: 2, pin: { position: { x: 1, y: 1 } } }],
          board,
        },
        () => 0.1,
      );
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
      turnManager = new TurnManager(
        {
          currentPlayer: 2,
          players: [{ id: 2, pin: { position: { x: 0, y: 0 } } }],
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
        {
          currentPlayer: 2,
          players: [{ id: 2, pin: { position: { x: 0, y: 0 } } }],
          board,
        },
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
        {
          currentPlayer: 2,
          players: [{ id: 2, pin: { position: { x: 0, y: 0 } } }],
          board,
        },
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
        {
          currentPlayer: 2,
          players: [{ id: 2, pin: { position: { x: 0, y: 0 } } }],
          board,
        },
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
        {
          currentPlayer: 2,
          players: [{ id: 2, pin: { position: { x: 0, y: 0 } } }],
          board,
        },
        () => 0.1,
      );
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
        {
          currentPlayer: 2,
          players: [{ id: 2, pin: { position: { x: 0, y: 0 } } }],
          board,
        },
        () => 0.1,
      );
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
});
