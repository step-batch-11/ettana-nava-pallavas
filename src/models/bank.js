import { shuffle as defaultShuffle } from "@std/random";

export class Bank {
  #designCards;
  #actionCards;
  #tokens = 55;
  #tiles = [{ value: 1, playerId: null }, { value: 6, playerId: null }]; //random
  #yarns = [1, 2, 3, 4, 5];

  constructor(designCards = [], actionCards = [], shuffle = defaultShuffle) {
    this.#designCards = shuffle(designCards);
    this.#actionCards = shuffle(actionCards);
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
}
