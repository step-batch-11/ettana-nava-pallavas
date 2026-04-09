export default class Gain {
  static token(payload, currentPlayer, _played, game) {
    const { diceValue } = game.getGameState();
    const { number } = game.rollDice();
    currentPlayer.removeActionCard(payload.cardId);

    if (payload.number > number) {
      return {
        diceValues: { colorId: diceValue.colorId, number },
        message: "Tokens has not been credited",
      };
    }

    const tokens = game.getBank().deductTokens(payload.number);
    currentPlayer.creditTokens(tokens);

    return {
      diceValues: { colorId: diceValue.colorId, number },
      message: "Tokens credited",
    };
  }
}
