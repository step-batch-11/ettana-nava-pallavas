import {
  createColorDice,
  createPopup,
  getPlayerById,
  openDialog,
  showToast,
  submitColorDice,
  submitDice,
} from "../../../utils/utils.js";
import {
  handlePlayerMove,
  removeMoveClass,
  renderMoveOptions,
  updateDice,
} from "../utilities/game_utilities.js";
import { handleSwapEvent, removeTileHighlighting } from "./board_handlers.js";
import { renderGame } from "../app.js";
import {
  createSVGPlayerIcon,
  removeTileEventListeners,
} from "../utilities/board_utilities.js";
import { replacePopup, selectorArea } from "../utilities/dom_elements.js";
import { colorsMap } from "/assets/colors.js";

export const handleActionCardSwap = async (id) => {
  const res = await fetch(`game/action-card/${id}`, { method: "PATCH" });
  const { success, result, message } = await res.json();

  if (!success) {
    return showToast(message, "e");
  }
  handleSwapEvent("game/perform-action-card", result.swappableYarns);
};

export const handleMoveActionCard = async (id) => {
  const res = await fetch(`game/action-card/${id}`, { method: "PATCH" });
  const { state, success, result, message } = await res.json();

  if (!success) {
    return showToast(message, "e");
  }

  result.availableDestinations.forEach(([x, y]) => {
    const tile = document.querySelector(`#tile${x}${y}`);
    if (!tile) return;
    tile.classList.remove("premium-move", "normal-move");
    tile.classList.add("jump-move");

    tile.addEventListener(
      "click",
      () =>
        handlePlayerMove(
          { destination: { x, y }, cardId: id },
          "perform-action-card",
        ),
      { once: true },
    );
  });

  renderGame(state);
};

const createPlayerCard = (player) => {
  const card = document.createElement("div");
  card.id = player.playerId;
  card.className = "selectable-player";

  const name = document.createElement("p");
  const pin = document.createElement("div");

  name.className = "user-name";
  pin.className = "user-pin";

  name.textContent = player?.name;
  pin.appendChild(createSVGPlayerIcon(player.pinColor));

  card.append(pin, name);
  return card;
};

export const performSteal = async (id, object) => {
  const res = await fetch(`game/action-card/${id}`, { method: "PATCH" });
  const { state, success, result, message } = await res.json();

  if (!success) {
    return showToast(message, "e");
  }

  if (result.length === 0) {
    return showToast(`No player has ${object}`, "e");
  }

  const playerCards = renderPlayers(object, result, state.players);

  playerCards.map((card) =>
    card.addEventListener("dblclick", () => steal(card, id))
  );
};

const renderPlayers = (object, playerIds, players) => {
  selectorArea.style.display = "block";

  const h2 = document.createElement("h2");
  h2.innerText = `select a player to steal ${object}`;

  const section = document.createElement("section");
  section.className = "players-selection-area";

  const playerCards = playerIds.map((id) => {
    const player = getPlayerById(players, id);
    return createPlayerCard(player);
  });

  section.append(...playerCards);
  selectorArea.innerHTML = "";
  selectorArea.append(h2, section);
  return playerCards;
};

const steal = async (card, id) => {
  const body = JSON.stringify({ opponentPlayerId: card.id, cardId: id });
  const response = await fetch(`/game/perform-action-card`, {
    method: "POST",
    body,
  });
  const { result, state } = await response.json();

  selectorArea.style.display = "none";

  showToast(result.message);
  renderGame(state);
};

const createReplacePopup = (e, type) => {
  replacePopup.style.display = "block";
  replacePopup.style.top = `${e.screenY - 100}px`;
  replacePopup.style.left = `${e.screenX - 100}px`;
  const h2 = document.createElement("h2");
  h2.innerText = `select ${type} to replace`;
  const section = document.createElement("section");
  section.className = "reserve-selection-area";
  const closeBtn = document.createElement("button");
  closeBtn.textContent = "X";
  return { closeBtn, section, h2 };
};

const highlight = (element, cls) => {
  element.classList.add(cls);
};

const replaceElement = async (cardId, position, reservePosition, type) => {
  const res = await fetch("/game/perform-action-card", {
    method: "POST",
    body: JSON.stringify({ cardId, position, reservePosition, type }),
  });

  const { state, success, result, message } = await res.json();

  replacePopup.style.display = "none";
  if (!success) {
    return showToast(message, "e");
  }

  showToast(result.message);
  renderGame(state);
  removeTileHighlighting();
};

const createTiles = (tiles, position, cardId) => {
  return tiles.map((value, index) => {
    const tilePlaceholder = document.createElement("div");
    tilePlaceholder.classList.add("tile");
    const tileValue = document.createElement("h4");
    tileValue.textContent = value;

    tilePlaceholder.append(tileValue);

    tilePlaceholder.addEventListener(
      "click",
      () => replaceElement(cardId, position, index, "tile"),
    );

    return tilePlaceholder;
  });
};

