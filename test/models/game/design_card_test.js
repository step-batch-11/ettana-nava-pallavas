import { beforeEach, describe, it } from "@std/testing/bdd";
import Game from "../../../src/models/game.js";
import Bank from "../../../src/models/bank.js";
import Board from "../../../src/models/board.js";
import Player from "../../../src/models/player.js";
import { diceValue } from "../../../src/data/state.js";
import {
  getAllActionCard,
  getAllDesignCard,
  getDesignCard,
  mockTiles,
  mockYarns,
} from "../../../src/utils/mock_data.js";

describe("Design card", () => {
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

  describe("Rotate design card", () => {
    it("Player should be able to rotate their design card", () => {
      const dc = getDesignCard(1);
      players[0].addDesignCard(dc);

      game.rotatePattern(dc.id);  // yet to write
    });
  });
});
