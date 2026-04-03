import { beforeAll, beforeEach, describe, it } from "@std/testing/bdd";
import {
  assert,
  assertEquals,
  assertNotEquals,
  assertThrows,
} from "@std/assert";
import Game from "../../src/models/game.js";
import Bank from "../../src/models/bank.js";
import Board from "../../src/models/board.js";
import Player from "../../src/models/player.js";
const getCoords = ({ x, y }) => ({ x, y });
import { diceValue } from "../../src/data/state.js";

describe("Game controller test", () => {
  let game, players, bank;

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
    bank = new Bank(designCards, actionCards, (x) => x, () => 0.1);
    game = new Game(
      players,
      bank,
      new Board(tiles, yarns),
      diceValue,
    );
  });

  describe("Buy Design Card", () => {
    it("Player can buy successfully design card", () => {
      players[0].creditTokens(3);
      const card = game.buyDesignCard();
      assertEquals(card, {
        "id": 1,
        "victoryPoints": 1,
        "design": [
          { coord: { x: 0, y: 0 }, color: 1 },
          { coord: { x: 0, y: 1 }, color: 1 },
          { coord: { x: 0, y: 2 }, color: 1 },
        ],
      });
      assertEquals(bank.getBank().tokens, 58);
      assertEquals(players[0].getTokens(), 0);
    });

    it("Player cannot buy design card due to insuffiecient tokens", () => {
      const card = game.buyDesignCard();
      assertEquals(card, "NOT_ENOUGH_TOKEN");
      assertEquals(bank.getBank().tokens, 55);
      assertEquals(players[0].getTokens(), 0);
    });

    it("Player cannot buy design card due to insuffiecient DC in bank", () => {
      players[0].creditTokens(9);
      game.buyDesignCard();
      game.buyDesignCard();
      assertThrows(() => game.buyDesignCard());
    });
  });

  describe("Buy Action Card", () => {
    it("Player can buy successfully action card", () => {
      players[0].creditTokens(2);
      const card = game.buyActionCard();
      assertEquals(card, {
        "id": 1,
        "type": "move",
        "description": "Move the pin to any unoccupied square.",
      });
      assertEquals(bank.getBank().tokens, 57);
      assertEquals(players[0].getTokens(), 0);
    });

    it("Player cannot buy action card due to insuffiecient tokens", () => {
      const card = game.buyActionCard();
      assertEquals(card, "NOT_ENOUGH_TOKEN");
      assertEquals(bank.getBank().tokens, 55);
      assertEquals(players[0].getTokens(), 0);
    });
  });

  describe("Play Tax Action Card", () => {
    it("Player plays tax action card successfully", () => {
      players[1].creditTokens(2);
      players[0].addActionCard({
        id: 6,
        "type": "tax",
        "description": "Get 3 tokens from the reserve.",
      });
      const { affectedPlayers } = game.playTaxActionCard(6);
      assertEquals(affectedPlayers, [2]);
    });
    it("Player plays tax action card successfully, but no one is affected", () => {
      players[0].addActionCard({
        id: 6,
        "type": "tax",
        "description": "Get 3 tokens from the reserve.",
      });
      const { affectedPlayers } = game.playTaxActionCard(6);
      assertEquals(affectedPlayers, []);
    });

    it("Player cannot play tax action card, as he doesn't have the card", () => {
      assertThrows(() => game.playTaxActionCard(6));
    });
  });

  describe.ignore("Claim design", () => {
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
    it.ignore("should distribute assets when they have 0 tokens", () => {
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

        assertThrows(() => gameState.freeSwap(source, destination));
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

        assertThrows(() => gameState.freeSwap(source, destination));
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

        assertThrows(() => gameState.freeSwap(source, destination));
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

        assertThrows(() => gameState.freeSwap(source, destination));
        assertEquals(mockGame.board.yarns, expected);
      });
    });

    describe("Paid yarn swap", () => {
      it("Player have more than 3 tokens, should get a chance", () => {
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

        game.distributeInitialAssets();

        assertEquals(bank.getBank(), result);
      },
    );
  });

  describe("upkeep: Roll dice and find possible path :", () => {
    const randomFn = () => 0.9;
    let game;
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
      const board = new Board(tiles, yarns);
      const bank = new Bank([], []);

      const player1 = new Player(2, "john");
      player1.setup(1, { x: 1, y: 1 });

      const player2 = new Player(1, "alex");
      player2.setup(2, { x: 3, y: 3 });

      const diceValue = { colorId: 1, number: 1 };
      const players = [player1, player2];

      game = new Game(players, bank, board, diceValue);
    });

    describe("roll dice :", () => {
      it("when rollDice invoked, should return two random values :", () => {
        const actual = game.rollDice(randomFn);
        const expected = { number: 6, colorId: 6 };
        assertEquals(actual, expected);
      });
    });

    describe("distributeAssets : ", () => {
      let bank;
      let players;
      beforeEach(() => {
        const player1 = new Player(1, "Ajoy");
        const player2 = new Player(2, "Dinesh");

        player1.setup(2, { x: 2, y: 3 });
        player2.setup(3, { x: 3, y: 3 });
        players = [player1, player2];

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
        const diceValue = { colorId: 2, number: 2 };

        game = new Game(players, bank, board, diceValue);
      });

      it("after rolling dice when color id is other than black, then should distribute the tokens to players based on the positions and yarns surrounded by the players pins", () => {
        const playerTokens = [players[0].getTokens(), players[1].getTokens()];

        game.distributeAssets({ colorId: 2 }, players[0]);

        const actual = players.every((player, i) => {
          return player.getTokens() === playerTokens[i] + 1;
        });
        const expected = true;
        const reserveTokens = bank.getBank().tokens;

        assertEquals(actual, expected);
        assertEquals(reserveTokens, 53);
      });

      it("when black color dice appeared, then should deduct one action card from the bank and add to current player actionCards store :", () => {
        const actionCardsBeforeDistribution = players[0].getAc().length;
        game.distributeAssets({ colorId: 6 }, players[0]);
        const actual = players[0].getAc().length;

        const actionCards = [{
          "id": 1,
          "type": "move",
          "description": "Move the pin to any unoccupied square.",
        }];
        assertEquals(actual, actionCardsBeforeDistribution + 1);
        assertEquals(players[0].getAc(), actionCards);
        assertEquals(bank.getBank().availableActionCards, 1);
      });

      it("when no players pins are surrounded by colorId, should not distribute tokens to any one", () => {
        game.distributeAssets({ colorId: 5 });
        const actual = players.every((player) => player.getTokens() === 0);
        const reserveTokens = bank.getBank().tokens;
        assertEquals(reserveTokens, 55);
        assert(actual);
      });

      it("when available tokens in the reserve less than total expense,then should not pay :", () => {
        bank.deductTokens(55);
        game.distributeAssets({ colorId: 2 });
        const actual = players.every((player) => player.getTokens() === 0);
        assert(actual);
      });
    });
  });
});
