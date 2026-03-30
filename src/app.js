import { Hono } from "hono";
import { logger } from "hono/logger";
import { serveStatic } from "hono/deno";
import { initGame } from "./initGame.js";
import { TurnManager } from "./models/turn_manager.js";
import { handleDiceRoll } from "./handlers/turn_handler.js";

export const createApp = (randomFn = Math.random) => {
  const app = new Hono();

  app.use(logger());

  app.use(async (ctx, next) => {
    const game = initGame();
    const turnManager = new TurnManager(game, randomFn);
    ctx.set("turnManager", turnManager);
    await next();
  });

  app.post("/roll", handleDiceRoll);
  app.get("*", serveStatic({ root: "public" }));

  return app;
};
