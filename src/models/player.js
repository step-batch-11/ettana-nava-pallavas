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

    this.#position = {};
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

  addDesignCard(card) {
    this.#dc.push(card);
  }

  addAllDesignCardDev(...card) {
    this.#dc.push(...card);
  }

  addActionCard(card) {
    this.#ac.push(card);
  }

  getAc() {
    return structuredClone(this.#ac);
  }

  getDc() {
    return structuredClone(this.#dc);
  }

  #findCardIndex(container, target) {
    return container.findIndex((card) => card.id === target.id);
  }

  removeActionCard(card) {
    if (this.#ac.length === 0) return;

    const cardIndex = this.#findCardIndex(this.#ac, card);
    this.#ac.splice(cardIndex, 1);
  }

  removeDesignCard(card) {
    if (this.#dc.length === 0) return;

    const cardIndex = this.#findCardIndex(this.#dc, card);
    this.#dc.splice(cardIndex, 1);
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
}
