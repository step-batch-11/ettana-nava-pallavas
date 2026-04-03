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
    if (currentPlayer.getTokens() < 3) return "NOT_ENOUGH_TOKEN";

    // currentPlayer.tokens -= 3;
    const card = this.#bank.getDesignCard();
    currentPlayer.debitTokens(3);
    this.#bank.incrementTokens(3);
    currentPlayer.addActionCard(card);
    return card;
  }

  buyActionCard() {
    const currentPlayer = this.#players[this.#currentPlayerIndex];
    if (currentPlayer.getTokens() < 2) return "NOT_ENOUGH_TOKEN";

    const card = this.#bank.getActionCard();
    currentPlayer.debitTokens(2);
    this.#bank.incrementTokens(2);
    currentPlayer.addActionCard(card);
    return card;
  }

  getGameState() {
    return {
      players: this.#players,
      bank: this.#bank,
      board: this.#board.getState(),
      diceValue: this.#diceValue,
      currentPlayerId: this.#players[this.#currentPlayerIndex].getId(),
    };
  }

  getCurrentPlayerId() {
    return this.#players[this.#currentPlayerIndex].getId();
  }

  #getOpponents() {
    return this.#players.toSpliced(this.#currentPlayerIndex, 1);
  }

  #findActionCard(currentPlayer, id) {
    const actionCards = currentPlayer.getAc();
    return actionCards.find((card) => card.id === Number(id));
  }

  #collectTax(otherPlayers) {
    const affectedPlayers = [];
    let collectedTax = 0;
    otherPlayers.forEach((player) => {
      if (player.getTokens() > 0) {
        affectedPlayers.push(player.getId());
        player.debitTokens(1);
        collectedTax++;
      }
    });
    return { collectedTax, affectedPlayers };
  }

  playTaxActionCard(id) {
    const currentPlayer = this.#players[this.#currentPlayerIndex];
    const card = currentPlayer.getActionCard(id);
    const otherPlayers = this.#getOpponents();
    const { collectedTax, affectedPlayers } = this.#collectTax(otherPlayers);

    this.#bank.incrementTokens(collectedTax);
    currentPlayer.removeActionCard(card);

    return {
      affectedPlayers,
      gameState: this.getGameState(),
    };
  }
}
