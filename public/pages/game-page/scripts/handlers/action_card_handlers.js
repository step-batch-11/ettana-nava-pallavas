import { handleSwapEvent, removeTileHighlighting } from "./board_handlers.js";
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

function handleReplaceTile(x, y) {
  const reservedTiles = document.querySelectorAll(".tiles .tile");
  reservedTiles.forEach((tile, index) => {
    tile.classList.add("jump-move");
    tile.addEventListener("click", async () => {
      const res = await fetch("/game/replace-tile", {
        method: "PATCH",
        body: JSON.stringify({ source: [x, y], destination: index }),
      });
      const { success, result } = await res.json();

      if (!success) {
        return showToast(message, "e");
      }

      showToast(result.message);
      renderGame(result.state);
      removeTileHighlighting();
    });
  });
}

export const handleReplaceActionCard = async () => {
  const res = await fetch(`game/action-card/34`, { method: "PATCH" });
  const { state, success, result, message } = await res.json();

  if (!success) return showToast(message, "e");

  result.availableDestinations.forEach(([x, y]) => {
    const tile = document.querySelector(`#tile${x}${y}`);
    if (!tile) return;
    tile.classList.add("jump-move");

    tile.addEventListener("click", () => {
      handleReplaceTile(x, y);
    });
  });

  showToast(result.message);
  renderGame(state);
};
