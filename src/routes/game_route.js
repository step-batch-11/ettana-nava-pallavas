import { Hono } from "hono";
import {
  buyActionCard,
  buyDesignCard,
  claimDesign,
  handleActionCardMove,
  handleDiceRoll,
  handleMove,
  handleSwap,
  playActionCard,
  serveGameState,
  stealFromOpponent
} from "../handlers/game_handlers.js";

const gameRoute = new Hono();

gameRoute.post("/roll", handleDiceRoll);

gameRoute.get("/game-state", serveGameState);
gameRoute.get("/buy-design-card", buyDesignCard);
gameRoute.get("/buy-action-card", buyActionCard);
gameRoute.get("/claim-design/:id", claimDesign);
gameRoute.post("/move", handleMove);
gameRoute.post("/action-card-move", handleActionCardMove);
gameRoute.post("/swap", handleSwap);
gameRoute.patch("/action-card/:id", playActionCard);
gameRoute.post("/steal/:type", stealFromOpponent);

export default gameRoute;
