import { colorsMap } from "/assets/colors.js";
import { showToast } from "../../utils/utils.js";
import { addEventListener, renderGame } from "./app.js";

const sendRequest = async (path) => {
  const response = await fetch(path);
  return await response.json();
};

const designCardListeners = () => {
  const designCard = document.querySelector(".design-card");

  designCard.addEventListener("dblclick", async () => {
    const response = await sendRequest("/game/buy-design-card");
    if (!response.success) {
      showToast(response.message, "e");
      return;
    }

    const { state } = await sendRequest("/game/game-state");
    renderGame(state);
    addEventListener();
  });
};

const actionCardListeners = () => {
  const actionCard = document.querySelector(".action-card");

  actionCard.addEventListener("dblclick", async () => {
    const response = await sendRequest("/game/buy-action-card");

    if (!response.success) {
      showToast(response.message, "e");
      return;
    }

    const { state } = await sendRequest("/game/game-state");
    renderGame(state);
    addEventListener();
  });
};

export const renderBankState = (bank) => {
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
  designCardListeners();
  actionCardListeners();
};
