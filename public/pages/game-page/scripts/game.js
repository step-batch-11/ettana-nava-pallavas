import { rollDice } from "./api.js";
import { renderGame } from "./app.js";
import {
  removeMoveClass,
  renderMoveOptions,
  updateDice,
} from "./utilities/game_utilities.js";
import { removeTileEventListeners } from "./utilities/board_utilities.js";
import { showToast } from "../../utils/utils.js";

const rollDiceForTurn = async (dice) => {
  const response = await rollDice();
  if (!response.success) {
    return showToast(response.error.message, "e");
  }

  addRollingAnimation(dice);

  setTimeout(() => {
    updateDice(response.diceValues);
    removeMoveClass();
    removeTileEventListeners();
    renderMoveOptions(response.destinations);
    renderGame();
  }, 1000);
};

const addRollingAnimation = (dice) => {
  const dices = dice.querySelectorAll(".dice");

  dices.forEach((d) => {
    if (d.classList.contains("rolling")) return;
    d.classList.add("rolling");

    const interval = setInterval(() => {
      const randomNumber = Math.floor(Math.random() * 6) + 1;
      const randomColor = Math.floor(Math.random() * 5) + 1;

      updateDice({ number: randomNumber, colorId: randomColor });
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      d.classList.remove("rolling");
    }, 1000);
  });
};

export const rollDiceEventListener = () => {
  const dice = document.querySelector("#dice");
  if (dice.dataset.listenerAdded) return;
  dice.addEventListener("click", () => {
    rollDiceForTurn(dice);
  });
  dice.dataset.listenerAdded = true;
};

export const defaultDice = () => {
  updateDice({ number: 6, colorId: 6 });
};
