import { getGameState, rollDice } from "./api.js";
import { renderGame } from "./app.js";
import { colorsMap } from "/assets/colors.js";

const updateDice = ({ number, colorId }) => {
  const numberDice = document.querySelector("#number-dice");
  const colorDice = document.querySelector("#color-dice");
  numberDice.textContent = number;
  const diceColor = document.createElement("span");
  diceColor.classList.add("dice-color");

  diceColor.style.backgroundColor = colorsMap[colorId];
  colorDice.replaceChildren(diceColor);
};

const removeEventListeners = (elements) => {
  elements.forEach((tile) => {
    tile.replaceWith(tile.cloneNode(true));
  });
};

const removeTileEventListeners = () => {
  const tiles = document.querySelectorAll(".tile");
  removeEventListeners(tiles);
};

const removeClasses = (selector, ...classes) => {
  const elements = document.querySelectorAll(selector);

  elements.forEach((element) => {
    element.classList.remove(...classes);
  });
};

const removeMoveClass = () => {
  removeClasses(".tile", "premium-move", "normal-move", "jump-move");
};

const removeYarnHighlighting = () => {
  const yarns = document.querySelectorAll(".dot");
  yarns.forEach((yarn) => {
    yarn.draggable = false;
    yarn.style.boxShadow = "none";
  });
};

const removeCellEventListeners = () => {
  const cells = document.querySelectorAll(".cell");
  removeEventListeners(cells);
};

const removeYarnEventListeners = () => {
  const yarns = document.querySelectorAll(".dot");
  removeEventListeners(yarns);
};

const handleStartDrag = (e, yarnPosition) => {
  e.dataTransfer.setData("text/plain", e.target.id);
  e.dataTransfer.setData("application/json", JSON.stringify(yarnPosition));
};

const handleDragOver = (e, cell) => {
  e.preventDefault();
  const octagon = cell.querySelector("polygon");
  octagon.style.stroke = "orange";
};

const handleDragLeave = (_, cell) => {
  const octagon = cell.querySelector("polygon");
  octagon.style.stroke = "";
};

const fetchSwapResult = async (draggablePosition, yarnPosition) => {
  const response = await fetch("/game/swap", {
    method: "POST",
    body: JSON.stringify({ draggablePosition, yarnPosition }),
    headers: { "content-type": "application/json" },
  });
  return await response.json();
};

const swapYarns = async (draggablePosition, yarnPosition) => {
  const response = await fetchSwapResult(draggablePosition, yarnPosition);
  await reRenderGameState();
  if (response.success) {
    removeYarnHighlighting();
    removeYarnEventListeners();
    removeCellEventListeners();
  }
};

const handleDrop = async (e, cell, yarnPosition) => {
  const draggableId = e.dataTransfer.getData("text/plain");
  const draggablePosition = JSON.parse(
    e.dataTransfer.getData("application/json"),
  );
  const yarn = cell.querySelector(".dot");

  const octagon = cell.querySelector("polygon");
  octagon.style.stroke = "";

  if (yarn.id !== draggableId) {
    await swapYarns(draggablePosition, yarnPosition);
    document.removeEventListener("click", documentClickHandler);
  }
};

const documentClickHandler = (e) => {
  if (!e.target.closest(".cell")?.classList.contains("active")) {
    removeYarnHighlighting();
    removeYarnEventListeners();
    removeCellEventListeners();
    removeClasses(".cell", "active");
    document.removeEventListener("click", documentClickHandler);
  }
};

const addDragAndDrop = (yarn, yarnPosition) => {
  yarn.addEventListener("dragstart", (e) => handleStartDrag(e, yarnPosition));
  const cell = yarn.parentElement;
  cell.classList.add("active");

  cell.addEventListener("dragover", (e) => handleDragOver(e, cell));
  cell.addEventListener("dragleave", (e) => handleDragLeave(e, cell));
  cell.addEventListener("drop", (e) => handleDrop(e, cell, yarnPosition));

  document.addEventListener("click", documentClickHandler);
};

const highlightAdjacentYarns = (yarns) => {
  yarns.forEach((yarnPosition) => {
    const id = `#r-${yarnPosition.x}-c-${yarnPosition.y}`;
    const yarn = document.querySelector(id);
    yarn.draggable = true;
    yarn.style.boxShadow = "0 0 10px 3px rgba(0, 200, 255, 0.9)";
    addDragAndDrop(yarn, yarnPosition);
  });
};

const fetchMoveResult = async (destination) => {
  const response = await fetch("/game/move", {
    method: "POST",
    body: JSON.stringify(destination),
    headers: { "content-type": "application/json" },
  });

  return await response.json();
};

const attachPenaltyTooltip = (tile, penalty) => {
  const tooltip = document.createElement("div");
  tooltip.className = "tooltip";
  tile.appendChild(tooltip);

  tile.addEventListener("mouseenter", () => {
    if (penalty > 0) {
      tooltip.textContent = `Pay ${penalty} token`;
      tooltip.style.opacity = 1;
    }
  });

  tile.addEventListener("mouseleave", () => {
    tooltip.style.opacity = 0;
  });
};

const reRenderGameState = async () => {
  const res = await fetch("/game/board-state");
  const { state } = await res.json();
  renderGame(state);
};

const displacePin = ({ source, destination }) => {
  const sourceTile = document.querySelector(`#tile${source.x}${source.y}`);
  const destinationTile = document.querySelector(
    `#tile${destination.x}${destination.y}`,
  );

  const playerIcon = sourceTile.querySelector(".player-icon");
  sourceTile.removeChild(playerIcon);
  destinationTile.appendChild(playerIcon);
  removeMoveClass();
};

const handlePlayerMove = async (destination) => {
  const response = await fetchMoveResult(destination);

  if (!response.success) {
    alert(response.message);
    return;
  }

  const { adjYarns, moveResult } = response.data;
  highlightAdjacentYarns(adjYarns);
  displacePin(moveResult);
  removeTileEventListeners();
  await reRenderGameState();
};

const highlightTile = (tile, destination) => {
  tile.classList.add(`${destination.type}-move`);
};

const renderMoveOptions = (destinations) => {
  destinations.forEach((route) => {
    const destination = route.destination;
    console.log(destination);

    const id = `#tile${destination.x}${destination.y}`;
    const tile = document.querySelector(id);
    console.log(tile);

    highlightTile(tile, route);

    if (route.type === "premium") {
      const penalty = route.recipients.length;
      attachPenaltyTooltip(tile, penalty);
    }

    tile.addEventListener("click", () => handlePlayerMove(route));
  });
};

export const applyEventListenerOnDice = () => {
  const dice = document.querySelector("#dice");
  dice.addEventListener("click", async () => {
    const { diceValues, destinations } = await rollDice();
    updateDice(diceValues);
    const state = await getGameState();
    await renderGame(state);
    removeMoveClass();
    removeTileEventListeners();
    renderMoveOptions(destinations);
  });
};

export const defaultDice = () => {
  updateDice({ number: 6, colorId: 6 });
};
