import { colorsMap } from "/assets/colors.js";
import { renderDeck } from "./deck.js";
import { renderGame } from "./board.js";
import { showToast } from "../../utils/utils.js";

const sendRequest = async (path) => {
  const response = await fetch(path);
  return await response.json();
};

const buyDesignCard = () => {
  const designCard = document.querySelector(".design-card");

  designCard.addEventListener("click", async () => {
    const response = await sendRequest("/game/buy-design-card");
    if (!response.success) {
      showToast(response.message, "e");
      return;
    }

    const res = await fetch("/game/board-state");
    const { state } = await res.json();
    renderGame(state);
    renderDeck(state.players, state.currentPlayer);
    renderBankState();
  });
};

const buyActionCard = () => {
  const actionCard = document.querySelector(".action-card");

  actionCard.addEventListener("click", async () => {
    const response = await sendRequest("/game/buy-action-card");

    if (!response.success) {
      showToast(response.message, "e");
      return;
    }

    const res = await fetch("/game/board-state");
    const { state } = await res.json();
    renderGame(state);
    renderDeck(state.players, state.currentPlayer);
    renderBankState();
    renderBankState();
  });
};

const attachListeners = () => {
  buyDesignCard();
  buyActionCard();
};

attachListeners();

export const renderBankState = async () => {
  const bank = await sendRequest("/game/bank-state");

  const tokenPlaceholder = document.querySelector("#token-count");
  tokenPlaceholder.textContent = bank.tokens;

  const tiles = document.querySelectorAll(".tile span");
  tiles.forEach((tile, index) => {
    tile.textContent = bank.tiles[index].value;
  });

  const yarns = document.querySelectorAll(".yarn");
  yarns.forEach((yarn, index) => {
    yarn.style.backgroundColor = colorsMap[bank.yarns[index]];
  });
};
