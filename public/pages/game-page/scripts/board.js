const board = document.getElementById("board");
const playersContainer = document.querySelector(".players");

export const colorsMap = {
  1: "red",
  2: "blue",
  3: "green",
  4: "purple",
  5: "yellow",
  6: "black",
};
const size = 5;

const cellSize = 120;
const gap = 10;

const _tilesId = [
  ["tile00", "tile01", "tile02", "tile03", "tile04", "tile05"],
  ["tile10", "tile11", "tile12", "tile13", "tile14", "tile15"],
  ["tile20", "tile21", "tile22", "tile23", "tile24", "tile25"],
  ["tile30", "tile31", "tile32", "tile33", "tile34", "tile35"],
  ["tile40", "tile41", "tile42", "tile43", "tile44", "tile45"],
  ["tile50", "tile51", "tile52", "tile53", "tile54", "tile55"],
];

const createCells = () => {
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const cell = document.createElement("div");
      cell.className = "octagon";

      const dot = document.createElement("div");
      dot.className = "dot";
      dot.id = `r-${row}-c-${col}`;
      dot.style.backgroundColor = "black";

      cell.appendChild(dot);
      board.appendChild(cell);
    }
  }
};

const createCenterTiles = () => {
  for (let row = 0; row < size - 1; row++) {
    for (let col = 0; col < size - 1; col++) {
      const tiles = document.createElement("div");
      tiles.className = "tile";
      tiles.id = `tile${row + 1}${col + 1}`;
      tiles.style.left = col * (cellSize + gap) + cellSize + gap / 2 - 26 +
        "px";
      tiles.style.top = row * (cellSize + gap) + cellSize + gap / 2 - 26 +
        "px";
      board.appendChild(tiles);
    }
  }
};

const createHorizontalTiles = () => {
  for (let col = 0; col < size - 1; col++) {
    const tiles = document.createElement("div");
    tiles.className = "halfTile rotate180";
    tiles.id = `tile0${col + 1}`;
    tiles.style.left = col * (cellSize + gap) + cellSize + gap / 2 - 20 + "px";

    tiles.style.top = 0 + "px";
    board.appendChild(tiles);

    const tiles1 = document.createElement("div");
    tiles1.className = "halfTile";
    tiles1.id = `tile5${col + 1}`;
    tiles1.style.left = col * (cellSize + gap) + cellSize + gap / 2 - 20 + "px";

    tiles1.style.top = 4.55 * (cellSize + gap) + "px";

    board.appendChild(tiles1);
  }
};

const createVerticalTiles = () => {
  for (let row = 0; row < size - 1; row++) {
    const tiles = document.createElement("div");
    tiles.className = "halfTile rotate90";
    tiles.id = `tile${row + 1}0`;
    tiles.style.left = 0 + "px";

    tiles.style.top = row * (cellSize + gap) + cellSize + gap / 2 - 20 + "px";
    board.appendChild(tiles);

    const tiles1 = document.createElement("div");
    tiles1.className = "halfTile rotate270";
    tiles1.id = `tile${row + 1}5`;
    tiles1.style.top = row * (cellSize + gap) + cellSize + gap / 2 - 20 + "px";

    tiles1.style.left = 4.55 * (cellSize + gap) + "px";

    board.appendChild(tiles1);
  }
};

const createCornerTiles = () => {
  const topLeft = document.createElement("div");
  topLeft.className = "halfTile rotate315";
  topLeft.id = "tile00";
  topLeft.style.top = -20 + "px";
  topLeft.style.left = -20 + "px";

  board.appendChild(topLeft);

  const topRight = document.createElement("div");
  topRight.className = "halfTile rotate45";
  topRight.id = "tile05";
  topRight.style.top = -20 + "px";
  topRight.style.left = 4.55 * (cellSize + gap) + 20 + "px";

  board.appendChild(topRight);

  const bottomLeft = document.createElement("div");
  bottomLeft.className = "halfTile rotate225";
  bottomLeft.id = "tile50";
  bottomLeft.style.left = -20 + "px";
  bottomLeft.style.top = 4.55 * (cellSize + gap) + 20 + "px";

  board.appendChild(bottomLeft);

  const bottomRight = document.createElement("div");
  bottomRight.className = "halfTile rotate135";
  bottomRight.id = "tile55";
  bottomRight.style.left = 4.55 * (cellSize + gap) + 20 + "px";
  bottomRight.style.top = 4.55 * (cellSize + gap) + 20 + "px";

  board.appendChild(bottomRight);
};

const initBoard = () => {
  createCells();
  createCenterTiles();
  createHorizontalTiles();
  createVerticalTiles();
  createCornerTiles();
};

const renderYarns = (yarns) => {
  yarns.forEach((row, r) => {
    row.forEach((yarnColor, c) => {
      const yarnContainer = board.querySelector(`#r-${r}-c-${c}`);
      yarnContainer.style.backgroundColor = colorsMap[yarnColor];
    });
  });
};

const renderTiles = (pins) => {
  pins.forEach((row, rowIdx) => {
    row.forEach((tileInfo, colIdx) => {
      const tileEle = board.querySelector(`#tile${rowIdx}${colIdx}`);

      tileEle.innerHTML = "";

      const valueEl = document.createElement("div");
      valueEl.className = "tile-value";
      valueEl.textContent = tileInfo?.value ?? "";

      tileEle.appendChild(valueEl);

      if (tileInfo?.playerId) {
        const iconEl = document.createElement("div");
        iconEl.className = "player-icon tile-value";
        iconEl.textContent = "👤";

        tileEle.appendChild(iconEl);
      }
    });
  });
};

const createPlayerCard = ({ name, avatar, token, victoryPoint }) => {
  const template = document.getElementById("player-card-template");
  const clone = template.content.cloneNode(true);

  clone.querySelector(".player-name").textContent = name;
  clone.querySelector(".avatar").src = avatar;
  clone.querySelector(".stat1").textContent = token;
  clone.querySelector(".stat2").textContent = victoryPoint;

  return clone;
};

const renderPlayers = (players, playersContainer) => {
  players.forEach((player) => {
    const playerCard = createPlayerCard({
      name: player.name,
      avatar: "/assets/user_pin.png",
      token: player.availabeToken,
      victoryPoint: player.victoryPoint,
    });

    playersContainer.appendChild(playerCard);
  });
};

globalThis.onload = async () => {
  initBoard();
  const res = await fetch("/game/board-state");
  const { state } = await res.json();
  console.log(state);

  renderYarns(state.board.yarns);
  renderTiles(state.board.tiles);
  renderPlayers(state.players, playersContainer);

  const octagons = document.querySelectorAll(".octagon");
  octagons.forEach((octagon) => {
    octagon.addEventListener("click", (e) => {
      console.log(e);
    });
  });
};
