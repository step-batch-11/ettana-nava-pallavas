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
    this.#players.forEach((player) => {
      const token = this.#bank.deductTokens(2);
      const designCard = this.#bank.getDesignCard();
      const actionCard = this.#bank.getActionCard();
      player.addDesignCard(designCard);
      player.addActionCard(actionCard);
      player.creditTokens(token);
    });
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

  claimDesign(designCardId) {
    const designCard = this.#players[this.#currentPlayerIndex]
      .getDc().find((
        { id },
      ) => id === Number(designCardId));


    const { yarns } = this.#board.getState();

    return this.#board.matchPattern(yarns, designCard.design);
  }

  getGameState() {
    return {
      players: this.#players.map((player) => player.getPlayerData()),
      bank: this.#bank.getBank(),
      board: this.#board.getState(),
      diceValue: this.#diceValue,
      currentPlayerId: this.#players[this.#currentPlayerIndex].id,
      deck: {
        actionCards: this.#players[this.#currentPlayerIndex].getAc(),
        designCards: this.#players[this.#currentPlayerIndex].getDc(),
      },
    };
  }

  getCurrentPlayerId() {
    return this.#players[this.#currentPlayerIndex].id;
  }
}
