import { Hono } from "hono";
import {
  buyActionCard,
  buyDesignCard,
  claimDesign,
  exchangeDesignCard,
  handleDiceRoll,
  handleMove,
  handlePaidSwap,
  handleSwap,
  passTurn,
  performActionCard,
  playActionCard,
  rotateDesignCard,
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
gameRoute.post("/passTurn", passTurn);
// gameRoute.post("/action-card/swap-yarn", swapYarnActionCard);
gameRoute.patch("/action-card/:id", playActionCard);
gameRoute.post("/perform-action-card", performActionCard);
gameRoute.patch("/rotate-design-card/:id", rotateDesignCard);
gameRoute.patch("/exchange-design-card/:id", exchangeDesignCard);

export default gameRoute;
