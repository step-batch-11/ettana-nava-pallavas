const fetchData = () => {
  const bank = {
    tokens: 55,
    numberOfDC: 36,
    numberOfAC: 36,
    tiles: [5, 2],
    yarns: [1, 2, 3, 4, 5],
  };

  const colorMap = {
    1: "red",
    2: "yellow",
    3: "blue",
    4: "purple",
    5: "green",
  };

  return { bank, colorMap };
};

globalThis.onload = () => {
  const { bank, colorMap } = fetchData();

  const tokenPlaceholder = document.querySelector("#token-count");
  tokenPlaceholder.textContent = bank.tokens;

  const tiles = document.querySelectorAll(".tile span");
  tiles.forEach((tile, index) => {
    tile.textContent = bank.tiles[index];
  });

  const yarns = document.querySelectorAll(".yarn");
  yarns.forEach((yarn, index) => {
    yarn.classList.add(colorMap[bank.yarns[index]]);
  });
};
