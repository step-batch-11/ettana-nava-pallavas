export const serveGameState = (ctx) => {
  try {
    const game = ctx.get("gameState");
    const gameState = game.getGameState();

    return ctx.json({ success: true, state: gameState });
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
  } catch (e) {
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

export const playActionCard = (context) => {
  try {
    const game = context.get("gameState");
    const actionCardService = context.get("actionCardService");
    const id =  context.req.param("id");

    const actionCardHandlers = {
      6: (id) => game.playTaxActionCard(id),
      16: (id) => game.playVictoryPoint(id),
      4: (id) => game.playCollectToken(id),
      1: (id) => game.playMoveActionCard(id),
      7: (id) => game.getDesignCardActionCard(id),
      22: (id) =>
        game.playStealCard(id, (opponent) => opponent.getAc().length > 0),
      10: (id) => game.playStealCard(id, (opponent) => opponent.getTokens()),
      34: (id) => actionCardService.playAction(Number(id), game),
    };

    if (id in actionCardHandlers) {
      const { result, state } = actionCardHandlers[id](Number(id));

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
    const type = context.req.param("type");
    const { playerId, cardId } = await context.req.json();

    const stealHandlers = {
      "action-card": (id, cardId) => game.stealActionCard(id, cardId),
      "tokens": (id, cardId) => game.stealTokens(id, cardId),
    };

    if (type in stealHandlers) {
      const { result, state } = stealHandlers[type](
        Number(playerId),
        Number(cardId),
      );

      return context.json({
        result,
        state,
        success: true,
      });
    }

    return context.json(
      { success: false, result: { message: "Invalid action card" } },
      400,
    );
  } catch (err) {
    return context.json(
      { success: false, result: { message: err.message } },
      400,
    );
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

export const handleActionCardMove = async (ctx) => {
  const gameState = ctx.get("gameState");
  const board = gameState.getBoard();

  const { destination } = await ctx.req.json();
  const moveResult = gameState.movePlayer(destination);
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
