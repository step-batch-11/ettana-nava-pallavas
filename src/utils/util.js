export const getPlayerById = (players, id) =>
  players.find((player) => player.getId() === id);

export const createStolenMsg = (receiver, sender, quantity, object) => {
  return `${receiver.name} stolen ${quantity} ${object} from ${sender.name}`;
};
