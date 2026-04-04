import { colorsMap } from "../../../assets/colors.js";
import { showToast } from "../../utils/utils.js";
import { renderGame } from "./app.js";
import { highLightYarns } from "./bank.js";

const panels = document.querySelectorAll(".panel");
const containers = document.querySelectorAll(".cards");
const designCardContainer = document.getElementById("design-card-panel");
const actionCardContainer = document.getElementById("action-card-panel");

let sourceContainer = null;
let dragged = null;

const placeholder = document.createElement("div");
placeholder.classList.add("placeholder");

const findClosest = (closest, child, x) => {
  const box = child.getBoundingClientRect();
  const offset = x - (box.left + box.width / 2);

  if (offset < 0 && offset > closest.offset) {
    return { offset: offset, element: child };
  } else {
    return closest;
  }
};

const getDragAfterElement = (container, x) => {
  const elements = [...container.querySelectorAll(".card-item:not(.dragging)")];

  return elements.reduce(
    (closest, child) => findClosest(closest, child, x),
    { offset: Number.NEGATIVE_INFINITY },
  ).element;
};

const handleDragStart = (e) => {
  if (!e.target.classList.contains("card-item")) return;

  dragged = e.target;
  sourceContainer = e.target.closest(".cards");

  setTimeout(() => {
    dragged.classList.add("dragging");
  }, 0);
};

const autoScrollWithDrag = (e, container) => {
  const rect = container.getBoundingClientRect();
  const edgeThreshold = 100;
  const scrollSpeed = 2;
  const mouseX = e.clientX;

  if (mouseX < rect.left + edgeThreshold) {
    container.scrollLeft -= scrollSpeed;
  }

  if (mouseX > rect.right - edgeThreshold) {
    container.scrollLeft += scrollSpeed;
  }
};

const handleDragOver = (e, container) => {
  e.preventDefault();

  if (container !== sourceContainer) return;
  autoScrollWithDrag(e, container);

  const afterElement = getDragAfterElement(container, e.clientX);

  if (afterElement == null) {
    container.appendChild(placeholder);
  } else {
    afterElement.before(placeholder);
  }
};

const handleDragDrop = (e) => {
  e.preventDefault();
  if (!dragged) return;

  const targetContainer = placeholder.closest(".cards");
  if (sourceContainer !== targetContainer) {
    placeholder.remove();
    return;
  }

  placeholder.before(dragged);
  placeholder.remove();
};

const createSkeleton = (cardInfo, id) => {
  const card = document.createElement("div");
  card.classList.add("card-item");
  card.dataset.id = cardInfo.id;
  card.id = id + 1;
  card.setAttribute("draggable", "true");

  const cardTop = document.createElement("section");
  cardTop.classList.add("card-item-top");

  const pointer = document.createElement("div");
  pointer.classList.add("card-pointer");
  pointer.textContent = cardInfo.victoryPoints;
  cardTop.append(pointer);

  const cardMiddle = document.createElement("section");
  cardMiddle.classList.add("design");

  const cardBottom = document.createElement("section");
  cardBottom.classList.add("card-item-bottom");

  const buttonArea = document.createElement("section");
  buttonArea.classList.add("card-item-button-area");

  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      const colorContainer = document.createElement("div");
      colorContainer.classList.add("color-item");
      colorContainer.id = `r-${r}-c-${c}`;
      colorContainer.style.backgroundColor = "white";
      cardMiddle.appendChild(colorContainer);
    }
  }

  card.append(cardTop, cardMiddle, cardBottom);

  return card;
};

const applyPattern = (card, cardInfo) => {
  cardInfo.forEach(({ coord, color }) => {
    const ele = card.querySelector(`#r-${coord.x}-c-${coord.y}`);
    ele.style.backgroundColor = colorsMap[color];
  });

  return card;
};

const createDesignCard = (cardInfo, id) => {
  const card = createSkeleton(cardInfo, id);
  return applyPattern(card, cardInfo.design);
};

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
    const actionCard = document.createElement("div");
    actionCard.classList.add("card-item");
    actionCard.setAttribute("draggable", "true");
    actionCard.dataset.id = card.id;
    actionCard.id = `a-${card.id}`;

    const actionDetails = document.createElement("section");
    actionDetails.classList.add("action-details");
    actionDetails.textContent = card.description;

    actionCard.append(actionDetails);
    actionCardContainer.appendChild(actionCard);
  });
};

export const addToggleEventListenerOnDeck = () => {
  panels.forEach((panel) => {
    panel.addEventListener("click", () => {
      panels.forEach((p) => p.classList.remove("expanded"));
      panel.classList.add("expanded");
    });
  });
};

const handleDragEnd = () => {
  if (dragged) {
    dragged.classList.remove("dragging");
  }
  const _ids = [...sourceContainer.querySelectorAll(".card-item")].map((card) =>
    card.dataset.id
  );
  if (sourceContainer.id.includes("action")) {
    console.log("action");
  } else {
    console.log("design");
  }

  placeholder.remove();
};

export const addDragEventListenerOnDeck = () => {
  containers.forEach((container) => {
    container.addEventListener("dragstart", handleDragStart);
    container.addEventListener("dragover", (e) => handleDragOver(e, container));
    container.addEventListener("drop", handleDragDrop);
    container.addEventListener("dragend", handleDragEnd);
  });
};

export const addClaimEventListener = (handleClaim) => {
  designCardContainer.querySelectorAll(".card-item").forEach(
    (card) => {
      card.addEventListener("dblclick", handleClaim);
    },
  );
};

export const renderDeck = (deck) => {
  renderDesignCards(deck.designCards);
  renderActionCards(deck.actionCards);
};

export const attachPlayActionCard = () => {
  const actionCards = document.querySelectorAll(".action-cards .card-item");

  actionCards.forEach((card) => {
    card.addEventListener("click", async () => {
      if (card.id === "a-25") {
        highLightYarns("game/action-card/swap-yarn");
      } else {
        const id = card.dataset.id;
        const res = await fetch(`game/action-card/${id}`, { method: "PATCH" });
        const { state, success, message } = await res.json();

        if (!success) {
          return showToast(message, "e");
        }

        showToast(message);
        renderGame(state);
      }
    });
  });
};
