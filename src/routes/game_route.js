import { Hono } from "hono";
import {
  buyActionCard,
  buyDesignCard,
  claimDesign,
  handleDiceRoll,
  handleMove,
  handlePaidSwap,
  handleSwap,
  performActionCard,
  playActionCard,
  serveGameState,
} from "../handlers/game_handlers.js";

const gameRoute = new Hono();


gameRoute.post("/roll", handleDiceRoll);
gameRoute.get("/game-state", serveGameState);
gameRoute.post("/move", handleMove);
gameRoute.post("/swap", handleSwap);
gameRoute.get("/buy-design-card", buyDesignCard);
gameRoute.get("/buy-action-card", buyActionCard);
gameRoute.get("/claim-design/:id", claimDesign);
gameRoute.post("/paid-swap", handlePaidSwap);
// gameRoute.post("/action-card/swap-yarn", swapYarnActionCard);
gameRoute.patch("/action-card/:id", playActionCard);
gameRoute.post("/perform-action-card", performActionCard);

export default gameRoute;
