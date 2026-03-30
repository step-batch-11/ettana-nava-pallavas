export class Bank {
  #designCards;
  #actionCards;
  #tokens = 55;
  #tiles = [1, 2];
  #yarns = [1, 2, 3, 4, 5];

  constructor(designCards, actionCards, shuffleFn = this.#shuffle) {
    this.#designCards = shuffleFn(designCards);
    this.#actionCards = shuffleFn(actionCards);
    this.#yarns = shuffleFn(this.#yarns);
  }

  #shuffle(patterns) {
    const shuffled = [...patterns];

    for (let pointer = 0; pointer < shuffled.length; pointer++) {
      const randomIndex = Math.floor(Math.random() * patterns.length);
      const temp = shuffled[randomIndex];
      shuffled[randomIndex] = shuffled[pointer];
      shuffled[pointer] = temp;
    }
    return { ...shuffled };
  }

  getBank() {
    return {
      tokens: this.#tokens,
      availableDesignCards: this.#designCards,
      availableActionCards: this.#actionCards,
      yarns: this.#yarns,
      tiles: this.#tiles,
    };
  }
}
