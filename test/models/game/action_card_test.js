import { beforeEach, describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
import Game from "../../../src/models/game.js";
import Bank from "../../../src/models/bank.js";
import Board from "../../../src/models/board.js";
import Player from "../../../src/models/player.js";
import { diceValue } from "../../../src/data/state.js";
import {
  acMap,
  getActionCard,
  getAllActionCard,
  getAllDesignCard,
  isPresent,
  mockTiles,
  mockYarns,
} from "../../../src/utils/mock_data.js";

describe.ignore("Action cards", () => {
  let game, players, bank;
  const yarns = mockYarns();
  const tiles = mockTiles();

  beforeEach(() => {
    players = [new Player(1, "Ajoy"), new Player(2, "Dinesh")];
    bank = new Bank(
      getAllDesignCard(),
      getAllActionCard(),
    );
    game = new Game(
      players,
      bank,
      new Board(tiles, yarns),
      diceValue,
    );
  });

  describe("Play Victory Point Action Card", () => {
    it("Player plays victory point action card successfully", () => {
      const cardId = acMap.victoryPoint;
      const ac = getActionCard(cardId);
      players[0].addActionCard(ac);

      game.playVictoryPoint(cardId);

      const playerActionCardsAfter = players[0].getAc();
      const playerVPCardsAfter = players[0].getVp();
      assertEquals(playerActionCardsAfter, []);
      assertEquals(playerVPCardsAfter, 1);
      assertEquals(isPresent(playerActionCardsAfter, ac), false);
    });
  });

  describe("Play Collect Tokens Action Card", () => {
    it("Player plays collect token action card successfully", () => {
      const cardId = acMap.collectToken;
      const ac = getActionCard(cardId);
      players[0].addActionCard(ac);
      const playerTokenBefore = players[0].getTokens();
      const bankTokensBefore = bank.getBank().tokens;
      game.playCollectToken(cardId);

      const playerActionCardsAfter = players[0].getAc();
      const playerTokenAfter = players[0].getTokens();
      const bankTokensAfter = bank.getBank().tokens;

      assertEquals(isPresent(playerActionCardsAfter, ac), false);
      assertEquals(playerTokenAfter, playerTokenBefore + 3);
      assertEquals(bankTokensAfter, bankTokensBefore - 3);
    });
  });
});
