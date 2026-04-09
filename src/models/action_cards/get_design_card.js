export default class GetDesignCard {
  static play(id, game) {
    const currentPlayer = game.getCurrentPlayer();
    const designCard = game.getDesignCardFromBank();

    currentPlayer.addDesignCard(designCard);
    currentPlayer.removeActionCard(id);

    return { message: "design card added", card: designCard };
  }
}
