import { beforeEach, describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
import GetDesignCard from "../../../src/models/action_cards/get_design_card.js";

describe("Play Get-Design-Card Action Card", () => {
  const cardId = 3;
  let game, card, actionPlayed;
  beforeEach(() => {
    card = { id: 3 };
    const player = {
      removeActionCard: (card) => card,
      addDesignCard: (id) => id,
      getName: () => "kha",
    };
    game = {
      getCurrentPlayer: () => player,
      getDesignCardFromBank: () => card,
      storeLastAction: (action, player) =>
        actionPlayed = `${player.getName()} has played ${action}`,
    };
  });

  it("should add a design card to player deck, if action card is present in player", () => {
    const result = GetDesignCard.play(cardId, game);

    assertEquals(result, { message: "design card added", card });
    assertEquals(actionPlayed, "kha has played GET_DESIGN_CARD");
  });
});
