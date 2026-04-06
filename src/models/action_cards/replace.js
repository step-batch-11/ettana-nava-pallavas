export default class Replace {
  static play(id, currentPlayer, game) {
    const availableDestinations = game.getPossibleDestinations();
    currentPlayer.removeActionCard(id);

    return {
      state: game.getGameState(),
      result: {
        availableDestinations,
        message: "Choose tiles to replace",
      },
    };
  }
}
