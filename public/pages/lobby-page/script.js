const maxPlayers = 4;

const _players = [
  { username: "Sandip" },
  { username: "Aman" },
];

const playerList = document.getElementById("playerList");
const playerCount = document.getElementById("playerCount");
const timerEl = document.getElementById("timer");

function renderPlayers() {
  playerList.innerHTML = "";

  _players.forEach((p) => {
    const div = document.createElement("div");
    div.className = "player";

    div.innerHTML = `
      <span>${p.username}</span>
      <span>🧵</span>
    `;

    playerList.appendChild(div);
  });

  playerCount.textContent = `${_players.length} / ${maxPlayers} Players`;
}

renderPlayers();

// ⏳ Timer
let timeLeft = 30;

const timer = setInterval(() => {
  timeLeft--;
  timerEl.textContent = timeLeft;

  if (timeLeft <= 5) {
    timerEl.style.color = "red"; // urgency feel
  }

  if (timeLeft <= 0) {
    clearInterval(timer);
    alert("Game Starting!");
  }
}, 1000);

// 🚪 Exit
document.getElementById("exitBtn").addEventListener("click", () => {
  if (confirm("Leave the loom?")) {
    alert("Exited Room");
  }
});
