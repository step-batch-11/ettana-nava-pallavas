import {
  computeExpense,
  createLedger,
  distributeTokens,
  extractPlayersPositions,
  mapAdjacentYarns,
} from "../utils/color_dice_action.js";

export default class TurnManager {
  #game;
  #randomFn;
  destinations;

  constructor(game, randomFn = Math.random) {
    this.#game = game.getGameState();
    this.#randomFn = randomFn;
  }

  #randomInRange(min, max) {
    return Math.floor(this.#randomFn() * max) + min;
  }

  rollDice() {
    const colorId = this.#randomInRange(1, 6);
    const number = this.#randomInRange(1, 6);
    return { number, colorId };
  }

  #getPlayerById(id) {
    return this.#game.players.find((player) => player.id === id);
  }

  #getTile(point) {
    return this.#game.board.tiles[point.x][point.y];
  }

  #getPlayerPosition(playerId) {
    const player = this.#game.players.find((player) => player.id === playerId);
    return player.getPosition();
  }

  processColorAction(colorId, bank) {
    const bankData = bank.getBank();
    if (colorId === 6) {
      if (bankData.availableActionCards <= 0) {
        return;
      }
      const currentPlayer = this.#getPlayerById(this.#game.currentPlayerId);
      const actionCard = bank.getActionCard();
      currentPlayer.addActionCard(actionCard);
      return;
    }

    const playersPositions = extractPlayersPositions(this.#game.players);
    const adjYarns = mapAdjacentYarns(
      playersPositions,
      this.#game.board.yarns,
    );
    const ledger = createLedger(adjYarns, colorId);
    const totalTokens = computeExpense(ledger);
    if (bankData.tokens < totalTokens) {
      return;
    }
    distributeTokens(ledger, this.#game.players);
    bank.deductTokens(totalTokens);
  }
}
