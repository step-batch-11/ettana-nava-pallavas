export default class RollAgain {
  static play(id, game) {
    const currentPlayer = game.getCurrentPlayer();
    currentPlayer.removeActionCard(id);

    game.storeLastAction("ROLL_AGAIN", currentPlayer);

    return { message: "Roll again card played successfully" };
  }
}
