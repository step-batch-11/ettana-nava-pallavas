import { Hono } from "hono";
import {
  claimDesign,
  handleMove,
  handleSwap,
  serveGameState,
} from "../handlers/game_handlers.js";

import { buyActionCard, buyDesignCard } from "../handlers/bank_handler.js";
import { handleActionCard } from "../handlers/action_handler.js";

const gameRoute = new Hono();

gameRoute.get("/game-state", serveGameState);
gameRoute.get("/buy-design-card", buyDesignCard);
gameRoute.get("/buy-action-card", buyActionCard);
gameRoute.get("/claim-design/:id", claimDesign);
// gameRoute.post("/roll", handleDiceRoll);
gameRoute.post("/move", handleMove);
gameRoute.post("/swap", handleSwap);
gameRoute.patch("/action-card/:id", handleActionCard);

export default gameRoute;
