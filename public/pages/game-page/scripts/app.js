import { hightLightPattern, initBoard, renderBoard } from "./board.js";
import { applyEventListenerOnDice, defaultDice } from "./game.js";
import { attachBankEventListeners, renderBankState } from "./bank.js";
import {
  addClaimEventListener,
  addDragEventListenerOnDeck,
  addToggleEventListenerOnDeck,
  attachPlayActionCard,
  renderDeck,
} from "./deck.js";
import { claimDesignCard, getGameState } from "./api.js";
import { showToast } from "../../utils/utils.js";

const handleClaim = async (e) => {
  const card = e.target.closest(".card-item");
  const status = await claimDesignCard(card.dataset.id);
  if (!status.result.isMatched) {
    showToast("Pattern is not matched", "e");
    return;
  }
  await hightLightPattern(status.result.matches);
};

const addEventListener = () => {
  applyEventListenerOnDice();
  addToggleEventListenerOnDeck();
  addDragEventListenerOnDeck();
  addClaimEventListener(handleClaim);
  attachBankEventListeners();
  attachPlayActionCard();
};

export const renderGame = (state) => {
  renderBoard(state);
  renderBankState(state.bank);
  renderDeck(state.deck);
  addEventListener();
};

const main = async () => {
  initBoard();

  const state = await getGameState();
  renderGame(state);

  defaultDice();
};

globalThis.onload = main;
