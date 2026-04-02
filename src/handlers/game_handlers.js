export const serveGameState = (ctx) => {
  try {
    const game = ctx.get("gameState");
    console.log(game);
    const gameState = game.getGameState();

    return ctx.json({
      success: true,
      state: gameState,
    });
  } catch (e) {
    return ctx.json({ success: false, error: e.message });
  }
};
