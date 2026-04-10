import { getCookie } from "hono/cookie";
import { errorResponse } from "../utils/util.js";

export const isAuthenticated = async (context, next) => {
  const sessionId = getCookie(context, "sessionId");
  if (!sessionId) {
    return errorResponse(context, {
      message: "You do not have permission to play",
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
    return errorResponse(context, {
      message: "Its not your turn",
    }, 401);
  }

  await next();
};
