import { beforeEach, describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
import GameSetup from "../../src/models/game_setup.js";
import Board from "../../src/models/board.js";
import Player from "../../src/models/player.js";
import Bank from "../../src/models/bank.js";

describe("game setup", () => {
  let gameSetup, players, bank, board, rolledValues;
  const randomFn = () => 0;

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
      "id": 4,
      "type": "get tokens",
      "description": "Get 3 tokens from the reserve.",
    }, {
      "id": 2,
      "type": "move",
      "description": "Move the pin to any unoccupied square.",
    }];

    players = [new Player(1, "Ajoy"), new Player(2, "Dinesh")];
    board = new Board(tiles, yarns);
    bank = new Bank(designCards, actionCards, (x) => x, randomFn);
    gameSetup = new GameSetup(players, bank, board, rolledValues, randomFn);
  });

  describe("roll-dice", () => {
    it("should return an object with number and default colorId(6)", () => {
      const rolledValue = gameSetup.rollDice();
      assertEquals(rolledValue, { number: 1, colorId: 6 });
    });
  });

  describe("upkeep", () => {
    it("should return an object with positions and gameState", () => {
      const expectedDestinations = [
        { destination: { x: 1, y: 1 }, type: "jump" },
        { destination: { x: 2, y: 3 }, type: "jump" },
      ];
      const expectedState = {
        players: players.map((position) => position.getPlayerData()),
        bank: bank.getBank(),
        board: board.getState(),
        currentPlayerId: 1,
        diceValues: { number: 1, colorId: 6 },
        deck: {
          actionCards: [],
          designCards: [],
        },
      };

      const { destinations, state } = gameSetup.upkeep();
      assertEquals(destinations, expectedDestinations);
      assertEquals(state, expectedState);
      assertEquals(gameSetup.getRolledValues(), [{ "1": 1 }]);
    });

    it("should return an object with positions and gameState", () => {
      gameSetup = new GameSetup(players, bank, board, [], () => 0.9);

      const expectedDestinations = [
        { destination: { x: 2, y: 1 }, type: "jump" },
        { destination: { x: 3, y: 3 }, type: "jump" },
        { destination: { x: 4, y: 4 }, type: "jump" },
      ];
      const expectedState = {
        players: players.map((position) => position.getPlayerData()),
        bank: bank.getBank(),
        board: board.getState(),
        currentPlayerId: 1,
        diceValues: { number: 5, colorId: 6 },
        deck: {
          actionCards: [],
          designCards: [],
        },
      };

      const { destinations, state } = gameSetup.upkeep();
      assertEquals(state, expectedState);
      assertEquals(destinations, expectedDestinations);
      assertEquals(gameSetup.getRolledValues(), [{ "1": 5 }]);
    });
  });

  describe("Distribute initial assets", () => {
    it(
      "when game starts, then should update bank state after initial token and card distribution",
      () => {
        const result = {
          tokens: 51,
          availableDesignCards: 0,
          availableActionCards: 3,
          yarns: [1, 2, 3, 4, 5],
          tiles: [1, 6],
        };

        gameSetup.distributeInitialAssets();

        assertEquals(bank.getBank(), result);
      },
    );
  });
});
