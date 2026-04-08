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
  #destinations;

  constructor(players, bank, board, rolledValues = {}, randomFn = Math.random) {
    this.#turnsTaken = Object.keys(rolledValues).length || 0;
    this.state = "game-setup";
    this.#players = players;
    this.#bank = bank;
    this.#board = board;
    this.#currentPlayerIndex = 0;
    this.#rolledValues = rolledValues;
    this.#random = randomFn;
  }

  getPlayers() {
    return this.#players;
  }

  getCurrentPlayer() {
    return this.#players[this.#currentPlayerIndex];
  }

  getRolledValues() {
    return structuredClone(this.#rolledValues);
  }

  getPlayerById(id) {
    const current = this.#players.find((player) =>
      player.getId() === Number(id)
    );
    return current;
  }

  getGameState(id = 1) {
    const currentPlayerId = this.getCurrentPlayer().getId();
    const requesterDeck = {
      actionCards: this.getPlayerById(id).getAc(),
      designCards: this.getPlayerById(id).getDc(),
    };

    return {
      players: this.#players.map((player) => player.getPlayerData()),
      currentPlayerId,
      board: this.#board.getState(),
      bank: this.#bank.getBank(),
      diceValues: this.diceValues,
      deck: requesterDeck,
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
    this.#rolledValues[currentPlayerId] = diceValues.number;

    const tiles = this.#board.getTiles();
    const players = this.#players.map((player) => player.getPlayerData());
    const destinations = findJumpableRoutes(diceValues.number, tiles, players);
    this.#destinations = destinations;

    return { diceValues, destinations };
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
    if (!isValidMove(destination, this.#destinations)) {
      throw new Error("not a valid move");
    }

    const player = this.getCurrentPlayer();
    const previousPosition = player.getPosition();
    player.move(destination);

    return {
      adjYarns: [],
      moveResult: { source: previousPosition, destination },
    };
  }

  next() {
    this.#currentPlayerIndex = (this.#currentPlayerIndex + 1) %
      this.#players.length;

    if (this.#turnsTaken >= this.#players.length - 1) {
      const players = this.#players.toSorted((a, b) =>
        this.#rolledValues[b.getId()] - this.#rolledValues[a.getId()]
      );
      this.distributeInitialAssets();

      return new Game(players, this.#bank, this.#board, this.diceValues);
    }

    this.#turnsTaken++;

    return this;
  }
}
