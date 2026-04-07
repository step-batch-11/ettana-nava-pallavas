export default class VictoryPoint{
  static play(id, game) {
    const currentPlayer = game.getCurrentPlayer();
    currentPlayer.removeActionCard(id);
    currentPlayer.updateVp(1);

    return {
      state: game.getGameState(),
      result: {
        message: "Victory point added to the player",
      },
    };
  }
}