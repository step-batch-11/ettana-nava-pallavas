import { TurnManager } from "../src/models/turn_manager.js";
import { assertEquals } from "@std/assert";
import { beforeEach, describe, it } from "@std/testing/bdd";

describe("tests for moving pin", () => {
  let turnManager;
  let currentPlayer;
  beforeEach(() => {
    currentPlayer = { id: 1, tokens: 2 };

    const mockGame = {
      currentPlayer,
      players: [currentPlayer, { id: 2, tokens: 3 }, { id: 3, tokens: 2 }],

      board: {
        tiles: [
          [
            { value: null, playerId: null },
            { value: null, playerId: null },
            { value: null, playerId: null },
            { value: null, playerId: null },
            { value: null, playerId: null },
            { value: null, playerId: null },
          ],
          [
            { value: null, playerId: 1 },
            { value: 1, playerId: null },
            { value: 2, playerId: 2 },
            { value: 3, playerId: null },
            { value: 4, playerId: 3 },
            { value: null, playerId: null },
          ],
          [
            { value: null, playerId: null },
            { value: 5, playerId: null },
            { value: 6, playerId: null },
            { value: 1, playerId: null },
            { value: 2, playerId: null },
            { value: null, playerId: null },
          ],
          [
            { value: null, playerId: null },
            { value: 3, playerId: null },
            { value: 4, playerId: null },
            { value: 5, playerId: null },
            { value: 6, playerId: null },
            { value: null, playerId: null },
          ],
          [
            { value: null, playerId: null },
            { value: 2, playerId: null },
            { value: 3, playerId: null },
            { value: 4, playerId: null },
            { value: 5, playerId: null },
            { value: null, playerId: null },
          ],
          [
            { value: null, playerId: null },
            { value: null, playerId: null },
            { value: null, playerId: null },
            { value: null, playerId: null },
            { value: null, playerId: null },
            { value: null, playerId: null },
          ],
        ],
      },
    };

    turnManager = new TurnManager(mockGame);
  });

  describe("If current player is taking a path through occupied tile, they have to pay", () => {
    it("should pay to one player", () => {
      const path = [
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 1, y: 2 },
        { x: 1, y: 3 },
      ];

      const { payerTokens, payees } = turnManager.traversePathTile(
        currentPlayer,
        path,
      );
      assertEquals(payerTokens, 1);
      assertEquals(payees, [2]);
    });

    it("should pay to tow players", () => {
      const path = [
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 1, y: 2 },
        { x: 1, y: 3 },
        { x: 1, y: 4 },
        { x: 1, y: 5 },
      ];

      const { payerTokens, payees } = turnManager.traversePathTile(
        currentPlayer,
        path,
      );
      assertEquals(payerTokens, 0);
      assertEquals(payees, [2, 3]);
    });

    it("should not pay to another player", () => {
      const path = [
        { x: 1, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: 0, y: 2 },
        { x: 0, y: 3 },
        { x: 1, y: 3 },
      ];

      const { payerTokens, payees } = turnManager.traversePathTile(
        currentPlayer,
        path,
      );
      assertEquals(payerTokens, 2);
      assertEquals(payees, []);
    });

    describe("");
  });
});
