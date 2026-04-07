import { beforeEach, describe, it } from "@std/testing/bdd";
import { assertEquals, assertThrows } from "@std/assert";
import GameSetup from "../../src/models/game_setup.js";
import Board from "../../src/models/board.js";
import Player from "../../src/models/player.js";
import Bank from "../../src/models/bank.js";
import Game from "../../src/models/game.js";

describe("game setup", () => {
  let gameSetup, players, bank, board, rolledValues, player1, player2;

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
    player1 = new Player(1, "Ajoy");
    player2 = new Player(2, "Dinesh");

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

    players = [player1, player2];
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

  describe("move", () => {
    it("the player has to move to given destination and current player index has to increment", () => {
      const _destinations = gameSetup.upkeep();
      const movedTo = gameSetup.move({ destination: { x: 2, y: 3 } });

      assertEquals(movedTo, {
        adjYarns: [],
        moveResult: { source: {}, destination: { x: 2, y: 3 } },
      });
    });

    it("the player shouldn't move to given destination when destination is not valid", () => {
      const _destinations = gameSetup.upkeep();
      const error = assertThrows(() =>
        gameSetup.move({ destination: { x: 3, y: 3 } })
      );
      assertEquals(error.message, "not a valid move");
    });
  });

  describe("Distribute initial assets", () => {
    it(
      "every player has to get one design card and action card, and 2 tokens",
      () => {
        const result = {
          tokens: 51,
          availableDesignCards: 0,
          availableActionCards: 3,
          yarns: [1, 2, 3, 4, 5],
          tiles: [1, 6],
        };

        gameSetup.distributeInitialAssets();

        assertEquals(player1.getTokens(), 2);
        assertEquals(player2.getTokens(), 2);
        assertEquals(bank.getBank(), result);
      },
    );
  });

  describe("next", () => {
    it(
      "once every one has rolled, players has to be sorted and initial distribution has to take place",
      () => {
        rolledValues = [{ "1": 3 }, { "2": 2 }];
        gameSetup = new GameSetup(players, bank, board, rolledValues);
        const result = {
          tokens: 51,
          availableDesignCards: 0,
          availableActionCards: 3,
          yarns: [1, 2, 3, 4, 5],
          tiles: [1, 6],
        };

        const game = gameSetup.next();

        assertEquals(game instanceof Game, true);
        assertEquals(player1.getTokens(), 2);
        assertEquals(player2.getTokens(), 2);
        assertEquals(gameSetup.getPlayers(), [player2, player1]);
        assertEquals(bank.getBank(), result);
      },
    );

    it(
      "the current player has to be incremented if every one has not rolled",
      () => {
        gameSetup = new GameSetup(players, bank, board);
        const result = {
          tokens: 55,
          availableDesignCards: 2,
          availableActionCards: 3,
          yarns: [1, 2, 3, 4, 5],
          tiles: [1, 6],
        };

        const game = gameSetup.next();

        assertEquals(game instanceof GameSetup, true);
        assertEquals(player1.getTokens(), 0);
        assertEquals(player2.getTokens(), 0);
        assertEquals(gameSetup.getPlayers(), [player1, player2]);
        assertEquals(bank.getBank(), result);
      },
    );
  });
});
