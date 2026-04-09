import { assertEquals } from "@std/assert";
import { beforeEach, describe, it } from "@std/testing/bdd";
import RollAgain from "../../../src/models/action_cards/roll_again.js";

describe("Roll Again", () => {
  const cardId = 28;
  let game, mockState;
  beforeEach(() => {
    mockState = { state: "game" };
    const player = {
      removeActionCard: (id) => id,
    };
    game = {
      getCurrentPlayer: () => player,
      getGameState: () => mockState,
    };
  });

  it("when played immediately after dice roll, should give the player the ability to roll again", () => {
    const result = RollAgain.play(cardId, game);

    assertEquals(result, {
      message: "Roll again card played successfully",
    });
  });
});
