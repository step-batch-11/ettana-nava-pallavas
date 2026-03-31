import { initBoard, renderGame } from "./board.js";
import { applyEventListenerOnDice } from "./game.js";
import { renderBankState } from "./bank.js";
import {
  addDragEventListenerOnDeck,
  addToggleEventListenerOnDeck,
  renderDeck,
} from "./deck.js";

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
  renderGame(state);
  renderBankState();
};

const addEventListener = () => {
  applyEventListenerOnDice();
  addToggleEventListenerOnDeck();
  addDragEventListenerOnDeck();
};

globalThis.onload = async () => {
  initBoard();

  await distributeInitialAssets();
  const res = await fetch("/game/board-state");
  const { state } = await res.json();
  renderGame(state);
  await renderBankState();
  renderDeck(state.currentPlayer.actionCards, state.currentPlayer.designCards);

  addEventListener();
};
