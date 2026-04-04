import { Hono } from "hono";
import {
  buyActionCard,
  buyDesignCard,
  claimDesign,
  handleDiceRoll,
  handleMove,
  handlePaidSwap,
  handleSwap,
  playActionCard,
  serveGameState,
  stealFromOpponent,
  swapYarnActionCard,
} from "../handlers/game_handlers.js";

const gameRoute = new Hono();

gameRoute.post("/roll", handleDiceRoll);

gameRoute.get("/game-state", serveGameState);
gameRoute.get("/buy-design-card", buyDesignCard);
gameRoute.get("/buy-action-card", buyActionCard);
gameRoute.get("/claim-design/:id", claimDesign);
gameRoute.post("/move", handleMove);
gameRoute.post("/swap", handleSwap);
gameRoute.post("/paid-swap", handlePaidSwap);
gameRoute.patch("/action-card/:id", playActionCard);
gameRoute.post("/action-card/swap-yarn", swapYarnActionCard);
gameRoute.post("/steal/:type", stealFromOpponent);

export default gameRoute;
