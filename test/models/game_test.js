import { beforeEach, describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert/equals";
import Player from "../../src/models/player.js";
import Bank from "../../src/models/bank.js";
import Game from "../../src/models/game.js";
import Board from "../../src/models/board.js";
import { diceValue, tiles, yarns } from "../../src/data/state.js";
import { assertThrows } from "@std/assert/throws";

describe("Game Class", () => {
  let game, bank, players;
  const actionCards = [{
    "id": 1,
    "type": "move",
    "description": "Move the pin to any unoccupied square.",
  }, {
    "id": 4,
    "type": "get tokens",
    "description": "Get 3 tokens from the reserve.",
  }];

  beforeEach(() => {
    const designCards = [{ "id": 1, "victoryPoints": 1 }];
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
      assertEquals(card, { "id": 1, "victoryPoints": 1 });
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
});
