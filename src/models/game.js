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

  distributeInitalAssets() {
    this.#bank.distributeInitialAssets(this.#players);
  }

  buyDesignCard() {
    const currentPlayer = this.#players[this.#currentPlayerIndex];
    if (currentPlayer.tokens < 3) return "NOT_ENOUGH_TOKEN";

    currentPlayer.tokens -= 3;
    const card = this.#bank.getDesignCard();
    this.#bank.incrementTokens(3);
    currentPlayer.designCards.push(card);
  }

  buyActionCard() {
    const currentPlayer = this.#players[this.#currentPlayerIndex];
    if (currentPlayer.tokens < 2) return "NOT_ENOUGH_TOKEN";

    currentPlayer.tokens -= 2;
    const card = this.#bank.getActionCard();
    this.#bank.incrementTokens(2);
    currentPlayer.actionCards.push(card);
    return card;
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
