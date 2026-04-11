import { colorsMap } from "/assets/colors.js";

export class PlayerDetailElement extends HTMLElement {
  #_currentPlayerId;

  constructor() {
    super();
    this._detail = {};
    this.#_currentPlayerId = 0;

    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
  }

  get detail() {
    return this._detail;
  }

  set detail({ d, currentPlayerId }) {
    this._detail = d;
    this.#_currentPlayerId = currentPlayerId;
    this.render();
  }

  render() {
    const classList = this.detail.playerId === this.#_currentPlayerId
      ? "player current-player"
      : "player";
    this.shadowRoot.innerHTML = `
    <style>
    .player {
      display: flex;
      width:94%;
      height: 25%;
      justify-content: space-evenly;
      padding-block:1em;
      border-bottom: 1px solid black;
      margin:0.5em;
    }

    .name-icon {
      width:40%;
      display:flex;
      gap:0.5em;
      align-items:center;
    }

    .pin-color {
      display:flex;
      height:70%;
      aspect-ratio:1/1;
      border-radius:50%;
      justify-content:center;
      background-color : ${colorsMap[this.detail.pinColor]}; 
    }

    .player-stats {
      display: flex;
      width:60%;
      justify-content: space-evenly;
      align-items: center;
    }

    .name, .player-stats > p{
      margin:0;
      padding:0;  
      text-align: left;
      font-size: 1.2em;
      font-weight:400;
      color: black;
    }

    .current-player {
      border: 5px solid var(--success);
    }
    </style>
    <div class=${classList}>
      <div class="name-icon">
        <div class="pin-color"></div>
        <h5 class="name">${this.detail.name}</h5>
      </div>
      <div class="player-stats">
        <p>${this.detail.vp}</p>
        <p>${this.detail.tokens}</p>
        <p>${this.detail.ac}</p>
        <p>${this.detail.dc}</p>
      </div>
    </div>
    `;
  }
}

export class PlayersElement extends HTMLElement {
  #_players;
  #_currentPlayerId;
  #_requesterId;

  constructor() {
    super();
    this.#_players = [];
    this.#_currentPlayerId = null;
    this.#_requesterId = null;
    this.attachShadow({ mode: "open" });
  }

  get players() {
    return this.#_players;
  }

  set players({ players, currentPlayerId, requesterId }) {
    this.#_players = players;
    this.#_requesterId = requesterId;
    this.render();
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const playerElements = this.players.map((d) => {
      if (d.playerId === this.#_requesterId) {
        d.name = "You";
      }

      const playerDetail = document.createElement("player-detail");
      playerDetail.detail = { d, currentPlayerId: this.#_currentPlayerId };

      return playerDetail;
    });

    this.shadowRoot.replaceChildren(...playerElements);
  }
}
