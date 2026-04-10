import Polling from "./polling.js";
import { initBoard, renderBoard, renderPlayers } from "./board.js";
import { defaultDice, rollDiceEventListener } from "./game.js";
import { attachBankEventListeners, renderBankReserve } from "./bank.js";
import { attachDeckEventListener, renderDeck } from "./deck.js";
import { getGameState } from "./api.js";
import { showEndGamePopup } from "./leaderboard.js";
import { showAction } from "./info_panel.js";

const Game = {
  polling: null,
};

export const addEventListener = () => {
  attachDeckEventListener();
  attachBankEventListeners();
  rollDiceEventListener();
};

export const renderGame = async () => {
  const state = await getGameState();
  if (state?.isFinished) {
    showEndGamePopup(state.leaderboard, state.requesterId);
    Game.polling.stop();
  }

  renderBoard(state);
  renderPlayers(state.players, state.currentPlayerId, state.requesterId);
  renderBankReserve(state);
  renderDeck(state.deck);
};

const main = () => {
  Game.polling = new Polling(renderGame, 2000);
  initBoard();
  renderGame();
  defaultDice();
  addEventListener();

  showAction({
    id: "evt_123",
    type: "STEAL_TOKENS",
    actor: {
      id: "p1",
      name: "Sandip",
    },
    target: {
      id: "p2",
      name: "Khasim",
    },
    value: 2,
    meta: {
      card: "Steal Tokens",
    },
    createdAt: 1710000000000,
  }, 1);
  
  Game.polling.start();
};

globalThis.window.onload = main;
