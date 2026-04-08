import { beforeEach, describe, it } from "@std/testing/bdd";
import { assertEquals, assertFalse } from "@std/assert";
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
import Gain from "../../../src/models/action_cards/gain_token.js";
import VictoryPoint from "../../../src/models/action_cards/victoryPoint.js";
import CollectToken from "../../../src/models/action_cards/collect_token.js";
import GetDesignCard from "../../../src/models/action_cards/get_design_card.js";
import Tax from "../../../src/models/action_cards/tax.js";

describe("Action cards", () => {
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

      VictoryPoint.play(cardId, game);

      const playerVPCardsAfter = players[0].getVp();

      assertEquals(playerVPCardsAfter, 1);
      assertEquals(isPresent(players[0].getAc(), ac), false);
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

  describe("Play Get-Design-Card Action Card", () => {
    it("should add a design card to player deck, if action card is present in player", () => {
      const cardId = acMap.getDesignCard;
      const ac = getActionCard(cardId);
      players[0].addActionCard(ac);

      GetDesignCard.play(cardId, game);

      const actionCardOnHand = players[0].getAc();
      const designCardOnHand = players[0].getDc();

      assertEquals(actionCardOnHand, []);
      assertEquals(designCardOnHand.length, 1);
      assertEquals(isPresent(actionCardOnHand, ac), false);
    });
  });

  describe("Play Collect Tokens Action Card", () => {
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
});

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
