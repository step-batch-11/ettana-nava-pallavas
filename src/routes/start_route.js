import { Hono } from "hono";
import { serveStatic } from "hono/deno";

const startRoute = new Hono();

startRoute.get(
  "/",
  serveStatic({ path: "public/pages/start-page/index.html" }),
);

export default startRoute;
