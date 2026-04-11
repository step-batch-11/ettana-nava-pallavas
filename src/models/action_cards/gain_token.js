export default class Gain {
  static token(payload, currentPlayer, _played, game) {
    const { diceValue } = game.getGameState(currentPlayer.getId());
    const { number } = game.rollDice();
    currentPlayer.removeActionCard(payload.cardId);

    if (payload.number > number) {
      game.storeLastAction("GAIN_TOKEN", currentPlayer);

      return {
        diceValues: { colorId: diceValue.colorId, number },
        message: "Tokens has not been credited",
      };
    }

    const tokens = game.getBank().deductTokens(payload.number);
    currentPlayer.creditTokens(tokens);
    game.storeLastAction("GAIN_TOKEN", currentPlayer);
    return {
      diceValues: { colorId: diceValue.colorId, number },
      message: "Tokens credited",
    };
  }
}
