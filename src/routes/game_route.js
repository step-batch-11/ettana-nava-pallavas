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
} from "../handlers/game_handlers.js";

const gameRoute = new Hono();

gameRoute.get("/roll", handleDiceRoll);

gameRoute.get("/game-state", serveGameState);
gameRoute.get("/buy-design-card", buyDesignCard);
gameRoute.get("/buy-action-card", buyActionCard);
gameRoute.get("/claim-design/:id", claimDesign);
gameRoute.post("/move", handleMove);
gameRoute.post("/action-card-move", handleActionCardMove);
gameRoute.post("/swap", handleSwap);
gameRoute.patch("/action-card/:id", playActionCard);

export default gameRoute;
