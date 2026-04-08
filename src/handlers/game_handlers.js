export const serveGameState = (ctx) => {
  try {
    const room = ctx.get("room");
    const session = ctx.get("session");

    const gameState = room.state.getGameState(session.playerId);
    return ctx.json({
      success: true,
      state: gameState,
    });
  } catch (e) {
    console.log(e);
    return ctx.json({ success: false, error: e.message });
  }
};

export const handleDiceRoll = (context) => {
  try {
    const session = context.get("session");
    const room = context.get("room");

    const { diceValues, destinations } = room.state.upkeep(session.playerId);
    const gameState = room.state.getGameState(session.playerId);
    return context.json({ success: true, gameState, destinations, diceValues });
  } catch (e) {
    console.log(e);
    return context.json({ success: false, error: e.message });
  }
};

export const buyDesignCard = (context) => {
  try {
    const room = context.get("room");
    const card = room.state.buyDesignCard();

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
    const room = context.get("room");

    const card = room.state.buyActionCard();
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
    const designCardId = context.req.param("id");
    const room = ctx.get("room");

    const result = room.state.claimDesign(designCardId);
    const gameState = room.state.getGameState();
    return context.json({ success: true, result, state: gameState });
  } catch (error) {
    return context.json({ success: false, message: error.message });
  }
};

export const handleMove = async (ctx) => {
  try {
    const destination = await ctx.req.json();
    const room = ctx.get("room");

    const result = room.state.move(destination);
    return ctx.json(
      { success: true, result: { ...result, message: "Moved successfully" } },
      200,
    );
  } catch (error) {
    console.log(error);
    return ctx.json({ success: false, message: error.message }, 400);
  }
};

export const handleSwap = async (context) => {
  try {
    const { draggablePosition, yarnPosition } = await context.req.json();
    const room = context.get("room");

    room.state.freeSwap(draggablePosition, yarnPosition);
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
    const room = context.get("room");
    const { draggablePosition, yarnPosition } = await context.req.json();
    room.state.paidSwap(draggablePosition, yarnPosition);

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
    const room = context.get("room");
    const cardId = Number(context.req.param("id"));

    const { result, state } = room.state.playCard(cardId);

    return context.json({ result, state, success: true });
  } catch (err) {
    return context.json({ success: false, message: err.message }, 400);
  }
};

export const performActionCard = async (context) => {
  try {
    const room = context.get("room");
    const payload = await context.req.json();

    const { result, state } = room.state.performAction(payload);

    return context.json({ result, state, success: true });
  } catch (err) {
    return context.json({ success: false, message: err.message }, 400);
  }
};

export const rotateDesignCard = (context) => {
  try {
    const room = context.get("room");
    const game = room.state.getGame();
    const id = Number(context.req.param("id"));
    const { state } = game.rotatePattern(id);
    return context.json({ state, message: "Rotated", success: true });
  } catch (err) {
    console.log(err);
    return context.json({ success: false, message: err.message }, 400);
  }
};

export const exchangeDesignCard = (context) => {
  try {
    const room = context.get("room");
    const id = Number(context.req.param("id"));

    room.state.exchangeDesignCard(id);
    const state = room.state.getGameState();

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
    const room = context.get("room");
    const session = context.get("session");

    const { state } = room.state.endTurn(session.playerId);
    return context.json({
      result: { message: "turn passed" },
      state,
      success: true,
    });
  } catch (err) {
    return context.json({ success: false, message: err.message }, 400);
  }
};
