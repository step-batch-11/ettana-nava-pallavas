const panels = document.querySelectorAll(".panel");
const containers = document.querySelectorAll(".cards");
let souceContainer = null;
let dragged = null;
const placeholder = document.createElement("div");
placeholder.classList.add("placeholder");

const toggleDeckView = (panels) => {
  panels.forEach((panel) => {
    panel.addEventListener("click", () => {
      panels.forEach((p) => p.classList.remove("expanded"));
      panel.classList.add("expanded");
    });
  });
};

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
  souceContainer = e.target.closest(".cards");
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

  if (container !== souceContainer) return;
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
  if (souceContainer !== targetContainer) {
    placeholder.remove();
    return;
  }

  placeholder.before(dragged);
  placeholder.remove();
};

const handleDragCards = (containers) => {
  containers.forEach((container) => {
    container.addEventListener("dragstart", handleDragStart);
    container.addEventListener("dragend", (_e) => placeholder.remove());
    container.addEventListener("dragover", (e) => handleDragOver(e, container));
    container.addEventListener("drop", handleDragDrop);
  });
};

toggleDeckView(panels);
handleDragCards(containers);
