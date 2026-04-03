import { Hono } from "hono";
import { handleMove, handleSwap } from "../handlers/turn_handler.js";
import { serveGameState, handleDiceRoll } from "../handlers/game_handlers.js";
import { buyActionCard, buyDesignCard } from "../handlers/bank_handler.js";
import { handleActionCard } from "../handlers/action_handler.js";

const gameRoute = new Hono();

gameRoute.get("/roll-dice", handleDiceRoll);

gameRoute.get("/game-state", serveGameState);
gameRoute.get("/buy-design-card", buyDesignCard);
gameRoute.get("/buy-action-card", buyActionCard);
gameRoute.post("/roll", handleDiceRoll);
gameRoute.post("/move", handleMove);
gameRoute.post("/swap", handleSwap);
gameRoute.patch("/action-card/:id", handleActionCard);

export default gameRoute;
