import { Hono } from "hono";
import {
  handleDiceRoll,
  handleMove,
  handleSwap,
} from "../handlers/turn_handler.js";
import {
  buyActionCard,
  buyDesignCard,
  playActionCard,
  claimDesign,
  serveGameState,
} from "../handlers/game_handlers.js";
// import { claimDesign, serveGameState } from "../handlers/game_handlers.js";

const gameRoute = new Hono();

gameRoute.get("/game-state", serveGameState);
gameRoute.get("/buy-design-card", buyDesignCard);
gameRoute.get("/buy-action-card", buyActionCard);
gameRoute.get("/claim-design/:id", claimDesign);
gameRoute.post("/roll", handleDiceRoll);
gameRoute.post("/move", handleMove);
gameRoute.post("/swap", handleSwap);
gameRoute.patch("/action-card/:id", playActionCard);

export default gameRoute;
