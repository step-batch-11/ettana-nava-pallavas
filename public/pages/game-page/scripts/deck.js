import { showToast } from "../../utils/utils.js";
import { addEventListener, renderGame } from "./app.js";
import { claimDesignCard, playActionCard } from "./api.js";
import {
  createActionCard,
  createDesignCard,
} from "./utilities/deck_utilities.js";
import {
  handleDragDrop,
  handleDragEnd,
  handleDragOver,
  handleDragStart,
  rotateDesignCard,
} from "./handlers/deck_handlers.js";

import {
  handleActionCardSwap,
  handleGainToken,
  handleMoveActionCard,
  handleReplaceActionCard,
} from "./handlers/action_card_handlers.js";

import { highlightPattern } from "./board.js";

const panels = document.querySelectorAll(".panel");
const containers = document.querySelectorAll(".cards");
const designCardContainer = document.getElementById("design-card-panel");
const actionCardContainer = document.getElementById("action-card-panel");
const sourceContainer = { element: null };
const dragged = { element: null };

const placeholder = document.createElement("div");
placeholder.classList.add("placeholder");

const renderDesignCards = (cards) => {
  designCardContainer.innerHTML = "";
  cards.forEach((card, i) => {
    const ele = createDesignCard(card, i);
    designCardContainer.appendChild(ele);
  });
};

const renderActionCards = (cards) => {
  actionCardContainer.innerHTML = "";

  cards.forEach((card) => {
    const actionCard = createActionCard(card);
    actionCardContainer.appendChild(actionCard);
  });
};

const isVictoryPointCardPresent = async (card) => {
  if (card.some((c) => c.id === 16)) {
    const { result, success, state } = await playActionCard(16);
    if (success) {
      showToast(result.message);
    }
    renderGame(state);
    addEventListener();
  }
};

const handleClaimDesignCard = async (card) => {
  if (!card) return;

  const status = await claimDesignCard(card.dataset.id);

  if (!status.result.isMatched) {
    showToast("Pattern is not matched", "e");
    return;
  }

  renderGame(status.state);
  highlightPattern(status.result.matches);
};

const claimDesignCardEventListener = () => {
  if (designCardContainer.dataset.listenerAdded) return;
  designCardContainer.addEventListener("dblclick", (e) => {
    const card = e.target.closest(".card-item");
    const button = e.target.closest(".rotate-design");
    if (!card || button) return;
    if (!designCardContainer.contains(card)) return;

    handleClaimDesignCard(card);
  });

  designCardContainer.addEventListener("click", (e) => {
    const button = e.target.closest(".rotate-design");
    const card = e.target.closest(".card-item");

    if (!button || !card) return;
    if (!designCardContainer.contains(card)) return;

    rotateDesignCard(card);
  });

  designCardContainer.dataset.listenerAdded = true;
};

const playActionCardEventListener = () => {
  const actionCardsContainer = document.querySelector(".action-cards");

  if (actionCardsContainer.dataset.listenerAdded) return;

  actionCardsContainer.addEventListener("dblclick", async (e) => {
    const card = e.target.closest(".card-item");

    if (!card) return;
    if (!actionCardsContainer.contains(card)) return;
    const id = card.dataset.id;

    if (id === "25") {
      return handleActionCardSwap("game/action-card/swap-yarn");
    }

    if (id === "1") {
      return handleMoveActionCard();
    }

    if (id === "34") {
      return handleReplaceActionCard();
    }

    if (id === "31") {
      return handleGainToken();
    }

    try {
      const res = await fetch(`game/action-card/${id}`, { method: "PATCH" });
      const { state, success, result, message } = await res.json();

      if (!success) {
        return showToast(message, "e");
      }

      showToast(result.message);
      renderGame(state);
    } catch (err) {
      showToast("Something went wrong", err);
    }
  });

  actionCardsContainer.dataset.listenerAdded = true;
};

const togglePanelViewEventListener = () => {
  panels.forEach((panel) => {
    panel.addEventListener("click", () => {
      panels.forEach((p) => p.classList.remove("expanded"));
      panel.classList.add("expanded");
    });
  });
};

const dragDesignCardsEventListener = () => {
  containers.forEach((container) => {
    container.addEventListener(
      "dragstart",
      (e) => handleDragStart(e, dragged, sourceContainer),
    );
    container.addEventListener(
      "dragover",
      (e) => handleDragOver(e, container, sourceContainer, placeholder),
    );
    container.addEventListener(
      "drop",
      (e) => handleDragDrop(e, dragged, sourceContainer, placeholder),
    );
    container.addEventListener(
      "dragend",
      () => handleDragEnd(dragged, sourceContainer, placeholder),
    );
  });
};

export const renderDeck = (deck) => {
  renderDesignCards(deck.designCards);
  isVictoryPointCardPresent(deck.actionCards);
  renderActionCards(deck.actionCards);
};

export const attachDeckEventListener = () => {
  claimDesignCardEventListener();
  playActionCardEventListener();
  dragDesignCardsEventListener();
  togglePanelViewEventListener();
};
