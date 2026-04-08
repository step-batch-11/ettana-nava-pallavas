export const serveGameState = (ctx) => {
  try {
    const gameController = ctx.get("gameController");
    const gameState = gameController.getGameState();

    return ctx.json({ success: true, state: gameState });
  } catch (e) {
    return ctx.json({ success: false, error: e.message });
  }
};

export const handleDiceRoll = (context) => {
  try {
    const gameController = context.get("gameController");
    const { diceValues, destinations } = gameController.upkeep();

    const gameState = gameController.getGameState();

    return context.json({ gameState, destinations, diceValues });
  } catch (e) {
    return context.json({ success: false, error: e.message });
  }
};

export const buyDesignCard = (context) => {
  try {
    const gameController = context.get("gameController");
    const card = gameController.buyDesignCard();

    return context.json({
      success: true,
      card,
      message: "Design card bought successfully",
    });
  } catch (error) {
    return context.json({ success: false, message: error.message });
  }
};

export const buyActionCard = (context) => {
  try {
    const gameController = context.get("gameController");
    const card = gameController.buyActionCard();

    return context.json({
      success: true,
      card,
      message: "Action card bought successfully",
    });
  } catch (error) {
    return context.json({ success: false, message: error.message });
  }
};

export const claimDesign = (context) => {
  try {
    const gameController = context.get("gameController");
    const designCardId = context.req.param("id");
    const result = gameController.claimDesign(designCardId);
    const gameState = gameController.getGameState();

    return context.json({ success: true, result, state: gameState });
  } catch (error) {
    return context.json({ success: false, message: error.message });
  }
};

export const handleMove = async (ctx) => {
  try {
    const destination = await ctx.req.json();
    const gameController = ctx.get("gameController");
    const result = gameController.move(destination);

    return ctx.json(
      { success: true, result: { ...result, message: "Moved successfully" } },
      200,
    );
  } catch (error) {
    return ctx.json({ success: false, message: error.message }, 400);
  }
};

export const handleSwap = async (context) => {
  try {
    const gameController = context.get("gameController");
    const { draggablePosition, yarnPosition } = await context.req.json();
    gameController.freeSwap(draggablePosition, yarnPosition);

    return context.json(
      { success: true, message: "Swapped successfully" },
      200,
    );
  } catch (e) {
    return context.json({ success: false, message: e.message }, 400);
  }
};

export const handlePaidSwap = async (context) => {
  try {
    const gameController = context.get("gameController");
    const { draggablePosition, yarnPosition } = await context.req.json();
    gameController.paidSwap(draggablePosition, yarnPosition);

    return context.json(
      { success: true, message: "Swapped successfully" },
      200,
    );
  } catch (e) {
    return context.json({ success: false, message: e.message }, 400);
  }
};

export const playActionCard = (context) => {
  try {
    const gameController = context.get("gameController");
    const cardId = Number(context.req.param("id"));

    const { result, state } = gameController.playCard(cardId);

    return context.json({ result, state, success: true });
  } catch (err) {
    return context.json({ success: false, message: err.message }, 400);
  }
};

export const performActionCard = async (context) => {
  try {
    const gameController = context.get("gameController");
    const payload = await context.req.json();

    const { result, state } = gameController.performAction(payload);

    return context.json({ result, state, success: true });
  } catch (err) {
    return context.json({ success: false, message: err.message }, 400);
  }
};

export const rotateDesignCard = (context) => {
  const gameController = context.get("gameController");
  const game = gameController.getGame();
  const id = Number(context.req.param("id"));
  const { state } = game.rotatePattern(id);

  return context.json({ state, message: "Rotated", success: true });
};

export const exchangeDesignCard = (context) => {
  try {
    const gameController = context.get("gameController");
    const id = Number(context.req.param("id"));

    gameController.exchangeDesignCard(id);
    const state = gameController.getGameState();

    return context.json({
      state,
      result: { message: "Design card exchanged successfully" },
      success: true,
    });
  } catch (err) {
    return context.json({ success: false, message: err.message }, 400);
  }
};

export const passTurn = (context) => {
  try {
    const gameController = context.get("gameController");
    const { state } = gameController.endTurn();

    return context.json({
      result: { message: "turn passed" },
      state,
      success: true,
    });
  } catch (err) {
    return context.json({ success: false, message: err.message }, 400);
  }
};
