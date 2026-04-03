export const serveGameState = (ctx) => {
  try {
    const game = ctx.get("gameState");
    const gameState = game.getGameState();

    return ctx.json({
      success: true,
      state: gameState,
    });
  } catch (e) {
    return ctx.json({ success: false, error: e.message });
  }
};

export const claimDesign = (ctx) => {
  const game = ctx.get("gameState");
  const designCardId = ctx.req.params("id");
  const result = game.claimDesign(designCardId);

  return ctx.json({
    success: true,
    result,
  });
};
