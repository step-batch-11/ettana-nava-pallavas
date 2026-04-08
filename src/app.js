import { Hono } from "hono";
import { serveStatic } from "hono/deno";
import gameRoute from "./routes/game_route.js";
import { logger } from "hono/logger";
import lobbyRoute from "./routes/lobby_rotue.js";
import { getCookie } from "hono/cookie";

export const createApp = (
  gameState,
  gameController,
  actionCardService,
  rooms,
  players,
  sessions,
  loggerFn = logger,
) => {
  const app = new Hono();
  app.use(loggerFn());

  app.use("*", async (context, next) => {
    context.set("rooms", rooms);
    context.set("players", players);
    context.set("sessions", sessions);
    await next();
  });

  app.use("/game/*", async (context, next) => {
    context.set("gameState", gameState);
    context.set("gameController", gameController);
    context.set("actionCardService", actionCardService);

    const sessionId = getCookie(context, "sessionId");
    const rooms = context.get("rooms");
    const sessions = context.get("sessions");
    const session = sessions.get(sessionId);
    const room = rooms[session.roomId];
    context.set("room", room);
    context.set("session", session);
    await next();
  });

  app.route("/game", gameRoute);
  app.route("/lobby", lobbyRoute);

  app.get("/", serveStatic({ path: "public/pages/start-page" }));
  app.get("/dashboard", serveStatic({ path: "public/pages/dashboard" }));
  app.get("*", serveStatic({ root: "public" }));

  return app;
};
