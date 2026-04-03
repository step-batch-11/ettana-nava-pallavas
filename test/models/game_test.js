import designCards from "../../src/config/design_card.json" with {
  type: "json",
};
import actionCards from "../../src/config/action_card.json" with {
  type: "json",
};
import Bank from "../../src/models/bank.js";
import Board from "../../src/models/board.js";
import Game from "../../src/models/game.js";
import Player from "../../src/models/player.js";
import { beforeEach, describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert/equals";
import { assert } from "@std/assert/assert";

describe("Roll dice and find possible path :", () => {
  const randomFn = () => 0.9;
  let game;
  const yarns = [
    [1, 1, 1, 1, 1],
    [2, 2, 2, 2, 2],
    [3, 3, 3, 3, 3],
    [4, 4, 4, 4, 4],
    [5, 5, 5, 5, 5],
  ];

  const tiles = [
    [0, 1, 2, 3, 4, 0],
    [0, 5, 6, 1, 2, 0],
    [0, 3, 4, 5, 6, 0],
    [0, 1, 2, 3, 4, 0],
    [0, 5, 6, 1, 2, 0],
    [0, 3, 4, 5, 6, 0],
  ];

  beforeEach(() => {
    const board = new Board(tiles, yarns);
    const bank = new Bank([], []);

    const player1 = new Player(2, "john");
    player1.setup(1, { x: 1, y: 1 });

    const player2 = new Player(1, "alex");
    player2.setup(2, { x: 3, y: 3 });

    const diceValue = { colorId: 1, number: 1 };
    const players = [player1, player2];

    game = new Game(players, bank, board, diceValue);
  });

  describe("roll dice :", () => {
    it("when rollDice invoked, should return two random values :", () => {
      const actual = game.rollDice(randomFn);
      const expected = { number: 6, colorId: 6 };
      assertEquals(actual, expected);
    });
  });

  describe("distributeAssets : ", () => {
    let bank;
    let players;
    beforeEach(() => {
      const player1 = new Player(1, "Ajoy");
      const player2 = new Player(2, "Dinesh");

      player1.setup(2, { x: 2, y: 3 });
      player2.setup(3, { x: 3, y: 3 });
      players = [player1, player2];

      const yarns = [
        [1, 2, 3, 4, 5],
        [5, 4, 3, 2, 1],
        [1, 2, 3, 4, 5],
        [5, 4, 3, 2, 1],
        [1, 2, 3, 4, 5],
      ];

      const tiles = [
        [0, 0, 0, 0, 0, 0],
        [0, 1, 2, 3, 4, 0],
        [0, 5, 6, 1, 2, 0],
        [0, 3, 4, 5, 6, 0],
        [0, 2, 3, 4, 5, 0],
        [0, 0, 0, 0, 0, 0],
      ];

      const board = new Board(tiles, yarns);
      const actionCards = [{
        "id": 1,
        "type": "move",
        "description": "Move the pin to any unoccupied square.",
      }];

      bank = new Bank([], actionCards, (x) => x);
      const diceValue = { colorId: 2, number: 2 };

      game = new Game(players, bank, board, diceValue);
    });

    it("after rolling dice when color id is other than black, then should distribute the tokens to players based on the positions and yarns surrounded by the players pins", () => {
      const playerTokens = [players[0].getTokens(), players[1].getTokens()];

      game.distributeAssets({ colorId: 2 }, players[0]);

      const actual = players.every((player, i) => {
        return player.getTokens() === playerTokens[i] + 1;
      });
      const expected = true;
      const reserveTokens = bank.getBank().tokens;

      assertEquals(actual, expected);
      assertEquals(reserveTokens, 53);
    });

    it("when black color dice appeared, then should deduct one action card from the bank and add to current player actionCards store :", () => {
      const actionCardsBeforeDistribution = players[0].getAc().length;
      game.distributeAssets({ colorId: 6 }, players[0]);
      const actual = players[0].getAc().length;

      const actionCards = [{
        "id": 1,
        "type": "move",
        "description": "Move the pin to any unoccupied square.",
      }];
      assertEquals(actual, actionCardsBeforeDistribution + 1);
      assertEquals(players[0].getAc(), actionCards);
      assertEquals(bank.getBank().availableActionCards, 1);
    });

    it("when no players pins are surrounded by colorId, should not distribute tokens to any one", () => {
      game.distributeAssets({ colorId: 5 });
      const actual = players.every((player) => player.getTokens() === 0);
      const reserveTokens = bank.getBank().tokens;
      assertEquals(reserveTokens, 55);
      assert(actual);
    });

    it("when available tokens in the reserve less than total expense,then should not pay :", () => {
      bank.deductTokens(55);
      game.distributeAssets({ colorId: 2 });
      const actual = players.every((player) => player.getTokens() === 0);
      assert(actual);
    });
  });
});
