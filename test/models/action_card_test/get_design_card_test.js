import { beforeEach, describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
import GetDesignCard from "../../../src/models/action_cards/get_design_card.js";

describe.ignore("Play Get-Design-Card Action Card", () => {
  const cardId = 3;
  let game, card;
  beforeEach(() => {
    card = { id: 3 };
    const player = {
      removeActionCard: (card) => card,
      addDesignCard: (id) => id,
    };
    game = {
      getCurrentPlayer: () => player,
      getDesignCardFromBank: () => card,
    };
  });

  it("should add a design card to player deck, if action card is present in player", () => {
    const result = GetDesignCard.play(cardId, game);

    assertEquals(result, { message: "design card added", card });
  });
});
