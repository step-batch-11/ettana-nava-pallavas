import { beforeEach, describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
import Player from "../../../src/models/player.js";
import Board from "../../../src/models/board.js";
import Game from "../../../src/models/game.js";
import Bank from "../../../src/models/bank.js";
import { diceValue } from "../../../src/data/state.js";
import { createApp } from "../../../src/app.js";
import {
  acMap,
  getActionCard,
  getAllActionCard,
  getAllDesignCard,
  isPresent,
  mockTiles,
  mockYarns,
} from "../../../src/utils/mock_data.js";
import ActionCardService from "../../../src/service/action_card.js";
import GameController from "../../../src/controller/game_controller.js";

describe("Action card handlers", () => {
  let app, players, gameController;

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

    gameController = new GameController(gameState, actionCardService);
    app = createApp(gameState, gameController, actionCardService);
  });

  describe("PATCH /action-card/16 (Victory Point)", () => {
    it("Player should be able to play victory point action card only if they have that card", async () => {
      const currentPlayer = players[0];
      const cardId = acMap.victoryPoint;
      currentPlayer.addActionCard(getActionCard(cardId));

      gameController.playerActions.diceRolled = true;
      const res = await app.request(`/game/action-card/${cardId}`, {
        method: "PATCH",
      });

      const { success } = await res.json();

      const playerData = currentPlayer.getPlayerData();

      const expectedPlayerData = {
        playerId: 1,
        name: "Ajoy",
        tokens: 0,
        dc: 2,
        ac: 0,
        pinColor: 3,
        position: { x: 4, y: 1 },
        vp: 1,
      };

      assertEquals(success, true);
      assertEquals(res.ok, true);
      assertEquals(playerData.vp, expectedPlayerData.vp);
      assertEquals(currentPlayer.haveActionCard(16), false);
    });
  });

  describe("PATCH /action-card/4 (Collect Tokens)", () => {
    it("Player should be able to play victory point action card only if they have that card", async () => {
      const currentPlayer = players[0];
      const cardId = acMap.collectToken;
      const collectTokenAc = getActionCard(cardId);
      currentPlayer.addActionCard(collectTokenAc);

      const playerTokensBefore = currentPlayer.getPlayerData().tokens;

      gameController.playerActions.diceRolled = true;
      const res = await app.request(`/game/action-card/${cardId}`, {
        method: "PATCH",
      });

      const { success } = await res.json();

      const playerTokensAfter = currentPlayer.getPlayerData().tokens;
      const playerActionsCards = currentPlayer.getAc();

      assertEquals(success, true);
      assertEquals(res.ok, true);
      assertEquals(playerTokensBefore + 3, playerTokensAfter);
      assertEquals(isPresent(playerActionsCards, collectTokenAc), false);
    });
  });

  describe("Failed endpoints", () => {
    it("Should fail if card id is invalid", async () => {
      gameController.playerActions.diceRolled = true;
      const res = await app.request("/game/action-card/0", {
        method: "PATCH",
      });

      const { message } = await res.json();
      assertEquals(message, "Card is missing");
    });
  });
});
