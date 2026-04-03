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

export const handleDiceRoll = (ctx) => {
  const game = ctx.get("gamestate");
  const {diceValue, paths} = game.upkeep();

  const gameState = game.getGameState();
  
  return ctx.json({ gameState, paths, diceValue });
};

export const buyDesignCard = (ctx) => {
  try {
    const game = ctx.get("gameState");
    const card = game.buyDesignCard();

    if (card === "NOT_ENOUGH_TOKEN") {
      return ctx.json({
        message: "You do not have enough tokens",
        success: false,
      });
    }

    return ctx.json({
      success: true,
      message: "Design card bought successfully",
    });
  } catch (err) {
    return ctx.json({ success: false, message: err.message });
  }
};

export const buyActionCard = (ctx) => {
  try {
    const game = ctx.get("gameState");
    const card = game.buyActionCard();

    if (card === "NOT_ENOUGH_TOKEN") {
      return ctx.json({
        message: "You do not have enough tokens",
        success: false,
      });
    }

    return ctx.json({
      success: true,
      card,
      message: "Action card bought successfully",
    });
  } catch (err) {
    return ctx.json({ success: false, message: err.message });
  }
};

export const playActionCard = async (context) => {
  try {
    const game = context.get("gameState");
    const id = await context.req.param("id");

    const actionCardHandlers = {
      6: (id) => game.playTaxActionCard(id),
    };

    if (id in actionCardHandlers) {
      const { affectedPlayers, state } = game.playTaxActionCard(id);

      return context.json({
        affectedPlayers,
        state,
        success: true,
        message: "Tax action card played",
      });
    }

    return context.json(
      { success: false, message: "Invalid action card" },
      400,
    );
  } catch (err) {
    return context.json({ success: false, message: err.message }, 400);
  }
};

export const claimDesign = (ctx) => {
  const game = ctx.get("gameState");
  const designCardId = ctx.req.param("id");
  const result = game.claimDesign(designCardId);
  const gameState = game.getGameState();

  return ctx.json({
    success: true,
    result,
    state: gameState,
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
