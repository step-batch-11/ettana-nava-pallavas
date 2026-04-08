import CollectToken from "../models/action_cards/collect_token.js";
import Gain from "../models/action_cards/gain_token.js";
import GetDesignCard from "../models/action_cards/get_design_card.js";
import Move from "../models/action_cards/move.js";
import Replace from "../models/action_cards/replace.js";
import Steal from "../models/action_cards/steal.js";
import Swap from "../models/action_cards/swap.js";
import Tax from "../models/action_cards/tax.js";
import Preset from "../models/action_cards/preset.js";
import VictoryPoint from "../models/action_cards/victoryPoint.js";
import RollAgain from "../models/action_cards/roll_again.js";

export default class ActionCardService {
  constructor() {
    this.played = {};
  }

  playCard(id, game) {
    const currentPlayer = game.getCurrentPlayer();

    if (!currentPlayer.haveActionCard(id)) {
      throw new Error("Card is missing");
    }

    const actions = {
      10: () =>
        Steal.play(this.played, game, (opponent) => opponent.getTokens()),
      22: () =>
        Steal.play(
          this.played,
          game,
          (opponent) => opponent.getAc().length,
        ),
      34: () => Replace.play(this.played, id, game),
      6: () => Tax.play(id, game),
      16: () => VictoryPoint.play(id, game),
      4: () => CollectToken.play(id, game),
      7: () => GetDesignCard.play(id, game),
      1: () => Move.play(this.played, id, game),
      25: () => Swap.play(this.played, id, game),
      13: () => Preset.play(this.played, id, game),
      28: () => RollAgain.play(id, game),
    };

    return actions[id]();
  }

  performAction(payload, game) {
    const currentPlayer = game.getCurrentPlayer();

    if (!currentPlayer.haveActionCard(payload.cardId)) {
      throw new Error("Card is missing");
    }

    const actions = {
      1: Move.performMove,
      34: Replace.performAction,
      10: Steal.stealTokens,
      22: Steal.stealActionCard,
      25: Swap.performSwap,
      31: Gain.token,
      13: Preset.rollNumberDice,
    };

    return actions[payload.cardId](payload, currentPlayer, this.played, game);
  }
}
