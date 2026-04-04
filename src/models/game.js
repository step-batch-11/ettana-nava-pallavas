import { createLedger } from "../utils/color_dice_action.js";
import { areYarnsSwappable } from "../utils/yarns.js";
import { getPlayerById } from "../utils/util.js";
import {
  areSamePositions,
  randomBw,
  updatePlayerCards,
} from "../utils/common.js";

export default class Game {
  #players;
  #bank;
  #board;
  #diceValue;
  #currentPlayerIndex;
  #playerActions;

  constructor(
    players,
    bank,
    board,
    diceValue,
    randomFn = Math.random,
    currentPlayerIndex = 0,
  ) {
    this.#players = players;
    this.#bank = bank;
    this.#board = board;
    this.#diceValue = diceValue;
    this.#currentPlayerIndex = currentPlayerIndex;
    this.randomFn = randomFn;
    this.#playerActions = { isMoved: false };
  }

  distributeAssets({ colorId }, currentPlayer) {
    if (colorId === 6) {
      currentPlayer.addActionCard(this.#bank.getActionCard());
      return;
    }

    const ledger = createLedger(colorId, this.#players, this.#board.getYarns());
    const credit = Object.values(ledger).reduce((x, y) => x + y);
    if (this.#bank.getTokens() < credit) return;

    this.#players.forEach((player) => {
      const id = player.getId();
      this.#bank.deductTokens(ledger[id]);
      player.creditTokens(ledger[id]);
    });
    return;
  }

  rollDice() {
    const colorId = Math.floor(this.randomFn() * 6) + 1;
    const number = Math.floor(this.randomFn() * 6) + 1;

    return { number, colorId };
  }

  upkeep() {
    const currentPlayer = this.#players[this.#currentPlayerIndex];
    const diceValues = this.rollDice();

    this.destinations = this.#board.findPossibleDestinations(
      currentPlayer,
      this.#players,
      diceValues.number,
    );

    this.distributeAssets(diceValues, currentPlayer);
    return { diceValues, destinations: this.destinations };
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

    const card = this.#bank.getDesignCard();
    currentPlayer.debitTokens(3);
    this.#bank.incrementTokens(3);
    currentPlayer.addDesignCard(card);
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
      .find(({ id }) => id === Number(designCardId));

    const { yarns } = this.#board.getState();

    const status = this.#board.matchPattern(yarns, designCard.design);
    if (status.isMatched) {
      currentPlayer.updateVp(designCard.victoryPoints);
      currentPlayer.removeDesignCard(Number(designCardId));
    }
    return status;
  }

  getGameState() {
    return {
      players: this.#players.map((player) => player.getPlayerData()),
      bank: this.#bank.getBank(),
      board: this.#board.getState(),
      diceValue: this.#diceValue,
      currentPlayerId: this.#players[this.#currentPlayerIndex].getId(),
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

  getBoard() {
    return this.#board;
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
    if (!currentPlayer.haveActionCard(id)) {
      throw new Error("Card is missing");
    }
    const otherPlayers = this.#getOpponents();
    const { collectedTax, affectedPlayers } = this.#collectTax(otherPlayers);

    this.#bank.incrementTokens(collectedTax);
    currentPlayer.removeActionCard(id);

    return {
      result: { affectedPlayers, message: "Tax payed successfully" },
      state: this.getGameState(),
      message: "Tax action card played",
    };
  }

  swapYarnActionCard(source, destination) {
    const cardId = 25;
    const currentPlayer = this.#getCurrentPlayer();

    if (
      !currentPlayer.haveActionCard(cardId) ||
      areSamePositions(source, destination)
    ) {
      throw new Error("Player don't have this action card");
    }

    this.#board.swapYarns(source, destination);
    currentPlayer.removeActionCard(cardId);
  }

  getPlayersPositions() {
    return this.#players.map((player) => player.getPosition());
  }

  getPossibleDestinations() {
    const availableDestinations = [];
    const occupiedPositions = this.getPlayersPositions();
    const tiles = this.#board.getTiles();

    for (let row = 0; row < tiles.length; row++) {
      for (let col = 0; col < tiles[row].length; col++) {
        const isOccupied = occupiedPositions.some(({ x, y }) =>
          row === x && col === y
        );
        if (!isOccupied) {
          availableDestinations.push([row, col]);
        }
      }
    }

    return availableDestinations;
  }

  playMoveActionCard(id) {
    const currentPlayer = this.#players[this.#currentPlayerIndex];
    if (this.#playerActions.isMoved) {
      throw new Error("Already move action performed!");
    }

    if (!currentPlayer.haveActionCard(id)) {
      throw new Error("Don't have this action card");
    }

    const availableDestinations = this.getPossibleDestinations();

    // console.log(availableDestinations);

    currentPlayer.removeActionCard(id);
    this.#playerActions.isMoved = true;

    // const a = availableDestinations.map(([x,y]) => ({x,y}))

    return {
      result: { availableDestinations },
      state: this.getGameState(),
      message: "Move action card played",
    };
  }

  movePlayer(destination) {
    const currentPlayer = this.#players[this.#currentPlayerIndex];
    const source = currentPlayer.getPosition();
    currentPlayer.move(destination);
    return { source, destination };
  }

  #filterOpponents(filterFn) {
    const opponents = this.#getOpponents();

    return opponents.filter(filterFn).map((player) => player.getId());
  }

  playStealCard(id, filterFn) {
    const currentPlayer = this.#getCurrentPlayer();

    const card = currentPlayer.getActionCard(id);
    if (!card) throw new Error("player don't have card");

    const opponents = this.#filterOpponents(filterFn);

    return { result: opponents, state: this.getGameState() };
  }

  #takeRandomCard(player) {
    const cards = player.getAc();
    if (cards.length === 0) throw new Error("Player has no cards");

    const randomId = randomBw(cards.length);
    const card = cards[randomId];

    player.removeActionCard(card.id);
    return card;
  }

