import { beforeEach, describe, it } from "@std/testing/bdd";
import { assertFalse } from "@std/assert/false";
import { assertEquals } from "@std/assert/equals";
import Player from "../../../src/models/player.js";
import Bank from "../../../src/models/bank.js";
import Game from "../../../src/models/game.js";
import Board from "../../../src/models/board.js";
import { acMap, getActionCard, getAllActionCard, getAllDesignCard, isPresent, mockTiles, mockYarns } from "../../../src/utils/mock_data.js";
import Gain from "../../../src/models/action_cards/gain_token.js";
import { diceValue } from "../../../src/data/state.js";

describe("Play Gain Token Action Card", () => {
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
      () => 0.5,
      0,
    );
  });

  it("Player should get token if their guessed number is smaller than the rolled dice value", () => {
    const cardId = acMap.gainToken;
    const ac = getActionCard(cardId);
    players[0].addActionCard(ac);

    const playerTokenBefore = players[0].getTokens();
    const bankTokensBefore = bank.getBank().tokens;

    Gain.token({ cardId, number: 2 }, players[0], {}, game);

    const playerActionCardsAfter = players[0].getAc();
    const playerTokenAfter = players[0].getTokens();
    const bankTokensAfter = bank.getBank().tokens;

    assertFalse(isPresent(playerActionCardsAfter, ac));
    assertEquals(playerTokenBefore + 2, playerTokenAfter);
    assertEquals(bankTokensBefore - 2, bankTokensAfter);
  });

  it("Player should get token if their guessed number is equal to the rolled dice value", () => {
    const cardId = acMap.gainToken;
    const ac = getActionCard(cardId);
    players[0].addActionCard(ac);

    const playerTokenBefore = players[0].getTokens();
    const bankTokensBefore = bank.getBank().tokens;

    Gain.token({ cardId, number: 4 }, players[0], {}, game);

    const playerActionCardsAfter = players[0].getAc();
    const playerTokenAfter = players[0].getTokens();
    const bankTokensAfter = bank.getBank().tokens;

    assertFalse(isPresent(playerActionCardsAfter, ac));
    assertEquals(playerTokenBefore + 4, playerTokenAfter);
    assertEquals(bankTokensBefore - 4, bankTokensAfter);
  });

  it("Player should not get token if their guessed number is greater than the rolled dice value", () => {
    const cardId = acMap.gainToken;
    const ac = getActionCard(cardId);
    players[0].addActionCard(ac);

    const playerTokenBefore = players[0].getTokens();
    const bankTokensBefore = bank.getBank().tokens;

    Gain.token({ cardId, number: 5 }, players[0], {}, game);

    const playerActionCardsAfter = players[0].getAc();
    const playerTokenAfter = players[0].getTokens();
    const bankTokensAfter = bank.getBank().tokens;

    assertFalse(isPresent(playerActionCardsAfter, ac));
    assertEquals(playerTokenBefore, playerTokenAfter);
    assertEquals(bankTokensBefore, bankTokensAfter);
  });
});