import { assertEquals } from "@std/assert";
import { beforeEach, describe, it } from "@std/testing/bdd";
import {
  computeExpense,
  computeSettlement,
  createLedger,
  distributeTokens,
  extractPlayersPositions,
  mapAdjacentYarns,
  isInBoundary,
} from "../../src/utils/color_dice_action.js";
import Player from "../../src/models/player.js";

describe("color dice actions : ", () => {
  let players;

  const player1 = new Player(1, "John");
  const player2 = new Player(2, "Jane");
  player1.setup(2, { x: 2, y: 2 });
  player2.setup(3, { x: 3, y: 3 });

  beforeEach(() => {
    players = [player1, player2];
  });
  describe("coordinates validations : ", () => {
    it("when coordinates given within the boundary then , should return true : ", () => {
      const actual = isInBoundary(1, 1, 4, 4);
      const expected = true;
      assertEquals(actual, expected);
    });

    it("when coordinates given outside the range of boundary, should return false : ", () => {
      const actual = isInBoundary(10, 1, 4, 4);
      const expected = false;
      assertEquals(actual, expected);
    });
  });

  describe("extract the positions from players : ", () => {
    it("when players data is given , should return the position map to pin : ", () => {
      const actual = extractPlayersPositions(players);
      const expected = {
        "1": [2, 2],
        "2": [3, 3],
      };
      assertEquals(actual, expected);
    });
  });

  describe("yarns id's around player position", () => {
    it("when pin positions are given ,then should return all the yarns around all the pins on the board : ", () => {
      const pinPositions = {
        "1": [2, 2],
        "2": [3, 3],
      };

      const yarns = [
        [1, 2, 3, 4, 5],
        [5, 4, 3, 2, 1],
        [1, 2, 3, 4, 5],
        [5, 4, 3, 2, 1],
        [1, 2, 3, 4, 5],
      ];
      const actual = mapAdjacentYarns(pinPositions, yarns);
      const expected = { "1": [3, 2, 3, 4], "2": [2, 3, 4, 3] };
      assertEquals(actual, expected);
    });

    it("when there are no pin are in board, then should return empty object :", () => {
      const pinPositions = {};
      const yarns = [
        [1, 2, 3, 4, 5],
        [5, 4, 3, 2, 1],
        [1, 2, 3, 4, 5],
        [5, 4, 3, 2, 1],
        [1, 2, 3, 4, 5],
      ];
      const actual = mapAdjacentYarns(pinPositions, yarns);
      const expected = {};
      assertEquals(actual, expected);
    });
  });

  describe("find count of match yarn : ", () => {
    it("when yarns are given, then should return the count of match yarn in the yarns array : ", () => {
      const actual = computeSettlement([3, 2, 3, 4], 3);
      const expected = 2;
      assertEquals(actual, expected);
    });

    it("when no yarns are match with target yarn, then should return 0 : ", () => {
      const actual = computeSettlement([3, 2, 3, 4], 1);
      const expected = 0;
      assertEquals(actual, expected);
    });
  });

  describe("assign token count to playerId's", () => {
    it("when pin mapped yarns object and target yarn is given, then should return the player's id with match yarns", () => {
      const actual = createLedger({ "1": [3, 2, 3, 4], "2": [2, 3, 4, 3] }, 2);
      const expected = { "1": 1, "2": 1 };
      assertEquals(actual, expected);
    });

    it("when no players yarns are matching then, should return count 0 in place of players token count :", () => {
      const actual = createLedger({ "1": [3, 2, 3, 4], "2": [2, 3, 4, 3] }, 1);
      const expected = { "1": 0, "2": 0 };
      assertEquals(actual, expected);
    });
  });

  describe("sum of all tokens : ", () => {
    it("when distribution configuration given, then should calculate the all tokens count :", () => {
      const actual = computeExpense({ "1": 1, "2": 1 });
      const expected = 2;
      assertEquals(actual, expected);
    });

    it("when empty distribution configuration is given, then should return total token count as 0", () => {
      const actual = computeExpense({});
      const expected = 0;
      assertEquals(actual, expected);
    });
  });

  describe("distribution of tokens :", () => {
    it("when distribution configuration and players given, then should increase the count of the player's token count", () => {
      distributeTokens({ "1": 1, "2": 1 }, players);
      const actual = players.every((player) => player.getTokens() === 1);
      const expected = true;
      assertEquals(actual, expected);
    });
  });
});
