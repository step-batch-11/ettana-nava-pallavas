export default class RollAgain {
  static play(id, game) {
    const currentPlayer = game.getCurrentPlayer();
    currentPlayer.removeActionCard(id);

    return {
      state: game.getGameState(),
      result: {
        message: "Roll again card played successfully",
      },
    };
  }
}
