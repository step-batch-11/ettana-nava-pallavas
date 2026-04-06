import Replace from "../models/action_cards/replace.js";

export default class ActionCardService {
  constructor() {
  }

  playAction(id, game) {
    const currentPlayer = game.getCurrentPlayer();

    if (!currentPlayer.haveActionCard(id)) {
      throw new Error("Card is missing");
    }

    const actions = {
      34: () => Replace.play(id, currentPlayer, game),
    };

    return actions[id]();
  }
}
