import { shuffle } from "@std/random";

export default class Bank {
  #designCards;
  #actionCards;
  #tokens = 55;
  #tiles = [1, 6];
  #yarns = [1, 2, 3, 4, 5];
  #randomFn;

  constructor(
    designCards = [],
    actionCards = [],
    shuffleFn = shuffle,
    randomFn = Math.random,
  ) {
    this.#designCards = shuffleFn(designCards);
    this.#actionCards = shuffleFn(actionCards);
    this.#randomFn = randomFn;
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

  getDesignCard() {
    if (this.#designCards.length === 0) {
      throw new Error("No more design cards are remaining");
    }

    return this.#designCards.shift();
  }

  #randomInRange(min, max) {
    return Math.round(this.#randomFn() * (max - min) + min);
  }

  getActionCard() {
    const index = this.#randomInRange(0, 11);
    return this.#actionCards[index];
  }

  deductTokens(n) {
    if (this.#tokens < n) {
      throw new Error("No tokens remainig in the bank");
    }

    this.#tokens -= n;
    return n;
  }

  incrementTokens(n) {
    this.#tokens += n;
    return n;
  }
}
