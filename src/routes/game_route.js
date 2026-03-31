import { Hono } from "hono";
import {
  // distributeInitialAssets,
  serveBoardState,
} from "../handlers/game_handlers.js";
import { handleDiceRoll } from "../handlers/turn_handler.js";

const gameRoute = new Hono();

gameRoute.get("/board-state", serveBoardState);
// gameRoute.get("/distribute-initial-assets", distributeInitialAssets);
gameRoute.post("/roll", handleDiceRoll);

export default gameRoute;
