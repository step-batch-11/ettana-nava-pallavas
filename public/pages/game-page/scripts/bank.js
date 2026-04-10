import { colorsMap } from "/assets/colors.js";
import { showToast } from "../../utils/utils.js";
import { renderGame } from "./app.js";
import { changeTurnRequest, sendRequest } from "./api.js";
import {
  handleSwapEvent,
  removeTileHighlighting,
  removeYarnHighlighting,
} from "./handlers/board_handlers.js";
import { handlePlayerMove } from "./utilities/game_utilities.js";
import { removeTileEventListeners } from "/pages/game-page/scripts/utilities/board_utilities.js";

const passTurnEventListener = () => {
  const passTurn = document.querySelector("#pass-turn");

  if (passTurn.dataset.listenerAdded) return;

  passTurn.addEventListener("dblclick", async () => {
    removeYarnHighlighting();
    removeTileHighlighting();
    removeTileEventListeners(handlePlayerMove);

    const response = await changeTurnRequest("/game/pass-turn");

    if (!response.success) {
      showToast(response.error.message, "e");
      return;
    }

    const { state } = await sendRequest("/game/game-state");
    renderGame(state);
  });

  passTurn.dataset.listenerAdded = true;
};

const buyDesignCardEventListener = () => {
  const designCard = document.querySelector(".design-card");

  if (designCard.dataset.listenerAdded) return;
  designCard.addEventListener("dblclick", async () => {
    const response = await sendRequest("/game/buy-design-card");
    if (!response.success) {
      showToast(response.error.message, "e");
      return;
    }

    const { state } = await sendRequest("/game/game-state");
    renderGame(state);
  });

  designCard.dataset.listenerAdded = true;
};

const buyActionCardEventListener = () => {
  const actionCard = document.querySelector(".action-card");

  if (actionCard.dataset.listenerAdded) return;
  actionCard.addEventListener("dblclick", async () => {
    const response = await sendRequest("/game/buy-action-card");
    if (!response.success) {
      showToast(response.error.message, "e");
      return;
    }

    const { state } = await sendRequest("/game/game-state");
    renderGame(state);
  });

  actionCard.dataset.listenerAdded = true;
};

const getCurrentPlayer = (state) => {
  const currentPlayerId = state.currentPlayerId;
  return state.players.find((player) => player.playerId === currentPlayerId);
};

const hasPaidSwap = () => {
  const yarns = document.querySelectorAll(".dot[draggable=true]");
  return yarns.length > 4;
};

const buyPaidSwapListener = () => {
  const button = document.querySelector(".swap-btn");

  if (button.dataset.listenerAdded) return;
  button.addEventListener("click", async () => {
    if (hasPaidSwap()) {
      return showToast("You already have an unused paid swap", "e");
    }
    const res = await fetch("/game/buy-swap", { credentials: "include" });
    const resBody = await res.json();
    if (!resBody.success) {
      return showToast(resBody.error.message, "e");
    }

    handleSwapEvent("/game/paid-swap");
  });
  button.dataset.listenerAdded = true;
};

const setButtonForBuyingPaidSwap = (state) => {
  const currentPlayer = getCurrentPlayer(state);
  const buySwapButton = document.querySelector(".swap-btn");

  buySwapButton.disabled = currentPlayer.tokens < 3;
};

export const renderBankReserve = (state) => {
  const bank = state.bank;
  setButtonForBuyingPaidSwap(state);

  const tokenPlaceholder = document.querySelector("#token-count");
  tokenPlaceholder.textContent = bank.tokens;

  const tiles = document.querySelectorAll(".tile span");
  tiles.forEach((tile, index) => {
    tile.textContent = bank.tiles[index];
  });

  const yarns = document.querySelectorAll(".yarn");
  yarns.forEach((yarn, index) => {
    yarn.style.backgroundColor = colorsMap[bank.yarns[index]];
  });
};

export const attachBankEventListeners = () => {
  buyDesignCardEventListener();
  buyActionCardEventListener();
  buyPaidSwapListener();
  passTurnEventListener();
};
