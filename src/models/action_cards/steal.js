import { createStolenMsg } from "../../utils/util.js";

export default class Steal {
  static play(played, id, game, predicate) {
    played["steal"] = true;

    const currentPlayer = game.getCurrentPlayer();
    if (!currentPlayer.haveActionCard(id)) {
      throw new Error("You don't have card");
    }

    const opponents = game.filterOpponents(predicate);

    return { result: opponents, state: game.getGameState() };
  }

  static stealTokens(payload, currentPlayer, played, game) {
    Steal.isPlayed(played);

    if (currentPlayer.getId() === Number(payload.opponentPlayerId)) {
      throw new Error("player can't take from himself");
    }

    const opponentPlayer = game.getPlayerById(payload.opponentPlayerId);
    const stolenTokens = opponentPlayer.takeToken();

    currentPlayer.creditTokens(stolenTokens);
    currentPlayer.removeActionCard(payload.cardId);
    delete played.steal;

    const message = createStolenMsg(
      currentPlayer.getPlayerData(),
      opponentPlayer.getPlayerData(),
      stolenTokens,
      "tokens",
    );

    return { result: { message }, state: game.getGameState() };
  }

  static isPlayed(played) {
    if (!played["steal"]) {
      throw new Error("You did not play steal action card");
    }
  }

  static stealActionCard(payload, currentPlayer, played, game) {
    Steal.isPlayed(played);

    if (currentPlayer.getId() === payload.opponentPlayerId) {
      throw new Error("player can't take from himself");
    }

    const opponentPlayer = game.getPlayerById(payload.opponentPlayerId);
    const newCard = opponentPlayer.takeRandomCard();

    player.removeActionCard(payload.cardId);
    player.addActionCard(newCard);
    delete played.steal;

    const message = createStolenMsg(
      currentPlayer.getPlayerData(),
      opponentPlayer.getPlayerData(),
      1,
      "action card",
    );

    return { result: { message }, state: game.getGameState() };
  }
}
