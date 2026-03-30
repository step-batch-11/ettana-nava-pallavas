import { Hono } from "hono";
import { serveBoardState } from "../handlers/game_handlers.js";

const gameRoute = new Hono();


gameRoute.get("/bank-state", serveBoardState);
gameRoute.get("/board-state", serveBoardState);

export default gameRoute;
