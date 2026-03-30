const board = document.getElementById("board");
const colorsMap = {
  "1": "red",
  "2": "blue",
  "3": "green",
  "4": "purple",
  "5": "yellow",
};
const size = 5;

const cellSize = 100;
const gap = 10;

const createCells = () => {
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const cell = document.createElement("div");
      cell.className = "octagon";

      const dot = document.createElement("div");
      dot.className = "dot";
      dot.id = `r-${r}-c-${c}`;
      dot.style.backgroundColor = "black";

      cell.appendChild(dot);
      board.appendChild(cell);
    }
  }
};

let count = 1;

const createCenterConnectors = () => {
  for (let r = 0; r < size - 1; r++) {
    for (let c = 0; c < size - 1; c++) {
      const connector = document.createElement("div");
      connector.className = "connector";
      connector.innerHTML = count++;
      connector.style.left = c * (cellSize + gap) + cellSize + gap / 2 - 20 +
        "px";

      connector.style.top = r * (cellSize + gap) + cellSize + gap / 2 - 20 +
        "px";

      board.appendChild(connector);
    }
  }
};

const initBoard = () => {
  createCells();
  createCenterConnectors();
};

const placeYarns = (yarns) => {
  yarns.forEach((row, r) => {
    row.forEach((yarnColor, c) => {
      const yarnContainer = board.querySelector(`#r-${r}-c-${c}`);
      yarnContainer.style.backgroundColor = colorsMap[yarnColor];
    });
  });
};

globalThis.onload = async () => {
  initBoard();
  const res = await fetch("/game/board-state");
  const { state } = await res.json();
  console.log(state);

  placeYarns(state.yarns);
};
