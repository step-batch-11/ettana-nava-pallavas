export default class Replace {
  static play(played, id, game) {
    played["replace"] = true;
    const currentPlayer = game.getCurrentPlayer();

    if (!currentPlayer.haveActionCard(id)) {
      throw new Error("Card is missing");
    }

    const boardTiles = game.getChangeAbleTiles();
    const boardYarns = game.getAllYarns();

    const { reservedTiles, reservedYarns } = game.getReserveElementsFromBank();

    return {
      boardTiles,
      boardYarns,
      reservedTiles,
      reservedYarns,
      message: "Choose tiles to replace",
    };
  }

  static isPlayed(played) {
    if (!played["replace"]) {
      throw new Error("You did not play replace action card");
    }
  }

  static performAction = (payload, currentPlayer, played, game) => {
    Replace.isPlayed(played);
    const { cardId, type, position, reservePosition } = payload;

    type === "tile"
      ? game.replaceTile(position, reservePosition)
      : game.replaceYarn(position, reservePosition);

    currentPlayer.removeActionCard(cardId);
    delete played.replace;

    return { message: `${type} changed with reserved` };
  };
}
