import { beforeEach, describe, it } from "@std/testing/bdd";
import { assert, assertEquals } from "@std/assert";
import { createApp } from "../../src/app.js";
import { logger } from "hono/logger";
import designCards from "../../src/config/design_card.json" with {
  type: "json",
};
import actionCards from "../../src/config/action_card.json" with {
  type: "json",
};

const players = [
  {
    name: "Sandip",
    id: 1,
    tokens: 0,
    victoryPoint: 0,
    actionCards: [],
    designCards: [],
    pin: { color: 1, position: { x: 3, y: 4 } },
  },
  {
    name: "Ajoy",
    id: 2,
    tokens: 0,
    victoryPoint: 0,
    actionCards: [],
    designCards: [],
    pin: { color: 2, position: { x: 2, y: 1 } },
  },
];

const gameState = {
  players,
  currentPlayer: 1,
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
        { value: 1, playerId: 1 },
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
        { value: 5, playerId: 4 },
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

const bank = {
  tokens: 55,
  availableDesignCards: designCards,
  availableActionCards: actionCards,
  yarns: [1, 2, 3, 4, 5],
  tiles: [
    { value: 1, playerId: null },
    { value: 6, playerId: null },
  ],
};

describe("move request: ", () => {
  let app;

  const randomValue = 0.05;

  beforeEach(() => {
    const mockBank = structuredClone(bank);
    const mockGameState = structuredClone(gameState);
    app = createApp(mockGameState, mockBank, () => randomValue, logger);
  });

  it("When player moves, should response with adjYarns, source and destination positons of pin", async () => {
    await app.request("/game/roll", { method: "POST" });
    const destination = { destination: { x: 2, y: 3 }, type: "jump" };

    const response = await app.request("/game/move", {
      method: "POST",
      body: JSON.stringify(destination),
      headers: { "content-type": "application/json" },
    });

    const data = await response.json();

    assertEquals(response.status, 200);
    assertEquals(data.adjYarns, [
      { x: 1, y: 2 },
      { x: 1, y: 3 },
      { x: 2, y: 2 },
      { x: 2, y: 3 },
    ]);

    assertEquals(data.positions, {
      source: { x: 3, y: 4 },
      destination: { x: 2, y: 3 },
    });
  });
});

describe("roll dice request : ", () => {
  let app;

  let randomValue = 0.05;

  beforeEach(() => {
    app = createApp(gameState, bank, () => randomValue, logger);
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
