export const getPlayerById = (players, id) =>
  players.find((player) => player.id === id);
