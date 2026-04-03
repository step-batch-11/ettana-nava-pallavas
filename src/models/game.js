import { areYarnsSwappable } from "../utils/yarns.js";

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
      .designCards.find((
        { id },
      ) => id === Number(designCardId));

    const { yarns } = this.#board.getState();

    return this.#board.matchPattern(yarns, designCard.design);
  }

  getGameState() {
    return {
      players: this.#players,
      bank: this.#bank,
      board: this.#board,
      diceValue: this.#diceValue,
      currentPlayerId: this.#players[this.#currentPlayerIndex].id,
    };
  }

  getCurrentPlayerId() {
    return this.#players[this.#currentPlayerIndex].id;
  }

  #getPlayerById(id) {
    return this.#players.find((player) => player.id === id);
  }

  #getCurrentPlayer() {
    return this.#players[this.#currentPlayerIndex];
  }

  #processPathPenalty(payer, payees) {
    return payees.map((payeeId) => {
      const payee = this.#getPlayerById(payeeId);
      payee.creditTokens(1);
      payer.debitTokens(1);
      return { payeeId, tokens: payee.tokens };
    });
  }

  #isValidDestination({ x, y }) {
    const destinations = this.#board.destinations;

    return destinations.some(
      ({ destination }) => destination.x === x && destination.y === y,
    );
  }

  move(route) {
    const currentPlayer = this.#getCurrentPlayer();
    const currentPosition = currentPlayer.getPosition();
    const destination = route.destination;

    let payees;
    if (this.#isValidDestination(destination)) {
      if (route.type === "premium") {
        payees = this.#processPathPenalty(currentPlayer, route.recipients);
      }

      currentPlayer.move(destination);
      return { source: currentPosition, destination, payees };
    }

    return { source: currentPosition, destination: currentPosition };
  }

  freeSwap(source, destination) {
    const currentPosition = (this.#getCurrentPlayer()).getPosition();
    const currPlayerAdjYarns = this.#board.getAdjYarnsPositions(
      currentPosition,
    );

    if (!areYarnsSwappable(source, destination, currPlayerAdjYarns)) {
      throw new Error("You can't swap these yarns");
    }

    this.#board.swapYarns(source, destination);
  }

  purchaseSwap() {
    const swapCost = 3;
    const currentPlayer = this.#getCurrentPlayer();
    if (currentPlayer.getTokens() < swapCost) {
      throw new Error("You don't have enough tokens")
    }
    currentPlayer.debitTokens(swapCost);
  }

}
