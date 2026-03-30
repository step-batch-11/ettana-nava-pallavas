import { Hono } from "hono";
import { serveStatic } from "hono/deno";
import gameRoute from "./routes/game_route.js";

export const createApp = (boardState) => {
  const app = new Hono();

  app.use("/game/*", async (ctx, next) => {
    ctx.set("boardState", boardState);
    await next();
  });

  app.get("*", serveStatic({ root: "public" }));
  app.route("/game", gameRoute);

  return app;
};
