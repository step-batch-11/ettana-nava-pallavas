export default class GetDesignCard {
  static play(id, game) {
    const currentPlayer = game.getCurrentPlayer();
    const designCard = game.getDesignCardFromBank();

    currentPlayer.addDesignCard(designCard);
    currentPlayer.removeActionCard(id);

    return {
      result: { message: "design card added" },
      state: game.getGameState(),
    };
  }
}
