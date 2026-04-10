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

export const rollAndMove = async (sessionId, app, canMove = true) => {
  const headers = new Headers();
  headers.append("Cookie", `sessionId=${sessionId}`);

  const { destinations, diceValues } = await app
    .request("/game/roll", {
      method: "POST",
      headers,
    })
    .then(toJSON);

  if (!canMove) return { diceValues, sessionId };

  let destination = destinations[0];
  if (destination.x === 5 && destination.y === 5) {
    destination = destinations[1];
  }

  const response = await app
    .request("/game/move", {
      method: "POST",
      body: JSON.stringify(destination),
      headers,
    })
    .then(toJSON);

  return { response, diceValues, sessionId };
};
