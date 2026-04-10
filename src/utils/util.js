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

export const setSession = (sessionId) => {
  const headers = new Headers();
  headers.append("Cookie", `sessionId=${sessionId}`);
  return headers;
};

export const sendRequest = async (app, url, payload, method = "POST") => {
  payload.method = method;
  return await app.request(url, payload).then(toJSON);
};

export const rollAndMove = async (sessionId, app, canMove = true) => {
  const headers = setSession(sessionId);
  const { destinations, diceValues } = await sendRequest(app, "/game/roll", {
    headers,
  });

  if (!canMove) return { diceValues, sessionId };

  let destination = destinations[0];
  if (destination.x === 5 && destination.y === 5) {
    destination = destinations[1];
  }

  const response = await sendRequest(app, "/game/move", {
    body: JSON.stringify(destination),
    headers,
  });

  return { response, diceValues, sessionId };
};
