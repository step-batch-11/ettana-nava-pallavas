import { initBoard, renderBoard } from "./board.js";
import { applyEventListenerOnDice, defaultDice } from "./game.js";
import { attachBankEventListeners, renderBankState } from "./bank.js";
import {
  addDragEventListenerOnDeck,
  addToggleEventListenerOnDeck,
  renderDeck,
} from "./deck.js";

import { getGameState } from "./api.js";

const distributeInitialAssets = async () => {
  await new Promise((res) => {
    setTimeout(() => {
      res(1);
    }, 500);
  });

  const res = await fetch("/game/distribute-initial-assets");
  await res.json();

  const boardRes = await fetch("/game/board-state");
  const { state } = await boardRes.json();
  renderBoard(state);
  renderBankState();
};

const addEventListener = () => {
  applyEventListenerOnDice();
  addToggleEventListenerOnDeck();
  addDragEventListenerOnDeck();
  attachBankEventListeners();
};

export const renderGame = async (state) => {
  renderBoard(state);
  await renderBankState();
  renderDeck(state.players, state.currentPlayer);
};

const main = async () => {
  initBoard();

  await distributeInitialAssets();
  const state = await getGameState();
  await renderGame(state);

  defaultDice();
  addEventListener();
};

globalThis.onload = main;
