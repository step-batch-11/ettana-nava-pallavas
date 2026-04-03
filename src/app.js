import { Hono } from "hono";
import { serveStatic } from "hono/deno";
import gameRoute from "./routes/game_route.js";
import { logger } from "hono/logger";

export const createApp = (
  game,
  turnManager,
  loggerFn = logger,
) => {
  const app = new Hono();

  app.use(loggerFn());

  app.use("/game/*", async (ctx, next) => {
    ctx.set("gameState", game);
    ctx.set("turnManager", turnManager);
    await next();
  });

  app.route("/game", gameRoute);
  app.get("/", serveStatic({ root: "public/pages/game-page" }));
  app.get("*", serveStatic({ root: "public" }));

  return app;
};
