import { colorsMap } from "/assets/colors.js";
import { removeEventListeners } from "/pages/game-page/scripts/utilities/game_utilities.js";
const cellSize = 128;
const gap = 20;
const size = 5;

export const createDiv = (className, id) => {
  const element = document.createElement("div");
  if (className) element.className = className;
  if (id) element.id = id;
  return element;
};

const setPosition = (element, left, top) => {
  element.style.left = `${left + 14}px`;
  element.style.top = `${top + 14}px`;
};

const getOffset = (i) => i * (cellSize + gap);

const centerOffset = (i, adjust = 26) =>
  getOffset(i) + cellSize + gap / 2 - adjust;

const getTilePosition = (row, col) => {
  const last = size;

  if (row > 0 && row < last && col > 0 && col < last) {
    return {
      x: centerOffset(col - 1),
      y: centerOffset(row - 1),
    };
  }

  const edgeOffset = 4.8 * (cellSize + gap);

  const x = col === 0
    ? -32
    : col === last
    ? edgeOffset - 10
    : centerOffset(col - 1);
  const y = row === 0
    ? -32
    : row === last
    ? edgeOffset - 10
    : centerOffset(row - 1);
  return { x, y };
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

export const createOctagons = (row, col) => {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 100 100");
  svg.classList.add("octagon");

  const polygon = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "polygon",
  );
  polygon.setAttribute(
    "points",
    "30 0, 70 0, 100 30, 100 70, 70 100, 30 100, 0 70, 0 30",
  );
  polygon.setAttribute("fill", "#f0f1e5");
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

  return cell;
};

export const createAllTiles = (board) => {
  for (let row = 0; row <= size; row++) {
    for (let col = 0; col <= size; col++) {
      const tile = createDiv(
        `tile ${getTileRotation(row, col)}`,
        `tile${row}${col}`,
      );

      const isBorder = row === 0 || col === 0 || row === size || col === size;

      isBorder
        ? tile.classList.add("border-tile")
        : tile.classList.add("inner-tile");

      const { x, y } = getTilePosition(row, col);
      setPosition(tile, x, y);

      board.appendChild(tile);
    }
  }
};

export const removeTileEventListeners = () => {
  const tiles = document.querySelectorAll(".tile");
  removeEventListeners(tiles);
};

export const removeCellEventListeners = () => {
  const cells = document.querySelectorAll(".cell");
  removeEventListeners(cells);
};

export const removeYarnEventListeners = () => {
  const yarns = document.querySelectorAll(".dot");
  removeEventListeners(yarns);
};

export const getAllYarnsPosition = () =>
  Array.from({ length: 5 }).flatMap((_, i) =>
    Array.from({ length: 5 }).map((_, j) => ({ x: i, y: j }))
  );

export const highlightYarns = (yarns) => {
  yarns.forEach((yarnPosition) => {
    const id = `#r-${yarnPosition.x}-c-${yarnPosition.y}`;
    const yarn = document.querySelector(id);
    yarn.style.boxShadow = "0 0 10px 3px rgba(0, 200, 255, 0.9)";
  });
};

export const createSVGPlayerIcon = (colorId) => {
  const primaryColor = colorsMap[colorId];

  const ns = "http://www.w3.org/2000/svg";

  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("width", "30");
  svg.setAttribute("height", "50");
  svg.setAttribute("viewBox", "0 0 120 220");

  const circle = document.createElementNS(ns, "circle");
  circle.setAttribute("cx", "60");
  circle.setAttribute("cy", "45");
  circle.setAttribute("r", "35");
  circle.setAttribute("fill", primaryColor);
  circle.setAttribute("stroke", "rgb(193, 90, 5)");
  circle.setAttribute("stroke-width", "4");

  const path = document.createElementNS(ns, "path");
  path.setAttribute(
    "d",
    "M40 75 Q30 130 25 165 Q60 190 95 165 Q90 130 80 75 Z",
  );
  path.setAttribute("fill", primaryColor);
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
