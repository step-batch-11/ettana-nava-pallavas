import { isValidMove } from "../utils/common.js";
import { findJumpableRoutes } from "../utils/find_routes.js";
import Game from "./game.js";

export default class GameSetup {
  #players;
  #bank;
  #board;
  #currentPlayerIndex;
  #rolledValues;
  #random;
  #turnsTaken;

  constructor(players, bank, board, rolledValues, randomFn = Math.random) {
    this.#turnsTaken = 0;
    this.state = "game-setup";
    this.#players = players;
    this.#bank = bank;
    this.#board = board;
    this.#currentPlayerIndex = 0;
    this.#rolledValues = rolledValues || [];
    this.#random = randomFn;
  }

  get playerCount() {
    return this.#players.length;
  }

  getCurrentPlayer() {
    return this.#players[this.#currentPlayerIndex];
  }

  getRolledValues() {
    return structuredClone(this.#rolledValues);
  }

  getPlayerById(id) {
    return this.#players.find((player) => player.getId() === Number(id));
  }

  getBoard() {
    return this.#board;
  }

  getGameState(id = 1) {
    return {
      players: this.#players.map((player) => player.getPlayerData()),
      currentPlayerId: this.getCurrentPlayer().getId(),
      board: this.#board.getState(),
      bank: this.#bank.getBank(),
      diceValues: this.diceValues,
      deck: {
        actionCards: this.getPlayerById(id).getAc(),
        designCards: this.getPlayerById(id).getDc(),
      },
    };
  }

  rollDice(max = 6, min = 1) {
    const number = Math.floor(this.#random() * (max - min)) + min;
    return { colorId: 6, number };
  }

  upkeep() {
    this.diceValues = this.rollDice();
    const diceValues = this.diceValues;

    const currentPlayerId = this.getCurrentPlayer().getId();
    this.#rolledValues.push({ [currentPlayerId]: diceValues.number });

    const tiles = this.#board.getTiles();
    const players = this.#players.map((player) => player.getPlayerData());
    const destinations = findJumpableRoutes(diceValues.number, tiles, players);
    this.destinations = destinations;

    return { diceValues, destinations, state: this.getGameState() };
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

  move({ destination }) {
    if (!isValidMove(destination, this.destinations)) {
      throw new Error("not a valid move");
    }

    const player = this.getCurrentPlayer();
    player.move(destination);

    return {
      adjYarns: [],
      moveResult: { source: player.getPosition(), destination },
    };
  }

  next() {
    this.#currentPlayerIndex = (this.#currentPlayerIndex + 1) %
      this.#players.length;

    if (this.#turnsTaken >= this.#players.length - 1) {
      this.distributeInitialAssets();

      return new Game(this.#players, this.#bank, this.#board, this.diceValues);
    }

    this.#turnsTaken++;

    return this;
  }
}
