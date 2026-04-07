import { Hono } from "hono";
import {
  handleExitLobby,
  handleGetLobbyState,
  handleJoinLobby,
} from "../handlers/lobby_handler.js";
import { serveStatic } from "hono/deno";

const lobbyRoute = new Hono();

lobbyRoute.get("/", serveStatic({ path: "public/pages/lobby-page" }));
lobbyRoute.post("/join", handleJoinLobby);
lobbyRoute.get("/get-state", handleGetLobbyState);
lobbyRoute.delete("/exit-lobby/:id", handleExitLobby);

export default lobbyRoute;