  stealActionCard(playerId) {
    const actionCardId = 22;
    const currentPlayer = this.#getCurrentPlayer();

    if (currentPlayer.getId() === playerId) {
      throw new Error("player cant take from himself");
    }

    const card = currentPlayer.getActionCard(actionCardId);

    const player = getPlayerById(this.#players, playerId);
    const newCard = this.#takeRandomCard(player);

    updatePlayerCards(currentPlayer, card, newCard);

    return { result: "stolen card", state: this.getGameState() };
  }

  #takeToken(player) {
    const tokens = player.getTokens();
    if (tokens === 0) throw new Error("Player has no tokens");

    if (tokens >= 2) {
      player.debitTokens(2);
      return 2;
    }

    player.debitTokens(1);
    return 1;
  }

  stealTokens(playerId) {
    const actionCardId = 10;
    const currentPlayer = this.#getCurrentPlayer();

    if (currentPlayer.getId() === playerId) {
      throw new Error("player cant take from himself");
    }

    currentPlayer.getActionCard(actionCardId);

    const player = getPlayerById(this.#players, playerId);
    const stolenTokens = this.#takeToken(player);

    currentPlayer.creditTokens(stolenTokens);
    player.removeActionCard(actionCardId);

    return { result: "stolen tokens", state: this.getGameState() };
  }

  #getCurrentPlayer() {
    return this.#players[this.#currentPlayerIndex];
  }

  #processPathPenalty(payer, payees) {
    return payees.map((payeeId) => {
      const payee = getPlayerById(this.#players, payeeId);
      payee.creditTokens(1);
      payer.debitTokens(1);
      return { payeeId, tokens: payee.tokens };
    });
  }

  #isValidDestination({ x, y }) {
    const destinations = this.#board.destinations || [];

    // console.log(this.#board);

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
    const currentPosition = this.#getCurrentPlayer().getPosition();
    const currPlayerAdjYarns = this.#board.getAdjYarnsPositions(
      currentPosition,
    );

    if (!areYarnsSwappable(source, destination, currPlayerAdjYarns)) {
      throw new Error("You can't swap these yarns");
    }

    this.#board.swapYarns(source, destination);
  }

  paidSwap(source, destination) {
    const swapCost = 3;
    const currentPlayer = this.#getCurrentPlayer();
    if (
      currentPlayer.getTokens() < swapCost ||
      areSamePositions(source, destination)
    ) {
      throw new Error("You don't have enough tokens");
    }
    this.#board.swapYarns(source, destination);
    currentPlayer.debitTokens(swapCost);
  }

  getDesignCardActionCard(id) {
    const currentPlayer = this.#players[this.#currentPlayerIndex];

    const actionCard = currentPlayer.getActionCard(id);

    const designCard = this.#bank.getDesignCard();
    currentPlayer.addDesignCard(designCard);
    currentPlayer.removeActionCard(actionCard);

    return {
      result: { message: "design card added" },
      state: this.getGameState(),
    };
  }

  playVictoryPoint(id) {
    const currentPlayer = this.#getCurrentPlayer();

    currentPlayer.removeActionCard(id);
    currentPlayer.updateVp(1);

    return {
      state: this.getGameState(),
      result: {
        message: "Victory point added to the deck",
      },
    };
  }

  playCollectToken(id) {
    const currentPlayer = this.#getCurrentPlayer();

    const tokens = this.#bank.deductTokens(3);
    currentPlayer.removeActionCard(id);
    currentPlayer.creditTokens(tokens);

    return {
      state: this.getGameState(),
      result: {
        message: "Tokens added",
      },
    };
  }
}
