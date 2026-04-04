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
  try {
    const game = ctx.get("gameState");
    const { diceValues, destinations } = game.upkeep();

    const gameState = game.getGameState();

    return ctx.json({ gameState, destinations, diceValues });
  } catch {
    return ctx.json({ success: false, error: e.message });
  }
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

export const swapYarnActionCard = async (ctx) => {
  const game = ctx.get("gameState");

  try {
    const { draggablePosition, yarnPosition } = await ctx.req.json();

    game.swapYarnActionCard(draggablePosition, yarnPosition);
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

export const playActionCard = async (context) => {
  try {
    const game = context.get("gameState");
    const id = await context.req.param("id");

    const actionCardHandlers = {
      6: (_) => game.playTaxActionCard(6),
      16: (_) => game.playVictoryPoint(16),
      4: (_) => game.playCollectToken(4),
      7: (id) => game.getDesignCardActionCard(id),
      10: (id) =>
        game.playStealCard(id, (opponent) => opponent.getAc().length > 0),
      22: (id) => game.playStealCard(id, (opponent) => opponent.getTokens()),
    };

    if (id in actionCardHandlers) {
      const { result, state } = actionCardHandlers[id](id);

      return context.json({
        result,
        state,
        success: true,
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

export const stealFromOpponent = async (context) => {
  try {
    const game = context.get("gameState");
    const type = await context.req.param("type");
    const { playerId } = await context.req.json();

    const stealHandlers = {
      "action-card": (id) => game.stealActionCard(id),
      tokens: (id) => game.stealTokens(id),
    };

    if (type in stealHandlers) {
      const { result, state } = stealHandlers[type](playerId);

      return context.json({
        result,
        state,
        success: true,
      });
    }

    return context.json(
      { success: false, message: "Invalid steal action card" },
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
  const board = gameState.getBoard();

  const destination = await ctx.req.json();
  const moveResult = gameState.move(destination);
  const adjYarns = board.getAdjYarnsPositions(moveResult.destination);

  const swappableYarns = adjYarns.length > 1 ? adjYarns : [];

  if (moveResult.source === moveResult.destination) {
    return ctx.json({ success: false, message: "You can't move there" }, 400);
  }

  return ctx.json(
    {
      success: true,
      data: { adjYarns: swappableYarns, moveResult },
      message: "Moved successfully",
    },
    200,
  );
};

export const handleSwap = async (ctx) => {
  const gameState = ctx.get("gameState");

  try {
    const { draggablePosition, yarnPosition } = await ctx.req.json();
    gameState.freeSwap(draggablePosition, yarnPosition);

    return ctx.json(
      {
        success: true,
        message: "Swapped successfully",
      },
      200,
    );
  } catch (e) {
    return ctx.json({ success: false, message: e.message }, 400);
  }
};

export const handlePaidSwap = async (ctx) => {
  const gameState = ctx.get("gameState");
  const { draggablePosition, yarnPosition } = await ctx.req.json();

  try {
    gameState.paidSwap(draggablePosition, yarnPosition);

    return ctx.json({
      success: true,
      message: "Swapped successfully",
    }, 200);
  } catch (e) {
    return ctx.json({ success: false, message: e.message }, 400);
  }
};
