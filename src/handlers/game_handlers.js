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
  const designCardId = ctx.req.param("id");
  const result = game.claimDesign(designCardId);

  return ctx.json({
    success: true,
    result,
  });
};

export const handleMove = async (ctx) => {
  const gameState = ctx.get("gameState");
  const { board } = gameState.getGameState();

  const destination = await ctx.req.json();
  const moveResult = gameState.move(destination);
  const adjYarns = board.getAdjYarnsPositions(moveResult.destination);

  if (moveResult.source === moveResult.destination) {
    return ctx.json({ success: false, message: "You can't move there" }, 400);
  }

  return ctx.json({
    success: true,
    data: { adjYarns, moveResult },
    message: "Moved successfully",
  }, 200);
};

export const handleSwap = async (ctx) => {
  const gameState = ctx.get("gameState");

  const { draggablePosition, yarnPosition } = await ctx.req.json();
  try {
    gameState.freeSwap(draggablePosition, yarnPosition);

    return ctx.json({
      success: true,
      message: "Swapped successfully",
    }, 200);
  } catch (e) {
    return ctx.json(
      { success: false, message: e.message },
      400,
    );
  }
};

export const handleSwapPurchase = (ctx) => {
  const gameState = ctx.get("gameState");

  try {
    gameState.paidSwap();

    return ctx.json({
      success: true,
      message: "Swap yarn",
    }, 200);
  } catch (e) {
    return ctx.json(
      { success: false, message: e.message },
      400,
    );
  }
};
