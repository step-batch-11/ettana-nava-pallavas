import { handleSwapEvent } from "./board_handlers.js";
import {
  createPopup,
  openDialog,
  showToast,
  submitDice,
} from "../../../utils/utils.js";
import { handlePlayerMove, updateDice } from "../utilities/game_utilities.js";
import { renderGame } from "../app.js";

export const handleActionCardSwap = (path) => {
  handleSwapEvent(path);
};

export const handleMoveActionCard = async () => {
  const res = await fetch(`game/action-card/1`, { method: "PATCH" });
  const { state, success, result } = await res.json();

  if (!success) {
    return showToast(result.message, "e");
  }

  result.availableDestinations.forEach(([x, y]) => {
    const tile = document.querySelector(`#tile${x}${y}`);
    if (!tile) return;

    tile.classList.add("jump-move");

    tile.addEventListener(
      "click",
      () =>
        handlePlayerMove(
          { destination: { x, y } },
          "action-card-move",
        ),
      { once: true },
    );
  });

  showToast(result.message);
  renderGame(state);
};

function handleReplaceTile(x, y) {
  const reservedTiles = document.querySelectorAll(".tiles .tile");
  reservedTiles.forEach((resTile, index) => {
    resTile.style.boxShadow = "0 0 5px 5px #c3bebe";
    resTile.addEventListener("click", async () => {
      const res = await fetch("/game/replace-tile", {
        method: "PATCH",
        body: JSON.stringify({ source: [x, y], destination: index }),
      });
      const { success, result, message } = await res.json();

      if (!success) {
        return showToast(message, "e");
      }

      showToast(result.message);
    });
  });
}

export const handleReplaceActionCard = async () => {
  const res = await fetch(`game/action-card/34`, { method: "PATCH" });
  const { state, success, result, message } = await res.json();

  if (!success) {
    return showToast(message, "e");
  }

  result.availableDestinations.forEach(([x, y]) => {
    const tile = document.querySelector(`#tile${x}${y}`);
    if (!tile) return;
    tile.classList.add("jump-move");

    tile.addEventListener("click", () => {
      tile.style.backgroundColor = "red";
      handleReplaceTile(x, y);
    });
  });

  showToast(result.message);
  renderGame(state);
  return;
};

export const handleGainToken = () => {
  createPopup();
  openDialog();

  const dice = document.querySelector("#dice");
  const newDice = dice.cloneNode(true);
  dice.parentNode.replaceChild(newDice, dice);

  const submitButton = document.getElementById("submit-popup");

  submitButton.addEventListener("click", () => {
    const number = submitDice();

    newDice.addEventListener("click", async () => {
      const res = await fetch(`/game/action-card/31`, {
        method: "PATCH",
        body: JSON.stringify({ number }),
      });

      const responseBody = await res.json();
      newDice.parentNode.replaceChild(dice, newDice);
      updateDice(responseBody.result.diceValues);
      renderGame(responseBody.state);
      showToast(responseBody.result.message);
    });
  });
};
