import Gain from "../models/action_cards/gain_token.js";
import Replace from "../models/action_cards/replace.js";

export default class ActionCardService {
  playAction(id, game, payload) {
    const currentPlayer = game.getCurrentPlayer();

    if (!currentPlayer.haveActionCard(id)) {
      throw new Error("Card is missing");
    }

    const actions = {
      34: () => Replace.play(id, currentPlayer, game),
      31: () => Gain.token(id, currentPlayer, game, payload, game.rollDice),
    };

    return actions[id]();
  }
}
