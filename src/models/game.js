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

  distributeInitialAssets() {
    this.#bank.distributeInitialAssets(this.#players);
  }

  buyDesignCard() {
    const currentPlayer = this.#players[this.#currentPlayerIndex];
    if (currentPlayer.tokens < 3) return "NOT_ENOUGH_TOKEN";

    currentPlayer.tokens -= 3;
    const card = this.#bank.buyDesignCard();
    currentPlayer.designCards.push(card);
  }

  buyActionCard() {
    const currentPlayer = this.#players[this.#currentPlayerIndex];
    if (currentPlayer.tokens < 2) return "NOT_ENOUGH_TOKEN";

    currentPlayer.tokens -= 2;
    const card = this.#bank.buyActionCard();
    currentPlayer.actionCards.push(card);
    return card;
  }

  claimDesign(designCardId) {
    const design = this.#players[this.#currentPlayerIndex].find(({ id }) =>
      id === designCardId
    );
    const { yarns } = this.#board.getState();

    return this.#board.matchDesign(yarns, design);
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
