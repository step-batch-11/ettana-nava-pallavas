import { colorsMap } from "../../../assets/colors.js";
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

  const cardPointer = document.createElement("div");
  cardPointer.textContent = cardInfo.victoryPoint;
  card.append(cardPointer);

  const design = document.createElement("div");
  design.classList.add("design");

  card.id = id + 1;
  card.setAttribute("draggable", "true");

  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      const colorContainer = document.createElement("div");
      colorContainer.classList.add("color-item");
      colorContainer.id = `r-${r}-c-${c}`;
      colorContainer.style.backgroundColor = "white";
      design.appendChild(colorContainer);
    }
  }

  card.append(design);
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

    actionCard.textContent = card.description;
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

export const addDragEventListenerOnDeck = () => {
  containers.forEach((container) => {
    container.addEventListener("dragstart", handleDragStart);
    container.addEventListener("dragend", (_e) => placeholder.remove());
    container.addEventListener("dragover", (e) => handleDragOver(e, container));
    container.addEventListener("drop", handleDragDrop);
  });
};

export const renderDeck = (actionCards, designCards) => {
  renderDesignCards(designCards);
  renderActionCards(actionCards);
};
