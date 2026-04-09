export const getPlayerById = (players, id) =>
  players.find((player) => player.getId() === id);

export const createStolenMsg = (receiver, sender, quantity, object) => {
  return `${receiver.name} stolen ${quantity} ${object} from ${sender.name}`;
};

export const toJSON = (x) => x.json();

export const errorResponse = (context, error, errorCode = 400) => {
  const { message } = error;

  return context.json({ success: false, error: { message } }, errorCode);
};
