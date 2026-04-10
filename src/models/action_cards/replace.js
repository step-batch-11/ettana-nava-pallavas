export default class Replace {
  static play(played, _id, game) {
    played["replace"] = true;
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

    game.storeLastAction(`REPLACE_${type.toUpperCase()}`, currentPlayer);
    return { message: `${type} changed with reserved` };
  };
}
