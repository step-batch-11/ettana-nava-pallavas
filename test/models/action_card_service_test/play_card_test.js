import { beforeEach, describe, it } from "@std/testing/bdd";
import { assertEquals, assertFalse, assertThrows } from "@std/assert";
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
import Move from "../../../src/models/action_cards/move.js";
import ActionCardService from "../../../src/service/action_card.js";
import Swap from "../../../src/models/action_cards/swap.js";

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

  describe("Play Swap action card", () => {
    let actionCardService;

    beforeEach(() => {
      actionCardService = new ActionCardService();
    });

    it("Should throw an error if player didn't play swap", () => {
      const cardId = acMap.swap;
      const ac = getActionCard(cardId);
      players[0].addActionCard(ac);

      const played = actionCardService.played;

      assertThrows(() => Swap.performSwap(_, _, played, game));
    });

    it("Should able to move anywhere on the unoccupied positions", () => {
      const cardId = acMap.swap;
      const ac = getActionCard(cardId);
      players[0].addActionCard(ac);

      const played = actionCardService.played;
      played.swap = true;

      const payload = {
        draggablePosition: { x: 0, y: 0 },
        yarnPosition: { x: 0, y: 0 },
      };

      assertThrows(() => Swap.performSwap(payload, _, played, game));
    });

    it("Should able to swap", () => {
      const cardId = acMap.swap;
      const ac = getActionCard(cardId);
      players[0].addActionCard(ac);

      const played = actionCardService.played;
      played.swap = true;

      const payload = {
        draggablePosition: { x: 0, y: 0 },
        yarnPosition: { x: 0, y: 1 },
      };

      const info = Swap.performSwap(payload, players[0], played, game);

      assertEquals(info.result.message, "Swap action card played");
    });

    it("Should able to play swap", () => {
      const cardId = acMap.swap;
      const ac = getActionCard(cardId);
      players[0].addActionCard(ac);

      const played = actionCardService.played;
      const info = Swap.play(played, cardId, game);

      assertEquals(info.result.swappableYarns, [
        [2, 1, 3, 4, 5],
        [5, 4, 3, 2, 1],
        [1, 2, 3, 4, 5],
        [5, 4, 3, 2, 1],
        [1, 2, 3, 4, 5],
      ]);
    });
  });

  describe("Play Move action card", () => {
    let actionCardService;

    beforeEach(() => {
      actionCardService = new ActionCardService();
    });

    it("Should throw an error if player didn't move", () => {
      const cardId = acMap.move;
      const ac = getActionCard(cardId);
      players[0].addActionCard(ac);

      const played = actionCardService.played;

      assertThrows(() => Move.performMove(_, _, played, game));
    });

    it("Should able to move anywhere on the unoccupied positions", () => {
      const cardId = acMap.move;
      const ac = getActionCard(cardId);
      players[0].addActionCard(ac);

      const played = actionCardService.played;
      played.move = true;

      const payload = { cardId: 1, destination: { x: 1, y: 1 } };
      const info = Move.performMove(payload, players[0], played, game);

      assertEquals(info.result.adjYarns, [
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
      ]);
    });

    it("Should able to move anywhere on the unoccupied positions", () => {
      const cardId = acMap.move;
      const ac = getActionCard(cardId);
      players[0].addActionCard(ac);

      const played = actionCardService.played;
      const info = Move.play(played, cardId, game);

      assertEquals(info.result, {
        availableDestinations: [
          [0, 0],
          [0, 1],
          [0, 2],
          [0, 3],
          [0, 4],
          [0, 5],
          [1, 0],
          [1, 1],
          [1, 2],
          [1, 3],
          [1, 4],
          [1, 5],
          [2, 0],
          [2, 1],
          [2, 2],
          [2, 3],
          [2, 4],
          [2, 5],
          [3, 0],
          [3, 1],
          [3, 2],
          [3, 3],
          [3, 4],
          [3, 5],
          [4, 0],
          [4, 1],
          [4, 2],
          [4, 3],
          [4, 4],
          [4, 5],
          [5, 0],
          [5, 1],
          [5, 2],
          [5, 3],
          [5, 4],
          [5, 5],
        ],
        message: "Move action card played",
      });
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
