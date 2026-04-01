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

const removeTileEventListeners = () => {
  const tiles = document.querySelectorAll(".tile");
  const halfTiles = document.querySelectorAll(".halfTile");
  [...tiles, ...halfTiles].forEach((tile) => {
    tile.replaceWith(tile.cloneNode(true));
  });
};

const removeMoveClass = () => {
  const tiles = document.querySelectorAll(".tile");
  [...tiles].forEach((tile) => {
    tile.classList.remove("premium-move", "normal-move", "jump-move");
  });
};

const highlightAdjacentYarns = (yarns) => {
  yarns.forEach((yarnPosition) => {
    const id = `#r-${yarnPosition.x}-c-${yarnPosition.y}`;
    const yarn = document.querySelector(id);
    yarn.style.boxShadow = "0 0 10px 3px rgba(0, 200, 255, 0.9)";
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

export const applyEventListenerOnDice = () => {
  const dice = document.querySelector("#dice");
  dice.addEventListener("click", async () => {
    const { diceValues, destinations } = await rollDice();
    updateDice(diceValues);
    const state = await getGameState();
    await renderGame(state)
    removeMoveClass();
    removeTileEventListeners();
    renderMoveOptions(destinations);
  });
};
