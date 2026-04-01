import { shuffle } from "@std/random";

export default class Bank {
  #designCards;
  #actionCards;
  #tokens = 55;
  #tiles = [{ value: 1, playerId: null }, { value: 6, playerId: null }];
  #yarns = [1, 2, 3, 4, 5];
  #shuffleFn;
  #actionCardsStore;

  constructor(designCards = [], actionCards = [], shuffleFn = shuffle) {
    this.#designCards = shuffleFn(designCards);
    this.#actionCards = shuffleFn(actionCards);
    this.#actionCardsStore = structuredClone(actionCards);
    this.#shuffleFn = shuffleFn;
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
      this.#actionCards.push(this.#shuffleFn(...this.#actionCardsStore));
    }

    this.#tokens += 2;
    return this.#actionCards.shift();
  }

  #deductToken(n) {
    this.#tokens -= n;
    return n;
  }

  distributeInitialAssets(players) {
    if (!players.some((player) => player.tokens !== 0)) {
      players.forEach((player) => {
        player.tokens += this.#deductToken(2);
        player.designCards.push(this.#designCards.pop());
        player.actionCards.push(this.#actionCards.pop());
      });
    }
  }
}
