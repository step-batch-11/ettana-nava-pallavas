import { Hono } from "hono";
import { handleDiceRoll, handleMove } from "../handlers/turn_handler.js";
import {
  distributeInitialAssets,
  serveBoardState,
} from "../handlers/game_handlers.js";
import {
  buyActionCard,
  buyDesignCard,
  serveBankState,
} from "../handlers/bank_handler.js";
import { handleActionCard } from "../handlers/action_handler.js";

const gameRoute = new Hono();

gameRoute.get("/bank-state", serveBankState);
gameRoute.get("/board-state", serveBoardState);
gameRoute.get("/buy-design-card", buyDesignCard);
gameRoute.get("/buy-action-card", buyActionCard);
gameRoute.get("/distribute-initial-assets", distributeInitialAssets);
gameRoute.post("/roll", handleDiceRoll);
gameRoute.post("/move", handleMove);
gameRoute.patch("/action-card/:id", handleActionCard);

export default gameRoute;
