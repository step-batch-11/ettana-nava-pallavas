import { Hono } from "hono";
import { serveBoardState } from "../handlers/game_handlers.js";
import { handleDiceRoll, handleMove } from "../handlers/turn_handler.js";
import { serveBankState } from "../handlers/bank_handler.js";

const gameRoute = new Hono();

gameRoute.get("/bank-state", serveBankState);
gameRoute.get("/board-state", serveBoardState);
gameRoute.post("/roll", handleDiceRoll);
gameRoute.post("/move", handleMove);

export default gameRoute;
