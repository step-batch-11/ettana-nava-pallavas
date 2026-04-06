import {
  autoScrollWithDrag,
  getDragAfterElement,
} from "../utilities/deck_utilities.js";

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
  if (sourceContainer.element.id.includes("action")) {
    console.log("action");
  } else {
    console.log("design");
  }

  placeholder.remove();
};
