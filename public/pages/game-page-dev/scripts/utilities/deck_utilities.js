import { colorsMap } from "/assets/colors.js";

const findClosest = (closest, child, x) => {
  const box = child.getBoundingClientRect();
  const offset = x - (box.left + box.width / 2);

  if (offset < 0 && offset > closest.offset) {
    return { offset: offset, element: child };
  } else {
    return closest;
  }
};

export const getDragAfterElement = (container, x) => {
  const elements = [...container.querySelectorAll(".card-item:not(.dragging)")];

  return elements.reduce(
    (closest, child) => findClosest(closest, child, x),
    { offset: Number.NEGATIVE_INFINITY },
  ).element;
};

export const autoScrollWithDrag = (e, container) => {
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

const createCardTopArea = (victoryPoints) => {
  const card = document.createElement("section");
  card.classList.add("card-item-top");

  const victoryPointer = document.createElement("div");
  victoryPointer.classList.add("card-pointer");
  victoryPointer.textContent = victoryPoints;
  card.append(victoryPointer);

  const rotateButton = document.createElement("button");
  rotateButton.innerHTML = "↻";

  const exchangeButton = document.createElement("button");
  exchangeButton.innerHTML = "⇄";

  rotateButton.classList.add("rotate-design");
  exchangeButton.classList.add("exchange-design");

  card.append(rotateButton, exchangeButton);

  return card;
};

const createDesignGrid = () => {
  const design = document.createElement("section");
  design.classList.add("design");

  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      const colorContainer = document.createElement("div");
      colorContainer.classList.add("color-item");
      colorContainer.id = `r-${r}-c-${c}`;
      colorContainer.style.backgroundColor = "white";
      design.appendChild(colorContainer);
    }
  }
  return design;
};

const createDesignCardSkeleton = (cardInfo, id) => {
  const card = document.createElement("div");
  card.classList.add("card-item");
  card.dataset.id = cardInfo.id;
  card.id = id + 1;
  card.setAttribute("draggable", "true");

  const cardBottom = document.createElement("section");
  cardBottom.classList.add("card-item-bottom");

  const cardTop = createCardTopArea(cardInfo.victoryPoints);
  const designGrid = createDesignGrid();

  card.append(cardTop, designGrid, cardBottom);

  return card;
};

const applyPattern = (card, cardInfo) => {
  cardInfo.forEach(({ coord, color }) => {
    const ele = card.querySelector(`#r-${coord.x}-c-${coord.y}`);
    ele.style.backgroundColor = colorsMap[color];
  });

  return card;
};

export const createDesignCard = (cardInfo, id) => {
  const card = createDesignCardSkeleton(cardInfo, id);
  return applyPattern(card, cardInfo.design);
};

export const createActionCard = (card) => {
  const actionCard = document.createElement("div");
  actionCard.classList.add("card-item");
  actionCard.setAttribute("draggable", "true");
  actionCard.dataset.id = card.id;
  actionCard.id = `a-${card.id}`;

  const actionDetails = document.createElement("section");
  actionDetails.classList.add("action-details");
  actionDetails.textContent = card.description;

  actionCard.append(actionDetails);
  return actionCard;
};
