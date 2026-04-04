import { colorsMap } from "/assets/colors.js";
import { showToast } from "../../utils/utils.js";
import {
  handleDragLeave,
  handleDragOver,
  handleStartDrag,
  removeCellEventListeners,
  removeYarnEventListeners,
  removeYarnHighlighting,
  reRenderGameState,
} from "./game.js";
import { addEventListener, renderGame } from "./app.js";

const sendRequest = async (path) => {
  const response = await fetch(path);
  return await response.json();
};

const designCardListeners = () => {
  const designCard = document.querySelector(".design-card");

  designCard.addEventListener("click", async () => {
    const response = await sendRequest("/game/buy-design-card");
    if (!response.success) {
      showToast(response.message, "e");
      return;
    }

    const { state } = await sendRequest("/game/game-state");
    renderGame(state);
    addEventListener();
  });
};

const actionCardListeners = () => {
  const actionCard = document.querySelector(".action-card");

  actionCard.addEventListener("click", async () => {
    const response = await sendRequest("/game/buy-action-card");

    if (!response.success) {
      showToast(response.message, "e");
      return;
    }

    const { state } = await sendRequest("/game/game-state");
    renderGame(state);
    addEventListener();
  });
};

const getCurrentPlayer = (state) => {
  const currentPlayerId = state.currentPlayerId;

  return state.players.find((player) => player.playerId === currentPlayerId);
};

const getAllYarnsPosition = () => {
  const mockBoardYarns = [
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["", "", "", "", ""],
  ];
  return mockBoardYarns.flatMap((_, i) =>
    mockBoardYarns[i].map((_, j) => ({ x: i, y: j }))
  );
};

const fetchPaidSwapResult = async (
  draggablePosition,
  yarnPosition,
  resource,
) => {
  const response = await fetch(resource, {
    method: "POST",
    body: JSON.stringify({ draggablePosition, yarnPosition }),
    headers: { "content-type": "application/json" },
  });

  return await response.json();
};

const swapYarns = async (draggablePosition, yarnPosition, resource) => {
  const response = await fetchPaidSwapResult(
    draggablePosition,
    yarnPosition,
    resource,
  );

  await reRenderGameState();
  if (!response.success) {
    showToast(response.message, "e");
  }
  removeYarnHighlighting();
  removeYarnEventListeners();
  removeCellEventListeners();
  showToast(response.message, "d");
};

const handleDrop = async (e, cell, yarnPosition, resource) => {
  const draggableId = e.dataTransfer.getData("text/plain");
  const draggablePosition = JSON.parse(
    e.dataTransfer.getData("application/json"),
  );
  const yarn = cell.querySelector(".dot");

  const octagon = cell.querySelector("polygon");
  octagon.style.stroke = "";

  if (yarn.id !== draggableId) {
    await swapYarns(draggablePosition, yarnPosition, resource);
  }
};

const addDragAndDrop = (yarn, yarnPosition, resource) => {
  yarn.addEventListener("dragstart", (e) => handleStartDrag(e, yarnPosition));
  const cell = yarn.parentElement;
  cell.classList.add("active");

  cell.addEventListener("dragover", (e) => handleDragOver(e, cell));
  cell.addEventListener("dragleave", (e) => handleDragLeave(e, cell));
  cell.addEventListener(
    "drop",
    (e) => handleDrop(e, cell, yarnPosition, resource),
  );
};

export const highLightYarns = (resource) => {
  const yarnsPosition = getAllYarnsPosition();

  yarnsPosition.forEach((yarnPosition) => {
    const id = `#r-${yarnPosition.x}-c-${yarnPosition.y}`;
    const yarn = document.querySelector(id);
    yarn.draggable = true;
    yarn.style.boxShadow = "0 0 10px 3px rgba(0, 200, 255, 0.9)";
    addDragAndDrop(yarn, yarnPosition, resource);
  });
};

const handleSwapEvent = (_) => {
  highLightYarns("/game/paid-swap");
};

const swapListener = () => {
  const button = document.querySelector(".swap-btn");

  button.removeEventListener("click", handleSwapEvent);
  button.addEventListener("click", handleSwapEvent);
};

const setButton = (state) => {
  const currentPlayer = getCurrentPlayer(state);
  const swapButton = document.querySelector(".swap-btn");

  swapButton.disabled = currentPlayer.tokens < 3;
};

export const renderBankState = (state) => {
  const bank = state.bank;
  setButton(state);

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
};

export const attachBankEventListeners = () => {
  designCardListeners();
  actionCardListeners();
  swapListener();
};
