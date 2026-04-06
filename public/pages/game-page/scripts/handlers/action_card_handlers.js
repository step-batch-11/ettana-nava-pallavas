import { handleSwapEvent, removeTileHighlighting } from "./board_handlers.js";
import { getPlayerById, showToast } from "../../../utils/utils.js";
import { handlePlayerMove } from "../utilities/game_utilities.js";
import { renderGame } from "../app.js";
import { createSVGPlayerIcon } from "../utilities/board_utilities.js";
import { selectorArea } from "../utilities/dom_elements.js";

export const handleActionCardSwap = (path) => {
  handleSwapEvent(path);
};

export const handleMoveActionCard = async () => {
  const res = await fetch(`game/action-card/1`, { method: "PATCH" });
  const { state, success, result } = await res.json();

  if (!success) {
    return showToast(result.message, "e");
  }

  result.availableDestinations.forEach(([x, y]) => {
    const tile = document.querySelector(`#tile${x}${y}`);
    if (!tile) return;

    tile.classList.add("jump-move");

    tile.addEventListener(
      "click",
      () =>
        handlePlayerMove(
          { destination: { x, y } },
          "action-card-move",
        ),
      { once: true },
    );
  });

  showToast(result.message);
  renderGame(state);
};

const createPlayerCard = (player) => {
  const card = document.createElement("div");
  card.id = player.playerId;
  card.className = "selectable-player";

  const name = document.createElement("p");
  const pin = document.createElement("div");

  name.className = "user-name";
  pin.className = "user-pin";

  name.textContent = player?.name;
  pin.appendChild(createSVGPlayerIcon(player.pinColor));

  card.append(pin, name);
  return card;
};

export const performSteal = async (id, object) => {
  const res = await fetch(`game/action-card/${id}`, { method: "PATCH" });
  const { state, success, result } = await res.json();
  console.log(result);

  if (!success) {
    return showToast(result.message, "e");
  }

  if (result.length === 0) {
    return showToast(`No player has ${object}`, "e");
  }

  const playerCards = renderPlayers(object, result, state.players);

  playerCards.map((card) =>
    card.addEventListener("dblclick", () => steal(card, id))
  );
};

const renderPlayers = (object, playerIds, players) => {
  selectorArea.style.display = "block";

  const h2 = document.createElement("h2");
  h2.innerText = `select a player to steal ${object}`;

  const section = document.createElement("section");
  section.className = "players-selection-area";

  const playerCards = playerIds.map((id) => {
    const player = getPlayerById(players, id);
    return createPlayerCard(player);
  });

  section.append(...playerCards);
  selectorArea.innerHTML = "";
  selectorArea.append(h2, section);
  return playerCards;
};

const steal = async (card, id) => {
  const body = JSON.stringify({ opponentPlayerId: card.id, cardId: id });
  const response = await fetch(`/game/perform-action-card`, {
    method: "POST",
    body,
  });
  const { result, state } = await response.json();

  selectorArea.style.display = "none";

  showToast(result.message);
  renderGame(state);
};

function handleReplaceTile(x, y) {
  const reservedTiles = document.querySelectorAll(".tiles .tile");
  reservedTiles.forEach((tile, index) => {
    tile.classList.add("jump-move");
    tile.addEventListener("click", async () => {
      const res = await fetch("/game/replace-tile", {
        method: "PATCH",
        body: JSON.stringify({ source: [x, y], destination: index }),
      });
      const { success, result } = await res.json();

      if (!success) {
        return showToast(message, "e");
      }

      showToast(result.message);
      renderGame(result.state);
      removeTileHighlighting();
    });
  });
}

export const handleReplaceActionCard = async () => {
  const res = await fetch(`game/action-card/34`, { method: "PATCH" });
  const { state, success, result, message } = await res.json();

  if (!success) return showToast(message, "e");

  result.availableDestinations.forEach(([x, y]) => {
    const tile = document.querySelector(`#tile${x}${y}`);
    if (!tile) return;
    tile.classList.add("jump-move");

    tile.addEventListener("click", () => {
      handleReplaceTile(x, y);
    });
  });

  showToast(result.message);
  renderGame(state);
};
