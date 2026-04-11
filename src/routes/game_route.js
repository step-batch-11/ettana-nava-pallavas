import { Hono } from "hono";
import {
  buyActionCard,
  buyDesignCard,
  claimDesign,
  exchangeDesignCard,
  handleBuySwap,
  handleDiceRoll,
  handleMove,
  handlePaidSwap,
  handleSwap,
  makeWin,
  passTurn,
  performActionCard,
  playActionCard,
  rotateDesignCard,
  serveGameState,
} from "../handlers/game_handlers.js";
import { serveStatic } from "hono/deno";
import { isCurrentPlayer } from "../middleware/auth.js";

const gameRoute = new Hono();

gameRoute.post("/roll", isCurrentPlayer, handleDiceRoll);
gameRoute.get("/game-state", serveGameState);
gameRoute.get("/buy-swap", handleBuySwap);
gameRoute.post("/move", isCurrentPlayer, handleMove);
gameRoute.post("/swap", isCurrentPlayer, handleSwap);
gameRoute.get("/buy-design-card", isCurrentPlayer, buyDesignCard);
gameRoute.get("/buy-action-card", isCurrentPlayer, buyActionCard);
gameRoute.get("/claim-design/:id", isCurrentPlayer, claimDesign);
gameRoute.post("/paid-swap", isCurrentPlayer, handlePaidSwap);
gameRoute.post("/pass-turn", isCurrentPlayer, passTurn);
gameRoute.patch("/action-card/:id", isCurrentPlayer, playActionCard);
gameRoute.post("/perform-action-card", isCurrentPlayer, performActionCard);
gameRoute.patch("/rotate-design-card/:id", rotateDesignCard);
gameRoute.patch(
  "/exchange-design-card/:id",
  isCurrentPlayer,
  exchangeDesignCard,
);
gameRoute.get("/force-win", isCurrentPlayer, makeWin);
gameRoute.get("/", serveStatic({ path: "public/pages/game-page" }));

export default gameRoute;
