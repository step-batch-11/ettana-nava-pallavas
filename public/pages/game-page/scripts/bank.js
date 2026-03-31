import { colorsMap } from "/assets/colors.js";

const fetchData = async () => {
  const response = await fetch("/game/bank-state");
  const bank = await response.json();

  return bank;
};

export const renderBankState = async () => {
  const bank = await fetchData();

  const tokenPlaceholder = document.querySelector("#token-count");
  tokenPlaceholder.textContent = bank.tokens;

  const tiles = document.querySelectorAll(".tile span");
  tiles.forEach((tile, index) => {
    tile.textContent = bank.tiles[index].value;
  });

  const yarns = document.querySelectorAll(".yarn");
  yarns.forEach((yarn, index) => {
    yarn.style.backgroundColor = colorsMap[bank.yarns[index]];
  });
};
