export default class Replace {
  static play(played, id, currentPlayer, game) {
    if (!played.replace) {
      throw new Error("you haven't played replace card");
    }
    const availableDestinations = game.getPossibleDestinations();
    currentPlayer.removeActionCard(id);



    delete played.replace;
    return {
      state: game.getGameState(),
      result: {
        availableDestinations,
        message: "Choose tiles to replace",
      },
    };
  }
}
