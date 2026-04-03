import { shuffle } from "@std/random";

export default class Bank {
  #designCards;
  #actionCards;
  #tokens = 55;
  #tiles = [1, 6];
  #yarns = [1, 2, 3, 4, 5];
  #initialToken;
  #designCardCost;
  #actionCardCost;
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
    this.#initialToken = 2;
    this.#designCardCost = 3;
    this.#actionCardCost = 2;
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

  distributeInitialAssets(players) {
    if (!players.some((player) => player.tokens !== 0)) {
      players.forEach((player) => {
        player.tokens += this.deductTokens(2);
        player.designCards.push(this.#designCards.shift());
        player.actionCards.push(this.getActionCard());
      });
    }
  }
}
