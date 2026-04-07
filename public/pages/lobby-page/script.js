const maxPlayers = 4;

const playerList = document.getElementById("playerList");
const playerCount = document.getElementById("playerCount");

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

document.getElementById("exitBtn").addEventListener("click", async () => {
  if (confirm("Leave the loom?")) {
    const currentPlayerId = localStorage.getItem("id");
    const res = await fetch(`/lobby/exit-lobby/${currentPlayerId}`, {
      method: "DELETE",
    });
    const resBody = await res.json();

    if (resBody.success) {
      localStorage.removeItem("id");
      globalThis.location.assign("/start");
    }
  }
});

const main = () => {
  setInterval(async () => {
    const res = await fetch("/lobby/get-state");
    const { state } = await res.json();
    renderPlayers(state.players);
  }, 200);
};

main();
