import { getCookie } from "hono/cookie";

export const isAuthenticated = async (context, next) => {
  const sessionId = getCookie(context, "sessionId");
  if (!sessionId) {
    return context.json({
      success: false,
      error: "You do not have permission to play",
    }, 401);
  }
  const rooms = context.get("rooms");
  const sessions = context.get("sessions");
  const session = sessions.get(sessionId);
  const room = rooms[session.roomId];
  context.set("room", room);
  context.set("session", session);
  await next();
};

export const isCurrentPlayer = async (context, next) => {
  const room = context.get("room");
  const session = context.get("session");
  if (room.state.getCurrentPlayerId() !== session.playerId) {
    return context.json({ success: false, error: "Its not your turn" }, 400);
  }

  await next();
};
