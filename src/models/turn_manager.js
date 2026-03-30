export class TurnManager {
  #game;

  constructor(game) {
    this.#game = game;
  }

  #processTilePenalty(tile, payer) {
    const payee = this.#game.players.find((player) =>
      player.id === tile.playerId
    );

    payer.tokens -= 1;
    payee.tokens += 1;

    return payee.id;
  }

  traversePathTile(currentPlayer, path) {
    const payees = [];

    for (const step of path) {
      const tile = this.#game.board.tiles[step.x][step.y];

      if (tile.playerId !== null && tile.playerId !== currentPlayer.id) {
        const payee = this.#processTilePenalty(tile, currentPlayer);

        payees.push(payee);
      }
    }
    return { payerTokens: currentPlayer.tokens, payees };
  }
}
