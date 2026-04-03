export default class Player {
  #vp;
  #tokens;
  #dc;
  #ac;
  #position;
  #pinColor;

  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.#vp = 0;
    this.#tokens = 0;
    this.#dc = [];
    this.#ac = [];
  }

  incrementVp() {
    this.#vp++;
  } 

  getVp() {
    return this.#vp
  }

  creditTokens(tokens) {
    this.#tokens += tokens;
  }

  debitTokens(tokens) {
    this.#tokens -= tokens;
  }

  getTokens() {
    return this.#tokens;
  }

  addDesignCard(card) {
    this.#dc.push(card);
  }

  addActionCard(card) {
    this.#ac.push(card);
  }

  getAc() {
    return structuredClone(this.#ac)
  }

  getDc() {
    return structuredClone(this.#dc)
  }

  #findCardIndex(container, target) {
    return container.findIndex((card) =>
      card.id === target.id
    );
  }

  removeActionCard(card) {
    if (!this.#ac.length) return
    
    const cardIndex = this.#findCardIndex(this.#ac, card);
    this.#ac.splice(cardIndex, 1);
  }

  removeDesignCard(card) {
    if (!this.#dc.length) return
    
    const cardIndex = this.#findCardIndex(this.#dc, card);
    this.#dc.splice(cardIndex, 1);
  }

  getPlayerData() {
    return {
      playerId: this.id,
      name: this.name,
      tokens: this.#tokens,
      dc: this.#dc.length,
      ac: this.#ac.length,
      pinColor: this.#pinColor,
      position: this.#position
    };
  }

  getPosition() {
    return { ...this.#position };
  }

  #setPosition(destination) {
    this.#position = destination
  }

  setup(pinColor, position) {
    this.#pinColor = pinColor
    this.#setPosition(position)
  }

  move(destination) {
    this.#setPosition(destination)
  }
}
