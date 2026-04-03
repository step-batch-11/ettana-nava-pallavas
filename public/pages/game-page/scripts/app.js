import { hightLightPattern, initBoard, renderBoard } from "./board.js";
import { applyEventListenerOnDice, defaultDice } from "./game.js";
import { attachBankEventListeners, renderBankState } from "./bank.js";
import {
  addDragEventListenerOnDeck,
  addToggleEventListenerOnDeck,
  renderDeck,
} from "./deck.js";
import { getGameState } from "./api.js";

const _distributeInitialAssets = async () => {
  await new Promise((res) => {
    setTimeout(() => {
      res(1);
    }, 500);
  });

  const res = await fetch("/game/distribute-initial-assets");
  await res.json();

  const boardRes = await fetch("/game/game-state");
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

export const renderGame = (state) => {
  renderBoard(state);
  renderBankState(state.bank);
  renderDeck(state.players, state.currentPlayerId);
};

const pattern = {
  "id": 36,
  "victoryPoints": 2,
  "design": [
    { "coord": { "x": 0, "y": 0 }, "color": 4 },
    { "coord": { "x": 0, "y": 1 }, "color": 4 },
    { "coord": { "x": 1, "y": 0 }, "color": 4 },
    { "coord": { "x": 1, "y": 2 }, "color": 1 },
    { "coord": { "x": 2, "y": 1 }, "color": 1 },
    { "coord": { "x": 2, "y": 3 }, "color": 1 },
    { "coord": { "x": 3, "y": 2 }, "color": 1 },
    { "coord": { "x": 3, "y": 4 }, "color": 5 },
    { "coord": { "x": 4, "y": 3 }, "color": 5 },
    { "coord": { "x": 4, "y": 4 }, "color": 5 },
  ],
};

const main = async () => {
  initBoard();

  // await distributeInitialAssets();
  const state = await getGameState();
  renderGame(state);

  defaultDice();
  addEventListener();

  hightLightPattern(pattern.design);
};

globalThis.onload = main;
