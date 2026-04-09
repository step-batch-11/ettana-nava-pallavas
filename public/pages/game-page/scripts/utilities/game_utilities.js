import { showToast } from "../../../utils/utils.js";
import { highlightAdjacentYarns } from "../handlers/board_handlers.js";
import { removeTileEventListeners } from "./board_utilities.js";
import { colorsMap } from "/assets/colors.js";

export const updateDice = ({ number, colorId }) => {
  const numberDice = document.querySelector("#number-dice");
  const colorDice = document.querySelector("#color-dice");

  numberDice.textContent = number;
  const diceColor = document.createElement("span");
  diceColor.classList.add("dice-color");

  diceColor.style.backgroundColor = colorsMap[colorId];
  colorDice.replaceChildren(diceColor);
};

export const removeEventListeners = (elements) => {
  elements.forEach((tile) => {
    tile.replaceWith(tile.cloneNode(true));
  });
};

export const removeClasses = (selector, ...classes) => {
  const elements = document.querySelectorAll(selector);

  elements.forEach((element) => {
    element.classList.remove(...classes);
  });
};

const highlightTile = (tile, destination) => {
  tile.classList.add(`${destination.type}-move`);
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

export const removeMoveClass = () => {
  removeClasses(".tile", "premium-move", "normal-move", "jump-move");
};

const displacePin = ({ source, destination }) => {
  removeMoveClass();
  const destinationTile = document.querySelector(
    `#tile${destination.x}${destination.y}`,
  );
  const sourceTile = document.querySelector(`#tile${source.x}${source.y}`);
  const playerIcon = sourceTile.querySelector(".player-icon");
  sourceTile.removeChild(playerIcon);
  destinationTile.appendChild(playerIcon);
};

const fetchMoveResult = async (payload, path = "move") => {
  const response = await fetch(`/game/${path}`, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: { "content-type": "application/json" },
    credentials: "include",
  });

  return await response.json();
};

export const handlePlayerMove = async (payload, path = "move") => {
  const response = await fetchMoveResult(payload, path);

  if (!response.success) {
    alert(response.message);
    return;
  }

  const { message, adjYarns, moveResult } = response.result;

  showToast(message);
  highlightAdjacentYarns(adjYarns);
  displacePin(moveResult);
  removeTileEventListeners();
};

export const renderMoveOptions = (destinations) => {
  destinations.forEach((route) => {
    const destination = route.destination;

    const id = `#tile${destination.x}${destination.y}`;
    const tile = document.querySelector(id);

    highlightTile(tile, route);

    if (route.type === "premium") {
      const penalty = route.recipients.length;
      attachPenaltyTooltip(tile, penalty);
    }

    tile.addEventListener("click", () => handlePlayerMove(route));
  });
};
