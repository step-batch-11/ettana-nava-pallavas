import { beforeEach, describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert/equals";
import Player from "../../src/models/player.js";
import Bank from "../../src/models/bank.js";
import Game from "../../src/models/game.js";
import Board from "../../src/models/board.js";
import { diceValue } from "../../src/data/state.js";
import { assertThrows } from "@std/assert/throws";

describe("Game controller test", () => {
  let game, players, bank;

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
      players[0].creditTokens(6);
      game.buyDesignCard();
      assertThrows(() => game.buyDesignCard());
    });
  });

  describe("Buy Action Card", () => {
    it("Player can buy successfully action card", () => {
      players[0].creditTokens(2);
      const card = game.buyActionCard();
      assertEquals(card, {
        "id": 4,
        "type": "get tokens",
        "description": "Get 3 tokens from the reserve.",
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
});
