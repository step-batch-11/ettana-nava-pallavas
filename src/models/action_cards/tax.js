export default class Tax {
  static collectTax(otherPlayers) {
    const affectedPlayers = [];
    let collectedTax = 0;
    otherPlayers.forEach((player) => {
      if (player.getTokens() > 0) {
        affectedPlayers.push(player.getId());
        player.debitTokens(1);
        collectedTax++;
      }
    });
    return { collectedTax, affectedPlayers };
  }

  static play(id, game) {
    const currentPlayer = game.getCurrentPlayer();

    const otherPlayers = game.getOpponents();
    const { collectedTax, affectedPlayers } = Tax.collectTax(otherPlayers);

    game.creditToBank(collectedTax);
    currentPlayer.removeActionCard(id);

    return { affectedPlayers, message: "Tax action card played" };
  }
}