const createYarns = (yarns, position, cardId) => {
  return yarns.map((colorId, index) => {
    const yarn = document.createElement("div");
    yarn.classList.add("yarn");
    yarn.setAttribute(`data-yarn-id`, colorId);
    yarn.style.backgroundColor = colorsMap[colorId];
    yarn.addEventListener(
      "click",
      () => replaceElement(cardId, position, index, "yarn"),
    );
    return yarn;
  });
};

const closeReplacePopup = (closePopup) => {
  closePopup.addEventListener("click", () => {
    replacePopup.innerHTML = "";
    replacePopup.style.display = "none";
    removeTileHighlighting();
  });
};

const addReplaceListener = ({ element, position, type }, cardId, reserved) => {
  element.addEventListener("click", (e) => {
    const { closeBtn, section, h2 } = createReplacePopup(e, type);

    const elements = type === "tile"
      ? createTiles(reserved, position, cardId)
      : createYarns(reserved, position, cardId);

    section.append(...elements);
    replacePopup.innerHTML = "";
    replacePopup.append(h2, section, closeBtn);

    closeReplacePopup(closeBtn);
  });
};

const highlightYarns = (boardYarns, cardId, reservedYarns) => {
  boardYarns.forEach((col, x) => {
    col.forEach((_colorId, y) => {
      const yarn = document.querySelector(`#r-${x}-c-${y}`);
      if (!yarn) return;
      highlight(yarn, "yarn-replace");
      addReplaceListener(
        { element: yarn, position: { x, y }, type: "yarn" },
        cardId,
        reservedYarns,
      );
    });
  });
};

const highlightTiles = (boardTiles, cardId, reservedTiles) => {
  boardTiles.forEach(([x, y]) => {
    const tile = document.querySelector(`#tile${x}${y}`);
    if (!tile) return;

    highlight(tile, "jump-move");
    addReplaceListener(
      { element: tile, position: { x, y }, type: "tile" },
      cardId,
      reservedTiles,
    );
  });
};

export const handleReplaceActionCard = async (cardId) => {
  const res = await fetch(`game/action-card/${cardId}`, { method: "PATCH" });
  const { state, success, result, message } = await res.json();
  const { boardTiles, boardYarns, reservedTiles, reservedYarns } = result;
  if (!success) return showToast(message, "e");

  highlightTiles(boardTiles, cardId, reservedTiles);
  highlightYarns(boardYarns, cardId, reservedYarns);

  showToast(result.message);
  renderGame(state);
};

export const handleGainToken = () => {
  createPopup();
  openDialog();

  const dice = document.querySelector("#dice");
  const newDice = dice.cloneNode(true);
  dice.parentNode.replaceChild(newDice, dice);

  const submitButton = document.getElementById("submit-popup");

  submitButton.addEventListener("click", () => {
    const number = submitDice();

    newDice.addEventListener("click", async () => {
      const res = await fetch(`/game/perform-action-card`, {
        method: "POST",
        body: JSON.stringify({ number, cardId: 31 }),
      });

      const responseBody = await res.json();
      newDice.parentNode.replaceChild(dice, newDice);
      updateDice(responseBody.result.diceValues);
      renderGame(responseBody.state);
      showToast(responseBody.result.message);
    });
  });
};

const preset = (cardId) => {
  const colorDicePopup = document.querySelector("#color-dice-dialog");
  createColorDice(colorDicePopup);
  colorDicePopup.showModal();

  const dice = document.querySelector("#dice");
  const newDice = dice.cloneNode(true);
  dice.parentNode.replaceChild(newDice, dice);

  const submitButton = colorDicePopup.querySelector("#submit-popup");

  submitButton.addEventListener("click", () => {
    const colorId = submitColorDice(colorDicePopup);
    newDice.addEventListener("click", async () => {
      const res = await fetch(`/game/perform-action-card`, {
        method: "POST",
        body: JSON.stringify({ colorId, cardId }),
      });
      const responseBody = await res.json();
      newDice.parentNode.replaceChild(dice, newDice);

      updateDice(responseBody.result.diceValues);
      removeMoveClass();
      removeTileEventListeners();
      renderMoveOptions(responseBody.result.destinations);
      renderGame();
      showToast(responseBody.result.message);
    });
  });
};

export const handlePreset = async (cardId) => {
  const res = await fetch(`game/action-card/${cardId}`, { method: "PATCH" });
  const { success, result, message } = await res.json();

  if (!success) return showToast(message, "e");

  showToast(result.message);
  preset(cardId);
};
