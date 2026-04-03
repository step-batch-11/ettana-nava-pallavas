import { beforeEach, describe, it } from "@std/testing/bdd";
import { createApp } from "../../src/app.js";
import { assertEquals } from "@std/assert";
import { serveGameState } from "../../src/handlers/game_handlers.js";
import Bank from "../../src/models/bank.js";
import Board from "../../src/models/board.js";
import Game from "../../src/models/game.js";
import { diceValue } from "../../src/data/state.js";
import Player from "../../src/models/player.js";
import {
  buyActionCard,
  buyDesignCard,
} from "../../src/handlers/game_handlers.js";

describe("Game route", () => {
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

  describe("Buy Design Card", () => {
    it("should give a new design card", async () => {
      players[0].creditTokens(5);
      const response = await app.request("/game/buy-design-card");
      const card = await response.json();

      assertEquals(response.status, 200);
      assertEquals(card, {
        message: "Design card bought successfully",
        success: true,
      });
    });

    it("should fail when context is invalid", () => {
      const context = { get: () => [], json: (x) => x };
      const res = buyDesignCard(context);

      assertEquals(res.success, false);
    });

    it("should inform if tokens are insufficient", () => {
      const context = {
        get: (key) => {
          if (key === "gameState") {
            return new Game(
              players,
              new Bank(designCards, actionCards),
              new Board(tiles, yarns),
              diceValue,
            );
          }
        },
        json: (x) => x,
      };

      const res = buyDesignCard(context);
      assertEquals(res, {
        success: false,
        message: "You do not have enough tokens",
      });
    });
  });

  describe("GET /game/game-state", () => {
    it("should return the initial state as it is", async () => {
      const res = await app.request("/game/game-state");
      const game = await res.json();
      assertEquals(game.success, true);
    });

    it("should fail if the context is wrong", () => {
      const mockCtx = {
        get: () => {
          throw new Error("forced failure");
        },
        json: (data) => data,
      };

      const result = serveGameState(mockCtx);

      assertEquals(result.success, false);
      assertEquals(result.error, "forced failure");
    });
  });

  describe("GET /game/claim-design", () => {
    it(
      "should return details of design card if that design pattern has matched with the board",
      async () => {
        const res = await app.request("/game/claim-design/1");
        const claimingStatus = await res.json();

        assertEquals(claimingStatus.success, true);
        assertEquals(claimingStatus.result.isMatched, true);
      },
    );

    it(
      "should return details of design card if that design pattern is not present in the board",
      async () => {
        const res = await app.request("/game/claim-design/2");
        const claimingStatus = await res.json();

        assertEquals(claimingStatus.success, true);
        assertEquals(claimingStatus.result.isMatched, false);
      },
    );
  });

  describe("move request: ", () => {
    let app;

    const randomValue = 0.05;

    beforeEach(() => {
      const bank = new Bank(designCards, actionCards, () => randomValue);

      const player1 = new Player(1, "Sandeep");
      const player2 = new Player(2, "Ajoy");

      player1.setup(1, { x: 3, y: 4 });
      player2.setup(2, { x: 2, y: 1 });

      const players = [player1, player2];
      const yarns = [
        [1, 2, 3, 4, 5],
        [5, 4, 3, 2, 1],
        [1, 2, 3, 4, 5],
        [5, 4, 3, 2, 1],
        [1, 2, 3, 4, 5],
      ];

      const tiles = [
        [0, 0, 0, 0, 0, 0],
        [0, 1, 2, 3, 4, 0],
        [0, 5, 6, 1, 2, 0],
        [0, 3, 4, 5, 6, 0],
        [0, 2, 3, 4, 5, 0],
        [0, 0, 0, 0, 0, 0],
      ];

      const board = new Board(tiles, yarns);
      const diceValue = { colorId: 1, number: 2 };

      const gameState = new Game(
        players,
        bank,
        board,
        diceValue,
        () => randomValue,
      );
      app = createApp(gameState);
    });

    it("Requesting with valid destination, should move to other tile", async () => {
      await app.request("/game/roll", { method: "POST" });
      const destination = { destination: { x: 2, y: 3 }, type: "jump" };

      const response = await app.request("/game/move", {
        method: "POST",
        body: JSON.stringify(destination),
        headers: { "content-type": "application/json" },
      });

      const moveResult = await response.json();

      assertEquals(response.status, 200);
      assertEquals(moveResult.success, true);
      assertEquals(moveResult.data.adjYarns, [
        { x: 1, y: 2 },
        { x: 1, y: 3 },
        { x: 2, y: 2 },
        { x: 2, y: 3 },
      ]);
      assertEquals(moveResult.data.moveResult, {
        source: { x: 3, y: 4 },
        destination: { x: 2, y: 3 },
      });
    });

    it("Requesting with invalid destination, should not move to other tile", async () => {
      await app.request("/game/roll", { method: "POST" });
      const destination = { destination: { x: 4, y: 3 }, type: "jump" };

      const response = await app.request("/game/move", {
        method: "POST",
        body: JSON.stringify(destination),
        headers: { "content-type": "application/json" },
      });

      const moveResult = await response.json();

      assertEquals(response.status, 400);
      assertEquals(moveResult.success, false);
      assertEquals(moveResult.message, "You can't move there");
    });
  });

  describe("Swap Yarns: ", () => {
    let app;

    beforeEach(() => {
      const yarns = [
        [1, 2, 3, 4, 5],
        [5, 4, 3, 2, 1],
        [1, 2, 3, 4, 5],
        [5, 4, 3, 2, 1],
        [1, 2, 3, 4, 5],
      ];
      const player = new Player(1, "jane");
      player.setup(2, { x: 3, y: 4 });

      const bank = new Bank(designCards, actionCards, () => 0.1);
      const board = new Board([[]], yarns);
      const mockGameState = new Game([player], bank, board, {});

      app = createApp(mockGameState);
    });

    it("Requesting with valid yarns positions, should be swapped", async () => {
      const draggablePosition = { x: 3, y: 4 };
      const yarnPosition = { x: 2, y: 3 };

      const response = await app.request("/game/swap", {
        method: "POST",
        body: JSON.stringify({ draggablePosition, yarnPosition }),
        headers: { "content-type": "application/json" },
      });

      const moveResult = await response.json();

      assertEquals(response.status, 200);
      assertEquals(moveResult.success, true);
      assertEquals(moveResult.message, "Swapped successfully");
    });

    it("Requesting with invalid source yarn position, should not be swapped", async () => {
      const draggablePosition = { x: 6, y: 1 };
      const yarnPosition = { x: 2, y: 2 };

      const response = await app.request("/game/swap", {
        method: "POST",
        body: JSON.stringify({ draggablePosition, yarnPosition }),
        headers: { "content-type": "application/json" },
      });

      const moveResult = await response.json();

      assertEquals(response.status, 400);
      assertEquals(moveResult.success, false);
      assertEquals(moveResult.message, "You can't swap these yarns");
    });

    it("Requesting with same source and destination yarns positions, should not be swapped", async () => {
      const draggablePosition = { x: 1, y: 1 };
      const yarnPosition = { x: 1, y: 1 };

      const response = await app.request("/game/swap", {
        method: "POST",
        body: JSON.stringify({ draggablePosition, yarnPosition }),
        headers: { "content-type": "application/json" },
      });

      const moveResult = await response.json();

      assertEquals(response.status, 400);
      assertEquals(moveResult.success, false);
      assertEquals(moveResult.message, "You can't swap these yarns");
    });
  });

  describe("Buy Action Card", () => {
    it("should give a new action card", async () => {
      players[0].creditTokens(5);
      const response = await app.request("/game/buy-action-card");
      const responseBody = await response.json();

      assertEquals(response.status, 200);

      assertEquals(responseBody.message, "Action card bought successfully");
      assertEquals(responseBody.success, true);
    });

    it("should fail when context is invalid", () => {
      const context = { get: () => [], json: (x) => x };
      const res = buyActionCard(context);

      assertEquals(res.success, false);
    });

    it("should inform if tokens are insufficient", () => {
      const context = {
        get: (key) => {
          if (key === "gameState") {
            return new Game(
              players,
              new Bank(designCards, actionCards),
              new Board(tiles, yarns),
              diceValue,
            );
          }
        },
        json: (x) => x,
      };

      const res = buyActionCard(context);

      assertEquals(res, {
        success: false,
        message: "You do not have enough tokens",
      });
    });
  });

  describe("Play Action Cards", () => {
    describe("Tax Action Card", () => {
      it("when tax action card played, then one token from other players should be deducted and bank tokens should incremented: ", async () => {
        players[0].addActionCard({
          "id": 6,
          "type": "tax",
          "description": "All other players pay 1 token to the reserve.",
        });
        players[1].creditTokens(2);
        const response = await app.request("/game/action-card/6", {
          method: "PATCH",
        });
        const { success, affectedPlayers } = await response.json();

        assertEquals(success, true);
        assertEquals(response.status, 200);
        assertEquals(affectedPlayers, [2]);
        assertEquals(bank.getBank().tokens, 56);
        assertEquals(players[1].getTokens(), 1);
        assertEquals(players[0].getAc(), []);
      });

      it("when tax action card played and other player has 0 token, then no token should be deducted and bank token should not incremented: ", async () => {
        players[0].addActionCard({
          "id": 6,
          "type": "tax",
          "description": "All other players pay 1 token to the reserve.",
        });

        const response = await app.request("/game/action-card/6", {
          method: "PATCH",
        });
        const { success, affectedPlayers } = await response.json();

        assertEquals(success, true);
        assertEquals(response.status, 200);
        assertEquals(affectedPlayers, []);
        assertEquals(bank.getBank().tokens, 55);
        assertEquals(players[1].getTokens(), 0);
        assertEquals(players[0].getAc(), []);
      });

      it("when played action card is invalid, then should throw error and no update in state: ", async () => {
        players[0].addActionCard({
          "id": 6,
          "type": "tax",
          "description": "All other players pay 1 token to the reserve.",
        });
        const response = await app.request("/game/action-card/0", {
          method: "PATCH",
        });
        const { success } = await response.json();

        assertEquals(success, false);
        assertEquals(response.status, 400);
        assertEquals(players[1].getTokens(), 0);
        assertEquals(bank.getBank().tokens, 55);
        assertEquals(players[0].getAc().length, 1);
      });

      it("when player does not have action card but wants to play, then should throw error and no update in state: ", async () => {
        const response = await app.request("/game/action-card/6", {
          method: "PATCH",
        });
        const { success } = await response.json();

        assertEquals(success, false);
        assertEquals(response.status, 400);
        assertEquals(players[1].getTokens(), 0);
        assertEquals(bank.getBank().tokens, 55);
        assertEquals(players[0].getAc().length, 0);
      });
    });
  });
});
