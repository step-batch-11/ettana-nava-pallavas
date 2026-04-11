import { colorsMap } from "/assets/colors.js";
import {
  createAllTiles,
  createDiv,
  createOctagons,
  createSVGPlayerIcon,
} from "./utilities/board_utilities.js";

const board = document.getElementById("board");

const size = 5;

const createCells = () => {
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const cell = createOctagons(row, col);
      board.appendChild(cell);
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

const renderPlayerOnTiles = (players, currentPlayerId) => {
  players.forEach((player) => {
    const el = board.querySelector(
      `#tile${player.position.x}${player.position.y}`,
    );
    if (!el) return;

    el.innerHTML = "";
    const icon = createDiv("player-icon tile-value");
    icon.dataset.id = player.id;
    const svgIcon = createSVGPlayerIcon(player.pinColor);
    icon.appendChild(svgIcon);
    el.appendChild(icon);

    if (player.playerId === currentPlayerId) {
      const icon = el.querySelector("svg");
      icon.classList.add("current-player");
    }
  });
};

const renderNumberOnTiles = (tiles) => {
  tiles.forEach((row, r) => {
    row.forEach((tile, c) => {
      const el = board.querySelector(`#tile${r}${c}`);
      el.innerHTML = "";

      const innerContent = createDiv("tile-value");
      innerContent.textContent = tile || "";
      el.appendChild(innerContent);
    });
  });
};

const renderTiles = (tiles, currentPlayerId, players) => {
  renderNumberOnTiles(tiles);
  renderPlayerOnTiles(players, currentPlayerId);
};

export const highlightPattern = async (pattern) => {
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
    board.querySelector(`#r-${x}-c-${y}`)
      .classList.remove("highlight");
  });
};

// Creates the skeleton of the board.
export const initBoard = () => {
  createCells();
  createAllTiles(board);
};

export const renderBoard = (state) => {
  console.log(state);
  renderYarns(state.board.yarns);
  renderTiles(state.board.tiles, state.currentPlayerId, state.players);
};
