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

  #getPlayerById(id) {
    return this.#players.find((player) => player.getId() === id);
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
      throw new Error("You don't have enough tokens");
    }
    currentPlayer.debitTokens(swapCost);
  }
}
