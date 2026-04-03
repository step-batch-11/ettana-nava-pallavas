import { beforeEach, describe, it } from "@std/testing/bdd";
import { createApp } from "../../src/app.js";
import { assertEquals } from "@std/assert/equals";
import Bank from "../../src/models/bank.js";
import Board from "../../src/models/board.js";
import Game from "../../src/models/game.js";
import { diceValue } from "../../src/data/state.js";
import Player from "../../src/models/player.js";
import {
  buyActionCard,
  buyDesignCard,
} from "../../src/handlers/game_handlers.js";
import TurnManager from "../../src/models/turn_manager.js";

describe("Game route", () => {
  // let app, players, game, bank;

  // const designCards = [{ "id": 1, "victoryPoints": 1 }];
  // const actionCards = [{
  //   "id": 1,
  //   "type": "move",
  //   "description": "Move the pin to any unoccupied square.",
  // }, {
  //   "id": 4,
  //   "type": "get tokens",
  //   "description": "Get 3 tokens from the reserve.",
  // }];

  let app,
    players,
    bank,
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

    players = [new Player(1, "Ajoy"), new Player(2, "Dinesh")];

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

    bank = new Bank(designCards, actionCards);
    game = new Game(
      players,
      bank,
      new Board(tiles, yarns),
      diceValue,
    );
    app = createApp(game, new TurnManager(game));
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

  describe.ignore("GET /game/game-state", () => {
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

  describe.ignore("GET /game/claim-design", () => {
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

        console.log(claimingStatus);
        assertEquals(claimingStatus.success, true);
        assertEquals(claimingStatus.result.isMatched, false);
      },
    );
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
