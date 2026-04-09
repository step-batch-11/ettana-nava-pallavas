import { assertEquals, assertThrows } from "@std/assert";
import { beforeEach, describe, it } from "@std/testing/bdd";
import Move from "../../../src/models/action_cards/move.js";

describe("Move", () => {
  const cardId = 1;
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
      getCurrentPlayer: () => player,
      getPossibleDestinations: () => mockPosition,
      getGameState: () => mockState,
    };
  });

  describe("play", () => {
    it("should return available destinations", () => {
      const result = Move.play(played, cardId, game);

      assertEquals(played.move, true);
      assertEquals(result, {
        availableDestinations: mockPosition,
        message: "Move action card played",
      });
    });
  });

  describe("perform", () => {
    it("should return available destinations", () => {
      Move.play(played, cardId, game);
      const payload = { destination: { x: 1, y: 1 }, cardId };
      const result = Move.performMove(payload, currentPlayer, played, game);

      assertEquals("move" in played, false);
      assertEquals(result, {
        adjYarns: [
          { x: 0, y: 0 },
          { x: 0, y: 1 },
          { x: 1, y: 0 },
          { x: 1, y: 1 },
        ],
        moveResult: {
          source: mockPosition,
          destination: payload.destination,
        },
        message: "moved successfully",
      });
    });

    it("should throw error destinations", () => {
      const payload = { destination: { x: 1, y: 1 }, cardId };

      const error = assertThrows(() =>
        Move.performMove(payload, currentPlayer, played, game)
      );
      assertEquals("move" in played, false);
      assertEquals(error.message, "You didn't play move action card");
    });
  });
});
