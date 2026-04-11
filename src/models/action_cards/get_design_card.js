export default class GetDesignCard {
  static play(id, game) {
    const currentPlayer = game.getCurrentPlayer();
    const designCard = game.getDesignCardFromBank();

    currentPlayer.addDesignCard(designCard);
    currentPlayer.removeActionCard(id);

    game.storeLastAction("GET_DESIGN_CARD", currentPlayer);

    return { message: "design card added", card: designCard };
  }
}
