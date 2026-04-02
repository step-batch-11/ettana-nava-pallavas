import {
  computeExpense,
  createLedger,
  distributeTokens,
  extractPlayersPositions,
  mapAdjacentYarns,
} from "../utils/color_dice_action.js";
import { findRoutes } from "../utils/find_routes.js";
export default class TurnManager {
  #game;
  #randomFn;
  destinations;

  constructor(game, randomFn = Math.random) {
    this.#game = game;
    this.#randomFn = randomFn;
  }

  #randomInRange(min, max) {
    return Math.floor(this.#randomFn() * max) + min;
  }

  rollDice() {
    const colorId = this.#randomInRange(1, 6);
    const number = this.#randomInRange(1, 6);
    return { number, colorId };
  }

  findPossibleDestinations(totalSteps) {
    const currentPlayer = this.#getPlayerById(this.#game.currentPlayer);
    const start = currentPlayer.pin.position;

    const routes = findRoutes(start, totalSteps, this.#game.board.tiles);

    this.destinations = routes;
    return this.destinations;
  }

  #getPlayerById(id) {
    return this.#game.players.find((player) => player.id === id);
  }

  #getTile(point) {
    return this.#game.board.tiles[point.x][point.y];
  }

  #processPathPenalty(payer, payees) {
    return payees.map((payeeId) => {
      const payee = this.#getPlayerById(payeeId);
      payee.tokens++;
      payer.tokens--;
      return { payeeId, tokens: payee.tokens };
    });
  }

  #isValidDestination({ x, y }) {
    return this.destinations.some(
      ({ destination }) => destination.x === x && destination.y === y,
    );
  }

  #displacePin(currentPlayer, destination, currentPosition) {
    const destinationTile = this.#getTile(destination);
    const prePositionTile = this.#getTile(currentPosition);

    destinationTile.playerId = currentPlayer.id;
    prePositionTile.playerId = null;
  }

  move(route) {
    const currentPlayer = this.#getPlayerById(this.#game.currentPlayer);

    const currentPosition = currentPlayer.pin.position;
    const destination = route.destination;
    let payees;
    if (this.#isValidDestination(destination)) {
      if (route.type === "premium") {
        payees = this.#processPathPenalty(currentPlayer, route.recipients);
      }
      currentPlayer.pin.position = destination;
      this.#displacePin(currentPlayer, destination, currentPosition);

      return { source: currentPosition, destination, payees };
    }

    return { source: currentPosition, destination: currentPosition };
  }

  #getYarnColor({ x, y }) {
    return this.#game.board.yarns[x][y];
  }

  #isValidYarn({ x, y }, yarns) {
    const rows = yarns.length;
    const columns = yarns[0].length;

    return x >= 0 && x < rows && y >= 0 && y < columns;
  }

  getAdjYarnsPositions(pinPosition) {
    const yarns = [
      { x: pinPosition.x - 1, y: pinPosition.y - 1 },
      { x: pinPosition.x - 1, y: pinPosition.y },
      { x: pinPosition.x, y: pinPosition.y - 1 },
      { x: pinPosition.x, y: pinPosition.y },
    ];

    return yarns.filter((yarn) =>
      this.#isValidYarn(yarn, this.#game.board.yarns)
    );
  }

  #areSamePositions({ x: x1, y: y1 }, { x: x2, y: y2 }) {
    return x1 === x2 && y1 === y2;
  }

  #getPlayerPosition(playerId) {
    const player = this.#game.players.find((player) => player.id === playerId);
    return player.pin.position;
  }

  #swapYarns(source, destination) {
    const boardYarns = this.#game.board.yarns;
    const sourceYarnColor = this.#getYarnColor(source);
    const destYarnColor = this.#getYarnColor(destination);

    boardYarns[destination.x][destination.y] = sourceYarnColor;
    boardYarns[source.x][source.y] = destYarnColor;
  }

  #doesConsist(target, locations) {
    return locations.some((location) =>
      this.#areSamePositions(target, location)
    );
  }

  #areYarnsSwappable(source, destination, allSwappableYarns) {
    return !this.#areSamePositions(source, destination) &&
      this.#doesConsist(destination, allSwappableYarns) &&
      this.#doesConsist(source, allSwappableYarns);
  }

  freeSwap(source, destination) {
    const currentPosition = this.#getPlayerPosition(this.#game.currentPlayer);
    const currPlayerAdjYarns = this.getAdjYarnsPositions(currentPosition);

    if (this.#areYarnsSwappable(source, destination, currPlayerAdjYarns)) {
      this.#swapYarns(source, destination);

      return { success: true };
    }
    return { success: false };
  }

  processColorAction(colorId, bank) {
    const bankData = bank.getBank();
    if (colorId === 6) {
      if (bankData.availableActionCards <= 0) {
        return;
      }
      const currentPlayer = this.#getPlayerById(this.#game.currentPlayer);
      const actionCard = bank.getActionCard();
      currentPlayer.actionCards.push(actionCard);
      return;
    }

    const playersPositions = extractPlayersPositions(this.#game.players);
    const adjYarns = mapAdjacentYarns(
      playersPositions,
      this.#game.board.yarns,
    );
    const ledger = createLedger(adjYarns, colorId);
    const totalTokens = computeExpense(ledger);
    if (bankData.tokens < totalTokens) {
      return;
    }
    distributeTokens(ledger, this.#game.players);
    bank.deductTokens(totalTokens);
  }
}
