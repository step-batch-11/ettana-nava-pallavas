import { initBoard, renderBoard } from "./board.js";
import { applyEventListenerOnDice, defaultDice } from "./game.js";
import { attachBankEventListeners, renderBankState } from "./bank.js";
import {
  addDragEventListenerOnDeck,
  addToggleEventListenerOnDeck,
  renderDeck,
} from "./deck.js";
import { getGameState } from "./api.js";

const addEventListener = () => {
  applyEventListenerOnDice();
  addToggleEventListenerOnDeck();
  addDragEventListenerOnDeck();
  attachBankEventListeners();
};

export const renderGame = (state) => {
  renderBoard(state);
  renderBankState(state.bank);
  renderDeck(state.players, state.currentPlayerId);
};

const main = async () => {
  initBoard();

  const state = await getGameState();
  renderGame(state);

  defaultDice();
  addEventListener();
};

globalThis.onload = main;
