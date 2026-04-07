import { beforeEach, describe, it } from "@std/testing/bdd";
import { createApp } from "../../../src/app.js";
import Player from "../../../src/models/player.js";
import Board from "../../../src/models/board.js";
import Bank from "../../../src/models/bank.js";
import Game from "../../../src/models/game.js";
import { diceValue, tiles, yarns } from "../../../src/data/state.js";
import { assertEquals } from "@std/assert";

describe("test action handlers", () => {
  let game, players, actionCards, app;

  beforeEach(() => {
    players = [
      new Player(1, "john"),
      new Player(2, "jane"),
      new Player(3, "jean"),
    ];
    players[0].setup(1, { x: 3, y: 3 });
    players[1].setup(2, { x: 2, y: 3 });
    players[2].setup(3, { x: 3, y: 2 });

    actionCards = [
      {
        id: 10,
        type: "steal token",
        description: "Choose a player and steal a maximum of 2 tokens.",
      },
      {
        id: 22,
        type: "steal action card",
        description: "Choose a player and steal an action card.",
      },
    ];

    players[0].addActionCard(actionCards[0]);

    const bank = new Bank([], actionCards, (x) => x);
    const board = new Board(tiles, yarns);
    game = new Game(players, bank, board, diceValue);

    app = createApp(game);
  });

  describe.ignore("/action-card/ -> steal cards", () => {
    it("case: when other players don't have any cards", async () => {
      const response = await app.request("/game/action-card/10", {
        method: "PATCH",
      });

      const { result } = await response.json();

      assertEquals(result, []);
    });

    it("case: when other players have cards", async () => {
      players[1].addActionCard(actionCards[1]);
      players[2].addActionCard(actionCards[1]);

      const response = await app.request("/game/action-card/10", {
        method: "PATCH",
      });

      const { result } = await response.json();

      assertEquals(result, [2, 3]);
    });
  });

  describe.ignore("/action-card/ -> steal tokens", () => {
    beforeEach(() => {
      players[0].addActionCard(actionCards[1]);
    });

    it("case: when other players don't have any tokens", async () => {
      const response = await app.request("/game/action-card/22", {
        method: "PATCH",
      });

      const { result } = await response.json();

      assertEquals(result, []);
    });

    it("case: when other players have tokens", async () => {
      players[1].creditTokens(2);
      players[2].creditTokens(2);

      const response = await app.request("/game/action-card/22", {
        method: "PATCH",
      });

      const { result } = await response.json();

      assertEquals(result, [2, 3]);
    });
  });

  describe.ignore("/steal/ -> action-card", () => {
    it("case: when player selects himself", async () => {
      const body = { playerId: 1 };

      const response = await app.request("/game/steal/action-card", {
        method: "POST",
        body: JSON.stringify(body),
      });

      const { message } = await response.json();
      assertEquals(message, "player cant take from himself");
    });

    it("case: when player has no steal action card", async () => {
      players[0].removeActionCard(actionCards[1]);
      const body = { playerId: 2 };

      const response = await app.request("/game/steal/action-card", {
        method: "POST",
        body: JSON.stringify(body),
      });

      const { message } = await response.json();
      assertEquals(message, "Action card is missing");
    });

    it("case: when the selected opponent has no cards", async () => {
      players[0].addActionCard(actionCards[1]);
      const body = { playerId: 2 };

      const response = await app.request("/game/steal/action-card", {
        method: "POST",
        body: JSON.stringify(body),
      });

      const { message } = await response.json();
      assertEquals(message, "Player has no cards");
    });

    it("case: when the selected opponent has cards", async () => {
      players[0].addActionCard(actionCards[1]);
      players[1].addActionCard(actionCards[1]);
      const body = { playerId: 2 };

      const response = await app.request("/game/steal/action-card", {
        method: "POST",
        body: JSON.stringify(body),
      });

      const { result } = await response.json();
      assertEquals(result, "stolen card");
    });
  });

  describe.ignore("/steal/ -> tokens", () => {
    it("case: when player selects himself", async () => {
      const body = { playerId: 1 };

      const response = await app.request("/game/steal/tokens", {
        method: "POST",
        body: JSON.stringify(body),
      });

      const { message } = await response.json();
      assertEquals(message, "player cant take from himself");
    });

    it("case: when player has no steal token card", async () => {
      players[0].removeActionCard(actionCards[0].id);
      const body = { playerId: 2 };

      const response = await app.request("/game/steal/tokens", {
        method: "POST",
        body: JSON.stringify(body),
      });

      const { message } = await response.json();
      assertEquals(message, "Action card is missing");
    });

    it("case: when the selected opponent has no tokens", async () => {
      players[0].addActionCard(actionCards[0]);
      const body = { playerId: 2 };

      const response = await app.request("/game/steal/tokens", {
        method: "POST",
        body: JSON.stringify(body),
      });

      const { message } = await response.json();
      assertEquals(message, "Player has no tokens");
    });

    it("case: when the selected opponent has tokens", async () => {
      players[0].addActionCard(actionCards[1]);
      players[1].creditTokens(3);

      const body = { playerId: 2 };

      const response = await app.request("/game/steal/tokens", {
        method: "POST",
        body: JSON.stringify(body),
      });

      const { result } = await response.json();
      assertEquals(result, "stolen tokens");
    });
  });
});
