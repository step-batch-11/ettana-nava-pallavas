import { Hono } from "hono";
import { serveStatic } from "hono/deno";
import gameRoute from "./routes/game_route.js";
import { logger } from "hono/logger";
import lobbyRoute from "./routes/lobby_route.js";
import { isAuthenticated } from "./middleware/auth.js";

export const createApp = (
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

  app.use("/game/*", isAuthenticated);

  app.route("/game", gameRoute);
  app.route("/lobby", lobbyRoute);
  app.get("/", serveStatic({ path: "public/pages/start-page" }));
  app.get("/end", serveStatic({ path: "public/pages/end-game" }));
  app.get("/dashboard", serveStatic({ path: "public/pages/dashboard" }));
  app.get("*", serveStatic({ root: "public" }));

  return app;
};
