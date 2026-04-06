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

describe("Action card handlers", () => {
  let app,
    players,
    bank,
    board,
    game;

  beforeEach(() => {
    const player1 = new Player(1, "Ajoy");
    player1.setup(2, { x: 2, y: 1 });
    player1.addAllDesignCardDev(...getAllDesignCard());

    const player2 = new Player(2, "Dinesh");
    player1.setup(3, { x: 4, y: 1 });
    players = [player1, player2];

    board = new Board(mockTiles(), mockYarns());

    bank = new Bank(getAllDesignCard(), getAllActionCard());
    game = new Game(players, bank, board, diceValue, Math.random, 0);
    app = createApp(game);
  });

  describe("PATCH /action-card/16 (Victory Point)", () => {
    it("Player should be able to play victory point action card only if they have that card", async () => {
      const currentPlayer = players[0];
      const victoryPointAc = {
        id: 16,
        type: "victory point",
        description:
          "1 Victory point. Reveal the card immediately and keep face-up. Cannot be stolen.",
      };

      currentPlayer.addActionCard(victoryPointAc);

      const res = await app.request("/game/action-card/16", {
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
      const victoryPointAc = getActionCard(cardId);
      currentPlayer.addActionCard(victoryPointAc);

      const playerTokensBefore = currentPlayer.getPlayerData().tokens;
      const bankTokensBefore = bank.getBank().tokens;
      const res = await app.request(`/game/action-card/${cardId}`, {
        method: "PATCH",
      });

      const { success } = await res.json();

      const playerTokensAfter = currentPlayer.getPlayerData().tokens;
      const playerActionsCards = currentPlayer.getAc();
      const bankTokensAfter = bank.getBank().tokens;

      assertEquals(success, true);
      assertEquals(res.ok, true);
      assertEquals(playerTokensBefore + 3, playerTokensAfter);
      assertEquals(isPresent(playerActionsCards, victoryPointAc), false);
      assertEquals(bankTokensBefore - 3, bankTokensAfter);
    });
  });

  // describe("PATCH /action-card/31 (Gain Tokens)", () => {
  //   it("Player should get tokes if they get dice number more that or equal their guess", async () => {
  //     const currentPlayer = players[0];
  //     const cardId = acMap.gainToken;
  //     const victoryPointAc = getActionCard(cardId);
  //     currentPlayer.addActionCard(victoryPointAc);

  //     const res = await app.request(`/game/action-card/${cardId}`, {
  //       method: "PATCH",
  //     });

  //     const { success } = await res.json();
  //   });
  // });

  describe("Failed endpoints", () => {
    it("Should fail if card id is invalid", async () => {
      const res = await app.request("/game/action-card/0", {
        method: "PATCH",
      });

      const { message } = await res.json();
      assertEquals(message, "Invalid action card");
    });
  });
});
