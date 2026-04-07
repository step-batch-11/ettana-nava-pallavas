import { areSamePositions } from "../../utils/common.js";

export default class Swap {
  static play(played, _id, game) {
    played["swap"] = true;

    const swappableYarns = game.getAllYarns();

    return {
      result: { swappableYarns, message: "Swap action card played" },
      state: game.getGameState(),
    };
  }

  static performSwap(payload, currentPlayer, played, game) {
    if (!played["swap"]) {
      throw new Error("You didn't play swap action card");
    }

    if (areSamePositions(payload.draggablePosition, payload.yarnPosition)) {
      throw new Error("Player can't swap on the same position");
    }

    game.swapYarns(payload.draggablePosition, payload.yarnPosition);
    currentPlayer.removeActionCard(payload.cardId);
    delete played.swap;
    
    return {
      result: { message: "Swap action card played" },
      state: game.getGameState(),
    };
  }
}
