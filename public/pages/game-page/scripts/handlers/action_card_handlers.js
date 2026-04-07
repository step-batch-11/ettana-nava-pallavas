import { handleSwapEvent } from "./board_handlers.js";
import { showToast } from "../../../utils/utils.js";
import { handlePlayerMove } from "../utilities/game_utilities.js";
import { renderGame } from "../app.js";

export const handleActionCardSwap = async (id) => {
  const res = await fetch(`game/action-card/${id}`, { method: "PATCH" });
  const { success, result } = await res.json();

  if (!success) {
    return showToast(result.message, "e");
  }
  handleSwapEvent("game/perform-action-card", result.swappableYarns);
};

export const handleMoveActionCard = async (id) => {
  const res = await fetch(`game/action-card/${id}`, { method: "PATCH" });
  const { state, success, result, message } = await res.json();

  if (!success) {
    return showToast(message, "e");
  }

  result.availableDestinations.forEach(([x, y]) => {
    const tile = document.querySelector(`#tile${x}${y}`);
    if (!tile) return;

    tile.classList.add("jump-move");

    tile.addEventListener(
      "click",
      () =>
        handlePlayerMove(
          { destination: { x, y }, cardId: id },
          "perform-action-card",
        ),
      { once: true },
    );
  });

  renderGame(state);
};
