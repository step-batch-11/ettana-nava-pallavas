export const serveGameState = (ctx) => {
  try {
    const gameController = ctx.get("gameController");
    const gameState = gameController.getGameState();

    return ctx.json({ success: true, state: gameState });
  } catch (e) {
    return ctx.json({ success: false, error: e.message });
  }
};

export const handleDiceRoll = (ctx) => {
  try {
    const gameController = ctx.get("gameController");
    const { diceValues, destinations } = gameController.upkeep();

    const gameState = gameController.getGameState();

    return ctx.json({ gameState, destinations, diceValues });
  } catch (e) {
    console.log(e);
    return ctx.json({ success: false, error: e.message });
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
    console.log({ error });
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

export const handlePaidSwap = async (ctx) => {
  try {
    const gameController = ctx.get("gameController");
    const { draggablePosition, yarnPosition } = await ctx.req.json();
    gameController.paidSwap(draggablePosition, yarnPosition);

    return ctx.json({ success: true, message: "Swapped successfully" }, 200);
  } catch (e) {
    console.log({ inPaidSwap: e });
    return ctx.json({ success: false, message: e.message }, 400);
  }
};

export const playActionCard = (context) => {
  try {
    const gameController = context.get("gameController");
    const game = gameController.getGame();
    const actionCardService = context.get("actionCardService");
    const id = Number(context.req.param("id"));

    const { result, state } = actionCardService.playCard(id, game);

    return context.json({ result, state, success: true });
  } catch (err) {
    return context.json({ success: false, message: err.message }, 400);
  }
};

export const performActionCard = async (context) => {
  try {
    const gameController = context.get("gameController");
    const game = gameController.getGame();
    const actionCardService = context.get("actionCardService");
    const payload = await context.req.json();
    const { result, state } = actionCardService.performAction(payload, game);

    return context.json({ result, state, success: true });
  } catch (err) {
    return context.json({ success: false, message: err.message }, 400);
  }
};

export const rotateDesignCard = (context) => {
  const game = context.get("gameState");
  const id = Number(context.req.param("id"));

  const { state } = game.rotatePattern(id);

  return context.json({ state, message: "Rotated", success: true });
};
