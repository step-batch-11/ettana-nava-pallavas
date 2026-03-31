import { colorsMap } from "/assets/colors.js";

const fetchData = () => {
  const bank = {
    tokens: 55,
    numberOfDC: 36,
    numberOfAC: 36,
    tiles: [5, 2],
    yarns: [1, 2, 3, 4, 5],
  };

  return { bank };
};

const { bank } = fetchData();

const tokenPlaceholder = document.querySelector("#token-count");
tokenPlaceholder.textContent = bank.tokens;

const tiles = document.querySelectorAll(".tile span");
tiles.forEach((tile, index) => {
  tile.textContent = bank.tiles[index];
});

const yarns = document.querySelectorAll(".yarn");
yarns.forEach((yarn, index) => {
  yarn.style.backgroundColor = colorsMap[bank.yarns[index]];
});
