export default class RollAgain {
  static play(id, game) {
    const currentPlayer = game.getCurrentPlayer();
    currentPlayer.removeActionCard(id);

    return { message: "Roll again card played successfully" };
  }
}
