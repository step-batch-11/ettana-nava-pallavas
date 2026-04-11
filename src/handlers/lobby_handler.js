import Player from "../models/player.js";
import LobbyController from "../models/lobby.js";
import { getCookie, setCookie } from "hono/cookie";
import { acMap, getActionCard, getAllActionCard } from "../utils/mock_data.js";

export const handleCreateLobby = async (context) => {
  try {
    const players = context.get("players");
    const rooms = context.get("rooms");
    const sessions = context.get("sessions");
    const payload = await context.req.json();

    const player = new Player(Date.now(), payload.username);
    players[player.getId()] = player;
    player.updateVp(8);
    player.addActionCard(getActionCard(acMap.roll));
    player.addActionCard(getActionCard(acMap.roll));
    player.addActionCard(getActionCard(acMap.roll));
    player.addAllActionCardDev(...getAllActionCard());
    player.creditTokens(1000);

    const room = {
      // id: `${Date.now()}-room`,π
      id: "1000",
      state: new LobbyController(),
      hostId: player.getId(),
      name: payload.name,
      color: [1, 2, 3, 4, 5, 6],
    };

    player.setup(room.color.shift(), { x: -1, y: -1 });
    player.assignRoomId(room.id);
    rooms[room.id] = room;

    room.state.addPlayer(player);

    const sessionId = sessions.add(player.getId(), room.id);
    setCookie(context, "sessionId", sessionId);
    return context.json({
      success: true,
      message: "Joined successfully",
      state: room.state.getLobbyState(),
      roomId: room.id,
      sessionId,
    });
  } catch (err) {
    return context.json({ success: false, error: err.message });
  }
};

export const handleJoinLobby = async (context) => {
  try {
    const players = context.get("players");
    const rooms = context.get("rooms");
    const sessions = context.get("sessions");
    const payload = await context.req.json();
    if (!(payload.roomId in rooms)) throw new Error("No Lobby Found");

    const room = rooms[payload.roomId];

    const player = new Player(Date.now(), payload.username);
    player.addAllActionCardDev(...getAllActionCard());

    player.setup(room.color.shift(), { x: -1, y: -1 });
    players[player.getId()] = player;
    room.state.addPlayer(player);
    player.assignRoomId(room.id);
    const sessionId = sessions.add(player.getId(), room.id);
    setCookie(context, "sessionId", sessionId);

    return context.json({
      success: true,
      message: "Joined successfully",
      state: room.state.getLobbyState(),
      roomId: room.id,
      sessionId,
    });
  } catch (err) {
    return context.json({ success: false, error: err.message });
  }
};

export const handleGetLobbyState = (context) => {
  try {
    const sessionId = getCookie(context, "sessionId");
    const rooms = context.get("rooms");
    const sessions = context.get("sessions");
    const session = sessions.get(sessionId);
    const room = rooms[session.roomId];

    const state = room.state.getLobbyState();
    return context.json({
      success: true,
      state,
      room: { id: room.id, name: room.name },
      isHost: room.hostId === session.playerId,
    });
  } catch (err) {
    return context.json({ success: false, error: err.message });
  }
};

const validateHost = (room, session) => {
  if (room.hostId !== session.playerId)
    throw new Error("Only host can start the game.");
};

export const handleStartGame = async (context) => {
  try {
    const sessionId = getCookie(context, "sessionId");
    const rooms = context.get("rooms");
    const sessions = context.get("sessions");
    const session = sessions.get(sessionId);
    const room = rooms[session.roomId];
    validateHost(room, session);
    room.state = await room.state.startGame();

    return context.json({ success: true, message: "Game started" });
  } catch (err) {
    return context.json({ success: false, error: { message: err.message } });
  }
};

export const handleExitLobby = (context) => {
  try {
    const sessions = context.get("sessions");
    const rooms = context.get("rooms");

    const sessionId = getCookie(context, "sessionId");
    const session = sessions.get(sessionId);
    const roomId = session.roomId;
    const playerId = session.playerId;
    const lobbyController = rooms[roomId].state;

    lobbyController.exitLobby(playerId);
    return context.json({ success: true, message: "You left the lobby" });
  } catch (err) {
    return context.json({ success: false, error: err.message });
  }
};
