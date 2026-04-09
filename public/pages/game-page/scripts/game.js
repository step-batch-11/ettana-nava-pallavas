import { rollDice } from "./api.js";
import { renderGame } from "./app.js";
import {
  removeMoveClass,
  renderMoveOptions,
  updateDice,
} from "./utilities/game_utilities.js";
import { removeTileEventListeners } from "./utilities/board_utilities.js";
import { showToast } from "../../utils/utils.js";

const rollDiceForTurn = async () => {
  
  const response = await rollDice();
  if (!response.success) {
    showToast(response.error, "e");
  }

  updateDice(response.diceValues);
  removeMoveClass();
  removeTileEventListeners();
  renderMoveOptions(response.destinations);
  renderGame();
};

export const rollDiceEventListener = () => {
  const dice = document.querySelector("#dice");
  if (dice.dataset.listenerAdded) return;
  dice.addEventListener("click", rollDiceForTurn);
  dice.dataset.listenerAdded = true;
};

export const defaultDice = () => {
  updateDice({ number: 6, colorId: 6 });
};
