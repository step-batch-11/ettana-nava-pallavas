import { gameStateController } from "../controllers/game_controllers.js";

export const validateTileWithBank = (boardTiles, bankTiles) => {
  const flatTiles = boardTiles.flat();

  const counts = {};
  for (const tile of flatTiles) {
    if (tile.value === null) continue;
    counts[tile.value] = (counts[tile.value] || 0) + 1;
  }

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
  try {
    const bank = ctx.get("bank");
    const board = ctx.get("boardState");

    bank.distributeInitialAssets(board.players);

    return ctx.json({
      success: true,
      message: "Initial assets are distributed among players",
    });
  } catch (e) {
    return ctx.json({ success: false, error: e.message });
  }
};
