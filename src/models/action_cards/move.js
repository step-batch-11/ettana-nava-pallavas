import { findAdjacentYarns } from "../../utils/color_dice_action.js";

export default class Move {
  static play(played, _id, game) {
    played["move"] = true;
    // if (this.#playerActions.isMoved) {
    //   throw new Error("Already move action performed!");
    // }

    const availableDestinations = game.getPossibleDestinations();

    // this.#playerActions.isMoved = true;

    return {
      result: { availableDestinations },
      state: game.getGameState(),
      message: "Move action card played",
    };
  }

  static performMove(payload, currentPlayer, played, game) {
    if (!played["move"]) {
      throw new Error("You didn't play move action card");
    }
    const source = currentPlayer.getPosition();
    currentPlayer.move(payload.destination);
    currentPlayer.removeActionCard(payload.cardId);
    const moveResult = { source, destination: payload.destination };
    const adjYarns = findAdjacentYarns(moveResult.destination);
    delete played.move;
    return {
      result: { adjYarns, moveResult, message: "moved successfully" },
      state: game.getGameState(),
    };
  }
}
