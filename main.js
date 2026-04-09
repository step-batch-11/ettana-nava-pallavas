import { createApp } from "./src/app.js";
import Session from "./src/models/session.js";

const main = () => {
  const rooms = {};
  const players = {};
  const sessions = new Session();

  const PORT = Deno.env.get("PORT") || 8000;
  const app = createApp(
    rooms,
    players,
    sessions,
  );

  Deno.serve({ port: PORT }, app.fetch);
};

main();
