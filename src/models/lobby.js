import GameController from "../controller/game_controller.js";
import { tiles, yarns } from "../data/state.js";
import ActionCardService from "../service/action_card.js";
import { getAllActionCard, getAllDesignCard } from "../utils/mock_data.js";
import Bank from "./bank.js";
import Board from "./board.js";
import GameSetup from "./game_setup.js";

export default class LobbyController {
  #canStart;
  #players;
  #capacity;
  constructor() {
    this.#canStart = false;
    this.#players = [];
    this.#capacity = 2;
  }

  addPlayer(player) {
    if (this.#players.length > 2) {
      throw new Error("Room is full");
    }

    this.#players.push(player);
  }

  exitLobby(playerId) {
    delete this.#players[playerId];
  }

  getLobbyState() {
    return {
      capacity: this.#capacity,
      start: this.#canStart,
      players: this.#players.map((player) => {
        const { playerId, name } = player.getPlayerData();
        return { id: playerId, name };
      }),
    };
  }

  async startGame() {
    if (this.#players.length < 2) {
      throw new Error("Not enough player to start the game");
    }

    const gameSetup = new GameSetup(
      this.#players,
      new Bank(getAllDesignCard(), getAllActionCard()),
      new Board(tiles, yarns),
    );

    const gameController = new GameController(
      gameSetup,
      new ActionCardService(),
    );

    this.#canStart = true;

    await new Promise((res) => {
      setTimeout(() => {
        res(1);
      }, 100);
    });

    return gameController;
  }
}
