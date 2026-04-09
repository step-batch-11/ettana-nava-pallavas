import { beforeEach, describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
import Player from "../../../src/models/player.js";
import Board from "../../../src/models/board.js";
import Game from "../../../src/models/game.js";
import Bank from "../../../src/models/bank.js";
import { diceValue } from "../../../src/data/state.js";
import { createApp } from "../../../src/app.js";
import {
  getAllActionCard,
  getAllDesignCard,
  mockTiles,
  mockYarns,
} from "../../../src/utils/mock_data.js";
import ActionCardService from "../../../src/service/action_card.js";
import GameController from "../../../src/controller/game_controller.js";

describe.ignore("Design card handlers", () => {
  let app,
    players;

  beforeEach(() => {
    const player1 = new Player(1, "Ajoy");
    player1.setup(2, { x: 2, y: 1 });
    player1.addAllDesignCardDev(...getAllDesignCard());

    const player2 = new Player(2, "Dinesh");
    player1.setup(3, { x: 4, y: 1 });
    players = [player1, player2];

    const gameState = new Game(
      players,
      new Bank(getAllDesignCard(), getAllActionCard()),
      new Board(mockTiles(), mockYarns()),
      diceValue,
      Math.random,
      0,
    );

    const actionCardService = new ActionCardService();

    const gameController = new GameController(gameState, actionCardService);
    app = createApp(gameState, gameController, actionCardService);
  });

  describe("GET /game/claim-design", () => {
    it(
      "should return details of design card if that design pattern has matched with the board",
      async () => {
        await app.request("/game/roll", { method: "POST" });

        const res = await app.request("/game/claim-design/5");
        const claimingStatus = await res.json();

        assertEquals(claimingStatus.success, true);
        assertEquals(claimingStatus.result.isMatched, true);
      },
    );

    it(
      "should return details of design card if that design pattern is not present in the board",
      async () => {
        await app.request("/game/roll", { method: "POST" });
        const res = await app.request("/game/claim-design/2");
        const claimingStatus = await res.json();

        assertEquals(claimingStatus.success, true);
        assertEquals(claimingStatus.result.isMatched, false);
      },
    );
  });
});
