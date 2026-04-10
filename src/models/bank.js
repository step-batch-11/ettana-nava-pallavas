export default class Bank {
  #designCards;
  #actionCards;
  #tiles;
  #tokens = 55;
  #yarns = [1, 2, 3, 4, 5];
  #randomFn;

  constructor(
    designCards = [],
    actionCards = [],
    tiles = [1, 6],
    randomFn = Math.random,
  ) {
    this.#designCards = designCards;
    this.#actionCards = actionCards;
    this.#randomFn = randomFn;
    this.#tiles = tiles;
  }

  #randomInRange(min, max) {
    return Math.round(this.#randomFn() * (max - min) + min);
  }

  getTokens() {
    return this.#tokens;
  }

  getReserveElements() {
    return { reservedTiles: this.#tiles, reservedYarns: this.#yarns };
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

  deductTokens(n) {
    if (this.#tokens < n) {
      throw new Error("No tokens remaining in the bank");
    }

    this.#tokens -= n;
    return n;
  }

  incrementTokens(n) {
    this.#tokens += n;
    return n;
  }

  getActionCard() {
    const index = this.#randomInRange(0, this.#actionCards.length - 1);
    return this.#actionCards[index];
  }

  getDesignCard() {
    if (this.#designCards.length === 0) {
      throw new Error("No more design cards are remaining");
    }

    return this.#designCards.shift();
  }

  getTileValue(index) {
    return this.#tiles[index];
  }

  changeTileValue(index, value) {
    this.#tiles.splice(index, 1, value);
  }

  getYarnColorId(index) {
    return this.#yarns[index];
  }

  changeYarnColorId(index, value) {
    this.#yarns.splice(index, 1, value);
  }

  pushDesignCard(card) {
    this.#designCards.push(card);
  }
}
