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
} from "../../../src/utils/mock_data.js";
import VictoryPoint from "../../../src/models/action_cards/victoryPoint.js";

describe("Action cards", () => {
  let game, players, bank;

  beforeEach(() => {
    players = [new Player(1, "Ajoy"), new Player(2, "Dinesh")];
    bank = new Bank(getAllDesignCard(), getAllActionCard());
    game = new Game(players, bank, new Board([], []), diceValue, Math.random);
  });

  describe("Play Victory Point Action Card", () => {
    it("Player plays victory point action card successfully", () => {
      const cardId = acMap.victoryPoint;
      const ac = getActionCard(cardId);
      players[0].addActionCard(ac);
      players[1].addActionCard(ac);

      const result = VictoryPoint.play(cardId, game);

      const playerVPCardsAfter = players[0].getVp();

      assertEquals(playerVPCardsAfter, 1);
      assertEquals(isPresent(players[0].getAc(), ac), false);
      assertEquals(isPresent(players[1].getAc(), ac), true);
      assertEquals(result, { message: "Victory point added to the player" });
    });
  });
});
