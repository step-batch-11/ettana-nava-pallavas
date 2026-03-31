import { Hono } from "hono";
import {
  distributeInitialAssets,
  serveBoardState,
} from "../handlers/game_handlers.js";
import { handleDiceRoll } from "../handlers/turn_handler.js";
import { serveBankState } from "../handlers/bank_handler.js";

const gameRoute = new Hono();

gameRoute.get("/bank-state", serveBankState);
gameRoute.get("/board-state", serveBoardState);
gameRoute.get("/distribute-initial-assets", distributeInitialAssets);
gameRoute.post("/roll", handleDiceRoll);

export default gameRoute;
