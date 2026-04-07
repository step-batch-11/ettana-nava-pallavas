export default class Replace {
  static play(played, id, game) {
    played["replace"] = true;
    const currentPlayer = game.getCurrentPlayer();

    if (!currentPlayer.haveActionCard(id)) {
      throw new Error("Card is missing");
    }

    const availableDestinations = game.getChangeAbleTiles();

    return {
      state: game.getGameState(),
      result: {
        availableDestinations,
        message: "Choose tiles to replace",
      },
    };
  }

  static isPlayed(played) {
    if (!played["replace"]) {
      throw new Error("You did not play replace action card");
    }
  }

  static performAction = (payload, currentPlayer, played, game) => {
    Replace.isPlayed(played);

    const boardTileValue = game.getBoardTileValue(payload.source);
    const bankTileValue = game.getBankTileValue(payload.destination);
    game.changeBoardTileValue(payload.source, bankTileValue);
    game.changeBankTileValue(payload.destination, boardTileValue);

    currentPlayer.removeActionCard(payload.cardId);
    delete played.replace;

    return {
      state: game.getGameState(),
      result: {
        message: "Tiles changed with reserved",
      },
    };
  };
}
