import {
  getAllYarnsPosition,
  highlightYarns,
  removeCellEventListeners,
  removeYarnEventListeners,
} from "../utilities/board_utilities.js";
import { showToast } from "../../../utils/utils.js";
import { removeClasses } from "../utilities/game_utilities.js";
import { renderGame } from "../app.js";

export const highlightAdjacentYarns = (yarns) => {
  yarns.forEach((yarnPosition) => {
    const id = `#r-${yarnPosition.x}-c-${yarnPosition.y}`;
    const yarn = document.querySelector(id);
    yarn.draggable = true;
    yarn.style.boxShadow = "0 0 10px 3px rgba(0, 200, 255, 0.9)";
    addDragAndDropOnYarns(yarn, yarnPosition, "/game/swap");
  });
};

export const removeYarnHighlighting = () => {
  const yarns = document.querySelectorAll(".dot");
  yarns.forEach((yarn) => {
    yarn.draggable = false;
    yarn.style.boxShadow = "none";
    yarn.classList.remove("yarn-replace");
  });
};

export const handleStartDragForYarns = (e, yarnPosition) => {
  e.dataTransfer.setData("text/plain", e.target.id);
  e.dataTransfer.setData("application/json", JSON.stringify(yarnPosition));
};

export const handleDragOverForYarns = (e, cell) => {
  e.preventDefault();
  const octagon = cell.querySelector("polygon");
  octagon.style.stroke = "orange";
};

export const handleDragLeaveForYarns = (_, cell) => {
  const octagon = cell.querySelector("polygon");
  octagon.style.stroke = "";
};

const fetchSwapResult = async (draggablePosition, yarnPosition, path) => {
  const response = await fetch(path, {
    method: "POST",
    body: JSON.stringify({ draggablePosition, yarnPosition, cardId: 25 }),
    headers: { "content-type": "application/json" },
    credentials: "include",
  });
  return await response.json();
};

const swapYarns = async (draggablePosition, yarnPosition, path) => {
  const response = await fetchSwapResult(draggablePosition, yarnPosition, path);
  renderGame();
  if (!response.success) {
    showToast(response.error.message, "e");
  }
  removeYarnHighlighting();
  removeYarnEventListeners();
  removeCellEventListeners();
  showToast(response.result.message);
};

export const documentClickHandler = (e) => {
  if (!e.target.closest(".cell")?.classList.contains("active")) {
    removeYarnHighlighting();
    removeYarnEventListeners();
    removeCellEventListeners();
    removeClasses(".cell", "active");
    document.removeEventListener("click", documentClickHandler);
  }
};

export const handleDropYarns = async (e, cell, yarnPosition, path) => {
  const draggableId = e.dataTransfer.getData("text/plain");
  const draggablePosition = JSON.parse(
    e.dataTransfer.getData("application/json"),
  );
  const yarn = cell.querySelector(".dot");

  const octagon = cell.querySelector("polygon");
  octagon.style.stroke = "";

  if (yarn.id !== draggableId) {
    await swapYarns(draggablePosition, yarnPosition, path);
    document.removeEventListener("click", documentClickHandler);
  }
};

export const addDragAndDropOnYarns = (yarn, yarnPosition, path) => {
  yarn.removeEventListener("dragstart", handleStartDragForYarns);

  yarn.addEventListener(
    "dragstart",
    (e) => handleStartDragForYarns(e, yarnPosition),
  );

  const cell = yarn.parentElement;
  cell.classList.remove("active");
  cell.classList.add("active");

  cell.removeEventListener("dragover", handleDragOverForYarns);
  cell.removeEventListener("dragleave", handleDragLeaveForYarns);
  cell.removeEventListener("drop", handleDropYarns);

  cell.addEventListener("dragover", (e) => handleDragOverForYarns(e, cell));
  cell.addEventListener("dragleave", (e) => handleDragLeaveForYarns(e, cell));
  cell.addEventListener(
    "drop",
    (e) => handleDropYarns(e, cell, yarnPosition, path),
  );
};

export const handleSwapEvent = (path = "/game/paid-swap") => {
  
  const yarnsPosition = getAllYarnsPosition();
  highlightYarns(yarnsPosition);

  yarnsPosition.forEach((yarnPosition) => {
    const id = `#r-${yarnPosition.x}-c-${yarnPosition.y}`;
    const yarn = document.querySelector(id);
    yarn.draggable = true;
    addDragAndDropOnYarns(yarn, yarnPosition, path);
  });
};

export const removeTileHighlighting = () => {
  const tiles = document.querySelectorAll(".tile");
  // const yarns = document.querySelectorAll(".dot");

  tiles.forEach((tile) => {
    tile.classList.remove("jump-move");
    tile.style.boxShadow = "none";
  });

  // yarns.forEach((tile) => {
  //   tile.classList.remove("yarn-replace");
  //   tile.style.boxShadow = "none";
  // });
};
