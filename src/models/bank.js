import { shuffle } from "@std/random";

export default class Bank {
  #designCards;
  #actionCards;
  #tokens = 55;
  #tiles = [{ value: 1, playerId: null }, { value: 6, playerId: null }]; //random
  #yarns = [1, 2, 3, 4, 5];

  constructor(designCards = [], actionCards = [], shuffleFn = shuffle) {
    this.#designCards = shuffleFn(designCards);
    this.#actionCards = shuffleFn(actionCards);
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

  buyDesignCard() {
    if (this.#designCards.length === 0) {
      throw new Error("No more design cards are remaining");
    }

    this.#tokens += 3;
    return this.#designCards.shift();
  }

  buyActionCard() {
    if (this.#actionCards.length === 0) {
      throw new Error("No more action cards are remaining");
    }

    this.#tokens += 2;
    return this.#actionCards.shift();
  }

  #deductToken(n) {
    this.#tokens -= n;
    return n;
  }

  distributeInitialAssets(players) {
    players.forEach((player) => {
      player.tokens += this.#deductToken(2);
      player.designCards.push(this.#designCards.pop());
      player.actionCards.push(this.#actionCards.pop());
    });
  }
}
