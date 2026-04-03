import { colorsMap } from "/assets/colors.js";

const board = document.getElementById("board");
const playersContainer = document.querySelector(".players");

const size = 5;
const cellSize = 120;
const gap = 10;

const createDiv = (className, id) => {
  const element = document.createElement("div");
  if (className) element.className = className;
  if (id) element.id = id;
  return element;
};

const setPosition = (element, left, top) => {
  element.style.left = `${left}px`;
  element.style.top = `${top}px`;
};

const getOffset = (i) => i * (cellSize + gap);

const centerOffset = (i, adjust = 26) =>
  getOffset(i) + cellSize + gap / 2 - adjust;

const createCells = () => {
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", "0 0 100 100");
      svg.classList.add("octagon");

      const polygon = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "polygon",
      );
      polygon.setAttribute(
        "points",
        "30,0 70,0 100,30 100,70 70,100 30,100 0,70 0,30",
      );
      polygon.setAttribute("fill", "white");
      polygon.setAttribute("stroke", "#C8A951");
      polygon.setAttribute("stroke-width", "2");

      svg.appendChild(polygon);

      const dot = document.createElement("div");
      dot.className = `dot`;
      dot.id = `r-${row}-c-${col}`;
      dot.style.backgroundColor = "black";

      const cell = document.createElement("div");
      cell.className = "cell";
      cell.appendChild(svg);
      cell.appendChild(dot);

      board.appendChild(cell);
    }
  }
};

const getTileRotation = (row, col) => {
  const last = size;

  const isTop = row === 0;
  const isBottom = row === last;
  const isLeft = col === 0;
  const isRight = col === last;

  if (isTop && isLeft) return "rotate315";
  if (isTop && isRight) return "rotate45";
  if (isBottom && isLeft) return "rotate225";
  if (isBottom && isRight) return "rotate135";

  if (isTop) return "rotate180";
  if (isLeft) return "rotate90";
  if (isRight) return "rotate270";

  return "";
};

const getTilePosition = (row, col) => {
  const last = size;

  if (row > 0 && row < last && col > 0 && col < last) {
    return {
      x: centerOffset(col - 1),
      y: centerOffset(row - 1),
    };
  }

  const edgeOffset = 4.8 * (cellSize + gap);

  const x = col === 0 ? -35 : col === last ? edgeOffset : centerOffset(col - 1);
  const y = row === 0 ? -35 : row === last ? edgeOffset : centerOffset(row - 1);
  return { x, y };
};

const createAllTiles = () => {
  for (let row = 0; row <= size; row++) {
    for (let col = 0; col <= size; col++) {
      const tile = createDiv(
        `tile ${getTileRotation(row, col)}`,
        `tile${row}${col}`,
      );

      const { x, y } = getTilePosition(row, col);
      setPosition(tile, x, y);

      board.appendChild(tile);
    }
  }
};

const renderYarns = (yarns) => {
  yarns.forEach((row, r) => {
    row.forEach((color, c) => {
      const el = board.querySelector(`#r-${r}-c-${c}`);
      el.style.backgroundColor = colorsMap[color];
    });
  });
};

const createSVGPlayerIcon = () => {
  const ns = "http://www.w3.org/2000/svg";

  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("width", "30");
  svg.setAttribute("height", "50");
  svg.setAttribute("viewBox", "0 0 120 220");

  const circle = document.createElementNS(ns, "circle");
  circle.setAttribute("cx", "60");
  circle.setAttribute("cy", "45");
  circle.setAttribute("r", "35");
  circle.setAttribute("fill", "rgb(239, 108, 0)");
  circle.setAttribute("stroke", "rgb(193, 90, 5)");
  circle.setAttribute("stroke-width", "4");

  const path = document.createElementNS(ns, "path");
  path.setAttribute(
    "d",
    "M40 75 Q30 130 25 165 Q60 190 95 165 Q90 130 80 75 Z",
  );
  path.setAttribute("fill", "#ef6c00");
  path.setAttribute("stroke", "rgb(193, 90, 5)");
  path.setAttribute("stroke-width", "4");

  const _rect = document.createElementNS(ns, "rect");
  _rect.setAttribute("width", "100");
  _rect.setAttribute("height", "25");
  _rect.setAttribute("rx", "20");
  _rect.setAttribute("ry", "20");
  _rect.setAttribute("fill", "#ef6c00");
  _rect.setAttribute("stroke", "rgb(193, 90, 5)");
  _rect.setAttribute("stroke-width", "4");

  svg.append(circle, path);

  return svg;
};

const renderPlayerPins = (players, currentPlayer) => {
  players.forEach((player) => {
    const el = board.querySelector(
      `#tile${player.position.x}${player.position.y}`,
    );
    el.innerHTML = "";
    const icon = createDiv("player-icon tile-value");
    icon.dataset.id = player.id;
    const svgIcon = createSVGPlayerIcon();
    icon.appendChild(svgIcon);
    el.appendChild(icon);

    if (player.id === currentPlayer) {
      const icon = el.querySelector("svg");
      icon.classList.add("current-player");
    }
  });
};

const renderNumberTiles = (tiles) => {
  tiles.forEach((row, r) => {
    row.forEach((tile, c) => {
      const el = board.querySelector(`#tile${r}${c}`);
      el.innerHTML = "";

      const innerContent = createDiv("tile-value");
      innerContent.textContent = tile;
      el.appendChild(innerContent);
    });
  });
};

const renderTilesContent = (tiles, currentPlayer, players) => {
  renderNumberTiles(tiles);
  renderPlayerPins(players, currentPlayer);
};

const createPlayerCard = (player) => {
  const template = document.getElementById("player-card-template");

  const clone = template.content.cloneNode(true);
  const element = clone.querySelector(".player-card");
  clone.querySelector(".player-name").textContent = player.name;
  clone.querySelector(".avatar").src = "/assets/user_pin.png";
  clone.querySelector(".stat1").textContent = player.vp;
  clone.querySelector(".stat2").textContent = player.tokens;

  return { clone, element };
};

const renderPlayersCards = (players, currentPlayer) => {
  playersContainer.innerHTML = "";
  players.forEach((player) => {
    const { clone, element } = createPlayerCard(player);

    if (player.id === currentPlayer) {
      element.classList.add("current-player-card");
    }

    playersContainer.appendChild(clone);
  });
};

export const hightLightPattern = async (pattern) => {
  pattern.forEach(({ x, y }) => {
    board.querySelector(`#r-${x}-c-${y}`).classList.add(
      "highlight",
    );
  });

  await new Promise((res) => {
    setTimeout(() => {
      res(1);
    }, 5000);
  });

  pattern.forEach(({ x, y }) => {
    board.querySelector(`#r-${x}-c-${y}`).classList.remove(
      "highlight",
    );
  });
};

export const initBoard = () => {
  createCells();
  createAllTiles();
};

export const renderBoard = (state) => {
  renderYarns(state.board.yarns);
  renderTilesContent(state.board.tiles, state.currentPlayer, state.players);
  renderPlayersCards(state.players, state.currentPlayer);
};
