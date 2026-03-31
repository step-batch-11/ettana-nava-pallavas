import { colorsMap } from "/assets/colors.js";

let cardId = 2;

const sendRequest = async (path) => {
  const response = await fetch(path);
  return await response.json();
};

const createCard = (id, content) => {
  const card = document.createElement("div");
  card.classList.add("card-item");

  if (content) card.textContent = content;

  card.setAttribute("draggable", true);
  card.setAttribute("id", id);

  return card;
};

const buyDesignCard = () => {
  const designCard = document.querySelector(".design-card");
  const cardsPlaceholder = document.querySelector(".design-cards .cards");

  designCard.addEventListener("click", async () => {
    const response = await sendRequest("/game/buy-design-card");
    if (response.hasError) {
      alert("Error came");
      return;
    }

    const card = createCard(`d-${cardId++}`, response.victoryPoints);
    cardsPlaceholder.append(card);
    renderBankState();
  });
};

const attachListeners = () => {
  buyDesignCard();
};

attachListeners();

export const renderBankState = async () => {
  const bank = await sendRequest("/game/bank-state");

  const tokenPlaceholder = document.querySelector("#token-count");
  tokenPlaceholder.textContent = bank.tokens;

  const tiles = document.querySelectorAll(".tile span");
  tiles.forEach((tile, index) => {
    tile.textContent = bank.tiles[index].value;
  });

  const yarns = document.querySelectorAll(".yarn");
  yarns.forEach((yarn, index) => {
    yarn.style.backgroundColor = colorsMap[bank.yarns[index]];
  });
};
