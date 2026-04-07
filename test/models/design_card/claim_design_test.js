import { beforeEach, describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
import {
  getAllActionCard,
  getAllDesignCard,
  mockTiles,
  mockYarns,
} from "../../../src/utils/mock_data.js";
import Game from "../../../src/models/game.js";
import Bank from "../../../src/models/bank.js";
import Player from "../../../src/models/player.js";
import Board from "../../../src/models/board.js";
import { diceValue } from "../../../src/data/state.js";

describe("Claim design", () => {
  let players, game, bank;
  const yarns = mockYarns();
  const tiles = mockTiles();

  beforeEach(() => {
    const player1 = new Player(1, "Ajoy");
    player1.addAllDesignCardDev(...getAllDesignCard());
    const player2 = new Player(1, "Dinesh");

    players = [player1, player2];
    bank = new Bank(
      getAllDesignCard(),
      getAllActionCard(),
      (x) => x,
      () => 0.1,
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

  it("should match a design pattern that is present in the board", () => {
    const matchingStatus = game.claimDesign(5);
    assertEquals(matchingStatus.isMatched, true);

    assertEquals(matchingStatus.matches, [
      { x: 0, y: 2 },
      { x: 1, y: 2 },
      { x: 2, y: 2 },
      { x: 3, y: 2 },
      { x: 4, y: 2 },
    ]);
  });

  it("should not match a design pattern that is not there in the board", () => {
    const matchingStatus = game.claimDesign(2);
    assertEquals(matchingStatus.isMatched, false);
  });
});
