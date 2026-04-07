import { Hono } from "hono";
import { serveStatic } from "hono/deno";
import gameRoute from "./routes/game_route.js";
import { logger } from "hono/logger";

export const createApp = (
  gameState,
  gameController,
  actionCardService,
  loggerFn = logger,
) => {
  const app = new Hono();

  app.use(loggerFn());

  app.use("/game/*", async (ctx, next) => {
    ctx.set("gameState", gameState);
    ctx.set("gameController", gameController);
    ctx.set("actionCardService", actionCardService);
    await next();
  });

  app.route("/game", gameRoute);
  app.get("/", serveStatic({ root: "public/pages/game-page" }));
  app.get("*", serveStatic({ root: "public" }));

  return app;
};
