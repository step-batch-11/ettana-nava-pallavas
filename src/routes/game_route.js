import { Hono } from "hono";
import { serveBoardState } from "../handlers/game_handlers.js";

const gameRoute = new Hono();

gameRoute.get("/board-state", serveBoardState);

export default gameRoute;
