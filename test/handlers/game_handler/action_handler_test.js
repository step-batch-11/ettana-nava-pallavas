import { beforeEach, describe, it } from "@std/testing/bdd";
import { createApp } from "../../../src/app.js";
import Player from "../../../src/models/player.js";
import Board from "../../../src/models/board.js";
import Bank from "../../../src/models/bank.js";
import Game from "../../../src/models/game.js";
import { diceValue, tiles, yarns } from "../../../src/data/state.js";
import { assertEquals } from "@std/assert";
import ActionCardService from "../../../src/service/action_card.js";

describe("test action handlers", () => {
  let game, players, actionCards, app, actionCardService;

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

    players[0].addActionCard(actionCards[1]);

    const bank = new Bank([], actionCards, (x) => x);
    const board = new Board(tiles, yarns);
    game = new Game(players, bank, board, diceValue);

    actionCardService = new ActionCardService();

    app = createApp(game, actionCardService);
  });

  describe.ignore("/action-card/ -> steal cards", () => {
    it("case: when player don't have steal card", async () => {
      players[0].removeActionCard(actionCards[1].id);

      const response = await app.request("/game/action-card/22", {
        method: "PATCH",
      });

      const { message } = await response.json();

      assertEquals(message, "You don't have card");
    });

    it("case: when other players don't have any cards", async () => {
      const response = await app.request("/game/action-card/22", {
        method: "PATCH",
      });

      const { result } = await response.json();

      assertEquals(result, []);
    });

    it("case: when other players have cards", async () => {
      players[1].addActionCard(actionCards[1]);
      players[2].addActionCard(actionCards[1]);

      const response = await app.request("/game/action-card/22", {
        method: "PATCH",
      });

      const { result } = await response.json();

      assertEquals(result, [2, 3]);
    });
  });

  describe.ignore("/action-card/ -> steal tokens", () => {
    beforeEach(() => {
      players[0].addActionCard(actionCards[0]);
    });

    it("case: when other players don't have any tokens", async () => {
      const response = await app.request("/game/action-card/10", {
        method: "PATCH",
      });

      const { result } = await response.json();

      assertEquals(result, []);
    });

    it("case: when other players have tokens", async () => {
      players[1].creditTokens(2);
      players[2].creditTokens(2);

      const response = await app.request("/game/action-card/10", {
        method: "PATCH",
      });

      const { result } = await response.json();

      assertEquals(result, [2, 3]);
    });
  });

  describe.ignore("/perform-action-card/ -> action-card", () => {
    beforeEach(() => {
      actionCardService.played["steal"] = true;
    });

    it("case: when player calls this wit curl or something", async () => {
      delete actionCardService.played["steal"];
      const body = { opponentPlayerId: 1, cardId: 22 };

      const response = await app.request("/game/perform-action-card", {
        method: "POST",
        body: JSON.stringify(body),
      });

      const { message } = await response.json();
      assertEquals(message, "You did not play steal action card");
    });

    it("case: when player selects himself", async () => {
      const body = { opponentPlayerId: 1, cardId: 22 };

      const response = await app.request("/game/perform-action-card", {
        method: "POST",
        body: JSON.stringify(body),
      });

      const { message } = await response.json();
      assertEquals(message, "player can't take from himself");
    });

    it("case: when player has no steal action card", async () => {
      players[0].removeActionCard(actionCards[1].id);
      const body = { opponentPlayerId: 2, cardId: 22 };

      const response = await app.request("/game/perform-action-card", {
        method: "POST",
        body: JSON.stringify(body),
      });

      const { message } = await response.json();
      assertEquals(message, "Action card is missing");
    });

    it("case: when the selected opponent has no cards", async () => {
      players[0].addActionCard(actionCards[1]);
      const body = { opponentPlayerId: 2, cardId: 22 };

      const response = await app.request("/game/perform-action-card", {
        method: "POST",
        body: JSON.stringify(body),
      });

      const { message } = await response.json();
      assertEquals(message, "Player has no cards");
    });

    it("case: when the selected opponent has cards", async () => {
      players[0].addActionCard(actionCards[1]);
      players[1].addActionCard(actionCards[1]);
      const body = { opponentPlayerId: 2, cardId: 22 };

      const response = await app.request("/game/perform-action-card", {
        method: "POST",
        body: JSON.stringify(body),
      });

      const { result } = await response.json();
      assertEquals(result.message, "john stolen 1 action card from jane");
    });
  });

  describe.ignore("/perform-action-card/ -> tokens", () => {
    beforeEach(() => {
      actionCardService.played["steal"] = true;
      players[0].addActionCard(actionCards[0]);
    });

    it("case: when player selects himself", async () => {
      const body = { opponentPlayerId: 1, cardId: 10 };

      const response = await app.request("/game/perform-action-card", {
        method: "POST",
        body: JSON.stringify(body),
      });

      const { message } = await response.json();
      assertEquals(message, "player can't take from himself");
    });

    it("case: when player has no steal token card", async () => {
      players[0].removeActionCard(actionCards[0].id);
      const body = { opponentPlayerId: 2, cardId: 10 };

      const response = await app.request("/game/perform-action-card", {
        method: "POST",
        body: JSON.stringify(body),
      });

      const { message } = await response.json();
      assertEquals(message, "Action card is missing");
    });

    it("case: when the selected opponent has no tokens", async () => {
      players[0].addActionCard(actionCards[0]);
      const body = { opponentPlayerId: 2, cardId: 10 };

      const response = await app.request("/game/perform-action-card", {
        method: "POST",
        body: JSON.stringify(body),
      });

      const { message } = await response.json();
      assertEquals(message, "Player has no tokens");
    });

    it("case: when the selected opponent has tokens", async () => {
      players[0].addActionCard(actionCards[0]);
      players[1].creditTokens(3);

      const body = { opponentPlayerId: 2, cardId: 10 };

      const response = await app.request("/game/perform-action-card", {
        method: "POST",
        body: JSON.stringify(body),
      });

      const { result } = await response.json();
      assertEquals(result.message, "john stolen 2 tokens from jane");
    });

    it("case: when the selected opponent has only 1 token", async () => {
      players[0].addActionCard(actionCards[0]);
      players[1].creditTokens(1);

      const body = { opponentPlayerId: 2, cardId: 10 };

      const response = await app.request("/game/perform-action-card", {
        method: "POST",
        body: JSON.stringify(body),
      });

      const { result } = await response.json();
      assertEquals(result.message, "john stolen 1 tokens from jane");
    });
  });
});
