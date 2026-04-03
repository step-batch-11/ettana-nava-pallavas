import { findRoutes } from "../utils/find_routes.js";
import { isValidPosition } from "../utils/common.js";

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

    const routes = findRoutes(
      start,
      totalSteps,
      this.#tiles,
      playerData,
    );

    this.destinations = routes;
    return this.destinations;
  }

  getState() {
    return { tiles: this.#tiles, yarns: this.#yarns };
  }

  #getYarnColor({ x, y }) {
    return this.#yarns[x][y];
  }

  swapYarns(source, destination) {
    const boardYarns = this.#yarns;
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
}
