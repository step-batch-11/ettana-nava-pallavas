import { Hono } from "hono";
import { handleJoinLobby } from "../handlers/lobby_handler.js";

const lobbyRoute = new Hono();
lobbyRoute.post("/join", handleJoinLobby);
lobbyRoute.get("/get-state");
export default lobbyRoute;
