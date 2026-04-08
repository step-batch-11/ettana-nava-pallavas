import { findRoutes } from "../utils/find_routes.js";
import { isValidPosition } from "../utils/common.js";
import {
  doesPatternMatch,
  generatePatternGrid,
  rotate,
} from "../utils/pattern_match.js";

export default class Board {
  #tiles;
  #yarns;

  constructor(tiles, yarns) {
    this.#tiles = tiles;
    this.#yarns = yarns;
  }

  getYarns() {
    return structuredClone(this.#yarns);
  }

  findPossibleDestinations(currentPlayer, players, totalSteps) {
    const start = currentPlayer.getPosition();

    const playerData = players.map((player) => player.getPlayerData());
    const routes = findRoutes(start, totalSteps, this.#tiles, playerData);

    this.destinations = routes;
    return this.destinations;
  }

  getTiles() {
    return structuredClone(this.#tiles);
  }

  getState() {
    return { tiles: this.#tiles, yarns: this.#yarns };
  }

  #getYarnColor({ x, y }) {
    return this.#yarns[x][y];
  }

  swapYarns(source, destination) {
    const boardYarns = this.#yarns;

    if (
      !isValidPosition(source, boardYarns) ||
      !isValidPosition(destination, boardYarns)
    ) {
      throw new Error("Invalid position");
    }
    const sourceYarnColor = this.#getYarnColor(source);
    const destYarnColor = this.#getYarnColor(destination);

    boardYarns[destination.x][destination.y] = sourceYarnColor;
    boardYarns[source.x][source.y] = destYarnColor;
  }

  getAdjYarnsPositions(pinPosition) {
    const yarns = [
      { x: pinPosition.x - 1, y: pinPosition.y - 1 },
      { x: pinPosition.x - 1, y: pinPosition.y },
      { x: pinPosition.x, y: pinPosition.y - 1 },
      { x: pinPosition.x, y: pinPosition.y },
    ];

    return yarns.filter((yarn) => isValidPosition(yarn, this.#yarns));
  }

  matchPattern(yarns, pattern) {
    let grid = generatePatternGrid(pattern);
    for (let count = 0; count < 4; count++) {
      const matches = doesPatternMatch(yarns, grid);
      if (matches) return { isMatched: true, matches };
      grid = rotate(grid);
    }

    return { isMatched: false };
  }

  getTileValue({ x, y }) {
    return this.#tiles[x][y];
  }

  changeTileValue({ x, y }, value) {
    this.#tiles[x][y] = value;
    return value;
  }

  getYarnColorId({ x, y }) {
    return this.#yarns[x][y];
  }

  changeYarnColorId({ x, y }, value) {
    this.#yarns[x][y] = value;
    return value;
  }
}
