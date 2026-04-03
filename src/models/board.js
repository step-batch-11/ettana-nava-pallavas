import { findRoutes } from "../utils/find_routes.js";

export default class Board {
  #tiles;
  #yarns;

  constructor(tiles, yarns) {
    this.#tiles = tiles;
    this.#yarns = yarns;
  }

  findPossibleDestinations(currentPlayer, players, totalSteps) {
    const start = currentPlayer.getPosition();

    const playerData = players.map((player) => player.getPlayerData());
    const routes = findRoutes(start, totalSteps, this.#tiles, playerData);

    this.destinations = routes;
    return this.destinations;
  }

  getYarns() {
    return structuredClone(this.#yarns);
  }

  getTiles() {
    return structuredClone(this.#tiles);
  }

  getBank() {
    return { tiles: this.#tiles, yarns: this.#yarns };
  }
}
