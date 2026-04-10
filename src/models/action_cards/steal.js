import { createStolenMsg } from "../../utils/util.js";

export default class Steal {
  static play(played, game, predicate) {
    played["steal"] = true;

    const opponents = game.filterOpponents(predicate);

    return { opponents, message: "Choose an opponent" };
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

    game.storeLastAction(
      "STEAL_TOKENS",
      currentPlayer,
      { card: "Steal Token Card", value: stolenTokens },
      opponentPlayer,
    );
    return { message };
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

    currentPlayer.removeActionCard(payload.cardId);
    currentPlayer.addActionCard(newCard);
    delete played.steal;

    const message = createStolenMsg(
      currentPlayer.getPlayerData(),
      opponentPlayer.getPlayerData(),
      1,
      "action card",
    );

    game.storeLastAction(
      "STEAL_ACTION",
      currentPlayer,
      { card: "Steal Action Card", value: 1 },
      opponentPlayer,
    );
    return { message };
  }
}
