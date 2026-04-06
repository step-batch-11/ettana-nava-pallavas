import { handleSwapEvent } from "./board_handlers.js";
import { showToast } from "../../../utils/utils.js";
import { handlePlayerMove } from "../utilities/game_utilities.js";
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
