const container = document.getElementById("actionContainer");

const createFront = (image) => {
  const front = document.createElement("div");
  front.className = "card-face card-front";

  const img = document.createElement("img");
  img.src = image;

  const infoBtn = document.createElement("div");
  infoBtn.className = "info-btn";
  infoBtn.innerText = "i";

  front.appendChild(img);
  front.appendChild(infoBtn);

  return { front, infoBtn };
};

const createBackSide = (title, description) => {
  const back = document.createElement("div");
  back.className = "card-face card-back";

  const titleEl = document.createElement("h3");
  titleEl.innerText = title;

  const desc = document.createElement("p");
  desc.innerText = description;

  const footer = document.createElement("div");
  footer.className = "footer";
  footer.innerText = "Tap to flip back";

  back.appendChild(titleEl);
  back.appendChild(desc);
  back.appendChild(footer);

  return back;
};

export const createActionCardNew = ({ title, description, image }) => {
  const card = document.createElement("div");
  card.className = "card";

  const { front, infoBtn } = createFront(image);

  const back = createBackSide(title, description);

  card.appendChild(front);
  card.appendChild(back);

  infoBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    card.classList.add("flipped");
  });

  card.addEventListener("click", () => {
    if (card.classList.contains("flipped")) {
      card.classList.remove("flipped");
    }
  });
  container.appendChild(card);
};

createActionCardNew({
  title: "Move",
  description: "Move your pin to any unoccupied square.",
  image: "/assets/action_cards/move_card.svg",
});
createActionCardNew({
  title: "Move",
  description: "Move your pin to any unoccupied square.",
  image: "/assets/action_cards/gain_tokens_card.svg",
});
createActionCardNew({
  title: "Move",
  description: "Move your pin to any unoccupied square.",
  image: "/assets/action_cards/roll_again_card.svg",
});
createActionCardNew({
  title: "Move",
  description: "Move your pin to any unoccupied square.",
  image: "/assets/action_cards/roll_again_card.svg",
});
createActionCardNew({
  title: "Move",
  description: "Move your pin to any unoccupied square.",
  image: "/assets/action_cards/roll_again_card.svg",
});
createActionCardNew({
  title: "Move",
  description: "Move your pin to any unoccupied square.",
  image: "/assets/action_cards/roll_again_card.svg",
});

const actionSection = document.getElementById("actionSection");
const designSection = document.getElementById("designSection");

const expand = (active, inactive) => {
  active.classList.add("expanded");
  active.classList.remove("collapsed");

  inactive.classList.add("collapsed");
  inactive.classList.remove("expanded");
};

actionSection.addEventListener("click", () => {
  expand(actionSection, designSection);
});

designSection.addEventListener("click", () => {
  expand(designSection, actionSection);
});
