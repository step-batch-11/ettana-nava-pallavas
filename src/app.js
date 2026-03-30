import { Hono } from "hono";
import { serveStatic } from "hono/deno";
import { initGame } from "./initGame.js";
import { TurnManager } from "./models/turn_manager.js";
import gameRoute from "./routes/game_route.js";
import { logger } from "hono/logger";

export const createApp = (
  boardState,
  randomFn = Math.random,
  loggerFn = logger,
) => {
  const app = new Hono();

  app.use(loggerFn());

  app.use("/game/*", async (ctx, next) => {
    ctx.set("boardState", boardState);
    const game = initGame();
    const turnManager = new TurnManager(game, randomFn);
    ctx.set("turnManager", turnManager);
    await next();
  });

  app.route("/game", gameRoute);
  app.get("*", serveStatic({ root: "public" }));

  return app;
};
