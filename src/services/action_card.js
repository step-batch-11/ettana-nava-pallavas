import Replace from "../models/action_cards/replace.js";
import Steal from "../models/action_cards/steal.js";

export default class ActionCardService {
  constructor() {
    this.played = {};
  }

  playCard(id, game) {
    const actions = {
      10: () =>
        Steal.play(this.played, id, game, (opponent) => opponent.getTokens()),
      22: () =>
        Steal.play(
          this.played,
          id,
          game,
          (opponent) => opponent.getAc().length > 0,
        ),
    };
    return actions[id]();
  }

  performAction(payload, game) {
    const currentPlayer = game.getCurrentPlayer();

    if (!currentPlayer.haveActionCard(payload.cardId)) {
      throw new Error("Card is missing");
    }

    const actions = {
      34: (...params) => Replace.play(...params),
      10: (...params) => Steal.stealTokens(...params),
      22: (...params) => Steal.stealActionCard(...params),
    };

    return actions[payload.cardId](payload, currentPlayer, this.played, game);
  }
}
