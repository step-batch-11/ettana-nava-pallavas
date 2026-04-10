export default class CollectToken {
  static play(id, game) {
    const currentPlayer = game.getCurrentPlayer();
    const tokens = game.debitFromBank(3);
    currentPlayer.removeActionCard(id);
    currentPlayer.creditTokens(tokens);

    game.storeLastAction("GET_TOKENS", currentPlayer);

    return { message: "Tokens added" };
  }
}
