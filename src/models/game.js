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

  getGameState() {
    return {
      players: this.#players,
      bank: this.#bank,
      board: this.#board.getState(),
      diceValue: this.#diceValue,
      currentPlayerId: this.#players[this.#currentPlayerIndex].id,
    };
  }

  getCurrentPlayerId() {
    return this.#players[this.#currentPlayerIndex].id;
  }
}
