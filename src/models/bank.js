import { shuffle } from "../utils.js";

export class Bank {
  #designCards;
  #actionCards;
  #tokens = 55;
  #tiles = [1, 2];
  #yarns = [1, 2, 3, 4, 5];

  constructor(dc = [], ac = [], shuffleFn = shuffle) {
    this.#designCards = shuffleFn(dc, this.randomFn);
    this.#actionCards = shuffleFn(ac, this.randomFn);
    this.#yarns = shuffleFn(this.#yarns);
  }

  getBank() {
    return {
      tokens: this.#tokens,
      availableDesignCards: this.#designCards.length,
      availableActionCards: this.#actionCards.length,
      yarns: this.#yarns,
      tiles: this.#tiles,
    };
  }

  #deductToken(n) {
    this.#tokens -= n;
    return n;
  }

  distributeInitialAssets(players) {
    players.forEach((player) => {
      player.token += this.#deductToken(2);
      player.designCards.push(this.#designCards.pop());
      player.actionCards.push(this.#designCards.pop());
    });
  }
}
