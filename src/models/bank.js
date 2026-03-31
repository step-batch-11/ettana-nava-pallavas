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

  buyDesignCard() {
    if (this.#designCards.length === 0) {
      throw new Error("No more design cards are remaining");
    }

    this.#tokens += 3;
    return this.#designCards.splice(0, 1)[0];
  }
}
