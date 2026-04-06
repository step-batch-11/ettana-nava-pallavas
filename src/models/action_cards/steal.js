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

  static stealTokens(
    { cardId, opponentPlayerId },
    currentPlayer,
    played,
    game,
  ) {
    Steal.isPlayed(played);

    if (currentPlayer.getId() === Number(opponentPlayerId)) {
      throw new Error("player can't take from himself");
    }

    const opponentPlayer = game.getPlayerById(opponentPlayerId);
    const stolenTokens = opponentPlayer.takeToken();

    currentPlayer.creditTokens(stolenTokens);
    currentPlayer.removeActionCard(cardId);

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

  static stealActionCard(
    { cardId, opponentPlayerId },
    currentPlayer,
    played,
    game,
  ) {
    Steal.isPlayed(played);

    if (currentPlayer.getId() === opponentPlayerId) {
      throw new Error("player can't take from himself");
    }

    const opponentPlayer = game.getPlayerById(opponentPlayerId);
    const newCard = opponentPlayer.takeRandomCard();

    player.removeActionCard(cardId);
    player.addActionCard(newCard);

    const message = createStolenMsg(
      currentPlayer.getPlayerData(),
      opponentPlayer.getPlayerData(),
      1,
      "action card",
    );

    return { result: { message }, state: game.getGameState() };
  }
}
