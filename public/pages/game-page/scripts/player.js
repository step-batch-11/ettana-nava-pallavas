const renderPlayerComponents = (players, currentPlayerId, requesterId) => {
  const playersElement = document.querySelector("players-element");
  playersElement.players = { players, currentPlayerId, requesterId };
  // const playerDetails = document.querySelectorAll("player-detail");
  // playerDetails.map((playerDetail) => playerDetail.classList.add("player"));
};

export const renderPlayers = (players, currentPlayerId, requesterId) => {
  renderPlayerComponents(players, currentPlayerId, requesterId);
};
