export default class Gain {
  static token(id, currentPlayer, game, payload, rollDice) {
    const { diceValue } = game.getGameState();
    const { number } = rollDice();
    currentPlayer.removeActionCard(id);

    if (payload.number > diceValue.number) {
      return {
        state: game.getGameState(),
        diceValues: { colorId: diceValue.colorId, number },
        result: {
          diceValues: { colorId: diceValue.colorId, number },
          message: "Tokens has not been credited",
        },
      };
    }

    const tokens = game.getBank().deductTokens(payload.number);
    currentPlayer.creditTokens(tokens);

    return {
      state: game.getGameState(),
      result: {
        diceValues: { colorId: diceValue.colorId, number },
        message: "Tokens credited",
      },
    };
  }
}
