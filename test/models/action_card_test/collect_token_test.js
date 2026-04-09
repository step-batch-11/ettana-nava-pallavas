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
  isPresent,
} from "../../../src/utils/mock_data.js";
import CollectToken from "../../../src/models/action_cards/collect_token.js";

describe("Play Collect Tokens Action Card", () => {
  let game, players, bank, board;

  beforeEach(() => {
    players = [new Player(1, "Ajoy"), new Player(2, "Dinesh")];
    bank = new Bank([], []);
    board = new Board([], []);
    game = new Game(players, bank, board, diceValue, Math.random, 0);
  });

  it("Player plays collect token action card successfully", () => {
    const cardId = acMap.collectToken;
    const ac = getActionCard(cardId);
    players[0].addActionCard(ac);
    const playerTokenBefore = players[0].getTokens();
    const bankTokensBefore = bank.getBank().tokens;
    CollectToken.play(cardId, game);

    const playerActionCardsAfter = players[0].getAc();
    const playerTokenAfter = players[0].getTokens();
    const bankTokensAfter = bank.getBank().tokens;

    assertEquals(isPresent(playerActionCardsAfter, ac), false);
    assertEquals(playerTokenAfter, playerTokenBefore + 3);
    assertEquals(bankTokensAfter, bankTokensBefore - 3);
  });
});
