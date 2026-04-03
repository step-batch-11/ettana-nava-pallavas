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

  getState() {
    return { tiles: this.#tiles, yarns: this.#yarns };
  }

  matchPattern(yarns, pattern) {
    let grid = generatePatternGrid(pattern);
    for (let count = 0; count < 4; count++) {
      const matches = doesPatternMatch(yarns, grid);
      if (matches) return matches;
      grid = rotate(grid);
    }

    return null;
  }
}
