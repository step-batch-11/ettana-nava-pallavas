import { initBoard, renderBoard } from "./board.js";
import { applyEventListenerOnDice } from "./game.js";
import { renderBankState } from "./bank.js";
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

  const baordRes = await fetch("/game/board-state");
  const { state } = await baordRes.json();
  renderBoard(state);
  renderBankState();
};

const addEventListener = () => {
  applyEventListenerOnDice();
  addToggleEventListenerOnDeck();
  addDragEventListenerOnDeck();
};

export const renderGame = async(state) => {
  renderBoard(state);
  await renderBankState();

  renderDeck(state.players, state.currentPlayer);
}

globalThis.onload = async () => {
  initBoard();

  await distributeInitialAssets();
  const state = await getGameState()
  await renderGame(state);
  addEventListener();
};
