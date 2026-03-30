export class Bank {
  #designCards;
  #actionCards;
  #tokens = 55;
  #tiles = [1, 2];
  #yarns = [1, 2, 3, 4, 5];

  constructor(dc = [], ac = [], shuffleFn = this.shuffle.bind(this)) {
    this.#designCards = shuffleFn(dc, this.randomFn);
    this.#actionCards = shuffleFn(ac, this.randomFn);
    this.#yarns = shuffleFn(this.#yarns);
  }

  randomFn(patterns) {
    return Math.floor(Math.random() * patterns.length);
  }

  shuffle(patterns, randomFn = this.randomFn.bind(this)) {
    const shuffled = [...patterns];

    for (let pointer = 0; pointer < shuffled.length; pointer++) {
      const randomIndex = randomFn(patterns);
      const temp = shuffled[randomIndex];
      shuffled[randomIndex] = shuffled[pointer];
      shuffled[pointer] = temp;
    }

    return shuffled;
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
