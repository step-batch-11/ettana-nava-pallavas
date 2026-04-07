import { beforeEach, describe, it } from "@std/testing/bdd";
import { createApp } from "../../../src/app.js";
import { assertEquals } from "@std/assert";
import Bank from "../../../src/models/bank.js";
import Board from "../../../src/models/board.js";
import Game from "../../../src/models/game.js";
import { diceValue } from "../../../src/data/state.js";
import Player from "../../../src/models/player.js";

describe.ignore("Game route", () => {
  let app,
    players,
    bank,
    board,
    tiles,
    yarns,
    designCards,
    actionCards,
    game;

  beforeEach(() => {
    designCards = [
      {
        "id": 1,
        "victoryPoints": 1,
        "design": [
          { coord: { x: 0, y: 0 }, color: 1 },
          { coord: { x: 0, y: 1 }, color: 1 },
          { coord: { x: 0, y: 2 }, color: 1 },
        ],
      },
      {
        "id": 2,
        "victoryPoints": 1,
        "design": [
          { "coord": { "x": 1, "y": 0 }, "color": 5 },
          { "coord": { "x": 2, "y": 1 }, "color": 5 },
          { "coord": { "x": 3, "y": 2 }, "color": 5 },
          { "coord": { "x": 4, "y": 3 }, "color": 5 },
          { "coord": { "x": 3, "y": 1 }, "color": 1 },
          { "coord": { "x": 4, "y": 0 }, "color": 1 },
        ],
      },
    ];

    actionCards = [{
      "id": 1,
      "type": "move",
      "description": "Move the pin to any unoccupied square.",
    }, {
      "id": 2,
      "type": "move",
      "description": "Move the pin to any unoccupied square.",
    }];

    const player1 = new Player(1, "Ajoy");
    player1.setup(2, { x: 2, y: 1 });
    player1.addAllDesignCardDev(...designCards);

    const player2 = new Player(2, "Dinesh");
    player1.setup(3, { x: 4, y: 1 });
    players = [player1, player2];

    tiles = [
      [0, 0, 0, 0, 0, 0],
      [0, 1, 2, 3, 4, 0],
      [0, 5, 6, 1, 2, 0],
      [0, 3, 4, 5, 6, 0],
      [0, 2, 3, 4, 5, 0],
      [0, 0, 0, 0, 0, 0],
    ];

    yarns = [
      [1, 2, 3, 4, 5],
      [5, 4, 3, 2, 1],
      [1, 2, 3, 4, 5],
      [5, 4, 3, 2, 1],
      [1, 2, 3, 4, 5],
    ];
    board = new Board(tiles, yarns);

    bank = new Bank(designCards, actionCards);
    game = new Game(players, bank, board, diceValue);
    app = createApp(game);
  });

  describe("Move Action Card", () => {
    it("when move action card played, then should return all unoccupied postions on the board and remove the action card : ", async () => {
      players[0].setup(1, { x: 0, y: 0 });
      players[1].setup(2, { x: 1, y: 1 });
      const expectedDestinations = [
        [0, 1],
        [0, 2],
        [0, 3],
        [0, 4],
        [0, 5],
        [1, 0],
        [1, 2],
        [1, 3],
        [1, 4],
        [1, 5],
        [2, 0],
        [2, 1],
        [2, 2],
        [2, 3],
        [2, 4],
        [2, 5],
        [3, 0],
        [3, 1],
        [3, 2],
        [3, 3],
        [3, 4],
        [3, 5],
        [4, 0],
        [4, 1],
        [4, 2],
        [4, 3],
        [4, 4],
        [4, 5],
        [5, 0],
        [5, 1],
        [5, 2],
        [5, 3],
        [5, 4],
        [5, 5],
      ];
      players[0].addActionCard({
        id: 1,
        "type": "move",
        "description": "Move to any unoccupied position",
      });

      const response = await app.request("/game/action-card/1", {
        method: "PATCH",
      });
      const { success, result } = await response.json();

      assertEquals(success, true);
      assertEquals(response.status, 200);
      assertEquals(result.availableDestinations, expectedDestinations);
      assertEquals(players[0].getAc(), []);
    });

    it("when played action card is invalid, then should throw error and no update in state: ", async () => {
      players[0].addActionCard({
        id: 1,
        "type": "move",
        "description": "Move to any unoccupied position",
      });
      const response = await app.request("/game/action-card/0", {
        method: "PATCH",
      });
      const { success } = await response.json();

      assertEquals(success, false);
      assertEquals(response.status, 400);
      assertEquals(players[0].getAc().length, 1);
    });

    it("when player does not have move action card but wants to play, then should throw error and no update in state: ", async () => {
      const response = await app.request("/game/action-card/1", {
        method: "PATCH",
      });
      const { success } = await response.json();

      assertEquals(success, false);
      assertEquals(response.status, 400);
      assertEquals(players[0].getAc().length, 0);
    });
  });
});
