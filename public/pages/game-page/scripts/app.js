import Polling from "./polling.js";
import { initBoard, renderBoard } from "./board.js";
import { defaultDice, rollDiceEventListener } from "./game.js";
import { attachBankEventListeners, renderBankReserve } from "./bank.js";
import { attachDeckEventListener, renderDeck } from "./deck.js";
import { getGameState } from "./api.js";
import { showEndGamePopup } from "./leaderboard.js";
import { showAction } from "./info_panel.js";
import { updateDice } from "./utilities/game_utilities.js";
import { renderPlayers } from "./player.js";
import {
  PlayerDetailElement,
  PlayersElement,
} from "./utilities/player_components.js";

const Game = {
  polling: null,
};

export const addEventListener = () => {
  attachDeckEventListener();
  attachBankEventListeners();
  rollDiceEventListener();
};

const showNotification = (() => {
  let actionId = -1;

  return (lastAction) => {
    if (actionId !== lastAction.id) {
      showAction(lastAction, 1);
      actionId = lastAction.id;
    }
  };
})();

export const renderGame = async () => {
  const state = await getGameState();
  if (state?.isFinished) {
    showEndGamePopup(state.leaderboard, state.requesterId);
    Game.polling.stop();
    return;
  }

  if (state.lastAction) {
    Game.polling.stop();
    showNotification(state.lastAction);
    Game.polling.start();
  }

  renderBoard(state);
  renderPlayers(state.players, state.currentPlayerId, state.requesterId);
  renderBankReserve(state);
  renderDeck(state.deck);
  // console.log(state);
  updateDice(state.diceValue);
};

const main = () => {
  Game.polling = new Polling(renderGame, 2000);

  customElements.define("player-detail", PlayerDetailElement);
  customElements.define("players-element", PlayersElement);

  initBoard();
  renderGame();
  defaultDice();
  addEventListener();

  Game.polling.start();
};

globalThis.window.onload = main;
