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

const highlightDestinations = (destinations) => {
  destinations.forEach((destination) => {
    const id = `#tile${destination.x}${destination.y}`;
    const tile = document.querySelector(id);
    tile.classList.add(`${destination.type}-move`);
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
