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
gameRoute.post("/action-card-move", handleActionCardMove);
gameRoute.post("/swap", handleSwap);
gameRoute.post("/paid-swap", handlePaidSwap);
gameRoute.patch("/action-card/:id", playActionCard);
gameRoute.post("/action-card/swap-yarn", swapYarnActionCard);
gameRoute.post("/steal/:type", stealFromOpponent);
gameRoute.patch("/replace-tile", async (c) => {
  const body = await c.req.json();
  const game = c.get("gameState");
  console.log({ game });

  const boardTileValue = game.board.getTileValue(body.source);
  console.log(boardTileValue);

  return c.json({ success: true, message: "Wait kro" });
});

export default gameRoute;
