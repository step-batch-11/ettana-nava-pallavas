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

  buyDesignCard() {
    if (this.#designCards.length === 0) {
      throw new Error("No more design cards are remaining");
    }

    this.#tokens += this.#designCardCost;
    return this.#designCards.shift();
  }

  getDesignCard() {
    if (this.#designCards.length === 0) {
      throw new Error("No more design cards are remaining");
    }

    return this.#designCards.shift();
  }

  exchangeDesignCard(card) {
    if (this.#designCards.length === 0) {
      throw new Error("No more design cards are remaining");
    }

    this.#designCards.push(card);
    return this.#designCards.shift();
  }

  #randomInRange(min, max) {
    return Math.round(this.#randomFn() * (max - min) + min);
  }

  getActionCard() {
    const index = this.#randomInRange(0, 11);
    return this.#actionCards[index];
  }

  buyActionCard() {
    this.#tokens += this.#actionCardCost;
    return this.getActionCard();
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

  exchangeYarn(yarn, index) {
    return this.#yarns.splice(index, 1, yarn)[0];
  }

  exchangeTile(tile, index) {
    return this.#tiles.splice(index, 1, tile)[0];
  }
}
