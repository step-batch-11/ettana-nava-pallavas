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

const createCenterTiles = () => {
  for (let row = 0; row < size - 1; row++) {
    for (let col = 0; col < size - 1; col++) {
      const tile = createDiv("tile", `tile${row + 1}${col + 1}`);

      setPosition(tile, centerOffset(col), centerOffset(row));
      board.appendChild(tile);
    }
  }
};

const createHorizontalTiles = () => {
  for (let col = 0; col < size - 1; col++) {
    const left = centerOffset(col, 26);

    const tile = createDiv(`tile rotate180`, `tile0${col + 1}`);
    setPosition(tile, left, -35);
    board.appendChild(tile);

    const tile2 = createDiv(`tile`, `tile5${col + 1}`);
    setPosition(tile2, left, 4.8 * (cellSize + gap));
    board.appendChild(tile2);
  }
};

const createVerticalTiles = () => {
  for (let row = 0; row < size - 1; row++) {
    const top = centerOffset(row, 26);

    const tile = createDiv(`tile rotate90`, `tile${row + 1}0`);
    setPosition(tile, -35, top);
    board.appendChild(tile);

    const tile2 = createDiv(`tile rotate270`, `tile${row + 1}5`);
    setPosition(tile2, 4.8 * (cellSize + gap), top);
    board.appendChild(tile2);
  }
};

const createCornerTiles = () => {
  const offset = 4.55 * (cellSize + gap);

  const corners = [
    { id: "tile00", cls: "rotate315", x: -35, y: -35 },
    { id: "tile05", cls: "rotate45", x: offset + 35, y: -35 },
    { id: "tile50", cls: "rotate225", x: -35, y: offset + 35 },
    { id: "tile55", cls: "rotate135", x: offset + 35, y: offset + 35 },
  ];

  corners.forEach(({ id, cls, x, y }) => {
    const tile = createDiv(`tile ${cls}`, id);
    setPosition(tile, x, y);
    board.appendChild(tile);
  });
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

const renderTiles = (tiles, currentPlayer) => {
  tiles.forEach((row, r) => {
    row.forEach((tile, c) => {
      const el = board.querySelector(`#tile${r}${c}`);
      el.innerHTML = "";

      const innerContent = createDiv("tile-value");
      innerContent.textContent = tile?.value ?? "";
      el.appendChild(innerContent);

      if (tile?.playerId) {
        const icon = createDiv("player-icon tile-value");
        const svgIcon = createSVGPlayerIcon();
        icon.appendChild(svgIcon);
        el.appendChild(icon);
      }

      if (tile?.playerId === currentPlayer) {
        const icon = el.querySelector("svg");
        icon.classList.add("current-player");
      }
    });
  });
};

const createPlayerCard = (player) => {
  const template = document.getElementById("player-card-template");

  const clone = template.content.cloneNode(true);
  const element = clone.querySelector(".player-card");
  clone.querySelector(".player-name").textContent = player.name;
  clone.querySelector(".avatar").src = "/assets/user_pin.png";
  clone.querySelector(".stat1").textContent = player.victoryPoint;
  clone.querySelector(".stat2").textContent = player.tokens;

  return { clone, element };
};

const renderPlayers = (players, currentPlayer) => {
  playersContainer.innerHTML = "";
  players.forEach((player) => {
    const { clone, element } = createPlayerCard(player);

    if (player.id === currentPlayer) {
      element.classList.add("current-player-card");
    }

    playersContainer.appendChild(clone);
  });
};

export const initBoard = () => {
  createCells();
  createCenterTiles();
  createHorizontalTiles();
  createVerticalTiles();
  createCornerTiles();
};

export const renderBoard = (state) => {
  renderYarns(state.board.yarns);
  renderTiles(state.board.tiles, state.currentPlayer);
  renderPlayers(state.players, state.currentPlayer);
};
