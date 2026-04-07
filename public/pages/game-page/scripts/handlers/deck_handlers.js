import {
  autoScrollWithDrag,
  getDragAfterElement,
} from "../utilities/deck_utilities.js";
import { renderGame } from "/pages/game-page/scripts/app.js";

export const handleDragStart = (e, dragged, sourceContainer) => {
  if (!e.target.classList.contains("card-item")) return;

  dragged.element = e.target;
  sourceContainer.element = e.target.closest(".cards");

  setTimeout(() => {
    dragged.element.classList.add("dragging");
  }, 0);
};

export const handleDragOver = (e, container, sourceContainer, placeholder) => {
  e.preventDefault();

  if (container !== sourceContainer.element) return;
  autoScrollWithDrag(e, container);

  const afterElement = getDragAfterElement(container, e.clientX);

  if (afterElement == null) {
    container.appendChild(placeholder);
  } else {
    afterElement.before(placeholder);
  }
};

export const handleDragDrop = (e, dragged, sourceContainer, placeholder) => {
  e.preventDefault();
  if (!dragged.element) return;

  const targetContainer = placeholder.closest(".cards");
  if (sourceContainer.element !== targetContainer) {
    placeholder.remove();
    return;
  }

  placeholder.before(dragged.element);
  placeholder.remove();
};

export const handleDragEnd = (dragged, sourceContainer, placeholder) => {
  if (dragged) {
    dragged.element.classList.remove("dragging");
  }
  const _ids = [...sourceContainer.element.querySelectorAll(".card-item")].map((
    card,
  ) => card.dataset.id);

  placeholder.remove();
};

export const rotateDesignCard = async (card) => {
  const res = await fetch(`/game/rotate-design-card/${card.dataset.id}`, {
    method: "PATCH",
  });
  const { state, success } = await res.json();
  if (success) {
    const designGrid = card.querySelector(".design");
    let angle = Number.parseInt(card.dataset.angle || "0", 10);
    angle += 90;
    card.dataset.angle = angle;
    designGrid.style.transform = `rotateZ(${angle}deg)`;
  }

  await new Promise((res) => {
    setTimeout(() => {
      res(1);
    }, 500);
  });

  console.log(state.deck);

  renderGame(state);
};
