import { showToast } from "/pages/utils/utils.js";

const maxPlayers = 4;

const playerList = document.getElementById("playerList");
const playerCount = document.getElementById("playerCount");
const startButton = document.querySelector(".start-button");
const infoLocation = document.querySelector(".room-info");

const renderPlayers = (players) => {
  playerList.innerHTML = "";

  players.forEach((p) => {
    const div = document.createElement("div");
    div.dataset.id = p.id;
    div.className = "player";
    div.innerHTML = `
      <span>${p.name}</span>
      <span>🧵</span>
    `;
    playerList.appendChild(div);
  });

  playerCount.textContent = `${players.length} / ${maxPlayers} Players`;
};

const renderCardInfo = (room) => {
  infoLocation.textContent = `Room Id: ${room.id}`;
};

document.getElementById("exitBtn").addEventListener("click", async () => {
  if (confirm("Leave the loom?")) {
    const currentPlayerId = localStorage.getItem("id");
    const res = await fetch(`/lobby/exit-lobby/${currentPlayerId}`, {
      method: "DELETE",
    });
    const resBody = await res.json();

    if (resBody.success) {
      localStorage.removeItem("id");
      globalThis.location.assign("/");
    }
  }
});

startButton.addEventListener("click", async () => {
  const res = await fetch("/lobby/start-game");
  const resBody = await res.json();
  if (!resBody.success) {
    showToast(resBody.error, "e");
    return;
  }

  globalThis.location.assign("/game");
});

const main = () => {
  setInterval(async () => {
    const res = await fetch("/lobby/get-state");
    const { state, room } = await res.json();
    if (state.start) {
      globalThis.location.assign("/game");
    }
    renderPlayers(state.players);
    renderCardInfo(room);
  }, 50);
};

main();
