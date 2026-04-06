import { Hono } from "hono";
import {
  buyActionCard,
  buyDesignCard,
  claimDesign,
  handleActionCardMove,
  handleDiceRoll,
  handleMove,
  handlePaidSwap,
  handleSwap,
  performActionCard,
  playActionCard,
  serveGameState,
  swapYarnActionCard,
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
gameRoute.post("/paid-swap", handlePaidSwap);
gameRoute.patch("/action-card/:id", playActionCard);
gameRoute.post("/action-card/swap-yarn", swapYarnActionCard);
gameRoute.post("/perform-action-card", performActionCard);

export default gameRoute;
