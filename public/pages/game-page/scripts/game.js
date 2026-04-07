import { rollDice } from "./api.js";
import { renderGame } from "./app.js";
import {
  removeMoveClass,
  renderMoveOptions,
  updateDice,
} from "./utilities/game_utilities.js";
import { removeTileEventListeners } from "./utilities/board_utilities.js";

const handleRollDice = async () => {
  const { diceValues, destinations } = await rollDice();
  updateDice(diceValues);
  removeMoveClass();
  removeTileEventListeners();
  renderMoveOptions(destinations);
  renderGame();
};

export const rollDiceEventListener = () => {
  const dice = document.querySelector("#dice");
  if (dice.dataset.listenerAdded) return;
  dice.addEventListener("click", handleRollDice);
  dice.dataset.listenerAdded = true;
};

export const defaultDice = () => {
  updateDice({ number: 6, colorId: 6 });
};
