import { createApp } from "../app.js";
import Session from "../models/session.js";

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

export const removeAcs = (player) => {
  const acs = player.getAc();
  acs.forEach((card) => {
    player.removeActionCard(card.id);
  });
};

export const manageTurns = async (app, p1Sid, p2Sid, canMoveAtLast) => {
  const p1 = await rollAndMove(p1Sid, app);
  const p2 = await rollAndMove(p2Sid, app);

  const currentPlayerSId = p1.diceValues.number >= p2.diceValues.number
    ? p1Sid
    : p2Sid;

  if (canMoveAtLast) await rollAndMove(currentPlayerSId, app, false);

  return { p1, p2, currentPlayerSId };
};

export const setPlayer = (players, currPSid) =>
  Object.values(players).find(
    (x) => x.getId() === currPSid,
  );

export const createPlayers = async (app, p1Name, p2Name) => {
  let payload = JSON.stringify({ username: p1Name });
  const player1 = await sendRequest(app, "/lobby/host-game", {
    body: payload,
  }); //request to host

  const roomId = player1.roomId;

  await new Promise((r) => setTimeout(r, 200));

  payload = JSON.stringify({ username: p2Name, roomId });
  const player2 = await sendRequest(app, "/lobby/join", { body: payload }); //request to join

  return {
    player1SessionId: player1.sessionId,
    player2SessionId: player2.sessionId,
  };
};

export const setupState = async (canMoveAtLast = true) => {
  const rooms = {};
  const players = {};
  const sessions = new Session();
  const roomIds = { value: 999 };

  const app = createApp(rooms, players, sessions, roomIds);

  const { player1SessionId, player2SessionId } = await createPlayers(
    app,
    "kha",
    "sim",
  );

  const headers = setSession(player1SessionId);

  await sendRequest(app, "/lobby/start-game", { headers }, "GET");

  const turnRes = await manageTurns(
    app,
    player1SessionId,
    player2SessionId,
    canMoveAtLast,
  );

  const { currentPlayerSId } = turnRes;

  headers.set("Cookie", `sessionId=${currentPlayerSId}`);
  const currentPlayer = setPlayer(players, currentPlayerSId);

  return {
    app,
    players,
    rooms,
    sessions,
    headers,
    player1SessionId,
    player2SessionId,
    currentPlayer,
    currentPlayerSId,
  };
};
