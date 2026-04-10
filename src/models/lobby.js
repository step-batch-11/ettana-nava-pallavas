import GameController from "../controller/game_controller.js";
import ActionCardService from "../service/action_card.js";
import { getAllActionCard, getAllDesignCard } from "../utils/mock_data.js";
import Bank from "./bank.js";
import Board from "./board.js";
import GameSetup from "./game_setup.js";
import board from "../config/board.json" with { type: "json" };
import { shuffle } from "@std/random";
import { generateValidGrid, getKeysByValue } from "../utils/board_util.js";

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

    const tilesInfo = generateValidGrid(board.tile);
    const yarnsInfo = generateValidGrid(board.yarn);
    const remainingTiles = getKeysByValue(tilesInfo.freq, 2);

    const designCards = shuffle(getAllDesignCard());
    const actionCards = shuffle(getAllActionCard());

    const gameSetup = new GameSetup(
      this.#players,
      new Bank(designCards, actionCards, remainingTiles),
      new Board(tilesInfo.grid, yarnsInfo.grid),
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
