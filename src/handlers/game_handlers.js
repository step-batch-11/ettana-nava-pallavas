import { gameStateController } from "../controllers/game_controllers.js";
import { identity, toFrequencyMap } from "../utils/array_utils.js";

export const validateTileWithBank = (boardTiles, bankTiles) => {
  const flatTiles = boardTiles.flat();

  const counts = toFrequencyMap(
    flatTiles
      .map((tile) => tile.value)
      .filter(identity),
  );

  return bankTiles.some(({ value }) => counts[value] !== 2);
};

export const serveGameState = (ctx) => {
  try {
    const board = ctx.get("boardState");
    const bank = ctx.get("bank");

    const gameState = gameStateController(board, bank);

    return ctx.json({
      success: true,
      state: gameState,
    });
  } catch (e) {
    return ctx.json({ success: false, error: e.message });
  }
};

export const distributeInitialAssets = (ctx) => {
  const bank = ctx.get("bank");
  const board = ctx.get("boardState");

  bank.distributeInitialAssets(board.players);

  return ctx.json({
    success: true,
    message: "Initial assets are distributed among players",
  });
};
