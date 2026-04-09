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
import VictoryPoint from "../../../src/models/action_cards/victoryPoint.js";
import Tax from "../../../src/models/action_cards/tax.js";

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
      Math.random,
      0,
    );
  });

  describe("Play Victory Point Action Card", () => {
    it("Player plays victory point action card successfully", () => {
      const cardId = acMap.victoryPoint;
      const ac = getActionCard(cardId);
      players[0].addActionCard(ac);
      players[1].addActionCard(ac);

      VictoryPoint.play(cardId, game);

      const playerVPCardsAfter = players[0].getVp();

      assertEquals(playerVPCardsAfter, 1);
      assertEquals(isPresent(players[0].getAc(), ac), false);
      assertEquals(isPresent(players[1].getAc(), ac), true);
    });
  });

  describe("Play Tax Action Card", () => {
    it("should collect tax from other players", () => {
      const cardId = acMap.tax;
      const ac = getActionCard(cardId);

      players[0].addActionCard(ac);
      players[1].creditTokens(1);

      Tax.play(cardId, game);

      const actionCardOnHand = players[0].getAc();

      assertEquals(actionCardOnHand, []);
      assertEquals(players[1].getTokens(), 0);
      assertEquals(isPresent(actionCardOnHand, ac), false);
    });
  });

});
