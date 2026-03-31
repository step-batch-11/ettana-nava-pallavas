import { colorsMap } from "/assets/colors.js";

const rollDice = async () => {
  const response = await fetch("/game/roll", {
    method: "POST",
  });
  return await response.json();
};

const updateDice = ({ number, colorId }) => {
  const numberDice = document.querySelector("#number-dice");
  const colorDice = document.querySelector("#color-dice");
  numberDice.textContent = number;
  const diceColor = document.createElement("span");
  diceColor.classList.add("dice-color");

  diceColor.style.backgroundColor = colorsMap[colorId];
  colorDice.replaceChildren(diceColor);
};

const removeMoveClass = () => {
  const tiles = document.querySelectorAll(".tile");
  const halfTiles = document.querySelectorAll(".halfTile");
  [...tiles, ...halfTiles].forEach((tile) => {
    tile.classList.remove("premium-move", "normal-move", "jump-move");
  });
};

const highlightSwappableYarns = (yarns) => {
  yarns.forEach((yarnPosition) => {
    const id = `#r-${yarnPosition.x}-c-${yarnPosition.y}`;
    const yarn = document.querySelector(id);
    yarn.style.boxShadow = "0px 0px 10px #666";
  });
};

const getNextPosition = async (destination) => {
  const response = await fetch("/game/move", {
    method: "POST",
    body: JSON.stringify(destination),
    headers: { "content-type": "application/json" },
  });

  return await response.json();
};

const addTooltip = (tile, penalty) => {
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

const highlightDestinations = (destinations) => {
  destinations.forEach((destination) => {
    const id = `#tile${destination.x}${destination.y}`;
    const tile = document.querySelector(id);
    tile.classList.add(`${destination.type}-move`);

    if (destination.type === "premium") {
      const penalty = destination.recipients.length;
      addTooltip(tile, penalty);
    }

    tile.addEventListener("click", async () => {
      const { adjYarns, positions } = await getNextPosition(destination);
      highlightSwappableYarns(adjYarns);
      displacePin(positions);
    });
  });
};

globalThis.addEventListener("load", () => {
  const dice = document.querySelector("#dice");
  dice.addEventListener("click", async () => {
    const { diceValues, destinations } = await rollDice();
    updateDice(diceValues);
    removeMoveClass();
    highlightDestinations(destinations);
  });
});
