import { colorsMap } from "/assets/colors.js";

const SUCCESSCOLOR = "#22c55e";
const ERRORCOLOR = "#ef4444";

export const showToast = (message, type) => {
  const toast = document.getElementById("toast");

  toast.innerText = message;
  toast.style.background = type === "e" ? ERRORCOLOR : SUCCESSCOLOR;
  toast.style.display = "block";

  setTimeout(() => {
    toast.style.display = "none";
  }, 3000);
};

const dialog = document.getElementById("diceDialog");
const diceContainer = document.getElementById("diceContainer");

let selectedValue = null;
let selectedColorId = null;

const diceMap = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

export const openDialog = () => {
  dialog.showModal();
};

export const closeDialog = () => {
  dialog.close();
};

export const createDice = (value) => {
  const dice = document.createElement("div");
  dice.classList.add("dice-popup");

  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");

    if (diceMap[value].includes(i)) {
      const dot = document.createElement("div");
      dot.classList.add("dice-dot");
      cell.appendChild(dot);
    }

    dice.appendChild(cell);
  }

  dice.addEventListener("click", () => {
    document.querySelectorAll(".dice").forEach((d) =>
      d.classList.remove("selected")
    );
    selectedValue = null;
    // dice.classList.add("selected");
    selectedValue = value;
  });

  return dice;
};

export const createPopup = () => {
  for (let i = 1; i <= 6; i++) {
    diceContainer.appendChild(createDice(i));
  }
};

export const submitDice = () => {
  if (selectedValue === null) {
    alert("Please select a dice");
    return;
  }
  dialog.close();
  diceContainer.innerHTML = "";
  return selectedValue;
};

export const getPlayerById = (players, id) =>
  players.find((player) => player.playerId === id) || { name: "not found" };

export const createColorDice = (dialog) => {
  const diceColors = dialog.querySelectorAll(".color");
  diceColors.forEach((dice) => {
    const colorId = dice.dataset.diceId;
    dice.style.backgroundColor = colorsMap[colorId];
  });

  const dices = document.querySelectorAll(".dice-popup");

  dices.forEach((dice) => {
    dice.classList.remove("selected");
    dice.addEventListener("click", () => {
      dices.forEach((dice) => {
        dice.classList.remove("selected");
      });

      dice.classList.add("selected");
      selectedColorId = dice.querySelector(".color").dataset.diceId;
    });
  });
};

export const submitColorDice = (colorDicePopup) => {
  if (selectedColorId === null) {
    alert("Please select a dice");
    return;
  }
  colorDicePopup.close();
  return selectedColorId;
};
