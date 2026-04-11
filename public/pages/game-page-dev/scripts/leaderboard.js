export const showEndGamePopup = (players, currentUserId) => {
  const overlay = document.getElementById("endGameOverlay");
  const leaderboard = document.getElementById("leaderboard");

  players.sort((a, b) => b.vp - a.vp);

  const winner = players[0];
  const isYouWinner = winner.id === currentUserId;

  document.getElementById("resultTitle").innerText = isYouWinner
    ? "🏆 Master Weaver!"
    : "🧵 Weaving Complete";

  document.getElementById("resultSubtitle").innerText = isYouWinner
    ? "You have crafted the finest design and reached 8 Annas."
    : `${winner.name} has mastered the loom.`;

  leaderboard.innerHTML = "";

  players.forEach((player, index) => {
    const row = document.createElement("div");
    row.className = "player" + (index === 0 ? " winner" : "");

    row.innerHTML = `
      <div class="rank">#${index + 1}</div>
      <div class="name">
        ${player.id === currentUserId ? "You" : player.name}
      </div>
      <div class="stats">
        <span>${player.vp} VP</span>
        <span>${player.tokens} 🟡</span>
      </div>
    `;

    leaderboard.appendChild(row);
  });

  overlay.classList.remove("hidden");
};

document.getElementById("closeLeaderboard")?.addEventListener("click", () => {
  document.getElementById("endGameOverlay").classList.add("hidden");
});

document.getElementById("goToHome")?.addEventListener("click", () => {
  globalThis.location.assign("/dashboard");
});
// showEndGamePopup(players, 3);
