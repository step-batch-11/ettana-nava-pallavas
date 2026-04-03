import { beforeEach, describe, it } from "@std/testing/bdd";
import { assert, assertEquals } from "@std/assert";
import { createApp } from "../../src/app.js";
import designCards from "../../src/config/design_card.json" with {
  type: "json",
};
import actionCards from "../../src/config/action_card.json" with {
  type: "json",
};
import Bank from "../../src/models/bank.js";
import Player from "../../src/models/player.js";
import Board from "../../src/models/board.js";
import Game from "../../src/models/game.js";
// import TurnManager from "../../src/models/turn_manager.js";

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
    const turnManager = new TurnManager(gameState, () => randomValue);
    app = createApp(gameState, turnManager);
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

describe.ignore("Swap Yarns: ", () => {
  let app;
  const randomFn = (_) => 0.5;

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

    const turnManager = new TurnManager(mockGameState, randomFn);
    app = createApp(mockGameState, turnManager);
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

describe.ignore("roll dice request : ", () => {
  let app;
  let bank;
  let randomValue = 0.05;

  beforeEach(() => {
    bank = new Bank([], [], () => randomValue);

    const player1 = new Player(1, "Sandeep");
    const player2 = new Player(2, "Ajoy");
    const player3 = new Player(3, "");
    const player4 = new Player(4, "");

    player1.setup(2, { x: 1, y: 1 });
    player2.setup(2, { x: 2, y: 2 });
    player3.setup(1, { x: 3, y: 3 });
    player4.setup(2, { x: 4, y: 4 });

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
    const turnManager = new TurnManager(gameState, () => randomValue);
    app = createApp(gameState, turnManager);
  });

  it("When /roll is hit, should respond with dice values of(1, 1) and destinations", async () => {
    const response = await app.request("/game/roll", { method: "POST" });
    const data = await response.json();

    assertEquals(response.status, 200);
    assert("destinations" in data);
    assert("diceValues" in data);
    assertEquals(data.diceValues.number, 1);
    assertEquals(data.diceValues.colorId, 1);
    assertEquals(data.destinations, [
      {
        destination: { x: 3, y: 5 },
        type: "normal",
        path: [{ x: 3, y: 4 }],
      },
      {
        destination: { x: 2, y: 4 },
        type: "normal",
        path: [{ x: 3, y: 4 }],
      },
      { destination: { x: 2, y: 3 }, type: "jump" },
    ]);
  });

  it("When /roll is hit, should respond with dice values of (4, 4) and destinations", async () => {
    randomValue = 0.5;
    const response = await app.request("/game/roll", { method: "POST" });
    const data = await response.json();

    assertEquals(response.status, 200);
    assert("destinations" in data);
    assert("diceValues" in data);
    assertEquals(data.diceValues.number, 4);
    assertEquals(data.diceValues.colorId, 4);
    assertEquals(data.destinations, [
      {
        destination: { x: 5, y: 4 },
        type: "normal",
        path: [
          { x: 3, y: 4 },
          { x: 3, y: 5 },
          { x: 4, y: 5 },
          { x: 5, y: 5 },
        ],
      },
      { destination: { x: 4, y: 3 }, type: "jump" },
      {
        destination: { x: 2, y: 3 },
        type: "normal",
        path: [
          { x: 3, y: 4 },
          { x: 3, y: 5 },
          { x: 2, y: 5 },
          { x: 2, y: 4 },
        ],
      },
      { destination: { x: 1, y: 4 }, type: "jump" },
      {
        destination: { x: 0, y: 5 },
        type: "normal",
        path: [
          { x: 3, y: 4 },
          { x: 3, y: 5 },
          { x: 2, y: 5 },
          { x: 1, y: 5 },
        ],
      },
      {
        destination: { x: 2, y: 5 },
        type: "normal",
        path: [
          { x: 3, y: 4 },
          { x: 2, y: 4 },
          { x: 1, y: 4 },
          { x: 1, y: 5 },
        ],
      },
      {
        destination: { x: 4, y: 5 },
        type: "normal",
        path: [
          { x: 3, y: 4 },
          { x: 2, y: 4 },
          { x: 2, y: 5 },
          { x: 3, y: 5 },
        ],
      },
      {
        destination: { x: 5, y: 2 },
        type: "premium",
        path: [
          { x: 3, y: 4 },
          { x: 3, y: 3 },
          { x: 3, y: 2 },
          { x: 4, y: 2 },
        ],
        recipients: [3],
      },
      {
        destination: { x: 4, y: 1 },
        type: "premium",
        path: [
          { x: 3, y: 4 },
          { x: 3, y: 3 },
          { x: 3, y: 2 },
          { x: 3, y: 1 },
        ],
        recipients: [3],
      },
      { destination: { x: 3, y: 2 }, type: "jump" },
      {
        destination: { x: 3, y: 0 },
        type: "premium",
        path: [
          { x: 3, y: 4 },
          { x: 3, y: 3 },
          { x: 3, y: 2 },
          { x: 3, y: 1 },
        ],
        recipients: [3],
      },
      {
        destination: { x: 2, y: 1 },
        type: "premium",
        path: [
          { x: 3, y: 4 },
          { x: 2, y: 4 },
          { x: 2, y: 3 },
          { x: 2, y: 2 },
        ],
        recipients: [2],
      },
      {
        destination: { x: 1, y: 2 },
        type: "normal",
        path: [
          { x: 3, y: 4 },
          { x: 2, y: 4 },
          { x: 2, y: 3 },
          { x: 1, y: 3 },
        ],
      },
      {
        destination: { x: 0, y: 3 },
        type: "normal",
        path: [
          { x: 3, y: 4 },
          { x: 2, y: 4 },
          { x: 2, y: 3 },
          { x: 1, y: 3 },
        ],
      },
    ]);
  });
});
