import { beforeEach, describe, it } from "@std/testing/bdd";
import Game from "../../../src/models/game.js";
import Player from "../../../src/models/player.js";
import Bank from "../../../src/models/bank.js";
import Board from "../../../src/models/board.js";
import { diceValue, tiles, yarns } from "../../../src/data/state.js";
import { assertEquals, assertThrows } from "@std/assert";

describe("testing stealing actions", () => {
  let game, actionCards, players;
  const actionCardFn = (opponent) => opponent.getAc().length > 0;
  const tokensFn = (opponent) => opponent.getTokens();

  beforeEach(() => {
    players = [
      new Player(1, "john"),
      new Player(2, "jane"),
      new Player(3, "jean"),
    ];
    players[0].setup(1, { x: 3, y: 3 });
    players[1].setup(2, { x: 2, y: 3 });
    players[2].setup(3, { x: 3, y: 2 });

    actionCards = [
      {
        id: 10,
        type: "steal token",
        description: "Choose a player and steal a maximum of 2 tokens.",
      },
      {
        id: 22,
        type: "steal action card",
        description: "Choose a player and steal an action card.",
      },
    ];

    players[0].addActionCard(actionCards[1]);

    const bank = new Bank([], actionCards, (x) => x);
    const board = new Board(tiles, yarns);
    game = new Game(players, bank, board, diceValue);
  });

  describe("test play steal action card", () => {
    it("when other players has no cards", () => {
      const actionCardId = actionCards[1].id;

      const { result } = game.playStealCard(actionCardId, actionCardFn);

      assertEquals(result.length, 0);
    });

    it("when other players has cards", () => {
      const actionCard = actionCards[1];
      players[1].addActionCard(actionCard);
      players[1].addActionCard(actionCard);
      players[2].addActionCard(actionCard);

      const { result } = game.playStealCard(actionCard.id, actionCardFn);

      assertEquals(result.length, 2);
    });

    it("when current players has no steal action card", () => {
      const actionCard = actionCards[1];
      players[0].removeActionCard(actionCard.id);

      assertThrows(() => game.playStealCard(actionCard.id, actionCardFn));
    });
  });

  describe("test play steal token card", () => {
    beforeEach(() => {
      players[0].addActionCard(actionCards[0]);
    });

    it("when other players has no tokens", () => {
      const actionCardId = actionCards[0].id;

      const { result } = game.playStealCard(actionCardId, tokensFn);

      assertEquals(result.length, 0);
    });

    it("when other players has tokens", () => {
      const actionCard = actionCards[0];
      players[1].creditTokens(2);
      players[2].creditTokens(1);

      const { result } = game.playStealCard(actionCard.id, tokensFn);

      assertEquals(result.length, 2);
    });

    it("when current players has no steal action card", () => {
      const actionCard = actionCards[0];
      players[0].removeActionCard(actionCard.id);

      assertThrows(() => game.playStealCard(actionCard.id, tokensFn));
    });
  });

  describe("test stealing action card from others", () => {
    beforeEach(() => {
      players[0].addActionCard(actionCards[1]);
    });

    it("testing when the current player selected himself", () => {
      assertThrows(() =>
        game.stealActionCard(players[0].getId(), actionCardFn)
      );
    });

    it("testing when the current player have no steal action card", () => {
      players[0].removeActionCard(actionCards[1].id);

      assertThrows(() =>
        game.stealActionCard(players[1].getId(), actionCardFn)
      );
    });

    it("testing when the selected opponent has no cards", () => {
      assertThrows(() =>
        game.stealActionCard(players[1].getId(), actionCardFn)
      );
    });

    it("valid case", () => {
      players[0].addActionCard(actionCards[1]);
      players[1].addActionCard(actionCards[1]);

      const { result } = game.stealActionCard(players[1].getId(), actionCardFn);

      assertEquals(result, "stolen card");
    });
  });

  describe("test stealing tokens from others", () => {
    beforeEach(() => {
      players[0].addActionCard(actionCards[0]);
      players.forEach((player) => player.creditTokens(1), tokensFn);
    });

    it("testing when the current player selected himself", () => {
      assertThrows(() => game.stealTokens(players[0].getId(), tokensFn));
    });

    it("testing when the current player have no steal action card", () => {
      players[0].removeActionCard(actionCards[0].id);

      assertThrows(() => game.stealTokens(players[1].getId(), tokensFn));
    });

    it("testing when the selected opponent has no tokens", () => {
      players[1].debitTokens(1);

      assertThrows(() => game.stealTokens(players[1].getId(), tokensFn));
    });

    it("valid case : opponent has more than 2 tokens", () => {
      players[1].creditTokens(3);
      const cpTokens = players[0].getTokens();
      const oppTokens = players[1].getTokens();

      const { result } = game.stealTokens(players[1].getId(), tokensFn);

      const cpUpdatedTokens = players[0].getTokens();
      const oppUpdatedTokens = players[1].getTokens();

      assertEquals(result, "stolen tokens");
      assertEquals(cpUpdatedTokens, cpTokens + 2);
      assertEquals(oppUpdatedTokens, oppTokens - 2);
    });

    it("valid case : opponent has only 2 tokens", () => {
      players[1].creditTokens(1);
      const cpTokens = players[0].getTokens();

      const { result } = game.stealTokens(players[1].getId(), tokensFn);

      const cpUpdatedTokens = players[0].getTokens();
      const oppUpdatedTokens = players[1].getTokens();

      assertEquals(result, "stolen tokens");
      assertEquals(cpUpdatedTokens, cpTokens + 2);
      assertEquals(oppUpdatedTokens, 0);
    });

    it("valid case : opponent has 1 token", () => {
      const cpTokens = players[0].getTokens();

      const { result } = game.stealTokens(players[1].getId(), tokensFn);

      const cpUpdatedTokens = players[0].getTokens();
      const oppUpdatedTokens = players[1].getTokens();

      assertEquals(result, "stolen tokens");
      assertEquals(cpUpdatedTokens, cpTokens + 1);
      assertEquals(oppUpdatedTokens, 0);
    });
  });
});
