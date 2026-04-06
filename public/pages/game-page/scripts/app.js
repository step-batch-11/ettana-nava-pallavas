import { initBoard, renderBoard, renderPlayers } from "./board.js";
import { defaultDice, rollDiceEventListener } from "./game.js";
import { attachBankEventListeners, renderBankReserve } from "./bank.js";
import { attachDeckEventListener, renderDeck } from "./deck.js";
import { getGameState } from "./api.js";

export const addEventListener = () => {
  attachDeckEventListener();
  attachBankEventListeners();
  rollDiceEventListener();
};

export const renderGame = async () => {
  const state = await getGameState();
  renderBoard(state);
  renderPlayers(state.players, state.currentPlayerId);
  renderBankReserve(state);
  renderDeck(state.deck);
};

const main = () => {
  initBoard();
  renderGame();
  defaultDice();
  addEventListener();

  // setInterval(() => {
  //   renderGame();
  // }, 2000);
};

globalThis.window.onload = main;
