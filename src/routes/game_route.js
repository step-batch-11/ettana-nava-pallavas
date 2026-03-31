import { Hono } from "hono";
import { serveBoardState } from "../handlers/game_handlers.js";
import { handleDiceRoll } from "../handlers/turn_handler.js";
import { buyDesignCard, serveBankState } from "../handlers/bank_handler.js";

const gameRoute = new Hono();

gameRoute.get("/bank-state", serveBankState);
gameRoute.get("/board-state", serveBoardState);
gameRoute.get("/buy-design-card", buyDesignCard);
gameRoute.post("/roll", handleDiceRoll);

export default gameRoute;
