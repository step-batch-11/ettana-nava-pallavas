export default class CollectToken {
  static play(id, game) {
    console.log(game);
    
    const currentPlayer = game.getCurrentPlayer();
    const tokens = game.debitFromBank(3);
    currentPlayer.removeActionCard(id);
    currentPlayer.creditTokens(tokens);

    return {
      state: game.getGameState(),
      result: {
        message: "Tokens added",
      },
    };
  }
}
