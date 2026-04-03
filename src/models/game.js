import { add } from "../utils/arthimetic.js";
import { createLedger } from "../utils/color_dice_action.js";

export default class Game {
  #players;
  #bank;
  #board;
  #diceValue;
  #currentPlayerIndex;

  constructor(players, bank, board, diceValue) {
    this.#players = players;
    this.#bank = bank;
    this.#board = board;
    this.#diceValue = diceValue;
    this.#currentPlayerIndex = 0;
  }

  distributeAssets({ colorId }, currentPlayer) {
    if (colorId === 6) {
      currentPlayer.addActionCard(this.#bank.getActionCard());
      return;
    }

    const ledger = createLedger(colorId, this.#players, this.#board.getYarns());
    const credit = Object.keys(ledger).reduce(add);
    if (this.#bank.getTokens() < credit) return;

    this.#players.forEach((player) => {
      const id = player.getId();
      this.#bank.deductTokens(ledger[id]);
      player.creditTokens(ledger[id]);
    });
    return;
  }

  rollDice(randomFn = Math.random) {
    const colorId = Math.floor(randomFn() * 6) + 1;
    const number = Math.floor(randomFn() * 6) + 1;

    return { number, colorId };
  }

  upkeep() {
    const currentPlayer = this.#players[this.#currentPlayerIndex];
    const diceValue = this.rollDice();

    this.destinations = this.#board.findPossiblePaths(
      this.#players,
      currentPlayer,
      diceValue.number,
    );

    this.distributeAssets(diceValue, currentPlayer);
    return { diceValue, paths: this.destinations };
  }

  getGameState() {
    return {
      players: this.#players,
      bank: this.#bank.getBank(),
      board: this.#board.getState(),
      diceValue: this.#diceValue,
      currentPlayerId: this.#players[this.#currentPlayerIndex].id,
    };
  }
}
