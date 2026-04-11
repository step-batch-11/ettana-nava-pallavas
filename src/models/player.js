import { randomBw } from "../utils/common.js";

export default class Player {
  #vp;
  #tokens;
  #dc;
  #ac;
  #position;
  #pinColor;
  #id;
  #name;

  constructor(id, name) {
    this.#id = id;
    this.#name = name;
    this.#vp = 0;
    this.#tokens = 0;

    this.#dc = [];
    this.#ac = [];

    this.#position = { x: -1, y: -1 };
  }

  assignRoomId(id) {
    this.roomId = id;
  }

  getRoomId() {
    return this.roomId;
  }

  updateVp(n) {
    this.#vp += n;
  }

  getVp() {
    return this.#vp;
  }

  creditTokens(tokens) {
    this.#tokens += tokens;
  }

  debitTokens(tokens) {
    if (this.#tokens - tokens < 0) return;

    this.#tokens -= tokens;
  }

  getTokens() {
    return this.#tokens;
  }

  getName() {
    return this.#name;
  }

  addDesignCard(card) {
    this.#dc.push(card);
  }

  addAllDesignCardDev(...card) {
    this.#dc.push(...card);
  }
  addAllActionCardDev(...card) {
    this.#ac.push(...card);
  }

  addActionCard(card) {
    this.#ac.push(card);
  }

  getAc() {
    return structuredClone(this.#ac);
  }

  getDc() {
    return this.#dc;
  }

  #findCardIndex(container, target) {
    return container.findIndex((card) => card.id === target);
  }

  #haveCard(cards, cardId) {
    return cards.some((card) => card.id === cardId);
  }

  haveActionCard(id) {
    return this.#haveCard(this.#ac, Number(id));
  }

  haveDesignCard(id) {
    return this.#haveCard(this.#dc, Number(id));
  }

  removeActionCard(cardId) {
    if (!this.#ac.length || !this.haveActionCard(Number(cardId))) return;

    const cardIndex = this.#findCardIndex(this.#ac, Number(cardId));
    this.#ac.splice(cardIndex, 1);
  }

  removeDesignCard(cardId) {
    if (!this.#dc.length || !this.haveDesignCard(cardId)) return;

    const cardIndex = this.#findCardIndex(this.#dc, cardId);
    return this.#dc.splice(cardIndex, 1);
  }

  getPlayerData() {
    return {
      playerId: this.#id,
      name: this.#name,
      tokens: this.#tokens,
      dc: this.#dc.length,
      ac: this.#ac.length,
      pinColor: this.#pinColor,
      position: this.#position,
      vp: this.#vp,
    };
  }

  getPosition() {
    return structuredClone(this.#position);
  }

  getId() {
    return this.#id;
  }

  getActionCard(id) {
    const card = this.#ac.find((card) => card.id === Number(id));

    if (!card) {
      throw new Error("Action card is missing");
    }

    return card;
  }

  #setPosition(x, y) {
    this.#position.x = x;
    this.#position.y = y;
  }

  setup(pinColor, { x, y }) {
    this.#pinColor = pinColor;
    this.#setPosition(x, y);
  }

  move({ x, y }) {
    this.#setPosition(x, y);
  }

  takeRandomCard() {
    const cards = this.getAc();
    if (cards.length === 0) throw new Error("Player has no cards");

    const randomId = randomBw(cards.length);
    const card = cards[randomId];

    this.removeActionCard(card.id);
    return card;
  }

  takeToken() {
    const tokens = this.getTokens();
    if (tokens === 0) throw new Error("Player has no tokens");

    if (tokens >= 2) {
      this.debitTokens(2);
      return 2;
    }

    this.debitTokens(1);
    return 1;
  }
}
