import { createLedger, findAdjacentYarns } from "../utils/color_dice_action.js";
import { areYarnsSwappable } from "../utils/yarns.js";
import { getPlayerById } from "../utils/util.js";
import { areSamePositions, isValidMove } from "../utils/common.js";
import { rotateDesign } from "../utils/pattern_match.js";

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
    this.#currentPlayerIndex = currentPlayerIndex || 0;
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
    this.#diceValue = diceValues;
    this.destinations = this.#board.findPossibleDestinations(
      currentPlayer,
      this.#players,
      diceValues.number,
    );

    this.distributeAssets(diceValues, currentPlayer);
    return { diceValues, destinations: this.destinations };
  }

  buyDesignCard() {
    const currentPlayer = this.#players[this.#currentPlayerIndex];
    if (currentPlayer.getTokens() < 3) throw new Error("NOT_ENOUGH_TOKEN");

    const card = this.#bank.getDesignCard();
    currentPlayer.debitTokens(3);
    this.#bank.incrementTokens(3);
    currentPlayer.addDesignCard(card);
  }

  buyActionCard() {
    const currentPlayer = this.#players[this.#currentPlayerIndex];
    if (currentPlayer.getTokens() < 2) throw new Error("NOT_ENOUGH_TOKEN");

    const card = this.#bank.getActionCard();
    currentPlayer.debitTokens(2);
    this.#bank.incrementTokens(2);
    currentPlayer.addActionCard(card);
    return card;
  }

  claimDesign(designCardId) {
    const currentPlayer = this.getCurrentPlayer();
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

  getGameState(id = 1) {
    return {
      players: this.#players.map((player) => player.getPlayerData()),
      bank: this.#bank.getBank(),
      board: this.#board.getState(),
      diceValue: this.#diceValue,
      currentPlayerId: this.#players[this.#currentPlayerIndex].getId(),
      deck: {
        actionCards: getPlayerById(this.#players, id).getAc(),
        designCards: getPlayerById(this.#players, id).getDc(),
      },
    };
  }

  getCurrentPlayerId() {
    return this.#players[this.#currentPlayerIndex].getId();
  }

  getOpponents() {
    return this.#players.toSpliced(this.#currentPlayerIndex, 1);
  }

  getBoard() {
    return this.#board;
  }

  getBank() {
    return this.#bank;
  }

  creditToBank(tokens) {
    return this.#bank.incrementTokens(tokens);
  }

  debitFromBank(tokens) {
    return this.#bank.deductTokens(tokens);
  }

  getDesignCardFromBank() {
    return this.#bank.getDesignCard();
  }

  swapYarns(source, destination) {
    return this.#board.swapYarns(source, destination);
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

  getChangeAbleTiles() {
    const changeAbleTiles = [];
    const occupiedPositions = this.getPlayersPositions();
    const tiles = this.#board.getTiles();

    for (let row = 1; row < tiles.length - 1; row++) {
      for (let col = 1; col < tiles[row].length - 1; col++) {
        const isOccupied = occupiedPositions.some(({ x, y }) =>
          row === x && col === y
        );
        if (!isOccupied) {
          changeAbleTiles.push([row, col]);
        }
      }
    }

    return changeAbleTiles;
  }

  getAllYarns() {
    return this.#board.getYarns();
  }

  filterOpponents(predicate) {
    const opponents = this.getOpponents();

    return opponents.filter(predicate).map((player) => player.getId());
  }

  getCurrentPlayer() {
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

  move(route) {
    const currentPlayer = this.getCurrentPlayer();
    const currentPosition = currentPlayer.getPosition();
    const destination = route.destination;

    if (!isValidMove(destination, this.destinations || [])) {
      throw new Error("not a valid move");
    }

    let payees;
    if (route.type === "premium") {
      payees = this.#processPathPenalty(currentPlayer, route.recipients);
    }

    currentPlayer.move(destination);
    const moveResult = { source: currentPosition, destination, payees };
    const adjYarns = this.#board.getAdjYarnsPositions(moveResult.destination);
    const swappableYarns = adjYarns.length > 1 ? adjYarns : [];

    return { adjYarns: swappableYarns, moveResult };
  }

  freeSwap(source, destination) {
    const currentPosition = this.getCurrentPlayer().getPosition();
    const currPlayerAdjYarns = findAdjacentYarns(currentPosition);

    if (!areYarnsSwappable(source, destination, currPlayerAdjYarns)) {
      throw new Error("You can't swap these yarns");
    }

    this.#board.swapYarns(source, destination);
  }

  paidSwap(source, destination) {
    const swapCost = 3;
    const currentPlayer = this.getCurrentPlayer();
    if (
      currentPlayer.getTokens() < swapCost ||
      areSamePositions(source, destination)
    ) {
      throw new Error("You don't have enough tokens");
    }
    this.#board.swapYarns(source, destination);
    currentPlayer.debitTokens(swapCost);
  }
  getPlayerById(id) {
    return this.#players.find((player) => player.getId() === Number(id));
  }

  getBoardTileValue(position) {
    return this.#board.getTileValue(position);
  }

  getBankTileValue(position) {
    return this.#bank.getTileValue(position);
  }

  changeBoardTileValue(position, value) {
    return this.#board.changeTileValue(position, value);
  }

  changeBankTileValue(position, value) {
    return this.#bank.changeTileValue(position, value);
  }

  rotatePattern(designCardId) {
    const currentPlayer = this.getCurrentPlayer();
    const designCard = currentPlayer
      .getDc()
      .find(({ id }) => id === Number(designCardId));
    const rotatedDesign = rotateDesign(designCard.design);
    designCard.design = rotatedDesign;

    return { state: this.getGameState() };
  }
}
