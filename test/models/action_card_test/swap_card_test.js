import { assertEquals, assertThrows } from "@std/assert";
import { beforeEach, describe, it } from "@std/testing/bdd";
import Swap from "../../../src/models/action_cards/swap.js";

describe("Swap", () => {
  const cardId = 25;
  let game, mockState, mockPosition, currentPlayer, played;
  beforeEach(() => {
    played = {};
    mockPosition = { x: 1, y: 1 };
    mockState = { state: "game" };
    const player = {
      removeActionCard: (id) => id,
      getPosition: () => mockPosition,
      move: () => mockPosition,
    };
    currentPlayer = player;
    game = {
      getAllYarns: () => mockPosition,
      swapYarns: () => [],
      getCurrentPlayer: () => player,
      getGameState: () => mockState,
      storeLastAction: () => {}
    };
  });

  describe("play", () => {
    it("should return available destinations", () => {
      const result = Swap.play(played, cardId, game);

      assertEquals(played.swap, true);
      assertEquals(result, {
        swappableYarns: mockPosition,
        message: "Swap action card played",
      });
    });
  });

  describe("perform", () => {
    it("should return available destinations", () => {
      Swap.play(played, cardId, game);
      const payload = {
        cardId,
        draggablePosition: { x: 1, y: 2 },
        yarnPosition: { x: 2, y: 4 },
      };
      const result = Swap.performSwap(payload, currentPlayer, played, game);

      assertEquals("swap" in played, false);
      assertEquals(result, {
        message: "Swap action card played" 
      });
    });

    it("should throw error destinations", () => {
      const payload = {
        cardId,
        draggablePosition: { x: 2, y: 3 },
        yarnPosition: { x: 2, y: 4 },
      };

      const error = assertThrows(() =>
        Swap.performSwap(payload, currentPlayer, played, game)
      );
      assertEquals("swap" in played, false);
      assertEquals(error.message, "You didn't play swap action card");
    });

    it("should throw error if source and destination are same", () => {
      Swap.play(played, cardId, game);
      const payload = {
        cardId,
        draggablePosition: { x: 2, y: 4 },
        yarnPosition: { x: 2, y: 4 },
      };

      const error = assertThrows(() =>
        Swap.performSwap(payload, currentPlayer, played, game)
      );
      assertEquals("swap" in played, true);
      assertEquals(error.message, "Player can't swap on the same position");
    });
  });
});
