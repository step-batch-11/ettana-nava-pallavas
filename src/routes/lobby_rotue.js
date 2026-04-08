import { Hono } from "hono";
import {
  handleCreateLobby,
  handleExitLobby,
  handleGetLobbyState,
  handleJoinLobby,
  handleStartGame,
} from "../handlers/lobby_handler.js";
import { serveStatic } from "hono/deno";

const lobbyRoute = new Hono();

lobbyRoute.get("/", serveStatic({ path: "public/pages/lobby-page" }));
lobbyRoute.post("/host-game", handleCreateLobby);
lobbyRoute.post("/join", handleJoinLobby);
lobbyRoute.get("/get-state", handleGetLobbyState);
lobbyRoute.delete("/exit-lobby/:id", handleExitLobby);
lobbyRoute.get("/start-game", handleStartGame);

export default lobbyRoute;
