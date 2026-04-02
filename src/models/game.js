export class Game {
  #players;
  #bank;
  #board;
  #diceValue;
  constructor(players, bank, board, diceValue) {
    this.#players = players;
    this.#bank = bank;
    this.#board = board;
    this.#diceValue = diceValue;
  }
}
