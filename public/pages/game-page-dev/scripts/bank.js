import { colorsMap } from "/assets/colors.js";
import { showToast } from "../../utils/utils.js";
import { renderGame } from "./app.js";
import { changeTurnRequest, sendRequest } from "./api.js";
import {
  handleSwapEvent,
  removeTileHighlighting,
  removeYarnHighlighting,
} from "./handlers/board_handlers.js";
import { handlePlayerMove } from "./utilities/game_utilities.js";
import { removeTileEventListeners } from "/pages/game-page/scripts/utilities/board_utilities.js";

const actionCards = [
  {
    "id": 1,
    "type": "move",
    "description": "Move the pin to any unoccupied square.",
  },

  {
    "id": 4,
    "type": "get tokens",
    "description": "Get 3 tokens from the reserve.",
  },

  {
    "id": 7,
    "type": "get design card",
    "description": "Get a design card from the stack.",
  },

  {
    "id": 10,
    "type": "steal token",
    "description": "Choose a player and steal a maximum of 2 tokens.",
  },

  {
    "id": 13,
    "type": "preset",
    "description": "Preset color of the die and roll only the number die.",
  },

  {
    "id": 16,
    "type": "victory point",
    "description":
      "1 Victory point. Reveal the card immediately and keep face-up. Cannot be stolen.",
  },

  {
    "id": 6,
    "type": "tax",
    "description": "All other players pay 1 token to the reserve.",
  },

  {
    "id": 22,
    "type": "steal action card",
    "description": "Choose a player and steal an action card.",
  },

  {
    "id": 25,
    "type": "swap yarns",
    "description": "Swap positions of any two yarns on the board.",
  },

  {
    "id": 28,
    "type": "roll again",
    "description":
      "Roll the dice again (cannot be played with Preset action card).",
  },

  {
    "id": 31,
    "type": "gain token",
    "description":
      "Call out a number and roll the dice. Gain called out number of tokens if number rolled is greater than or equal to the number called.",
  },

  {
    "id": 34,
    "type": "replace",
    "description":
      "Replace a yarn or a number tile with the reserve which has 5 yarns and 2 number tiles.",
  },
];

const passTurnEventListener = () => {
  const passTurn = document.querySelector("#pass-turn");

  if (passTurn.dataset.listenerAdded) return;

  passTurn.addEventListener("dblclick", async () => {
    removeYarnHighlighting();
    removeTileHighlighting();
    removeTileEventListeners(handlePlayerMove);

    const response = await changeTurnRequest("/game/pass-turn");

    if (!response.success) {
      showToast(response.error.message, "e");
      return;
    }

    const { state } = await sendRequest("/game/game-state");
    renderGame(state);
  });

  passTurn.dataset.listenerAdded = true;
};

const buyDesignCardEventListener = () => {
  const designCard = document.querySelector(".design-card");

  if (designCard.dataset.listenerAdded) return;
  designCard.addEventListener("click", async () => {
    const response = await sendRequest("/game/buy-design-card");
    if (!response.success) {
      showToast(response.error.message, "e");
      return;
    }

    const { state } = await sendRequest("/game/game-state");
    renderGame(state);
  });

  designCard.dataset.listenerAdded = true;
};

const createEttanaPopup = (options = [], onSelect = () => {}) => {
  const root = document.getElementById("ettanaPopupRootMount");

  const overlay = document.createElement("div");
  overlay.className = "ettana-popup-overlay-root";

  const container = document.createElement("div");
  container.className = "ettana-popup-container";

  const title = document.createElement("h2");
  title.className = "ettana-popup-title";
  title.innerText = "Select an Option";

  const select = document.createElement("select");
  select.className = "ettana-popup-select-input";

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.innerText = "-- Choose --";
  select.appendChild(defaultOption);

  options.forEach(({ id, type }) => {
    const optionEl = document.createElement("option");
    optionEl.value = id;
    optionEl.innerText = type;
    select.appendChild(optionEl);
  });

  const actions = document.createElement("div");
  actions.className = "ettana-popup-actions-row";

  const cancelBtn = document.createElement("button");
  cancelBtn.className = "ettana-popup-btn ettana-popup-btn-cancel";
  cancelBtn.innerText = "Cancel";

  const confirmBtn = document.createElement("button");
  confirmBtn.className = "ettana-popup-btn ettana-popup-btn-confirm";
  confirmBtn.innerText = "Confirm";

  actions.appendChild(cancelBtn);
  actions.appendChild(confirmBtn);

  container.appendChild(title);
  container.appendChild(select);
  container.appendChild(actions);
  overlay.appendChild(container);

  root.appendChild(overlay);

  cancelBtn.onclick = () => {
    root.removeChild(overlay);
  };

  confirmBtn.onclick = () => {
    const value = select.value;

    if (!value) {
      alert("Please select an option!");
      return;
    }

    onSelect(value);
    root.removeChild(overlay);
  };
};

const buyActionCardEventListener = () => {
  const actionCard = document.querySelector(".action-card");

  if (actionCard.dataset.listenerAdded) return;

  actionCard.addEventListener("click",  () => {
    createEttanaPopup(actionCards, async (value) => {
      const res = await fetch(`/game/sudo-buy/${value}`);
      const resBody = await res.json();
      console.log(resBody);
    });

    renderGame();
  });

  actionCard.dataset.listenerAdded = true;
};

const getCurrentPlayer = (state) => {
  const currentPlayerId = state.currentPlayerId;
  return state.players.find((player) => player.playerId === currentPlayerId);
};

const hasPaidSwap = () => {
  const yarns = document.querySelectorAll(".dot[draggable=true]");
  return yarns.length > 4;
};

const buyPaidSwapListener = () => {
  const button = document.querySelector(".swap-btn");

  if (button.dataset.listenerAdded) return;
  button.addEventListener("click", async () => {
    if (hasPaidSwap()) {
      return showToast("You already have an unused paid swap", "e");
    }
    const res = await fetch("/game/buy-swap", { credentials: "include" });
    const resBody = await res.json();
    if (!resBody.success) {
      return showToast(resBody.error.message, "e");
    }

    handleSwapEvent("/game/paid-swap");
  });
  button.dataset.listenerAdded = true;
};

const setButtonForBuyingPaidSwap = (state) => {
  const currentPlayer = getCurrentPlayer(state);
  const buySwapButton = document.querySelector(".swap-btn");

  buySwapButton.disabled = currentPlayer.tokens < 3;
};

export const renderBankReserve = (state) => {
  const bank = state.bank;
  setButtonForBuyingPaidSwap(state);

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
  buyDesignCardEventListener();
  buyActionCardEventListener();
  buyPaidSwapListener();
  passTurnEventListener();
};
