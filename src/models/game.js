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
    const currentPlayer = this.#getCurrentPlayer();
    const designCard = currentPlayer
      .getDc()
      .find((
        { id },
      ) => id === Number(designCardId));

    const { yarns } = this.#board.getState();

    const status = this.#board.matchPattern(yarns, designCard.design);
    if (status.isMatched) {
      currentPlayer.updateVp(designCard.victoryPoints);
      currentPlayer.removeDesignCard(designCard);
    }
    return status;
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
}
