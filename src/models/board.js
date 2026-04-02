export default class Board {
  #tiles;
  #yarns;

  constructor(tiles, yarns) {
    this.#tiles = tiles;
    this.#yarns = yarns;
  }

  getState() {
    return { tiles: this.#tiles, yarns: this.#yarns };
  }
}
