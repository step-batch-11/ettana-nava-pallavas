import { beforeEach, describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
import Tax from "../../../src/models/action_cards/tax.js";

describe("Play Tax Action Card", () => {
  const cardId = 7;
  let game;
  beforeEach(() => {
    const currentPlayer = {
      removeActionCard: (card) => card,
    };
    const opponent = {
      getId: () => 3,
      getTokens: () => 2,
      debitTokens: (n) => n,
    };
    game = {
      getCurrentPlayer: () => currentPlayer,
      getOpponents: () => [opponent],
      creditToBank: () => 2,
    };
  });

  it("every player should give one token to bank, if they have more than or equal to 1 token", () => {
    const result = Tax.play(cardId, game);

    assertEquals(result, {
      affectedPlayers: [3],
      message: "Tax action card played",
    });
  });
});
